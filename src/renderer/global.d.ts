import type { HotkeyStatus, TranslationResponse, TranslationError } from '../shared/types';

export interface TranslateResult {
  success: boolean;
  data?: TranslationResponse;
  error?: TranslationError;
}

export interface ApiKeyValidation {
  valid: boolean;
  error?: string;
}

export interface ElectronAPI {
  getVersion: () => Promise<{ version: string }>;
  onAppVersionReply: (callback: (version: string) => void) => void;

  // Overlay window controls
  toggleOverlay: () => Promise<void>;
  hideOverlay: () => Promise<void>;

  // Hotkey status
  getHotkeyStatus: () => Promise<HotkeyStatus & { primary: string; fallback: string }>;
  onHotkeyStatus: (callback: (status: HotkeyStatus) => void) => () => void;

  // Overlay visibility events
  onOverlayShown: (callback: () => void) => () => void;
  onOverlayHidden: (callback: () => void) => () => void;

  // Reload shortcuts
  reloadShortcuts: () => void;

  // Translation API
  translate: (text: string, targetLang: string, sourceLang?: string) => Promise<TranslateResult>;
  validateApiKey: () => Promise<ApiKeyValidation>;

  // Clipboard operations
  copyToClipboard: (text: string) => Promise<boolean>;
  readClipboard: () => Promise<string>;
  pasteIntoActiveWindow: (text: string) => Promise<boolean>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
