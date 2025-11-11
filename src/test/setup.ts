import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.api for all tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).window = {
  api: {
    translate: vi.fn(),
    validateApiKey: vi.fn(),
    toggleOverlay: vi.fn(),
    hideOverlay: vi.fn(),
    getHotkeyStatus: vi.fn(),
    onHotkeyStatus: vi.fn(),
    onOverlayShown: vi.fn(),
    onOverlayHidden: vi.fn(),
    reloadShortcuts: vi.fn(),
    copyToClipboard: vi.fn(),
    readClipboard: vi.fn(),
    pasteIntoActiveWindow: vi.fn(),
    history: {
      get: vi.fn(),
      getFavorites: vi.fn(),
      toggleFavorite: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      getStats: vi.fn(),
      getConfig: vi.fn(),
      updateConfig: vi.fn(),
    },
    settings: {
      get: vi.fn(),
      update: vi.fn(),
      reset: vi.fn(),
      validateHotkey: vi.fn(),
    },
    onSettingsChanged: vi.fn(),
    onNavigateToSettings: vi.fn(),
    getLogs: vi.fn(),
    clearLogs: vi.fn(),
    openLogsFolder: vi.fn(),
    logError: vi.fn(),
    getAnalyticsStats: vi.fn(),
    resetAnalytics: vi.fn(),
    exportAnalytics: vi.fn(),
    updater: {
      check: vi.fn(),
      download: vi.fn(),
      install: vi.fn(),
      skipVersion: vi.fn(),
      clearSkippedVersions: vi.fn(),
      getSkippedVersions: vi.fn(),
      updateConfig: vi.fn(),
      getConfig: vi.fn(),
      getStatus: vi.fn(),
    },
  },
};
