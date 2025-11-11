# Yandex Translation Service

This module provides integration with Yandex.Translate REST API with automatic language detection, request queuing, rate limiting, and error handling with retries.

## Architecture

### Components

1. **YandexApiClient** (`client.ts`)
   - Low-level HTTP client for Yandex Translate API
   - Handles API requests using axios
   - Provides error handling and mapping of HTTP status codes to user-friendly messages

2. **TranslationService** (`translator.ts`)
   - High-level translation service with advanced features:
     - Request queuing for sequential processing
     - Automatic language detection when source language is not provided
     - Rate limiting to prevent API throttling
     - Automatic retry logic with exponential backoff
     - Configurable retry count and delays

3. **Configuration** (`../config.ts`)
   - API key management from environment variables
   - Validation of API credentials
   - Secure config handling (sensitive data stays in main process)

## Usage

### Setup

1. Create a `.env` file in the project root:

```env
YANDEX_API_KEY=your_api_key_here
```

2. Get your API key from [Yandex Cloud Console](https://cloud.yandex.com/en/docs/iam/concepts/authorization/api-key)

### Translation API

The translation service is exposed to the renderer process via IPC:

```typescript
// Translate with auto-detection
const result = await window.api.translate('Hello world', 'ru');
// result: { success: true, data: { translatedText: '...', detectedSourceLang: 'en', targetLang: 'ru' } }

// Translate with specified source language
const result = await window.api.translate('Hello world', 'ru', 'en');

// Validate API key
const validation = await window.api.validateApiKey();
// validation: { valid: boolean, error?: string }
```

### Error Handling

The service handles various error scenarios:

- **Missing API Key**: Returns `MISSING_API_KEY` error code
- **Invalid API Key**: Returns authentication error (401/403 from API)
- **Rate Limiting**: Automatic retry with delays (429 from API)
- **Network Errors**: Automatic retry up to configured max retries
- **Service Unavailable**: Returns error when Yandex API is down (500+ errors)

All errors are localized and surfaced to the UI via the translation keys in `src/renderer/i18n/locales/ru.json`.

## Configuration Options

The `TranslationService` accepts the following configuration:

```typescript
{
  apiKey: string;           // Yandex API key (required)
  maxRetries?: number;      // Max retry attempts (default: 3)
  retryDelayMs?: number;    // Base delay between retries in ms (default: 1000)
  rateLimitMs?: number;     // Minimum time between API calls in ms (default: 200)
  queueConcurrency?: number; // Number of concurrent requests (default: 1)
}
```

## Testing

Unit tests are provided in `__tests__/` directory:

- `client.test.ts` - Tests for API client (error handling, HTTP responses)
- `translator.test.ts` - Tests for translation service (queue, retry, detection)

Run tests:

```bash
npm test
```

## API Endpoints

### Translate

- **Endpoint**: `POST /translate/v2/translate`
- **Request**:
  ```json
  {
    "texts": ["text to translate"],
    "targetLanguageCode": "ru",
    "sourceLanguageCode": "en" // optional
  }
  ```
- **Response**:
  ```json
  {
    "translations": [
      {
        "text": "translated text",
        "detectedLanguageCode": "en"
      }
    ]
  }
  ```

### Detect Language

- **Endpoint**: `POST /translate/v2/detect`
- **Request**:
  ```json
  {
    "text": "text to detect language"
  }
  ```
- **Response**:
  ```json
  {
    "languageCode": "en"
  }
  ```

## Security

- API keys are stored in environment variables (not committed to git)
- All API communication happens in the main Electron process
- Renderer process can only access the translation API via IPC (no direct API key access)
- Use `.env.example` as a template for required environment variables
