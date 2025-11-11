# yandextranslate

A modern Electron + React + TypeScript application for translation using Yandex Translate API.

## 🚀 Features

- **Electron + React**: Cross-platform desktop application
- **TypeScript**: Full type safety across the codebase
- **Vite**: Lightning-fast build tool and development server
- **Hot Module Replacement**: Instant renderer updates during development
- **ESLint + Prettier**: Code quality and formatting
- **GitHub Actions**: Automated CI/CD pipeline
- **Floating Overlay Window**: Always-on-top translation window with global hotkeys
- **Theme Support**: Light/dark mode with system detection
- **Internationalization**: Multi-language support (Russian default)

## 📋 Tech Stack

- **Electron 27**: Cross-platform desktop framework
- **React 18**: UI library
- **TypeScript 5**: Type-safe JavaScript
- **Vite 5**: Modern build tool with HMR
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Electron Builder**: Application packaging

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install
```

## 🎯 Available Scripts

### Development

```bash
# Start development server with hot reload
npm run dev
```

This command:
- Starts Vite development server on `http://localhost:5173`
- Launches Electron with the React renderer loaded
- Provides hot module replacement for instant updates
- Opens DevTools for debugging

### Building

```bash
# Build the entire application
npm run build
```

This command:
- Builds React renderer with Vite
- Compiles main process TypeScript
- Packages the application using electron-builder

#### Build Variants

```bash
# Build only the Vite renderer
npm run build:vite

# Build only the main process
npm run build:main

# Package the application
npm run build:packages
```

### Code Quality

```bash
# Lint and fix code
npm run lint

# Format code
npm run format

# Type check TypeScript
npm run type-check

# Format check (without fixing)
npm run format -- --check
```

## 📁 Project Structure

```
yandextranslate/
├── src/
│   ├── main/
│   │   ├── index.ts          # Electron main process entry point
│   │   └── preload.ts        # Preload script for secure IPC
│   ├── renderer/
│   │   ├── index.html        # HTML entry point
│   │   ├── main.tsx          # React entry point
│   │   ├── App.tsx           # Root component
│   │   ├── App.css           # App styles
│   │   └── index.css         # Global styles
│   └── shared/
│       └── types.ts          # Shared TypeScript types
├── assets/                    # Application assets (icons, etc.)
├── dist/                      # Build output (generated)
│   ├── main/                 # Compiled main process
│   └── renderer/             # Built renderer
├── package.json
├── tsconfig.json             # TypeScript config for renderer
├── tsconfig.main.json        # TypeScript config for main process
├── vite.config.ts            # Vite configuration
├── .eslintrc.json            # ESLint configuration
├── .prettierrc.json          # Prettier configuration
└── README.md
```

## 🔒 Security

- **Context Isolation**: Enabled for better security
- **Preload Script**: Secure IPC communication between processes
- **Node Integration**: Disabled in renderer process
- **Remote Module**: Disabled

## ⌨️ Floating Overlay Window

The application includes a floating overlay window for quick translations without switching focus from your work.

### Global Hotkeys

- **Primary**: `Win+T` (Windows) / `Super+T` (Linux)
- **Fallback**: `Ctrl+Shift+T` (all platforms)

If the primary hotkey conflicts with another application, the fallback will be used automatically.

### Features

- **Always-on-Top**: The overlay stays above other windows
- **Frameless & Transparent**: Sleek, modern design with rounded corners
- **Smart Positioning**: Appears near your cursor on first show, remembers last position
- **Auto-Focus**: Text input is automatically focused when shown
- **Keyboard Shortcuts**:
  - `Enter`: Translate text
  - `Escape`: Hide overlay
- **Compact UI**: Optimized for quick translations (400×300px)

### Usage

1. Press `Win+T` anywhere to show the overlay
2. Start typing immediately (input is auto-focused)
3. Press `Enter` to translate or `Escape` to hide
4. Click the X button or press `Escape` to close

### Testing in Development

You can test the overlay window from the main application:
1. Look for the "Floating Translation Window" card
2. Check the registered hotkey status
3. Use the "Toggle Overlay" button for manual testing
4. Use "Reload" to re-register hotkeys if needed

## 🔄 IPC Communication

The preload script exposes a secure API for renderer-to-main communication:

```typescript
// In renderer (React component)
const version = await window.api.getVersion()

// Toggle overlay window
await window.api.toggleOverlay()

// Get hotkey status
const status = await window.api.getHotkeyStatus()

// Listen for overlay events
window.api.onOverlayShown(() => {
  console.log('Overlay shown')
})
```

## 🐛 Debugging

### Renderer DevTools

The app automatically opens DevTools in development mode. You can toggle it with:
- **Ctrl+Shift+I** (Windows/Linux)
- **Cmd+Shift+I** (macOS)

### Hot Reload

Changes to React components are instantly reflected without full app reload.

## 📦 Distribution

### Supported Platforms

- **Windows**: NSIS installer + portable exe
- **macOS**: DMG + ZIP
- **Linux**: AppImage + DEB

Build configurations are defined in `package.json` under the `build` section.

## 🚀 Deployment

### GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/lint.yml`) that:
- Runs on Node.js 18 and 20
- Performs type checking
- Runs linting and formatting checks
- Builds the application
- Runs on push to `main`, `develop`, and feature branches

## 🛠️ Development Tips

1. **File Changes During Dev**:
   - Renderer changes: HMR reloads automatically
   - Main process changes: Restart app or use `npm run dev`

2. **Type Safety**:
   - Run `npm run type-check` to catch TypeScript errors

3. **Code Quality**:
   - Run `npm run format` before committing
   - Run `npm run lint` to catch linting issues

## 📝 Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
VITE_APP_TITLE=Yandex Translate
```

## 📄 License

[Add your license here]

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code passes linting: `npm run lint`
- Code is properly formatted: `npm run format`
- TypeScript types are correct: `npm run type-check`
- Application builds successfully: `npm run build`
