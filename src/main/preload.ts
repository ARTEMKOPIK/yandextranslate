import { contextBridge, ipcRenderer } from 'electron';

export const api = {
  getVersion: () => ipcRenderer.invoke('app-version'),
  onAppVersionReply: (callback: (version: string) => void) =>
    ipcRenderer.on('app-version', (_, { version }) => callback(version)),

  // Overlay window controls
  toggleOverlay: () => ipcRenderer.invoke('toggle-overlay'),
  hideOverlay: () => ipcRenderer.invoke('hide-overlay'),

  // Hotkey status
  getHotkeyStatus: () => ipcRenderer.invoke('get-hotkey-status'),
  onHotkeyStatus: (
    callback: (status: {
      registered: boolean;
      shortcut: string | null;
      error: string | null;
    }) => void
  ) => {
    const subscription = (
      _: unknown,
      status: { registered: boolean; shortcut: string | null; error: string | null }
    ) => callback(status);
    ipcRenderer.on('hotkey-status', subscription);
    return () => ipcRenderer.removeListener('hotkey-status', subscription);
  },

  // Overlay visibility events
  onOverlayShown: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on('overlay-shown', subscription);
    return () => ipcRenderer.removeListener('overlay-shown', subscription);
  },
  onOverlayHidden: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on('overlay-hidden', subscription);
    return () => ipcRenderer.removeListener('overlay-hidden', subscription);
  },

  // Reload shortcuts
  reloadShortcuts: () => ipcRenderer.send('reload-shortcuts'),

  // Translation API
  translate: (text: string, targetLang: string, sourceLang?: string) =>
    ipcRenderer.invoke('translate', text, targetLang, sourceLang),
  validateApiKey: () => ipcRenderer.invoke('validate-api-key'),

  // Clipboard operations
  copyToClipboard: (text: string) => ipcRenderer.invoke('copy-to-clipboard', text),
  readClipboard: () => ipcRenderer.invoke('read-clipboard'),
  pasteIntoActiveWindow: (text: string) => ipcRenderer.invoke('paste-into-active-window', text),
};

contextBridge.exposeInMainWorld('api', api);
