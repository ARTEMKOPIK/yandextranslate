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
