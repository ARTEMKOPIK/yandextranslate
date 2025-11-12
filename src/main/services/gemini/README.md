# Google Gemini Translation Service

This module provides translation services using the Google Gemini API. It includes:

## Components

### `client.ts` - GeminiApiClient

A client for interacting with the Google Gemini API for translation tasks.

**Features:**
- Translate text using Google Gemini LLM
- Automatic language detection
- Comprehensive error handling
- Timeout support

**Usage:**
```typescript
const client = new GeminiApiClient('your-api-key');

// Translate with known source language
const result = await client.translate({
  text: 'Hello, world!',
  targetLanguageCode: 'ru',
  sourceLanguageCode: 'en'
});

// Translate with auto-detection
const result = await client.translate({
  text: 'Hello, world!',
  targetLanguageCode: 'ru'
});

// Detect language only
const langCode = await client.detect('Hello, world!');
```

### `translator.ts` - TranslationService

A high-level translation service that wraps the Gemini API client with additional features:

**Features:**
- Request queuing
- Automatic retries with exponential backoff
- Rate limiting
- Configurable concurrency

**Usage:**
```typescript
const service = new TranslationService({
  apiKey: 'your-api-key',
  maxRetries: 3,
  retryDelayMs: 1000,
  rateLimitMs: 200,
});

const result = await service.translate('Hello', 'ru', 'en');
console.log(result.translatedText); // Привет
console.log(result.detectedSourceLang); // en
console.log(result.targetLang); // ru
```

### `types.ts`

TypeScript type definitions for the Gemini API and translation service.

## Configuration

The service supports the following configuration options:

- `apiKey`: Google Gemini API key (required)
- `maxRetries`: Maximum number of retry attempts (default: 3)
- `retryDelayMs`: Base delay between retries in milliseconds (default: 1000)
- `rateLimitMs`: Minimum time between API requests in milliseconds (default: 200)
- `queueConcurrency`: Number of concurrent requests (default: 1)

## Error Handling

The client handles various error scenarios:

- **Invalid API Key**: Returns "Invalid or expired API key"
- **Rate Limiting**: Returns "Rate limit exceeded"
- **Service Unavailable**: Returns "Google Gemini API service unavailable"
- **Network Errors**: Returns "Network error: No response from Google Gemini API"

## API Key

Get your Google Gemini API key from:
https://ai.google.dev/

Set it as the `GOOGLE_GEMINI_API_KEY` environment variable.
