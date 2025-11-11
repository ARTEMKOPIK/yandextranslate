import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getConfig, validateApiKey } from '../config.js';

describe('Config Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getConfig', () => {
    it('should return config with API key when set', () => {
      process.env.YANDEX_API_KEY = 'test-api-key';
      process.env.NODE_ENV = 'development';

      const config = getConfig();

      expect(config.yandexApiKey).toBe('test-api-key');
      expect(config.isDevelopment).toBe(true);
    });

    it('should return config with undefined API key when not set', () => {
      delete process.env.YANDEX_API_KEY;
      process.env.NODE_ENV = 'production';

      const config = getConfig();

      expect(config.yandexApiKey).toBeUndefined();
      expect(config.isDevelopment).toBe(false);
    });
  });

  describe('validateApiKey', () => {
    it('should validate successfully when API key is set', () => {
      process.env.YANDEX_API_KEY = 'test-api-key';

      const result = validateApiKey();

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail validation when API key is not set', () => {
      delete process.env.YANDEX_API_KEY;

      const result = validateApiKey();

      expect(result.valid).toBe(false);
      expect(result.error).toBe('YANDEX_API_KEY not found in environment');
    });

    it('should fail validation when API key is empty', () => {
      process.env.YANDEX_API_KEY = '   ';

      const result = validateApiKey();

      expect(result.valid).toBe(false);
      expect(result.error).toBe('YANDEX_API_KEY is empty');
    });

    it('should fail validation when API key is empty string', () => {
      process.env.YANDEX_API_KEY = '';

      const result = validateApiKey();

      expect(result.valid).toBe(false);
      expect(result.error).toBe('YANDEX_API_KEY not found in environment');
    });
  });
});
