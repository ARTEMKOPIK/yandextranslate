import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
const projectRoot = path.resolve(__dirname, '../../..');
const envPath = path.join(projectRoot, '.env');

// Only load .env if it exists
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

export interface AppConfig {
  yandexApiKey: string | undefined;
  isDevelopment: boolean;
}

export function getConfig(): AppConfig {
  return {
    yandexApiKey: process.env.YANDEX_API_KEY,
    isDevelopment: process.env.NODE_ENV === 'development',
  };
}

export function validateApiKey(): { valid: boolean; error?: string } {
  const config = getConfig();

  if (!config.yandexApiKey) {
    return {
      valid: false,
      error: 'YANDEX_API_KEY not found in environment',
    };
  }

  if (config.yandexApiKey.trim().length === 0) {
    return {
      valid: false,
      error: 'YANDEX_API_KEY is empty',
    };
  }

  return { valid: true };
}
