import Store from 'electron-store';
import { TranslationHistoryEntry, HistoryFilter, HistoryConfig } from '../../shared/types.js';
import crypto from 'crypto';

const DEFAULT_CONFIG: HistoryConfig = {
  maxEntries: 1000,
  enableEncryption: false,
};

interface StoreSchema {
  history: TranslationHistoryEntry[];
  config: HistoryConfig;
}

export class HistoryService {
  private store: Store<StoreSchema>;
  private encryptionKey: string | null = null;

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'translation-history',
      defaults: {
        history: [],
        config: DEFAULT_CONFIG,
      },
    });

    // Initialize encryption key if enabled
    const config = this.getConfig();
    if (config.enableEncryption) {
      this.initEncryption();
    }
  }

  private initEncryption() {
    // Generate a persistent encryption key based on machine ID
    // In production, consider using a more secure key management approach
    const machineId = crypto.randomBytes(16).toString('hex');
    this.encryptionKey = crypto.createHash('sha256').update(machineId).digest('hex');
  }

  private encrypt(text: string): string {
    if (!this.encryptionKey) return text;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'hex'), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(text: string): string {
    if (!this.encryptionKey) return text;

    try {
      const parts = text.split(':');
      if (parts.length !== 2) return text;

      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];

      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(this.encryptionKey, 'hex'),
        iv
      );

      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return text;
    }
  }

  getConfig(): HistoryConfig {
    return this.store.get('config', DEFAULT_CONFIG);
  }

  updateConfig(config: Partial<HistoryConfig>): HistoryConfig {
    const currentConfig = this.getConfig();
    const newConfig = { ...currentConfig, ...config };
    this.store.set('config', newConfig);

    // Re-initialize encryption if setting changed
    if (config.enableEncryption !== undefined) {
      if (config.enableEncryption) {
        this.initEncryption();
      } else {
        this.encryptionKey = null;
      }
    }

    return newConfig;
  }

  addEntry(
    sourceText: string,
    translatedText: string,
    sourceLang: string,
    targetLang: string
  ): TranslationHistoryEntry {
    const history = this.store.get('history', []);
    const config = this.getConfig();

    // Check if entry already exists (same source text and target language)
    const existingIndex = history.findIndex(
      (entry) =>
        entry.sourceText === sourceText &&
        entry.targetLang === targetLang &&
        entry.sourceLang === sourceLang
    );

    let entry: TranslationHistoryEntry;

    if (existingIndex >= 0) {
      // Update existing entry
      entry = {
        ...history[existingIndex],
        translatedText,
        timestamp: Date.now(),
        usageCount: history[existingIndex].usageCount + 1,
      };
      history[existingIndex] = entry;
    } else {
      // Create new entry
      entry = {
        id: crypto.randomUUID(),
        sourceText: config.enableEncryption ? this.encrypt(sourceText) : sourceText,
        translatedText: config.enableEncryption ? this.encrypt(translatedText) : translatedText,
        sourceLang,
        targetLang,
        timestamp: Date.now(),
        isFavorite: false,
        usageCount: 1,
      };

      history.unshift(entry);

      // Apply retention policy
      if (history.length > config.maxEntries) {
        // Remove oldest non-favorite entries
        const favorites = history.filter((e) => e.isFavorite);
        const nonFavorites = history.filter((e) => !e.isFavorite);
        const trimmedNonFavorites = nonFavorites.slice(0, config.maxEntries - favorites.length);
        this.store.set('history', [...favorites, ...trimmedNonFavorites]);
      } else {
        this.store.set('history', history);
      }
    }

    // Return decrypted entry
    return {
      ...entry,
      sourceText: config.enableEncryption ? this.decrypt(entry.sourceText) : entry.sourceText,
      translatedText: config.enableEncryption
        ? this.decrypt(entry.translatedText)
        : entry.translatedText,
    };
  }

  getHistory(filter?: HistoryFilter): TranslationHistoryEntry[] {
    let history = this.store.get('history', []);
    const config = this.getConfig();

    // Decrypt entries if encryption is enabled
    if (config.enableEncryption) {
      history = history.map((entry) => ({
        ...entry,
        sourceText: this.decrypt(entry.sourceText),
        translatedText: this.decrypt(entry.translatedText),
      }));
    }

    // Apply filters
    if (filter) {
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        history = history.filter(
          (entry) =>
            entry.sourceText.toLowerCase().includes(searchLower) ||
            entry.translatedText.toLowerCase().includes(searchLower)
        );
      }

      if (filter.sourceLang) {
        history = history.filter((entry) => entry.sourceLang === filter.sourceLang);
      }

      if (filter.targetLang) {
        history = history.filter((entry) => entry.targetLang === filter.targetLang);
      }

      if (filter.onlyFavorites) {
        history = history.filter((entry) => entry.isFavorite);
      }

      if (filter.startDate) {
        history = history.filter((entry) => entry.timestamp >= filter.startDate!);
      }

      if (filter.endDate) {
        history = history.filter((entry) => entry.timestamp <= filter.endDate!);
      }
    }

    // Sort by timestamp (most recent first)
    return history.sort((a, b) => b.timestamp - a.timestamp);
  }

  getFavorites(): TranslationHistoryEntry[] {
    return this.getHistory({ onlyFavorites: true }).sort((a, b) => b.usageCount - a.usageCount);
  }

  toggleFavorite(id: string): TranslationHistoryEntry | null {
    const history = this.store.get('history', []);
    const index = history.findIndex((entry) => entry.id === id);

    if (index >= 0) {
      history[index].isFavorite = !history[index].isFavorite;
      this.store.set('history', history);

      const config = this.getConfig();
      return {
        ...history[index],
        sourceText: config.enableEncryption
          ? this.decrypt(history[index].sourceText)
          : history[index].sourceText,
        translatedText: config.enableEncryption
          ? this.decrypt(history[index].translatedText)
          : history[index].translatedText,
      };
    }

    return null;
  }

  deleteEntry(id: string): boolean {
    const history = this.store.get('history', []);
    const filtered = history.filter((entry) => entry.id !== id);

    if (filtered.length < history.length) {
      this.store.set('history', filtered);
      return true;
    }

    return false;
  }

  clearHistory(keepFavorites = true): number {
    const history = this.store.get('history', []);
    const originalCount = history.length;

    if (keepFavorites) {
      const favorites = history.filter((entry) => entry.isFavorite);
      this.store.set('history', favorites);
      return originalCount - favorites.length;
    } else {
      this.store.set('history', []);
      return originalCount;
    }
  }

  getStats() {
    const history = this.store.get('history', []);
    const favorites = history.filter((entry) => entry.isFavorite);
    const totalUsage = history.reduce((sum, entry) => sum + entry.usageCount, 0);

    return {
      totalEntries: history.length,
      favoritesCount: favorites.length,
      totalUsage,
      oldestEntry: history.length > 0 ? Math.min(...history.map((e) => e.timestamp)) : null,
      newestEntry: history.length > 0 ? Math.max(...history.map((e) => e.timestamp)) : null,
    };
  }
}
