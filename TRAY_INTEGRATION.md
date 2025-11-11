# System Tray Integration

This document describes the system tray integration feature added to the yandextranslate application.

## Overview

The application now runs in the system tray, allowing it to stay available in the background without cluttering the taskbar. Users can interact with the app through the tray icon's context menu and control various settings.

## Features Implemented

### 1. Tray Icon

- **Adaptive Icons**: Automatically switches between light and dark icons based on system theme
- **High DPI Support**: Includes @2x assets for high-resolution displays
- **Platform Support**: Works on Windows, macOS, and Linux

**Icon Files**:
- `assets/icons/tray-light.png` - Dark icon for light backgrounds (16x16)
- `assets/icons/tray-light@2x.png` - Dark icon for light backgrounds (32x32)
- `assets/icons/tray-dark.png` - Light icon for dark backgrounds (16x16)
- `assets/icons/tray-dark@2x.png` - Light icon for dark backgrounds (32x32)
- `assets/icons/tray-light.ico` - Windows ICO format (light mode)
- `assets/icons/tray-dark.ico` - Windows ICO format (dark mode)

### 2. Context Menu

Right-clicking the tray icon shows a context menu with:
- **Show/Hide QuickTranslate**: Toggle the floating overlay window
- **Toggle Theme**: Switch between Light/Dark/System themes
- **Show Main Window**: Open the main application window
- **Settings**: Navigate to application settings
- **Check for Updates**: Check for app updates
- **Quit**: Exit the application completely

### 3. Window Management

#### Start Minimized to Tray
- Setting: `general.startMinimizedToTray` (default: `false`)
- When enabled, the app starts hidden in the system tray
- Main window is not shown on startup

#### Close to Tray
- Setting: `general.closeToTray` (default: `true`)
- When enabled, closing the main window minimizes it to tray instead of quitting
- Users must explicitly choose "Quit" from the tray menu to exit
- Prevents accidental app closure

### 4. Notifications

Configure in Settings → System Tray:

#### Show Notifications
- Setting: `tray.showNotifications` (default: `true`)
- Master switch for all tray notifications
- When disabled, no notifications are shown

#### Translation Complete Notifications
- Setting: `tray.showTranslationComplete` (default: `false`)
- Shows a notification when a translation finishes successfully
- Displays first 50 characters of the source text
- Disabled by default to avoid being intrusive

#### Error Notifications
- Automatically shown for translation errors
- Respects the `showNotifications` setting
- Provides user-friendly error messages

### 5. Tray Interactions

- **Single Click**: No action (OS-dependent behavior)
- **Double Click**: Show/hide main window
- **Right Click**: Show context menu

## Implementation Details

### Main Process (src/main/index.ts)

**New Functions**:
- `createTray()`: Initializes the system tray icon
- `getTrayIcon()`: Returns appropriate icon path based on system theme
- `updateTrayMenu()`: Updates context menu (e.g., when theme changes)
- `toggleMainWindow()`: Show/hide main window
- `showMainWindow()`: Ensure main window is visible and focused
- `toggleTheme()`: Change theme from tray menu
- `checkForUpdates()`: Placeholder for update checking
- `showTrayNotification()`: Show system notifications

**Window Behavior**:
- `isQuitting` flag tracks intentional app quit vs. close-to-tray
- Main window's `close` event checks `closeToTray` setting
- `window-all-closed` event doesn't quit if tray is active (except on macOS)
- `before-quit` event cleans up tray icon

### Settings (src/shared/types.ts)

**Extended AppSettings**:
```typescript
interface AppSettings {
  general: {
    historyMaxEntries: number;
    startMinimizedToTray: boolean;  // NEW
    closeToTray: boolean;            // NEW
  };
  // ... other settings ...
  tray: {                            // NEW
    showNotifications: boolean;
    showTranslationComplete: boolean;
  };
}
```

### UI Components

**GeneralSettings.tsx**:
- Added checkboxes for:
  - "Start Minimized to Tray"
  - "Close to Tray"
- Includes descriptions explaining each option

**TraySettings.tsx** (NEW):
- Dedicated settings panel for tray notifications
- Checkboxes for:
  - "Show Notifications" (master switch)
  - "Translation Complete" (disabled when master is off)

**Settings.tsx**:
- Added "System Tray" tab to settings navigation
- Renders TraySettings component

### Preload API (src/main/preload.ts)

**New API Method**:
- `onNavigateToSettings()`: Listen for navigation event from tray menu

### Localization (ru.json)

Added Russian translations for:
- `settings.general.startMinimizedToTray`
- `settings.general.startMinimizedToTrayDesc`
- `settings.general.closeToTray`
- `settings.general.closeToTrayDesc`
- `settings.tray.title`
- `settings.tray.showNotifications`
- `settings.tray.showNotificationsDesc`
- `settings.tray.showTranslationComplete`
- `settings.tray.showTranslationCompleteDesc`
- `tray.tooltip`
- `tray.showHideQuickTranslate`
- `tray.toggleTheme`
- `tray.showMainWindow`
- `tray.settings`
- `tray.checkForUpdates`
- `tray.quit`

## Usage Guide

### For Users

1. **Minimizing to Tray**:
   - Close the main window (if "Close to Tray" is enabled)
   - The app continues running in the system tray

2. **Accessing Features**:
   - Double-click tray icon to show main window
   - Right-click for context menu
   - Use `Win+T` hotkey for QuickTranslate overlay

3. **Customizing Behavior**:
   - Go to Settings → General for startup and close behavior
   - Go to Settings → System Tray for notification preferences

4. **Exiting Completely**:
   - Right-click tray icon → Quit
   - Or use main window File → Exit

### For Developers

**Icon Generation**:
```bash
node scripts/generate-icons.js
```
This creates placeholder tray icons. For production, replace with proper icon assets.

**Testing Tray Integration**:
1. Start the app: `npm run dev`
2. Check system tray for the icon
3. Right-click to test context menu
4. Close main window to test close-to-tray behavior
5. Verify theme changes update the tray icon

**Customizing Icons**:
Replace the generated icons in `assets/icons/` with your own designs:
- 16x16px and 32x32px PNGs
- Light and dark variants
- Use monochrome, template-style icons for best results on all platforms

## Platform-Specific Notes

### Windows
- Icons should be monochrome for best results
- System automatically inverts colors in dark mode
- ICO format supported but PNG is preferred

### macOS
- Template images (monochrome) work best
- System handles icon appearance automatically
- Use `@2x` suffix for Retina displays

### Linux
- Icon appearance depends on desktop environment
- Some DEs may not support dark/light variants
- Fallback to dark icon if theme detection fails

## Future Enhancements

Potential improvements:
- [ ] More tray menu actions (e.g., quick translation from clipboard)
- [ ] Customizable notification sound
- [ ] Notification action buttons (e.g., "Copy Translation")
- [ ] Badge/counter on tray icon
- [ ] Animated tray icon for active translations
- [ ] Tray icon tooltip showing last translation
- [ ] Better icon design (current icons are placeholders)

## Migration Notes

When updating from a version without tray integration:
- Existing settings are preserved
- New tray settings get default values:
  - `startMinimizedToTray`: `false`
  - `closeToTray`: `true`
  - `showNotifications`: `true`
  - `showTranslationComplete`: `false`
- No user action required; settings are applied automatically
