import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiApiClient } from '../client.js';

const mockGenerateContent = vi.fn();

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: function (_apiKey: string) {
    return {
      getGenerativeModel: function () {
        return {
          generateContent: mockGenerateContent,
        };
      },
    };
  },
}));

describe('GeminiApiClient', () => {
  let client: GeminiApiClient;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateContent.mockClear();
    client = new GeminiApiClient(mockApiKey);
  });

  describe('translate', () => {
    it('should successfully translate text with source language', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'Привет',
        },
      });

      const result = await client.translate({
        text: 'Hello',
        targetLanguageCode: 'ru',
        sourceLanguageCode: 'en',
      });

      expect(result.translatedText).toBe('Привет');
      expect(result.detectedLanguageCode).toBe('en');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Translate the following text from en to ru')
      );
    });

    it('should successfully translate text with auto-detection', async () => {
      const mockResponse = JSON.stringify({
        detectedLanguage: 'en',
        translation: 'Привет',
      });

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => mockResponse,
        },
      });

      const result = await client.translate({
        text: 'Hello',
        targetLanguageCode: 'ru',
      });

      expect(result.translatedText).toBe('Привет');
      expect(result.detectedLanguageCode).toBe('en');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Detect the language')
      );
    });

    it('should handle JSON response with code blocks', async () => {
      const mockResponse = '```json\n{"detectedLanguage": "en", "translation": "Привет"}\n```';

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => mockResponse,
        },
      });

      const result = await client.translate({
        text: 'Hello',
        targetLanguageCode: 'ru',
      });

      expect(result.translatedText).toBe('Привет');
      expect(result.detectedLanguageCode).toBe('en');
    });

    it('should handle invalid JSON gracefully', async () => {
      const mockResponse = 'Just plain text translation';

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => mockResponse,
        },
      });

      const result = await client.translate({
        text: 'Hello',
        targetLanguageCode: 'ru',
      });

      expect(result.translatedText).toBe('Just plain text translation');
      expect(result.detectedLanguageCode).toBe('unknown');
    });

    it('should handle empty translation response', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => '',
        },
      });

      await expect(
        client.translate({
          text: 'Hello',
          targetLanguageCode: 'ru',
        })
      ).rejects.toThrow('Empty translation response from Gemini');
    });

    it('should handle API key error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Invalid API key provided'));

      await expect(
        client.translate({
          text: 'Hello',
          targetLanguageCode: 'ru',
        })
      ).rejects.toThrow('Invalid or expired API key');
    });

    it('should handle rate limit error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(
        client.translate({
          text: 'Hello',
          targetLanguageCode: 'ru',
        })
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle service unavailable error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Service unavailable (503)'));

      await expect(
        client.translate({
          text: 'Hello',
          targetLanguageCode: 'ru',
        })
      ).rejects.toThrow('Google Gemini API service unavailable');
    });

    it('should handle network error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Network timeout'));

      await expect(
        client.translate({
          text: 'Hello',
          targetLanguageCode: 'ru',
        })
      ).rejects.toThrow('Network error: No response from Google Gemini API');
    });
  });

  describe('detect', () => {
    it('should successfully detect language', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'en',
        },
      });

      const result = await client.detect('Hello');

      expect(result).toBe('en');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Detect the language')
      );
    });

    it('should handle invalid language code', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'This is a very long invalid response',
        },
      });

      const result = await client.detect('Hello');

      expect(result).toBe('unknown');
    });

    it('should handle detection errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Detection failed'));

      await expect(client.detect('Hello')).rejects.toThrow(
        'Google Gemini API error: Detection failed'
      );
    });
  });
});
