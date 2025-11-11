import Store from 'electron-store';
import { AppSettings, HotkeyValidation, DeepPartial } from '../../shared/types.js';

const DEFAULT_SETTINGS: AppSettings = {
  general: {
    historyMaxEntries: 1000,
    startMinimizedToTray: false,
    closeToTray: true,
  },
  hotkeys: {
    overlay: 'Super+T',
  },
  interface: {
    language: 'ru',
  },
  theme: {
    mode: 'dark',
  },
  tray: {
    showNotifications: true,
    showTranslationComplete: false,
  },
};

interface StoreSchema {
  settings: AppSettings;
}

export class SettingsService {
  private store: Store<StoreSchema>;

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'app-settings',
      defaults: {
        settings: DEFAULT_SETTINGS,
      },
    });
  }

  getSettings(): AppSettings {
    return this.store.get('settings', DEFAULT_SETTINGS);
  }

  updateSettings(updates: DeepPartial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated: AppSettings = {
      general: { ...current.general, ...(updates.general || {}) },
      hotkeys: { ...current.hotkeys, ...(updates.hotkeys || {}) },
      interface: { ...current.interface, ...(updates.interface || {}) },
      theme: { ...current.theme, ...(updates.theme || {}) },
      tray: { ...current.tray, ...(updates.tray || {}) },
    };
    this.store.set('settings', updated);
    return updated;
  }

  resetSettings(): AppSettings {
    this.store.set('settings', DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  validateHotkey(hotkey: string): HotkeyValidation {
    if (!hotkey || hotkey.trim() === '') {
      return { valid: false, error: 'Hotkey cannot be empty' };
    }

    // Basic validation for hotkey format
    const validModifiers = [
      'CommandOrControl',
      'Command',
      'Control',
      'Ctrl',
      'Alt',
      'Option',
      'AltGr',
      'Shift',
      'Super',
      'Meta',
    ];
    const parts = hotkey.split('+').map((p) => p.trim());

    if (parts.length < 2) {
      return { valid: false, error: 'Hotkey must include at least one modifier and one key' };
    }

    // Check if all parts except the last are valid modifiers
    const modifiers = parts.slice(0, -1);
    const invalidModifiers = modifiers.filter((m) => !validModifiers.includes(m));

    if (invalidModifiers.length > 0) {
      return { valid: false, error: `Invalid modifiers: ${invalidModifiers.join(', ')}` };
    }

    // Check if the last part (the key) is not empty
    const key = parts[parts.length - 1];
    if (!key || key.length === 0) {
      return { valid: false, error: 'Hotkey must include a key' };
    }

    return { valid: true };
  }

  getDefaultSettings(): AppSettings {
    return DEFAULT_SETTINGS;
  }
}
