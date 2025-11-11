import {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  globalShortcut,
  screen,
  clipboard,
  Tray,
  nativeImage,
  nativeTheme,
  Notification,
} from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getConfig, validateApiKey } from './services/config.js';
import { TranslationService } from './services/yandex/translator.js';
import { HistoryService } from './services/history.js';
import { SettingsService } from './services/settings.js';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null;
let overlayWindow: BrowserWindow | null;
let tray: Tray | null = null;
let translationService: TranslationService | null = null;
let historyService: HistoryService | null = null;
let settingsService: SettingsService | null = null;
let isQuitting = false;

const isDev = process.env.NODE_ENV === 'development';

// Overlay window configuration
const OVERLAY_WIDTH = 500;
const OVERLAY_HEIGHT = 450;
const OVERLAY_MIN_WIDTH = 450;
const OVERLAY_MIN_HEIGHT = 400;

// Hotkey configuration (will be loaded from settings)
let PRIMARY_HOTKEY = 'Super+T'; // Win+T on Windows
const FALLBACK_HOTKEY = 'CommandOrControl+Shift+T';

// Store last overlay position
let lastOverlayPosition: { x: number; y: number } | null = null;

function initializeTranslationService() {
  const config = getConfig();

  if (config.yandexApiKey) {
    translationService = new TranslationService({
      apiKey: config.yandexApiKey,
      maxRetries: 3,
      retryDelayMs: 1000,
      rateLimitMs: 200,
    });
    console.log('Translation service initialized');
  } else {
    console.warn('Translation service not initialized: API key not found');
  }
}

