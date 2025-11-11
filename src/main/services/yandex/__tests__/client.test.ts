import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { YandexApiClient } from '../client.js';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(),
    isAxiosError: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios, true);

describe('YandexApiClient', () => {
  let client: YandexApiClient;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.create.mockReturnValue({
      post: vi.fn(),
    } as any);
    client = new YandexApiClient(mockApiKey);
  });

  describe('translate', () => {
    it('should successfully translate text', async () => {
      const mockResponse = {
        data: {
          translations: [
            {
              text: 'Hello',
              detectedLanguageCode: 'ru',
            },
          ],
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.post = mockPost;

      const result = await client.translate({
        texts: ['Привет'],
        targetLanguageCode: 'en',
        sourceLanguageCode: 'ru',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockPost).toHaveBeenCalledWith('/translate', {
        texts: ['Привет'],
        targetLanguageCode: 'en',
        sourceLanguageCode: 'ru',
      });
    });

    it('should handle 401 authentication error', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      const mockPost = vi.fn().mockRejectedValue(axiosError);
      (client as any).client.post = mockPost;
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(
        client.translate({
          texts: ['Test'],
          targetLanguageCode: 'en',
        })
      ).rejects.toThrow('Invalid or expired API key');
    });

    it('should handle 429 rate limit error', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 429,
          data: { message: 'Too many requests' },
        },
      };
      const mockPost = vi.fn().mockRejectedValue(axiosError);
      (client as any).client.post = mockPost;
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(
        client.translate({
          texts: ['Test'],
          targetLanguageCode: 'en',
        })
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle 500 server error', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };
      const mockPost = vi.fn().mockRejectedValue(axiosError);
      (client as any).client.post = mockPost;
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(
        client.translate({
          texts: ['Test'],
          targetLanguageCode: 'en',
        })
      ).rejects.toThrow('Yandex API service unavailable');
    });

    it('should handle network error', async () => {
      const axiosError = {
        isAxiosError: true,
        request: {},
      };
      const mockPost = vi.fn().mockRejectedValue(axiosError);
      (client as any).client.post = mockPost;
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(
        client.translate({
          texts: ['Test'],
          targetLanguageCode: 'en',
        })
      ).rejects.toThrow('Network error: No response from Yandex API');
    });
  });

  describe('detect', () => {
    it('should successfully detect language', async () => {
      const mockResponse = {
        data: {
          languageCode: 'ru',
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.post = mockPost;

      const result = await client.detect({
        text: 'Привет',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockPost).toHaveBeenCalledWith('/detect', {
        text: 'Привет',
      });
    });

    it('should handle detection errors', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { message: 'Invalid text' },
        },
      };
      const mockPost = vi.fn().mockRejectedValue(axiosError);
      (client as any).client.post = mockPost;
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(
        client.detect({
          text: '',
        })
      ).rejects.toThrow('Yandex API error: Invalid text');
    });
  });
});
