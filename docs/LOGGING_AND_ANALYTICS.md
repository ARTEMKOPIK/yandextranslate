# Logging and Analytics Documentation

## Overview

The application includes comprehensive logging and analytics features to help debug issues and understand usage patterns. All data is stored locally on the user's computer and is never transmitted to external servers.

## Logging System

### Architecture

The logging system is built on top of [electron-log](https://www.npmjs.com/package/electron-log), providing structured logging with automatic file rotation and retention policies.

### Log Locations

Logs are stored in the user's data directory:

- **Windows**: `%APPDATA%\yandextranslate\logs\app.log`
- **macOS**: `~/Library/Application Support/yandextranslate/logs/app.log`
- **Linux**: `~/.config/yandextranslate/logs/app.log`

### Log Rotation

- **Max file size**: 5 MB
- **Archived logs**: Last 10 archived log files are kept
- **Naming**: Archived logs are named `app.YYYY-MM-DDTHH-MM-SS.log`
- **Automatic cleanup**: Old archives beyond the 10-file limit are automatically deleted

### Log Levels

The application uses four log levels:

1. **error**: Critical errors that prevent functionality
2. **warn**: Warning messages for non-critical issues
3. **info**: General informational messages
4. **debug**: Detailed debugging information

### Log Format

Logs follow this format:
```
[YYYY-MM-DD HH:MM:SS.mmm] [level] [context] message {data}
```

Example:
```
[2024-01-15 10:30:45.123] [info] [Translation] Translation completed {sourceLang: "en", targetLang: "ru", textLength: 45}
```

### Usage in Code

#### Main Process (Node.js)

```typescript
import { logger } from './services/logger.js';

// Log an error
logger.error('Translation failed', 'Translation', { error: errorMessage });

// Log a warning
logger.warn('API key not configured', 'Config');

// Log info
logger.info('Service initialized', 'Main');

// Log debug info
logger.debug('Cache hit', 'Cache', { key: 'translation-xyz' });
```

#### Renderer Process (React)

```typescript
// Log errors from renderer
window.api.logError('Component failed to render', 'ComponentName', {
  error: error.message,
  stack: error.stack
});
```

### What Gets Logged

The following events are automatically logged:

**Startup & Configuration**
- Application initialization
- Service initialization (translation, history, settings)
- API key validation

**User Actions**
- Translations (source/target languages, text length)
- Clipboard operations (copy, paste)
- Favorite toggles
- History operations
- Settings changes

**System Events**
- Global hotkey registration/conflicts
- Overlay window show/hide
- Window lifecycle events

**Errors**
- Translation API failures
- Network errors
- Service errors
- UI component errors (via ErrorBoundary)

### Accessing Logs

Users can access logs through the Settings interface:

1. Navigate to Settings → Logs
2. Click "View Logs" to see the last 500 lines
3. Click "Export" to download the full log file
4. Click "Open Folder" to open the logs directory
5. Click "Clear Logs" to delete all logs

## Analytics System

### Architecture

The analytics system tracks anonymized usage metrics using a simple counter-based approach. All data is stored locally using electron-store.

### Data Location

Analytics data is stored in:

- **Windows**: `%APPDATA%\yandextranslate\app-analytics.json`
- **macOS**: `~/Library/Application Support/yandextranslate/app-analytics.json`
- **Linux**: `~/.config/yandextranslate/app-analytics.json`

### Tracked Metrics

The following metrics are tracked:

1. **Translations**: Total number of translations performed
2. **Favorites**: Current number of favorite translations
3. **Pastes**: Number of times text was pasted into another application
4. **Copies**: Number of times text was copied to clipboard
5. **Overlay Shows**: Number of times the overlay window was shown
6. **Errors**: Number of errors encountered
7. **Last Reset**: Timestamp when metrics were last reset

### Data Structure

```typescript
interface UsageMetrics {
  translations: number;
  favorites: number;
  pastes: number;
  copies: number;
  overlayShows: number;
  errors: number;
  lastReset: number; // Unix timestamp
}
```

### Usage in Code

```typescript
import { analytics } from './services/analytics.js';

// Track a translation
analytics.trackTranslation();

// Track favorite toggle
analytics.trackFavoriteToggle(isFavorite);

// Track paste action
analytics.trackPaste();

// Track copy action
analytics.trackCopy();

// Track overlay show
analytics.trackOverlayShow();

// Track error
analytics.trackError();

// Get current stats
const stats = analytics.getStats();

// Reset all metrics
analytics.reset();

// Export stats as JSON
const json = analytics.exportStats();
```

### Accessing Analytics

Users can view analytics through the Settings interface:

1. Navigate to Settings → Analytics
2. View usage statistics in a grid layout
3. Click "Export" to download analytics data as JSON
4. Click "Reset" to clear all statistics

## Privacy Considerations

### Local-Only Storage

- **No external transmission**: All logs and analytics data remain on the user's computer
- **No personal information**: Only anonymous counters and technical data are stored
- **No text content**: Translation texts are not logged (only metadata like length and languages)
- **User control**: Users can view, export, and delete all data at any time

### What Is NOT Tracked

- User identity or personal information
- Actual translation text content
- IP addresses or network information
- Device identifiers
- Location data
- Usage patterns over time (only aggregate counts)

### Data Retention

- **Logs**: Automatically rotated after 5 MB, last 10 archives kept
- **Analytics**: Stored indefinitely until user manually resets
- **User control**: Users can clear logs and reset analytics at any time

## Error Boundary

### Purpose

The ErrorBoundary component catches React errors and prevents the entire UI from crashing, providing a user-friendly error screen instead.

### What It Does

1. **Catches errors**: Intercepts JavaScript errors in child components
2. **Logs errors**: Automatically logs errors to the main process
3. **Shows fallback UI**: Displays a friendly error message with recovery options
4. **Development mode**: Shows detailed error information in dev builds

### Error Information Captured

- Error message
- Stack trace
- Component stack (React component tree)
- Timestamp (via logger)

### User Actions

Users can:
- **Reload Application**: Performs a full page reload
- **Try Again**: Resets the error boundary to attempt recovery
- **View Logs**: Access full error details in Settings → Logs

## Development Guidelines

### Adding New Logs

When adding new features, follow these guidelines:

1. **Use appropriate log levels**:
   - `error`: Only for critical failures
   - `warn`: For recoverable issues or deprecations
   - `info`: For important state changes
   - `debug`: For detailed tracing

2. **Include context**: Always provide a context string (e.g., 'Translation', 'Settings')

3. **Add structured data**: Use the data parameter for additional information

4. **Don't log sensitive data**: Never log API keys, passwords, or full translation texts

### Adding New Metrics

To track a new user action:

1. Add the metric to `UsageMetrics` interface in `src/shared/types.ts`
2. Add tracking method to `AnalyticsService` in `src/main/services/analytics.ts`
3. Call the tracking method at the appropriate location
4. Update the analytics UI in `AnalyticsSettings.tsx`
5. Add localization strings in `ru.json`

### Testing

Both logging and analytics services include unit tests:

```bash
npm test src/main/services/logger.test.ts
npm test src/main/services/analytics.test.ts
```

## Troubleshooting

### Logs Not Appearing

1. Check if the logs directory exists
2. Verify file permissions
3. Check if the log file is being written to
4. Look for errors in the console

### Analytics Not Updating

1. Verify analytics service is initialized
2. Check electron-store file permissions
3. Ensure tracking calls are being made
4. Check for errors in logs

### High Disk Usage

1. Check log file size (should auto-rotate at 5 MB)
2. Verify old log cleanup is working
3. Manually clear logs if needed
4. Check for excessive error logging

## Future Enhancements

Potential improvements for future versions:

- [ ] Configurable log levels per context
- [ ] Log filtering and search in UI
- [ ] Export analytics as CSV
- [ ] Usage trends over time
- [ ] Performance metrics tracking
- [ ] Crash reporting
- [ ] Remote logging (opt-in)