function createWindow() {
  const settings = settingsService?.getSettings();
  const shouldStartMinimized = settings?.general.startMinimizedToTray || false;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: !shouldStartMinimized,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../renderer/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev && !shouldStartMinimized) {
    mainWindow.webContents.openDevTools();
  }

  // Handle close event for close-to-tray behavior
  mainWindow.on('close', (event) => {
    const settings = settingsService?.getSettings();
    if (!isQuitting && settings?.general.closeToTray) {
      event.preventDefault();
      mainWindow?.hide();
      return;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createMenu();

  // Show window after ready if not starting minimized
  if (!shouldStartMinimized) {
    mainWindow.once('ready-to-show', () => {
      mainWindow?.show();
    });
  }
}

function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: OVERLAY_WIDTH,
    height: OVERLAY_HEIGHT,
    minWidth: OVERLAY_MIN_WIDTH,
    minHeight: OVERLAY_MIN_HEIGHT,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.platform === 'win32') {
    overlayWindow.setBackgroundColor('#00000000');
  }

  const startUrl = isDev
    ? 'http://localhost:5173?overlay=true'
    : `file://${path.join(__dirname, '../renderer/index.html')}?overlay=true`;

  overlayWindow.loadURL(startUrl);

  overlayWindow.on('blur', () => {
    if (overlayWindow && overlayWindow.isVisible()) {
      saveOverlayPosition();
    }
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  overlayWindow.on('moved', () => {
    if (overlayWindow) {
      const [x, y] = overlayWindow.getPosition();
      lastOverlayPosition = { x, y };
    }
  });
}

function getOverlayPosition(): { x: number; y: number } {
  if (lastOverlayPosition) {
    return lastOverlayPosition;
  }

  const cursorPoint = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursorPoint);

  const x = Math.min(
    Math.max(cursorPoint.x - OVERLAY_WIDTH / 2, display.workArea.x),
    display.workArea.x + display.workArea.width - OVERLAY_WIDTH
  );

  const y = Math.min(
    Math.max(cursorPoint.y - 50, display.workArea.y),
    display.workArea.y + display.workArea.height - OVERLAY_HEIGHT
  );

  return { x, y };
}

function saveOverlayPosition() {
  if (overlayWindow) {
    const [x, y] = overlayWindow.getPosition();
    lastOverlayPosition = { x, y };
  }
}

function toggleOverlayWindow() {
  if (!overlayWindow) {
    createOverlayWindow();
  }

  if (!overlayWindow) {
    return;
  }

  if (overlayWindow.isVisible()) {
    saveOverlayPosition();
    overlayWindow.hide();
    overlayWindow.webContents.send('overlay-hidden');
  } else {
    const position = getOverlayPosition();
    overlayWindow.setPosition(position.x, position.y);
    overlayWindow.show();
    overlayWindow.focus();
    overlayWindow.webContents.send('overlay-shown');
  }
}

function registerGlobalShortcuts() {
  globalShortcut.unregisterAll();

  let registeredShortcut: string | null = null;
  let errorMessage: string | null = null;

  const tryRegisterPrimary = globalShortcut.register(PRIMARY_HOTKEY, () => {
    toggleOverlayWindow();
  });

  if (tryRegisterPrimary) {
    registeredShortcut = PRIMARY_HOTKEY;
    console.log(`Registered primary hotkey: ${PRIMARY_HOTKEY}`);
  } else {
    console.warn(`Failed to register primary hotkey: ${PRIMARY_HOTKEY}`);

    const tryRegisterFallback = globalShortcut.register(FALLBACK_HOTKEY, () => {
      toggleOverlayWindow();
    });

    if (tryRegisterFallback) {
      registeredShortcut = FALLBACK_HOTKEY;
      console.log(`Registered fallback hotkey: ${FALLBACK_HOTKEY}`);
      errorMessage = `Primary hotkey ${PRIMARY_HOTKEY} is unavailable. Using fallback ${FALLBACK_HOTKEY} instead.`;
    } else {
      console.error(`Failed to register both primary and fallback hotkeys`);
      errorMessage = `Failed to register hotkeys. Both ${PRIMARY_HOTKEY} and ${FALLBACK_HOTKEY} are in use by another application.`;
    }
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('hotkey-status', {
      registered: registeredShortcut !== null,
      shortcut: registeredShortcut,
      error: errorMessage,
    });
  }

  return {
    registered: registeredShortcut !== null,
    shortcut: registeredShortcut,
    error: errorMessage,
  };
}

function unregisterGlobalShortcuts() {
  globalShortcut.unregisterAll();
  console.log('Unregistered all global shortcuts');
}

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        {
          label: 'Toggle DevTools',
          accelerator: 'CmdOrCtrl+Shift+I',
          role: 'toggleDevTools',
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function getTrayIcon(): string {
  const iconName = nativeTheme.shouldUseDarkColors ? 'tray-dark' : 'tray-light';
  const iconPath = path.join(__dirname, '../../assets/icons', `${iconName}.png`);
  return iconPath;
}

function createTray() {
  if (tray) {
    return;
  }

  const iconPath = getTrayIcon();
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);

  updateTrayMenu();

  tray.setToolTip('Яндекс Переводчик - QuickTranslate');

  // Handle double-click to show/hide main window
  tray.on('double-click', () => {
    toggleMainWindow();
  });

  // Update tray icon when system theme changes
  nativeTheme.on('updated', () => {
    if (tray) {
      const newIconPath = getTrayIcon();
      const newIcon = nativeImage.createFromPath(newIconPath);
      tray.setImage(newIcon);
    }
  });
}

function updateTrayMenu() {
  if (!tray) {
    return;
  }

  const settings = settingsService?.getSettings();
  const currentTheme = settings?.theme.mode || 'dark';

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Показать/Скрыть QuickTranslate',
      click: () => {
        toggleOverlayWindow();
      },
    },
    { type: 'separator' },
    {
      label: 'Переключить тему',
      submenu: [
        {
          label: 'Светлая',
          type: 'radio',
          checked: currentTheme === 'light',
          click: () => {
            toggleTheme('light');
          },
        },
        {
          label: 'Темная',
          type: 'radio',
          checked: currentTheme === 'dark',
          click: () => {
            toggleTheme('dark');
          },
        },
        {
          label: 'Системная',
          type: 'radio',
          checked: currentTheme === 'system',
          click: () => {
            toggleTheme('system');
          },
        },
      ],
    },
    { type: 'separator' },
    {
      label: 'Показать главное окно',
      click: () => {
        showMainWindow();
      },
    },
    {
      label: 'Настройки',
      click: () => {
        showMainWindow();
        // Navigate to settings tab in main window
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('navigate-to-settings');
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Проверить обновления',
      click: () => {
        checkForUpdates();
      },
    },
    { type: 'separator' },
    {
      label: 'Выход',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function toggleMainWindow() {
  if (!mainWindow) {
    showMainWindow();
    return;
  }

  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    showMainWindow();
  }
}

function showMainWindow() {
  if (!mainWindow) {
    createWindow();
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
}

function toggleTheme(theme: 'light' | 'dark' | 'system') {
  if (!settingsService) {
    return;
  }

  const settings = settingsService.updateSettings({
    theme: { mode: theme },
  });

  // Notify all windows of theme change
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('settings-changed', settings);
  }
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send('settings-changed', settings);
  }

  // Update tray menu to reflect new theme
  updateTrayMenu();
}

function checkForUpdates() {
  // Placeholder for update checking functionality
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: 'Проверка обновлений',
      body: 'Вы используете последнюю версию приложения',
    });
    notification.show();
  }
}

