import { create } from 'zustand';
import type { TranslationHistoryEntry, HistoryFilter, HistoryConfig } from '../../shared/types';

interface HistoryState {
  entries: TranslationHistoryEntry[];
  favorites: TranslationHistoryEntry[];
  filter: HistoryFilter;
  config: HistoryConfig | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadHistory: (filter?: HistoryFilter) => Promise<void>;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  clearHistory: (keepFavorites: boolean) => Promise<void>;
  setFilter: (filter: HistoryFilter) => void;
  loadConfig: () => Promise<void>;
  updateConfig: (config: Partial<HistoryConfig>) => Promise<void>;
  retranslate: (entry: TranslationHistoryEntry) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: [],
  favorites: [],
  filter: {},
  config: null,
  isLoading: false,
  error: null,

  loadHistory: async (filter?: HistoryFilter) => {
    set({ isLoading: true, error: null });
    try {
      const entries = await window.api.history.get(filter);
      set({ entries, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load history',
        isLoading: false,
      });
    }
  },

  loadFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const favorites = await window.api.history.getFavorites();
      set({ favorites, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load favorites',
        isLoading: false,
      });
    }
  },

  toggleFavorite: async (id: string) => {
    try {
      const updatedEntry = await window.api.history.toggleFavorite(id);
      if (updatedEntry) {
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? updatedEntry : e)),
        }));
        // Reload favorites to keep them up to date
        get().loadFavorites();
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to toggle favorite' });
    }
  },

  deleteEntry: async (id: string) => {
    try {
      const success = await window.api.history.delete(id);
      if (success) {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
          favorites: state.favorites.filter((e) => e.id !== id),
        }));
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete entry' });
    }
  },

  clearHistory: async (keepFavorites: boolean) => {
    try {
      await window.api.history.clear(keepFavorites);
      await get().loadHistory();
      await get().loadFavorites();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to clear history' });
    }
  },

  setFilter: (filter: HistoryFilter) => {
    set({ filter });
    get().loadHistory(filter);
  },

  loadConfig: async () => {
    try {
      const config = await window.api.history.getConfig();
      set({ config });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load config' });
    }
  },

  updateConfig: async (config: Partial<HistoryConfig>) => {
    try {
      const updatedConfig = await window.api.history.updateConfig(config);
      set({ config: updatedConfig });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update config' });
    }
  },

  retranslate: async (entry: TranslationHistoryEntry) => {
    try {
      const result = await window.api.translate(
        entry.sourceText,
        entry.targetLang,
        entry.sourceLang
      );
      if (result.success && result.data) {
        // The translation will be automatically added to history via the main process
        // Reload history to get the updated entry
        await get().loadHistory(get().filter);
      } else {
        throw new Error(result.error?.message || 'Translation failed');
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to retranslate' });
    }
  },
}));
