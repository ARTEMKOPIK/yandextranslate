import { GeminiApiClient } from './client.js';
import { TranslationQueueItem, TranslationResult, TranslationServiceConfig } from './types.js';

export class TranslationService {
  private client: GeminiApiClient;
  private queue: TranslationQueueItem[] = [];
  private isProcessing = false;
  private lastRequestTime = 0;

  private config: Required<TranslationServiceConfig>;

  constructor(config: TranslationServiceConfig) {
    this.client = new GeminiApiClient(config.apiKey);
    this.config = {
      apiKey: config.apiKey,
      maxRetries: config.maxRetries ?? 3,
      retryDelayMs: config.retryDelayMs ?? 1000,
      rateLimitMs: config.rateLimitMs ?? 200,
      queueConcurrency: config.queueConcurrency ?? 1,
    };
  }

  async translate(
    text: string,
    targetLang: string,
    sourceLang?: string
  ): Promise<TranslationResult> {
    return new Promise((resolve, reject) => {
      const item: TranslationQueueItem = {
        text,
        targetLang,
        sourceLang,
        resolve,
        reject,
        retries: 0,
      };

      this.queue.push(item);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      try {
        await this.enforceRateLimit();
        const result = await this.executeTranslation(item);
        item.resolve(result);
      } catch (error) {
        if (item.retries < this.config.maxRetries) {
          item.retries++;
          console.log(`Retrying translation (attempt ${item.retries}/${this.config.maxRetries})`);
          await this.delay(this.config.retryDelayMs * item.retries);
          this.queue.unshift(item);
        } else {
          const errorMessage = error instanceof Error ? error.message : 'Translation failed';
          item.reject(new Error(errorMessage));
        }
      }
    }

    this.isProcessing = false;
  }

  private async executeTranslation(item: TranslationQueueItem): Promise<TranslationResult> {
    const { text, targetLang, sourceLang } = item;

    const response = await this.client.translate({
      text,
      targetLanguageCode: targetLang,
      sourceLanguageCode: sourceLang,
    });

    if (!response.translatedText) {
      throw new Error('Empty translation response');
    }

    return {
      translatedText: response.translatedText,
      detectedSourceLang: response.detectedLanguageCode || sourceLang || 'unknown',
      targetLang,
    };
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.config.rateLimitMs) {
      await this.delay(this.config.rateLimitMs - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public getQueueStatus(): { queueLength: number; isProcessing: boolean } {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
    };
  }
}