function showTrayNotification(title: string, body: string) {
  const settings = settingsService?.getSettings();
  if (!settings?.tray.showNotifications) {
    return;
  }

  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
    });
    notification.show();
  }
}

app.on('ready', () => {
  // Initialize services
  settingsService = new SettingsService();
  historyService = new HistoryService();
  initializeTranslationService();

  // Load hotkey from settings
  if (settingsService) {
    const settings = settingsService.getSettings();
    PRIMARY_HOTKEY = settings.hotkeys.overlay;
  }

  // Create tray icon
  createTray();

  createWindow();
  registerGlobalShortcuts();
});

app.on('window-all-closed', () => {
  // Don't quit if we have tray - app continues to run in background
  if (process.platform !== 'darwin' && !tray) {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-quit', () => {
  unregisterGlobalShortcuts();
});

app.on('before-quit', () => {
  isQuitting = true;
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    saveOverlayPosition();
  }
  if (tray) {
    tray.destroy();
    tray = null;
  }
});

// Handle IPC messages
ipcMain.on('app-version', (event) => {
  event.reply('app-version', { version: app.getVersion() });
});

ipcMain.handle('get-hotkey-status', () => {
  const isRegistered =
    globalShortcut.isRegistered(PRIMARY_HOTKEY) || globalShortcut.isRegistered(FALLBACK_HOTKEY);
  const registeredShortcut = globalShortcut.isRegistered(PRIMARY_HOTKEY)
    ? PRIMARY_HOTKEY
    : globalShortcut.isRegistered(FALLBACK_HOTKEY)
      ? FALLBACK_HOTKEY
      : null;

  return {
    registered: isRegistered,
    shortcut: registeredShortcut,
    primary: PRIMARY_HOTKEY,
    fallback: FALLBACK_HOTKEY,
  };
});

ipcMain.handle('toggle-overlay', () => {
  toggleOverlayWindow();
});

ipcMain.handle('hide-overlay', () => {
  if (overlayWindow && overlayWindow.isVisible()) {
    saveOverlayPosition();
    overlayWindow.hide();
    overlayWindow.webContents.send('overlay-hidden');
  }
});

ipcMain.on('reload-shortcuts', () => {
  console.log('Reloading global shortcuts');
  registerGlobalShortcuts();
});

// Translation service IPC handlers
ipcMain.handle('translate', async (_, text: string, targetLang: string, sourceLang?: string) => {
  const validation = validateApiKey();

  if (!validation.valid) {
    return {
      success: false,
      error: {
        code: 'MISSING_API_KEY',
        message: validation.error || 'API key is not configured',
      },
    };
  }

  if (!translationService) {
    initializeTranslationService();
  }

  if (!translationService) {
    return {
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Translation service is not available',
      },
    };
  }

  try {
    const result = await translationService.translate(text, targetLang, sourceLang);

    // Add to history
    if (historyService) {
      historyService.addEntry(
        text,
        result.translatedText,
        result.detectedSourceLang,
        result.targetLang
      );
    }

    // Show translation complete notification if enabled
    const settings = settingsService?.getSettings();
    if (settings?.tray.showTranslationComplete) {
      const shortText = text.length > 50 ? text.substring(0, 47) + '...' : text;
      showTrayNotification('Перевод завершен', `"${shortText}"`);
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Translation failed';

    // Show error notification
    showTrayNotification('Ошибка перевода', message);

    return {
      success: false,
      error: {
        code: 'TRANSLATION_ERROR',
        message,
      },
    };
  }
});

ipcMain.handle('validate-api-key', () => {
  const validation = validateApiKey();
  return {
    valid: validation.valid,
    error: validation.error,
  };
});

