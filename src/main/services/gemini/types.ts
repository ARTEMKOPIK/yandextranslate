export interface GeminiTranslateRequest {
  text: string;
  targetLanguageCode: string;
  sourceLanguageCode?: string;
}

export interface GeminiTranslateResponse {
  translatedText: string;
  detectedLanguageCode?: string;
}

export interface GeminiApiError {
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
