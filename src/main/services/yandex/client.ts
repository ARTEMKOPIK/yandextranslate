import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  YandexTranslateRequest,
  YandexTranslateResponse,
  YandexDetectRequest,
  YandexDetectResponse,
  YandexApiError,
} from './types.js';

export class YandexApiClient {
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: 'https://translate.api.cloud.yandex.net/translate/v2',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Api-Key ${apiKey}`,
      },
      timeout: 10000,
    });
  }

  async translate(request: YandexTranslateRequest): Promise<YandexTranslateResponse> {
    try {
      const response = await this.client.post<YandexTranslateResponse>('/translate', request);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async detect(request: YandexDetectRequest): Promise<YandexDetectResponse> {
    try {
      const response = await this.client.post<YandexDetectResponse>('/detect', request);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<YandexApiError>;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data;

        if (status === 401 || status === 403) {
          return new Error('Invalid or expired API key');
        }

        if (status === 429) {
          return new Error('Rate limit exceeded');
        }

        if (status >= 500) {
          return new Error('Yandex API service unavailable');
        }

        if (data && typeof data === 'object' && 'message' in data) {
          return new Error(`Yandex API error: ${data.message}`);
        }

        return new Error(`HTTP error ${status}`);
      }

      if (axiosError.request) {
        return new Error('Network error: No response from Yandex API');
      }

      return new Error(axiosError.message || 'Unknown axios error');
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('Unknown error occurred');
  }
}
