# Changelog

All notable changes to Yandex Translate Desktop will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-rc.1] - 2024-11-11

### 🎉 First Release Candidate

This is the first release candidate for version 1.0.0. The application is feature-complete and ready for public testing.

### ✨ Features

#### Core Translation
- Yandex.Translate API integration with 30+ languages support
- Automatic source language detection
- Request queue with rate limiting (200ms between requests)
- Automatic retry logic with exponential backoff (up to 3 retries)
- Copy/paste automation with clipboard integration
- Translation history with search and filtering

#### Floating Overlay Window
- Global hotkey support (`Win+T` or `Ctrl+Shift+T`)
- Always-on-top frameless window with transparency
- Smart positioning (near cursor on first show, remembers last position)
- Auto-focus text input on show
- Keyboard shortcuts: `Enter` to translate, `Escape` to close
- Quick actions: Copy, Paste, Clear buttons
- Favorites quick-access panel with toggle

#### System Tray Integration
- Adaptive tray icons (light/dark based on system theme)
- High DPI support with @2x assets
- Context menu with quick actions:
  - Show/Hide QuickTranslate overlay
  - Toggle theme (Light/Dark/System)
  - Show main window
  - Access settings
  - Check for updates
  - Quit application
- Double-click to toggle main window
- Configurable notifications
- Start minimized to tray option
- Close to tray instead of quit option

#### User Interface
- Modern, responsive UI built with React 18 and Tailwind CSS v4
- Dark/Light/System theme support with automatic detection
- Smooth animations and transitions
- Toast notifications for user feedback
- Error boundary with graceful error handling
- Tab-based navigation (History, Favorites, Settings)
- Russian localization (default)

#### History & Favorites
- Automatic translation history tracking
- Configurable retention policy (default: 1000 entries)
- Deduplication (updates existing entries instead of creating duplicates)
- Search and filter by text, language, date range
- Star system for marking favorites
- Usage count tracking
- Favorites protected during retention cleanup
- Export history to JSON
- Clear history with confirmation

#### Settings
- **General**: History limits, startup behavior, tray preferences
- **Hotkeys**: Custom global shortcuts with validation
- **Interface**: Language selection (Russian/English placeholder)
- **Theme**: Light/Dark/System mode selection
- **Tray**: Notification controls and tray behavior
- **Updates**: Auto-download, prerelease, version skipping
- **Logs**: View, export, open folder, clear logs
- **Analytics**: Usage statistics dashboard with export/reset
- Live settings updates (no app restart required)
- Reset to defaults functionality

#### Auto-Updates
- Automatic update checks on startup (production only, 5s delay)
- Manual update checks from Settings or tray menu
- GitHub Releases integration
- Download progress with speed and size indicators
- Version skipping (tracks last 10 skipped versions)
- Differential updates for Windows (NSIS)
- Configurable: auto-download, allow prerelease, allow downgrade
- User must approve installation (never auto-installs)

#### Logging & Analytics
- Structured logging with electron-log
- Automatic rotation at 5MB
- Retention of last 10 archived logs
- Log levels: error, warn, info, debug
- Privacy-focused (no API keys or translation text logged)
- Anonymous usage analytics (100% local)
- Metrics: translations, favorites, pastes, copies, overlay shows, errors
- Export analytics to JSON
- View last 500 log lines in-app

#### Accessibility
- Full keyboard navigation support
- Clear focus indicators on all interactive elements
- ARIA labels and roles for screen readers
- High contrast mode detection and adaptation
- Reduced motion support (`prefers-reduced-motion`)
- Skip to main content link
- WCAG 2.1 Level AA compliance
- Active scale animation for button clicks
- Semantic HTML throughout

### 🏗️ Architecture

#### Main Process
- Electron 27 with Node.js access
- Service-oriented architecture:
  - Translation service (Yandex API client)
  - Configuration service (dotenv)
  - History service (electron-store)
  - Settings service (electron-store)
  - Logger service (electron-log)
  - Analytics service (electron-store)
  - Updater service (electron-updater)
- IPC handlers for secure renderer communication
- Global shortcuts management
- Window lifecycle management
- System tray management

#### Renderer Process
- React 18 with TypeScript 5
- Vite 5 for development and building
- Zustand for state management
- React Context for theme management
- i18next for internationalization
- Tailwind CSS v4 for styling
- Custom hooks for reusable logic
- Component-based architecture

#### Testing
- Vitest for unit tests (10+ tests across services)
- @testing-library/react for component tests
- Playwright for E2E smoke tests
- Coverage reporting with v8
- Test setup with jsdom environment
- Mocked window.api for renderer tests

#### Security
- Context isolation enabled
- Preload script for controlled IPC
- No Node integration in renderer
- API keys stored in environment variables
- HTTPS-only API communication
- Code signing support (Windows & macOS)
- SHA512 checksum verification for updates

