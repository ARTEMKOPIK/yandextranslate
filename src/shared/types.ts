export interface AppVersion {
  version: string;
}

export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationResult {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

export interface HotkeyStatus {
  registered: boolean;
  shortcut: string | null;
  primary?: string;
  fallback?: string;
  error?: string | null;
}

export interface TranslationResponse {
  translatedText: string;
  detectedSourceLang: string;
  targetLang: string;
}

export interface TranslationError {
  code: string;
  message: string;
}

export interface TranslationHistoryEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
  isFavorite: boolean;
  usageCount: number;
}

export interface HistoryFilter {
  search?: string;
  sourceLang?: string;
  targetLang?: string;
  onlyFavorites?: boolean;
  startDate?: number;
  endDate?: number;
}

export interface HistoryConfig {
  maxEntries: number;
  enableEncryption: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'ru' | 'en';

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface AppSettings {
  general: {
    historyMaxEntries: number;
    startMinimizedToTray: boolean;
    closeToTray: boolean;
  };
  hotkeys: {
    overlay: string;
  };
  interface: {
    language: Language;
  };
  theme: {
    mode: ThemeMode;
  };
  tray: {
    showNotifications: boolean;
    showTranslationComplete: boolean;
  };
}

export interface HotkeyValidation {
  valid: boolean;
  error?: string;
}

export interface UsageMetrics {
  translations: number;
  favorites: number;
  pastes: number;
  copies: number;
  overlayShows: number;
  errors: number;
  lastReset: number;
}

export interface AnalyticsStats extends UsageMetrics {
  since: string;
  daysTracked: number;
}
