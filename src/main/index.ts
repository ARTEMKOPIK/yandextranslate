import { app, BrowserWindow, Menu, ipcMain, globalShortcut, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null;
let overlayWindow: BrowserWindow | null;

const isDev = process.env.NODE_ENV === 'development';

// Overlay window configuration
const OVERLAY_WIDTH = 400;
const OVERLAY_HEIGHT = 300;
const OVERLAY_MIN_WIDTH = 350;
const OVERLAY_MIN_HEIGHT = 200;

// Hotkey configuration
const PRIMARY_HOTKEY = 'Super+T'; // Win+T on Windows
const FALLBACK_HOTKEY = 'CommandOrControl+Shift+T';

// Store last overlay position
let lastOverlayPosition: { x: number; y: number } | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
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

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createMenu();
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

app.on('ready', () => {
  createWindow();
  registerGlobalShortcuts();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
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
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    saveOverlayPosition();
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
