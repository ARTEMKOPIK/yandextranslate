import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHistoryStore } from '../historyStore';

const mockHistory = [
  {
    id: '1',
    sourceText: 'Hello',
    translatedText: 'Привет',
    sourceLang: 'en',
    targetLang: 'ru',
    timestamp: Date.now(),
    isFavorite: false,
    usageCount: 1,
  },
  {
    id: '2',
    sourceText: 'World',
    translatedText: 'Мир',
    sourceLang: 'en',
    targetLang: 'ru',
    timestamp: Date.now(),
    isFavorite: true,
    usageCount: 3,
  },
];

describe('historyStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store state
    useHistoryStore.setState({
      entries: [],
      favorites: [],
      config: null,
      isLoading: false,
      error: null,
      filter: {},
    });

    // Mock window.api.history
    (global as any).window = {
      api: {
        history: {
          get: vi.fn().mockResolvedValue(mockHistory),
          getFavorites: vi.fn().mockResolvedValue([mockHistory[1]]),
          toggleFavorite: vi.fn().mockResolvedValue(undefined),
          delete: vi.fn().mockResolvedValue(undefined),
          clear: vi.fn().mockResolvedValue(undefined),
        },
        translate: vi.fn(),
      },
    };
  });

  describe('loadHistory', () => {
    it('should load history successfully', async () => {
      await useHistoryStore.getState().loadHistory();

      const state = useHistoryStore.getState();
      expect(state.entries).toEqual(mockHistory);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle loading errors', async () => {
      (window.api.history.get as any).mockRejectedValue(new Error('Load failed'));

      await useHistoryStore.getState().loadHistory();

      const state = useHistoryStore.getState();
      expect(state.error).toBe('Load failed');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('loadFavorites', () => {
    it('should load favorites successfully', async () => {
      await useHistoryStore.getState().loadFavorites();

      const state = useHistoryStore.getState();
      expect(state.favorites).toEqual([mockHistory[1]]);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite successfully', async () => {
      await useHistoryStore.getState().toggleFavorite('1');

      expect(window.api.history.toggleFavorite).toHaveBeenCalledWith('1');
    });
  });

  describe('deleteEntry', () => {
    it('should delete entry successfully', async () => {
      await useHistoryStore.getState().deleteEntry('1');

      expect(window.api.history.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('clearHistory', () => {
    it('should clear history successfully', async () => {
      await useHistoryStore.getState().clearHistory(false);

      expect(window.api.history.clear).toHaveBeenCalled();
    });
  });
});
