import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HistoryService } from '../history';
import type { HistoryFilter } from '../../../shared/types';

let storage: Record<string, unknown> = {
  history: [],
  config: { maxEntries: 1000, enableEncryption: false },
};

vi.mock('electron-store', () => {
  const MockStore = function () {
    return {
      get: (key: string, defaultValue?: unknown) => {
        return storage[key] ?? defaultValue;
      },
      set: (key: string, value: unknown) => {
        storage[key] = value;
      },
      clear: () => {
        storage = { history: [], config: { maxEntries: 1000, enableEncryption: false } };
      },
    };
  };

  return {
    default: MockStore,
  };
});

describe('HistoryService', () => {
  let historyService: HistoryService;

  beforeEach(() => {
    storage = {
      history: [],
      config: { maxEntries: 1000, enableEncryption: false },
    };
    historyService = new HistoryService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should add a new entry to history', () => {
    const entry = historyService.addEntry('Hello', 'Привет', 'en', 'ru');

    expect(entry).toMatchObject({
      sourceText: 'Hello',
      translatedText: 'Привет',
      sourceLang: 'en',
      targetLang: 'ru',
      isFavorite: false,
      usageCount: 1,
    });
    expect(entry.id).toBeDefined();
    expect(entry.timestamp).toBeGreaterThan(0);
  });

  it('should increment usage count for duplicate entries', () => {
    const entry1 = historyService.addEntry('Hello', 'Привет', 'en', 'ru');
    const entry2 = historyService.addEntry('Hello', 'Привет', 'en', 'ru');

    expect(entry2.usageCount).toBe(2);
    expect(entry2.id).toBe(entry1.id);
  });

  it('should retrieve all history entries', () => {
    historyService.addEntry('Hello', 'Привет', 'en', 'ru');
    historyService.addEntry('World', 'Мир', 'en', 'ru');

    const history = historyService.getHistory();
    expect(history).toHaveLength(2);
  });

  it('should filter history by search query', () => {
    historyService.addEntry('Hello', 'Привет', 'en', 'ru');
    historyService.addEntry('World', 'Мир', 'en', 'ru');

    const filter: HistoryFilter = { search: 'Hello' };
    const results = historyService.getHistory(filter);

    expect(results).toHaveLength(1);
    expect(results[0].sourceText).toBe('Hello');
  });

  it('should filter history by language', () => {
    historyService.addEntry('Hello', 'Bonjour', 'en', 'fr');
    historyService.addEntry('Hello', 'Hola', 'en', 'es');

    const filter: HistoryFilter = { targetLang: 'fr' };
    const results = historyService.getHistory(filter);

    expect(results).toHaveLength(1);
    expect(results[0].translatedText).toBe('Bonjour');
  });

  it('should toggle favorite status', () => {
    const entry = historyService.addEntry('Hello', 'Привет', 'en', 'ru');

    const toggled = historyService.toggleFavorite(entry.id);
    expect(toggled?.isFavorite).toBe(true);

    const toggledAgain = historyService.toggleFavorite(entry.id);
    expect(toggledAgain?.isFavorite).toBe(false);
  });

  it('should get only favorites', () => {
    const entry1 = historyService.addEntry('Hello', 'Привет', 'en', 'ru');
    historyService.addEntry('World', 'Мир', 'en', 'ru');

    historyService.toggleFavorite(entry1.id);

    const favorites = historyService.getFavorites();
    expect(favorites).toHaveLength(1);
    expect(favorites[0].id).toBe(entry1.id);
  });

  it('should delete an entry', () => {
    const entry = historyService.addEntry('Hello', 'Привет', 'en', 'ru');

    const deleted = historyService.deleteEntry(entry.id);
    expect(deleted).toBe(true);

    const history = historyService.getHistory();
    expect(history).toHaveLength(0);
  });

  it('should clear history', () => {
    historyService.addEntry('Hello', 'Привет', 'en', 'ru');
    historyService.addEntry('World', 'Мир', 'en', 'ru');

    const cleared = historyService.clearHistory(false);
    expect(cleared).toBe(2);

    const history = historyService.getHistory();
    expect(history).toHaveLength(0);
  });

  it('should keep favorites when clearing history', () => {
    const entry1 = historyService.addEntry('Hello', 'Привет', 'en', 'ru');
    historyService.addEntry('World', 'Мир', 'en', 'ru');

    historyService.toggleFavorite(entry1.id);

    const cleared = historyService.clearHistory(true);
    expect(cleared).toBe(1);

    const history = historyService.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe(entry1.id);
  });

  it('should update config', () => {
    const newConfig = historyService.updateConfig({ maxEntries: 500 });

    expect(newConfig.maxEntries).toBe(500);
    expect(newConfig.enableEncryption).toBe(false);
  });

  it('should return stats', () => {
    historyService.addEntry('Hello', 'Привет', 'en', 'ru');
    const entry2 = historyService.addEntry('World', 'Мир', 'en', 'ru');
    historyService.toggleFavorite(entry2.id);

    const stats = historyService.getStats();

    expect(stats.totalEntries).toBe(2);
    expect(stats.favoritesCount).toBe(1);
    expect(stats.totalUsage).toBe(2);
  });
});
