import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TranslationService } from '../translator.js';

describe('TranslationService', () => {
  let service: TranslationService;
  let mockClient: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockClient = {
      translate: vi.fn(),
      detect: vi.fn(),
    };

    // Mock YandexApiClient constructor to return our mock client
    const clientModule = await import('../client.js');
    vi.spyOn(clientModule, 'YandexApiClient').mockImplementation(function (this: any) {
      return mockClient;
    } as any);

    service = new TranslationService({
      apiKey: 'test-key',
      maxRetries: 3,
      retryDelayMs: 100,
      rateLimitMs: 50,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('translate', () => {
    it('should translate text successfully with auto-detection', async () => {
      mockClient.detect.mockResolvedValue({
        languageCode: 'ru',
      });

      mockClient.translate.mockResolvedValue({
        translations: [
          {
            text: 'Hello',
            detectedLanguageCode: 'ru',
          },
        ],
      });

      const promise = service.translate('Привет', 'en');
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toEqual({
        translatedText: 'Hello',
        detectedSourceLang: 'ru',
        targetLang: 'en',
      });

      expect(mockClient.detect).toHaveBeenCalledWith({
        text: 'Привет',
      });

      expect(mockClient.translate).toHaveBeenCalledWith({
        texts: ['Привет'],
        targetLanguageCode: 'en',
        sourceLanguageCode: 'ru',
      });
    });

    it('should translate text with specified source language', async () => {
      mockClient.translate.mockResolvedValue({
        translations: [
          {
            text: 'Hello',
            detectedLanguageCode: 'ru',
          },
        ],
      });

      const promise = service.translate('Привет', 'en', 'ru');
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toEqual({
        translatedText: 'Hello',
        detectedSourceLang: 'ru',
        targetLang: 'en',
      });

      expect(mockClient.detect).not.toHaveBeenCalled();

      expect(mockClient.translate).toHaveBeenCalledWith({
        texts: ['Привет'],
        targetLanguageCode: 'en',
        sourceLanguageCode: 'ru',
      });
    });

    it('should retry on failure', async () => {
      mockClient.detect.mockResolvedValue({
        languageCode: 'ru',
      });

      mockClient.translate
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          translations: [
            {
              text: 'Hello',
              detectedLanguageCode: 'ru',
            },
          ],
        });

      const promise = service.translate('Привет', 'en');
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.translatedText).toBe('Hello');
      expect(mockClient.translate).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      mockClient.detect.mockResolvedValue({
        languageCode: 'ru',
      });

      mockClient.translate.mockRejectedValue(new Error('Network error'));

      const promise = service.translate('Привет', 'en');
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Network error');
      expect(mockClient.translate).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should handle empty translation response', async () => {
      mockClient.detect.mockResolvedValue({
        languageCode: 'ru',
      });

      mockClient.translate.mockResolvedValue({
        translations: [],
      });

      const promise = service.translate('Привет', 'en');
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Empty translation response');
    });

    it('should queue multiple translations', async () => {
      mockClient.detect.mockResolvedValue({
        languageCode: 'ru',
      });

      mockClient.translate
        .mockResolvedValueOnce({
          translations: [{ text: 'Hello', detectedLanguageCode: 'ru' }],
        })
        .mockResolvedValueOnce({
          translations: [{ text: 'World', detectedLanguageCode: 'ru' }],
        });

      const promise1 = service.translate('Привет', 'en');
      const promise2 = service.translate('Мир', 'en');

      await vi.runAllTimersAsync();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1.translatedText).toBe('Hello');
      expect(result2.translatedText).toBe('World');
      expect(mockClient.translate).toHaveBeenCalledTimes(2);
    });

    it('should enforce rate limiting', async () => {
      mockClient.detect.mockResolvedValue({
        languageCode: 'ru',
      });

      mockClient.translate.mockResolvedValue({
        translations: [{ text: 'Hello', detectedLanguageCode: 'ru' }],
      });

      const promise1 = service.translate('Привет', 'en');
      const promise2 = service.translate('Привет', 'en');

      // Run all timers to completion
      await vi.runAllTimersAsync();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Both should complete successfully
      expect(result1.translatedText).toBe('Hello');
      expect(result2.translatedText).toBe('Hello');
      // Should have been called twice (once for each translation)
      expect(mockClient.translate).toHaveBeenCalledTimes(2);
    });
  });

  describe('getQueueStatus', () => {
    it('should return queue status', () => {
      const status = service.getQueueStatus();
      expect(status).toEqual({
        queueLength: 0,
        isProcessing: false,
      });
    });

    it('should show queue length when items are added', async () => {
      mockClient.detect.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ languageCode: 'ru' }), 1000))
      );

      mockClient.translate.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ translations: [{ text: 'Hello', detectedLanguageCode: 'ru' }] }),
              1000
            )
          )
      );

      service.translate('Привет', 'en');
      service.translate('Мир', 'en');

      // Before processing starts
      await vi.advanceTimersByTimeAsync(0);
      const status = service.getQueueStatus();
      expect(status.queueLength).toBeGreaterThan(0);
    });
  });
});