// Clipboard operations
ipcMain.handle('copy-to-clipboard', (_, text: string) => {
  try {
    clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
});

ipcMain.handle('read-clipboard', () => {
  try {
    return clipboard.readText();
  } catch (error) {
    console.error('Failed to read clipboard:', error);
    return '';
  }
});

ipcMain.handle('paste-into-active-window', async (_, text: string) => {
  try {
    // Save current clipboard content
    const previousClipboard = clipboard.readText();

    // Copy text to clipboard
    clipboard.writeText(text);

    // Hide overlay to restore focus
    if (overlayWindow && overlayWindow.isVisible()) {
      saveOverlayPosition();
      overlayWindow.hide();
      overlayWindow.webContents.send('overlay-hidden');
    }

    // Wait a bit for focus to restore
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Send Ctrl+V keystroke based on platform
    if (process.platform === 'win32') {
      // Windows: Use PowerShell to send Ctrl+V
      await execAsync(
        `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^v')"`
      );
    } else if (process.platform === 'darwin') {
      // macOS: Use AppleScript
      await execAsync(
        `osascript -e 'tell application "System Events" to keystroke "v" using command down'`
      );
    } else {
      // Linux: Use xdotool
      await execAsync('xdotool key ctrl+v');
    }

    // Restore previous clipboard content after a delay
    setTimeout(() => {
      clipboard.writeText(previousClipboard);
    }, 500);

    return true;
  } catch (error) {
    console.error('Failed to paste into active window:', error);
    return false;
  }
});

// History IPC handlers
ipcMain.handle('history:get', (_, filter) => {
  if (!historyService) {
    return [];
  }
  return historyService.getHistory(filter);
});

ipcMain.handle('history:get-favorites', () => {
  if (!historyService) {
    return [];
  }
  return historyService.getFavorites();
});

ipcMain.handle('history:toggle-favorite', (_, id: string) => {
  if (!historyService) {
    return null;
  }
  return historyService.toggleFavorite(id);
});

ipcMain.handle('history:delete', (_, id: string) => {
  if (!historyService) {
    return false;
  }
  return historyService.deleteEntry(id);
});

ipcMain.handle('history:clear', (_, keepFavorites: boolean) => {
  if (!historyService) {
    return 0;
  }
  return historyService.clearHistory(keepFavorites);
});

ipcMain.handle('history:get-stats', () => {
  if (!historyService) {
    return null;
  }
  return historyService.getStats();
});

ipcMain.handle('history:get-config', () => {
  if (!historyService) {
    return null;
  }
  return historyService.getConfig();
});

ipcMain.handle('history:update-config', (_, config) => {
  if (!historyService) {
    return null;
  }
  return historyService.updateConfig(config);
});

// Settings IPC handlers
ipcMain.handle('settings:get', () => {
  if (!settingsService) {
    settingsService = new SettingsService();
  }
  return settingsService.getSettings();
});

ipcMain.handle('settings:update', (_, updates) => {
  if (!settingsService) {
    settingsService = new SettingsService();
  }

  const settings = settingsService.updateSettings(updates);

  // Apply hotkey changes if updated
  if (updates.hotkeys?.overlay) {
    PRIMARY_HOTKEY = updates.hotkeys.overlay;
    registerGlobalShortcuts();
  }

  // Sync history max entries with history service
  if (updates.general?.historyMaxEntries && historyService) {
    historyService.updateConfig({ maxEntries: updates.general.historyMaxEntries });
  }

  // Update tray menu if theme changed
  if (updates.theme?.mode) {
    updateTrayMenu();
  }

  // Notify all windows of settings change
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('settings-changed', settings);
  }
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send('settings-changed', settings);
  }

  return settings;
});

ipcMain.handle('settings:reset', () => {
  if (!settingsService) {
    settingsService = new SettingsService();
  }

  const settings = settingsService.resetSettings();
  PRIMARY_HOTKEY = settings.hotkeys.overlay;
  registerGlobalShortcuts();

  // Reset history config
  if (historyService) {
    historyService.updateConfig({ maxEntries: settings.general.historyMaxEntries });
  }

  // Notify all windows of settings change
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('settings-changed', settings);
  }
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send('settings-changed', settings);
  }

  return settings;
});

ipcMain.handle('settings:validate-hotkey', (_, hotkey: string) => {
  if (!settingsService) {
    settingsService = new SettingsService();
  }
  return settingsService.validateHotkey(hotkey);
});
