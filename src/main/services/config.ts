import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env from project root
const projectRoot = path.resolve(__dirname, '../../..');
const envPath = path.join(projectRoot, '.env');

// Only load .env if it exists
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

export interface AppConfig {
  geminiApiKey: string | undefined;
  isDevelopment: boolean;
}

export function getConfig(): AppConfig {
  return {
    geminiApiKey: process.env.GOOGLE_GEMINI_API_KEY,
    isDevelopment: process.env.NODE_ENV === 'development',
  };
}

export function validateApiKey(): { valid: boolean; error?: string } {
  const config = getConfig();

  if (!config.geminiApiKey) {
    return {
      valid: false,
      error: 'GOOGLE_GEMINI_API_KEY not found in environment',
    };
  }

  if (config.geminiApiKey.trim().length === 0) {
    return {
      valid: false,
      error: 'GOOGLE_GEMINI_API_KEY is empty',
    };
  }

  return { valid: true };
}
