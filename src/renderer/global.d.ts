import type { HotkeyStatus } from '../shared/types';

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
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
