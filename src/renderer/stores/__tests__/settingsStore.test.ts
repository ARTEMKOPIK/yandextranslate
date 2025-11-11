import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSettingsStore } from '../settingsStore';
import type { AppSettings } from '../../../shared/types';

const mockSettings: AppSettings = {
  general: { historyMaxEntries: 1000 },
  hotkeys: { overlay: 'Super+T' },
  interface: { language: 'ru' },
  theme: { mode: 'dark' },
};

describe('settingsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store state
    useSettingsStore.setState({
      settings: null,
      isLoading: false,
      error: null,
    });

    // Mock window.api.settings
    (global as any).window = {
      api: {
        settings: {
          get: vi.fn().mockResolvedValue(mockSettings),
          update: vi.fn().mockImplementation((updates: Partial<AppSettings>) => {
            return Promise.resolve({ ...mockSettings, ...updates });
          }),
          reset: vi.fn().mockResolvedValue(mockSettings),
          validateHotkey: vi.fn().mockImplementation((hotkey: string) => {
            if (hotkey === 'Super+T') {
              return Promise.resolve({ valid: true });
            }
            return Promise.resolve({ valid: false, error: 'Invalid hotkey' });
          }),
        },
      },
    };
  });

  describe('loadSettings', () => {
    it('should load settings successfully', async () => {
      await useSettingsStore.getState().loadSettings();

      const state = useSettingsStore.getState();
      expect(state.settings).toEqual(mockSettings);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle loading errors', async () => {
      (window.api.settings.get as any).mockRejectedValue(new Error('Load failed'));

      await useSettingsStore.getState().loadSettings();

      const state = useSettingsStore.getState();
      expect(state.error).toBe('Load failed');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('updateSettings', () => {
    it('should update settings successfully', async () => {
      await useSettingsStore.getState().updateSettings({
        theme: { mode: 'light' },
      });

      const state = useSettingsStore.getState();
      expect(state.settings?.theme.mode).toBe('light');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle update errors', async () => {
      (window.api.settings.update as any).mockRejectedValue(new Error('Update failed'));

      await useSettingsStore.getState().updateSettings({ theme: { mode: 'light' } });

      const state = useSettingsStore.getState();
      expect(state.error).toBe('Update failed');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('resetSettings', () => {
    it('should reset settings successfully', async () => {
      await useSettingsStore.getState().resetSettings();

      const state = useSettingsStore.getState();
      expect(state.settings).toEqual(mockSettings);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle reset errors', async () => {
      (window.api.settings.reset as any).mockRejectedValue(new Error('Reset failed'));

      await useSettingsStore.getState().resetSettings();

      const state = useSettingsStore.getState();
      expect(state.error).toBe('Reset failed');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('validateHotkey', () => {
    it('should validate correct hotkey', async () => {
      const validation = await useSettingsStore.getState().validateHotkey('Super+T');
      expect(validation).toEqual({ valid: true });
    });

    it('should reject invalid hotkey', async () => {
      const validation = await useSettingsStore.getState().validateHotkey('InvalidKey');
      expect(validation).toEqual({ valid: false, error: 'Invalid hotkey' });
    });

    it('should handle validation errors', async () => {
      (window.api.settings.validateHotkey as any).mockRejectedValue(new Error('Validation failed'));

      const validation = await useSettingsStore.getState().validateHotkey('Super+T');

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Validation failed');
    });
  });
});
