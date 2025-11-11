# Yandex Translate Desktop

> A modern, feature-rich desktop translation application powered by Yandex.Translate API

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0--rc.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![Electron](https://img.shields.io/badge/Electron-27-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

</div>

---

## 📖 About

Yandex Translate Desktop is a powerful, cross-platform desktop application that brings the speed and accuracy of Yandex.Translate API to your desktop. With support for 30+ languages, a floating overlay window, and system tray integration, it's designed to be your go-to translation companion that stays out of your way until you need it.

### Why Yandex Translate Desktop?

- **⚡ Lightning Fast**: Translate text in milliseconds with optimized API requests
- **🎯 Always Accessible**: Global hotkey brings up translation overlay from anywhere
- **🌙 Easy on the Eyes**: Beautiful dark/light themes with automatic system detection
- **🔒 Privacy First**: All data stored locally, full control over your translation history
- **🚀 Auto-Updates**: Stay up-to-date with the latest features automatically
- **🌐 30+ Languages**: Comprehensive language support for global communication

---

## ✨ Key Features

### 🪟 Floating Overlay Window
- **Global Hotkey**: Press `Win+T` (or `Ctrl+Shift+T`) from anywhere to open the translation window
- **Always-on-Top**: Overlay stays visible while you work
- **Smart Positioning**: Appears near your cursor, remembers last position
- **Auto-Focus**: Input field automatically focused for instant typing
- **Keyboard Shortcuts**: 
  - `Ctrl+Enter` to translate
  - `Escape` to hide
- **Quick Actions**: Copy, paste, and clear with one click

### 🎨 Modern UI/UX
- **Responsive Design**: Clean, intuitive interface built with Tailwind CSS
- **Dark/Light/System Themes**: Choose your preferred theme or follow your OS
- **Smooth Animations**: Polished transitions and feedback
- **Toast Notifications**: Non-intrusive success and error messages
- **Error Boundary**: Graceful error handling with recovery options

### 📚 History & Favorites
- **Translation History**: Automatic tracking of all translations (configurable)
- **Search & Filter**: Find past translations by text, language, or date
- **Favorites System**: Star important translations for quick access
- **Usage Statistics**: Track translation count, favorites, and more
- **Export/Import**: Backup your history to JSON

### ⚙️ Comprehensive Settings
- **General**: Configure history limits, startup behavior, tray options
- **Hotkeys**: Customize global shortcuts with validation
- **Interface**: Language selection (Russian/English)
- **Theme**: Light, dark, or system mode
- **Tray**: Control notifications and tray behavior
- **Updates**: Auto-download, prerelease, and version management
- **Logs**: View, export, and manage application logs
- **Analytics**: Anonymous usage metrics (stored locally)

### 🔔 System Tray Integration
- **Background Mode**: Runs quietly in system tray
- **Context Menu**: Quick access to overlay, settings, and updates
- **Theme Toggle**: Switch themes directly from tray
- **Smart Notifications**: Optional notifications for translation completion
- **Adaptive Icons**: Automatically adjusts to light/dark system themes

### 🔄 Automatic Updates
- **Seamless Updates**: Check for updates automatically on startup
- **Differential Downloads**: Windows users download only changed files
- **Progress Tracking**: Real-time download progress with speed and size
- **Version Skipping**: Skip versions you don't want to install
- **Manual Control**: Check for updates anytime from Settings or tray menu

### 🔐 Translation Service
- **Yandex.Translate API**: Industry-leading translation accuracy
- **Auto-Detection**: Automatically detects source language
- **Request Queue**: Intelligent API request management
- **Rate Limiting**: Respects API limits with configurable delays
- **Retry Logic**: Automatic retries with exponential backoff
- **Error Handling**: User-friendly error messages in Russian

### 📊 Logging & Analytics
- **Structured Logging**: Comprehensive application event logging
- **Automatic Rotation**: Log files rotate at 5MB
- **Privacy-Focused**: No sensitive data (API keys, text) logged
- **Usage Analytics**: Track translations, favorites, errors (local only)
- **Full Transparency**: View, export, and delete all data anytime

### ♿ Accessibility
- **Keyboard Navigation**: Full keyboard support throughout the app
- **Focus Management**: Clear focus indicators on all controls
- **ARIA Support**: Screen reader compatible
- **High Contrast**: Detects and adapts to system high contrast mode
- **Reduced Motion**: Respects prefers-reduced-motion setting
- **WCAG 2.1 Level AA**: Meets accessibility standards

---

## 🖼️ Screenshots

> *Screenshots will be added here*

### Main Window
![Main Window - Light Theme](docs/screenshots/main-light.png)
![Main Window - Dark Theme](docs/screenshots/main-dark.png)

### Floating Overlay
![Overlay Window](docs/screenshots/overlay.png)

### Settings Panel
![Settings - General](docs/screenshots/settings-general.png)
![Settings - Updates](docs/screenshots/settings-updates.png)

### History & Favorites
![History Panel](docs/screenshots/history.png)
![Favorites Panel](docs/screenshots/favorites.png)

---

## 💾 Installation

### For Users

#### Windows
1. Download the latest installer from the [Releases](https://github.com/your-username/yandextranslate/releases) page
2. Choose either:
   - **NSIS Installer**: `Yandex-Translate-Setup-1.0.0-rc.1.exe` (recommended)
   - **Portable**: `Yandex-Translate-1.0.0-rc.1.exe` (no installation required)
3. Run the installer and follow the setup wizard
4. Launch the app from Start Menu or Desktop shortcut

#### macOS
1. Download the DMG file from the [Releases](https://github.com/your-username/yandextranslate/releases) page
2. Open the DMG and drag Yandex Translate to Applications
3. Launch from Applications folder
4. If you see a security warning:
   - Go to System Preferences → Security & Privacy
   - Click "Open Anyway"

#### Linux
1. Download the appropriate package:
   - **AppImage**: `Yandex-Translate-1.0.0-rc.1.AppImage` (universal)
   - **Debian/Ubuntu**: `yandex-translate_1.0.0-rc.1_amd64.deb`
2. For AppImage:
   ```bash
   chmod +x Yandex-Translate-1.0.0-rc.1.AppImage
   ./Yandex-Translate-1.0.0-rc.1.AppImage
   ```
3. For DEB package:
   ```bash
   sudo dpkg -i yandex-translate_1.0.0-rc.1_amd64.deb
   ```

### Getting Started

1. **Get API Key**: 
   - Sign up at [Yandex Cloud Console](https://cloud.yandex.com/)
   - Create an API key for Translate API
   - See [API Key documentation](https://cloud.yandex.com/en/docs/iam/concepts/authorization/api-key)

2. **Configure API Key**:
   - Create a `.env` file in the app's data directory:
     - Windows: `%APPDATA%\yandextranslate\.env`
     - macOS: `~/Library/Application Support/yandextranslate/.env`
     - Linux: `~/.config/yandextranslate/.env`
   - Add your API key:
     ```env
     YANDEX_API_KEY=your_api_key_here
     ```

3. **Launch and Translate**:
   - Press `Win+T` (or configured hotkey) to open overlay
   - Type or paste text
   - Select target language
   - Press `Enter` or click Translate

---

## 👨‍💻 For Developers

### Prerequisites
- Node.js 18+ and npm
- Git

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/yandextranslate.git
cd yandextranslate

# Install dependencies
npm install

# Create .env file for development
cp .env.example .env
# Edit .env and add your Yandex API key

# Start development server
npm run dev
```

This command:
- Starts Vite development server on `http://localhost:5173`
- Launches Electron with hot module replacement
- Opens DevTools automatically

### Building

```bash
# Build the entire application
npm run build

# Build only renderer (React/Vite)
npm run build:vite

# Build only main process (Electron)
npm run build:main

# Build distributable packages
npm run build:packages
```

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run E2E smoke tests
npm run test:e2e
```

### Code Quality

```bash
# Lint and fix code
npm run lint

# Format code with Prettier
npm run format

# Type check TypeScript
npm run type-check
```

### Project Structure

```
yandextranslate/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── index.ts             # Main entry point
│   │   ├── preload.ts           # Preload script (IPC bridge)
│   │   └── services/            # Backend services
│   │       ├── yandex/          # Translation API client
│   │       ├── config.ts        # Environment configuration
│   │       ├── history.ts       # History management
│   │       ├── settings.ts      # Settings management
│   │       ├── logger.ts        # Logging service
│   │       ├── analytics.ts     # Usage analytics
│   │       └── updater.ts       # Auto-update service
│   ├── renderer/                # React application
│   │   ├── main.tsx             # React entry point
│   │   ├── App.tsx              # Main app component
│   │   ├── OverlayApp.tsx       # Overlay window component
│   │   ├── components/          # Reusable UI components
│   │   ├── contexts/            # React contexts (Theme)
│   │   ├── stores/              # Zustand state stores
│   │   ├── hooks/               # Custom React hooks
│   │   └── i18n/                # Internationalization
│   ├── shared/                  # Shared types and constants
│   │   ├── types.ts             # TypeScript type definitions
│   │   └── languages.ts         # Supported languages
│   └── test/                    # Test setup and utilities
├── e2e/                         # End-to-end tests
├── docs/                        # Documentation
│   ├── AUTO_UPDATES.md          # Auto-updates guide
│   ├── TESTING_UPDATES.md       # Testing updates locally
│   └── LOGGING_AND_ANALYTICS.md # Logging and analytics guide
├── assets/                      # Application assets
│   └── icons/                   # App and tray icons
├── scripts/                     # Build and utility scripts
├── .github/workflows/           # CI/CD workflows
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript config (renderer)
├── tsconfig.main.json           # TypeScript config (main)
├── vite.config.ts               # Vite configuration
├── vitest.config.ts             # Vitest configuration
├── playwright.config.ts         # Playwright configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── README.md                    # This file
```

### Architecture

- **Main Process**: Node.js environment with access to system APIs
- **Renderer Process**: React 18 with TypeScript and Tailwind CSS
- **IPC Communication**: Secure preload script exposes controlled API
- **State Management**: Zustand for React state, Electron Store for persistence
- **Styling**: Tailwind CSS v4 with dark mode support
- **Translation Service**: Axios-based HTTP client with queue and retry logic
- **Testing**: Vitest for unit tests, Playwright for E2E tests

---

## 🌐 Supported Languages

30+ languages supported by Yandex.Translate API:

- 🇬🇧 English • 🇷🇺 Russian • 🇩🇪 German • 🇫🇷 French • 🇪🇸 Spanish
- 🇮🇹 Italian • 🇵🇹 Portuguese • 🇵🇱 Polish • 🇺🇦 Ukrainian • 🇹🇷 Turkish
- 🇨🇳 Chinese • 🇯🇵 Japanese • 🇰🇷 Korean • 🇸🇦 Arabic • 🇮🇱 Hebrew
- 🇳🇱 Dutch • 🇸🇪 Swedish • 🇫🇮 Finnish • 🇩🇰 Danish • 🇳🇴 Norwegian
- 🇨🇿 Czech • 🇸🇰 Slovak • 🇧🇬 Bulgarian • 🇷🇴 Romanian • 🇭🇺 Hungarian
- 🇬🇷 Greek • 🇻🇳 Vietnamese • 🇹🇭 Thai • 🇮🇩 Indonesian • 🇮🇳 Hindi

All language names displayed in Russian for consistent UX.

---

## 🔒 Security & Privacy

### Data Privacy
- **Local Storage Only**: All data (history, settings, logs) stored on your device
- **No Telemetry**: Analytics are local-only, never transmitted
- **API Key Protection**: API keys stored in environment variables, never logged
- **User Control**: Export, view, and delete all data at any time

### Security Features
- **Context Isolation**: Renderer process isolated from Node.js
- **Preload Script**: Controlled IPC communication via secure bridge
- **No Node Integration**: Renderer can't access Node.js APIs directly
- **Code Signing**: Signed releases for Windows and macOS (when configured)
- **HTTPS Only**: All API communication over secure connections
- **Checksum Verification**: Updates verified with SHA512 checksums

---

## 📚 Documentation

- [Auto-Updates Guide](docs/AUTO_UPDATES.md) - Comprehensive auto-updates documentation
- [Testing Updates](docs/TESTING_UPDATES.md) - How to test updates locally
- [Logging & Analytics](docs/LOGGING_AND_ANALYTICS.md) - Logging and analytics systems
- [Accessibility](ACCESSIBILITY.md) - Accessibility features and WCAG compliance
- [Changelog](CHANGELOG.md) - Version history and release notes

---

## 🤝 Contributing

Contributions are welcome! Please ensure:

1. **Code Quality**:
   ```bash
   npm run lint        # No linting errors
   npm run format      # Code is formatted
   npm run type-check  # TypeScript types are correct
   npm test            # All tests pass
   ```

2. **Commit Guidelines**:
   - Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
   - Write clear, descriptive commit messages
   - Reference issue numbers when applicable

3. **Pull Requests**:
   - Create a feature branch from `develop`
   - Update documentation if needed
   - Add tests for new features
   - Ensure CI pipeline passes

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature idea?

1. Check [existing issues](https://github.com/your-username/yandextranslate/issues)
2. Create a new issue with:
   - Clear description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - System information (OS, version)
   - Screenshots or logs (if applicable)

---

## 📜 License

[Add your license here - e.g., MIT License]

---

## 🙏 Acknowledgments

- **Yandex.Translate API**: Powering the translation engine
- **Electron**: Cross-platform desktop framework
- **React**: UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Lightning-fast build tool

---

## 📞 Support

- **Documentation**: Check the [docs](docs/) folder
- **Issues**: [GitHub Issues](https://github.com/your-username/yandextranslate/issues)
- **Email**: dev@yandextranslate.local

---

<div align="center">

**Made with ❤️ using Electron, React, and TypeScript**

[⬆ Back to Top](#yandex-translate-desktop)

</div>
