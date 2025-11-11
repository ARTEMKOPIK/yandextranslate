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

  // History operations
  history: {
    get: (filter?: unknown) => ipcRenderer.invoke('history:get', filter),
    getFavorites: () => ipcRenderer.invoke('history:get-favorites'),
    toggleFavorite: (id: string) => ipcRenderer.invoke('history:toggle-favorite', id),
    delete: (id: string) => ipcRenderer.invoke('history:delete', id),
    clear: (keepFavorites: boolean) => ipcRenderer.invoke('history:clear', keepFavorites),
    getStats: () => ipcRenderer.invoke('history:get-stats'),
    getConfig: () => ipcRenderer.invoke('history:get-config'),
    updateConfig: (config: unknown) => ipcRenderer.invoke('history:update-config', config),
  },

  // Settings operations
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (updates: unknown) => ipcRenderer.invoke('settings:update', updates),
    reset: () => ipcRenderer.invoke('settings:reset'),
    validateHotkey: (hotkey: string) => ipcRenderer.invoke('settings:validate-hotkey', hotkey),
  },

  // Settings changed event
  onSettingsChanged: (callback: (settings: unknown) => void) => {
    const subscription = (_: unknown, settings: unknown) => callback(settings);
    ipcRenderer.on('settings-changed', subscription);
    return () => ipcRenderer.removeListener('settings-changed', subscription);
  },

  // Navigate to settings event (from tray menu)
  onNavigateToSettings: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on('navigate-to-settings', subscription);
    return () => ipcRenderer.removeListener('navigate-to-settings', subscription);
  },

  // Logging operations
  getLogs: (limit?: number) => ipcRenderer.invoke('logs:get', limit),
  clearLogs: () => ipcRenderer.invoke('logs:clear'),
  openLogsFolder: () => ipcRenderer.invoke('logs:open-folder'),
  logError: (message: string, context?: string, data?: unknown) =>
    ipcRenderer.invoke('logs:error', message, context, data),

  // Analytics operations
  getAnalyticsStats: () => ipcRenderer.invoke('analytics:get-stats'),
  resetAnalytics: () => ipcRenderer.invoke('analytics:reset'),
  exportAnalytics: () => ipcRenderer.invoke('analytics:export'),
};

contextBridge.exposeInMainWorld('api', api);
