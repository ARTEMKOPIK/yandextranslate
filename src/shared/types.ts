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