### 🛠️ Development

#### Build System
- TypeScript compilation for main process
- Vite build for renderer process
- electron-builder for packaging
- Multi-platform builds (Windows, macOS, Linux)
- NSIS installer with differential updates (Windows)
- DMG and ZIP packages (macOS)
- AppImage and DEB packages (Linux)

#### CI/CD
- GitHub Actions workflow
- Linting with ESLint
- Formatting with Prettier
- Type checking with TypeScript
- Unit test execution
- Coverage reporting
- Multi-platform builds
- Artifact uploading

#### Developer Experience
- Hot module replacement in development
- DevTools auto-open in dev mode
- Concurrent dev server and Electron
- Wait-on for proper startup order
- TypeScript strict mode
- Path aliases (@, @shared, @main)
- Comprehensive documentation

### 📚 Documentation

- Comprehensive README with user and developer guides
- AUTO_UPDATES.md - Auto-updates implementation guide
- TESTING_UPDATES.md - Local update testing guide
- LOGGING_AND_ANALYTICS.md - Logging and analytics documentation
- ACCESSIBILITY.md - Accessibility features and compliance
- CHANGELOG.md - Version history and release notes
- In-code comments for complex logic
- JSDoc annotations for public APIs

### 🔧 Configuration

- `.env` file for API key configuration
- `package.json` build configuration for electron-builder
- TypeScript configs: renderer and main process
- Vite config with React plugin and path aliases
- Vitest config with jsdom and setup files
- Playwright config for E2E tests
- Tailwind config with dark mode support
- ESLint config with TypeScript support
- Prettier config for consistent formatting

### 📦 Dependencies

#### Production
- electron 27.0.0
- react 18.2.0
- react-dom 18.2.0
- tailwindcss 4.1.17
- @tailwindcss/postcss 4.1.17
- axios 1.13.2
- dotenv 17.2.3
- electron-store 11.0.2
- electron-log 5.4.3
- electron-updater 6.6.2
- i18next 25.6.2
- react-i18next 16.2.4
- zustand 5.0.8
- clsx 2.1.1
- class-variance-authority 0.7.1

#### Development
- typescript 5.3.3
- vite 5.0.8
- vitest 4.0.8
- @vitejs/plugin-react 4.2.1
- electron-builder 24.6.4
- @testing-library/react 16.3.0
- @testing-library/user-event (latest)
- @testing-library/jest-dom (latest)
- playwright (latest)
- @playwright/test (latest)
- eslint 8.56.0
- prettier 3.1.1
- jsdom 27.1.0
- concurrently 8.2.2
- wait-on 7.2.0

### 🎯 Versioning Strategy

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version (1.x.x): Incompatible API changes or major overhauls
- **MINOR** version (x.1.x): New features in a backward-compatible manner
- **PATCH** version (x.x.1): Backward-compatible bug fixes

#### Pre-release Tags
- **alpha** (x.x.x-alpha.1): Early development, unstable
- **beta** (x.x.x-beta.1): Feature-complete, needs testing
- **rc** (x.x.x-rc.1): Release candidate, ready for production

### 🚀 Release Process

1. **Version Bump**: Update `package.json` version
2. **Changelog**: Document changes in `CHANGELOG.md`
3. **Testing**: Run full test suite and manual QA
4. **Build**: Generate distributable packages
5. **Tagging**: Create Git tag (e.g., `v1.0.0-rc.1`)
6. **Publishing**: Upload to GitHub Releases
7. **Announcement**: Update documentation and notify users

### 🐛 Known Issues

None at this time. Please report any issues on [GitHub Issues](https://github.com/your-username/yandextranslate/issues).

### 🔮 Roadmap

#### v1.0.0 (Stable Release)
- Address any issues found during RC testing
- Performance optimizations
- Additional automated tests
- User-provided feedback implementation

#### v1.1.0 (Planned Features)
- English UI localization
- Additional language support
- Clipboard history integration
- Batch translation mode
- Translation memory/glossary
- Keyboard shortcut customization in UI
- Font size settings
- Additional themes

#### v1.2.0 (Future Enhancements)
- OCR support (image translation)
- Voice input integration
- Browser extension companion
- Cloud sync for history and favorites
- Multi-monitor support improvements
- Custom translation providers

### 🙏 Acknowledgments

Special thanks to:
- Yandex.Translate team for the excellent API
- Electron, React, and TypeScript communities
- All contributors and testers
- Users providing feedback and bug reports

---

## Version History

### Release Candidates
- [1.0.0-rc.1] - 2024-11-11 - First release candidate

### Future Releases
- [1.0.0] - TBD - First stable release

---

[Unreleased]: https://github.com/your-username/yandextranslate/compare/v1.0.0-rc.1...HEAD
[1.0.0-rc.1]: https://github.com/your-username/yandextranslate/releases/tag/v1.0.0-rc.1
