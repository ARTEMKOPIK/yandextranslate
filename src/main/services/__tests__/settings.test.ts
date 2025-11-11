import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsService } from '../settings';

vi.mock('electron-store', () => {
  const MockStore = function () {
    let data: any = {};
    return {
      get: (key: string, defaultValue?: any) => {
        return data[key] !== undefined ? data[key] : defaultValue;
      },
      set: (key: string, value: any) => {
        data[key] = value;
      },
      clear: () => {
        data = {};
      },
    };
  };
  return { default: MockStore };
});

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    service = new SettingsService();
  });

  describe('getSettings', () => {
    it('should return default settings on first load', () => {
      const settings = service.getSettings();
      expect(settings).toEqual({
        general: {
          historyMaxEntries: 1000,
          startMinimizedToTray: false,
          closeToTray: true,
        },
        hotkeys: { overlay: 'Super+T' },
        interface: { language: 'ru' },
        theme: { mode: 'dark' },
        tray: {
          showNotifications: true,
          showTranslationComplete: false,
        },
      });
    });
  });

  describe('updateSettings', () => {
    it('should update general settings', () => {
      const updated = service.updateSettings({
        general: { historyMaxEntries: 500 },
      });
      expect(updated.general.historyMaxEntries).toBe(500);
      expect(updated.hotkeys.overlay).toBe('Super+T'); // unchanged
    });

    it('should update hotkey settings', () => {
      const updated = service.updateSettings({
        hotkeys: { overlay: 'CommandOrControl+Shift+T' },
      });
      expect(updated.hotkeys.overlay).toBe('CommandOrControl+Shift+T');
    });

    it('should update interface settings', () => {
      const updated = service.updateSettings({
        interface: { language: 'en' },
      });
      expect(updated.interface.language).toBe('en');
    });

    it('should update theme settings', () => {
      const updated = service.updateSettings({
        theme: { mode: 'light' },
      });
      expect(updated.theme.mode).toBe('light');
    });

    it('should persist changes', () => {
      service.updateSettings({ theme: { mode: 'light' } });
      const settings = service.getSettings();
      expect(settings.theme.mode).toBe('light');
    });

    it('should update multiple sections at once', () => {
      const updated = service.updateSettings({
        general: { historyMaxEntries: 2000 },
        theme: { mode: 'system' },
      });
      expect(updated.general.historyMaxEntries).toBe(2000);
      expect(updated.theme.mode).toBe('system');
    });
  });

  describe('resetSettings', () => {
    it('should reset to default settings', () => {
      service.updateSettings({
        general: {
          historyMaxEntries: 500,
          startMinimizedToTray: true,
          closeToTray: false,
        },
        theme: { mode: 'light' },
      });
      const reset = service.resetSettings();
      expect(reset).toEqual({
        general: {
          historyMaxEntries: 1000,
          startMinimizedToTray: false,
          closeToTray: true,
        },
        hotkeys: { overlay: 'Super+T' },
        interface: { language: 'ru' },
        theme: { mode: 'dark' },
        tray: {
          showNotifications: true,
          showTranslationComplete: false,
        },
      });
    });
  });

  describe('validateHotkey', () => {
    it('should validate correct hotkeys', () => {
      expect(service.validateHotkey('Super+T').valid).toBe(true);
      expect(service.validateHotkey('CommandOrControl+Shift+T').valid).toBe(true);
      expect(service.validateHotkey('Ctrl+Alt+Delete').valid).toBe(true);
      expect(service.validateHotkey('Command+Shift+K').valid).toBe(true);
    });

    it('should reject empty hotkeys', () => {
      const result = service.validateHotkey('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject hotkeys without modifiers', () => {
      const result = service.validateHotkey('T');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('modifier');
    });

    it('should reject hotkeys with invalid modifiers', () => {
      const result = service.validateHotkey('Invalid+T');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid modifiers');
    });

    it('should reject hotkeys without a key', () => {
      const result = service.validateHotkey('Ctrl+Alt+');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('key');
    });
  });

  describe('getDefaultSettings', () => {
    it('should return default settings without modifying current', () => {
      service.updateSettings({ theme: { mode: 'light' } });
      const defaults = service.getDefaultSettings();
      const current = service.getSettings();

      expect(defaults.theme.mode).toBe('dark');
      expect(current.theme.mode).toBe('light');
    });
  });
});
