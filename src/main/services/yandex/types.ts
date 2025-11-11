export interface YandexTranslateRequest {
  sourceLanguageCode?: string;
  targetLanguageCode: string;
  texts: string[];
  folderId?: string;
}

export interface YandexTranslateResponse {
  translations: Array<{
    text: string;
    detectedLanguageCode?: string;
  }>;
}

export interface YandexDetectRequest {
  text: string;
  languageCodeHints?: string[];
  folderId?: string;
}

export interface YandexDetectResponse {
  languageCode: string;
}

export interface YandexApiError {
  code: number;
  message: string;
  details?: unknown;
}

export interface TranslationQueueItem {
  text: string;
  targetLang: string;
  sourceLang?: string;
  resolve: (result: TranslationResult) => void;
  reject: (error: Error) => void;
  retries: number;
}

export interface TranslationResult {
  translatedText: string;
  detectedSourceLang: string;
  targetLang: string;
}

export interface TranslationServiceConfig {
  apiKey: string;
  maxRetries?: number;
  retryDelayMs?: number;
  rateLimitMs?: number;
  queueConcurrency?: number;
}
