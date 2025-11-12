import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { GeminiTranslateRequest, GeminiTranslateResponse } from './types.js';

export class GeminiApiClient {
  private model: GenerativeModel;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async translate(request: GeminiTranslateRequest): Promise<GeminiTranslateResponse> {
    try {
      const { text, targetLanguageCode, sourceLanguageCode } = request;

      let prompt: string;
      let needsJsonParsing = false;

      if (sourceLanguageCode) {
        prompt = `Translate the following text from ${sourceLanguageCode} to ${targetLanguageCode}. Respond ONLY with the translation, no explanations or additional text:\n\n${text}`;
      } else {
        prompt = `Detect the language of the following text and translate it to ${targetLanguageCode}. Respond in JSON format with keys "detectedLanguage" (ISO 639-1 code) and "translation" (the translated text). Do not include any other text:\n\n${text}`;
        needsJsonParsing = true;
      }

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const translatedText = response.text();

      if (!translatedText || translatedText.trim().length === 0) {
        throw new Error('Empty translation response from Gemini');
      }

      if (needsJsonParsing) {
        try {
          const cleanedText = translatedText
            .trim()
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '');
          const parsed = JSON.parse(cleanedText);

          if (!parsed.translation || !parsed.detectedLanguage) {
            throw new Error('Invalid JSON response format');
          }

          return {
            translatedText: parsed.translation,
            detectedLanguageCode: parsed.detectedLanguage,
          };
        } catch (parseError) {
          return {
            translatedText: translatedText.trim(),
            detectedLanguageCode: 'unknown',
          };
        }
      }

      return {
        translatedText: translatedText.trim(),
        detectedLanguageCode: sourceLanguageCode,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async detect(text: string): Promise<string> {
    try {
      const prompt = `Detect the language of the following text and respond ONLY with the ISO 639-1 language code (e.g., "en" for English, "ru" for Russian, etc.). No explanations:\n\n${text}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const languageCode = response.text().trim().toLowerCase();

      if (languageCode.length > 5) {
        return 'unknown';
      }

      return languageCode;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (
        message.includes('api key') ||
        message.includes('unauthorized') ||
        message.includes('forbidden')
      ) {
        return new Error('Invalid or expired API key');
      }

      if (message.includes('quota') || message.includes('rate limit') || message.includes('429')) {
        return new Error('Rate limit exceeded');
      }

      if (
        message.includes('500') ||
        message.includes('503') ||
        message.includes('service unavailable')
      ) {
        return new Error('Google Gemini API service unavailable');
      }

      if (message.includes('network') || message.includes('timeout')) {
        return new Error('Network error: No response from Google Gemini API');
      }

      return new Error(`Google Gemini API error: ${error.message}`);
    }

    return new Error('Unknown error occurred');
  }
}
