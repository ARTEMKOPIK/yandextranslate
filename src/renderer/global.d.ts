import type {
  HotkeyStatus,
  TranslationResponse,
  TranslationError,
  TranslationHistoryEntry,
  HistoryFilter,
  HistoryConfig,
  AppSettings,
  HotkeyValidation,
  DeepPartial,
  AnalyticsStats,
  UpdateInfo,
  UpdateProgress,
  UpdateStatus,
  UpdateConfig,
} from '../shared/types';

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

  // History operations
  history: {
    get: (filter?: HistoryFilter) => Promise<TranslationHistoryEntry[]>;
    getFavorites: () => Promise<TranslationHistoryEntry[]>;
    toggleFavorite: (id: string) => Promise<TranslationHistoryEntry | null>;
    delete: (id: string) => Promise<boolean>;
    clear: (keepFavorites: boolean) => Promise<number>;
    getStats: () => Promise<{
      totalEntries: number;
      favoritesCount: number;
      totalUsage: number;
      oldestEntry: number | null;
      newestEntry: number | null;
    } | null>;
    getConfig: () => Promise<HistoryConfig | null>;
    updateConfig: (config: Partial<HistoryConfig>) => Promise<HistoryConfig | null>;
  };

  // Settings operations
  settings: {
    get: () => Promise<AppSettings>;
    update: (updates: DeepPartial<AppSettings>) => Promise<AppSettings>;
    reset: () => Promise<AppSettings>;
    validateHotkey: (hotkey: string) => Promise<HotkeyValidation>;
  };

  // Settings changed event
  onSettingsChanged: (callback: (settings: AppSettings) => void) => () => void;

  // Navigate to settings event (from tray menu)
  onNavigateToSettings: (callback: () => void) => () => void;

  // Logging operations
  getLogs: (limit?: number) => Promise<{ success: boolean; data?: string; error?: string }>;
  clearLogs: () => Promise<{ success: boolean; error?: string }>;
  openLogsFolder: () => Promise<void>;
  logError: (message: string, context?: string, data?: unknown) => Promise<void>;

  // Analytics operations
  getAnalyticsStats: () => Promise<{ success: boolean; data?: AnalyticsStats; error?: string }>;
  resetAnalytics: () => Promise<{ success: boolean; data?: AnalyticsStats; error?: string }>;
  exportAnalytics: () => Promise<{ success: boolean; data?: string; error?: string }>;

  // Update operations
  updater: {
    checkForUpdates: (silent?: boolean) => Promise<{
      success: boolean;
      updateAvailable?: boolean;
      version?: string;
      error?: string;
    }>;
    downloadUpdate: () => Promise<{ success: boolean; error?: string }>;
    quitAndInstall: () => void;
    skipVersion: (version: string) => void;
    clearSkippedVersions: () => void;
    getSkippedVersions: () => Promise<Array<{ version: string; skippedAt: number }>>;
    updateConfig: (config: Partial<UpdateConfig>) => Promise<void>;
    getConfig: () => Promise<UpdateConfig>;
    getStatus: () => Promise<UpdateStatus>;
  };

  // Update events
  onUpdateChecking: (callback: () => void) => () => void;
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => () => void;
  onUpdateNotAvailable: (callback: (info: { version: string }) => void) => () => void;
  onUpdateDownloadProgress: (callback: (progress: UpdateProgress) => void) => () => void;
  onUpdateDownloaded: (callback: (info: { version: string }) => void) => () => void;
  onUpdateError: (callback: (error: { message: string }) => void) => () => void;
  onUpdateSkipped: (callback: (info: { version: string }) => void) => () => void;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
