# Fix: Electron Dev Mode Loading from Vite Dev Server

## Problem
In development mode, Electron was trying to load `dist/renderer/index.html` which doesn't exist yet, instead of connecting to the Vite dev server on `http://localhost:5173`.

Error: `"Failed to load URL: file:///...dist/renderer/index.html with error: ERR_FILE_NOT_FOUND"`

## Solution
Changed the approach to detect development mode from checking `NODE_ENV` to using a dedicated `VITE_DEV_SERVER_URL` environment variable.

## Changes Made

### 1. package.json
Updated the `dev:electron` script to set the `VITE_DEV_SERVER_URL` environment variable:

```json
"dev:electron": "wait-on tcp:5173 && cross-env VITE_DEV_SERVER_URL=http://localhost:5173 electron ."
```

Added `cross-env` as a dev dependency for cross-platform environment variable support.

### 2. src/main/index.ts
Replaced `isDev` check with `VITE_DEV_SERVER_URL`:

**Before:**
```typescript
const isDev = process.env.NODE_ENV === 'development';
```

**After:**
```typescript
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
```

Updated window loading logic in:
- `createWindow()` - Main window now loads from `VITE_DEV_SERVER_URL` if set, otherwise from file
- `createOverlayWindow()` - Overlay window also uses `VITE_DEV_SERVER_URL`
- Auto-update check - Only runs in production (when `VITE_DEV_SERVER_URL` is not set)

## How It Works

### Development Mode
When running `npm run dev`:
1. Vite dev server starts on port 5173
2. `wait-on` waits for port 5173 to be available
3. Electron starts with `VITE_DEV_SERVER_URL=http://localhost:5173`
4. Main process detects the environment variable and loads from the dev server
5. Hot Module Replacement (HMR) works for instant updates

### Production Mode
When running the built application:
1. No `VITE_DEV_SERVER_URL` is set
2. Main process loads from `dist/renderer/index.html`
3. Auto-updates are enabled
4. DevTools are not opened automatically

## Testing
After the fix:
1. Run `npm run dev`
2. Electron window should open and load the application from Vite dev server
3. DevTools should open automatically
4. Hot reload should work when editing React components
5. Global hotkey (Ctrl+Shift+T or Win+T) should open the translator overlay

## Dependencies Added
- `cross-env@^10.1.0` - Cross-platform environment variable setter
