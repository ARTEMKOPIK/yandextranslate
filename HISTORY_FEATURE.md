# Translation History & Favorites Feature

## Overview
The translation history and favorites feature provides persistent storage of all translations with advanced filtering, search, and quick-access capabilities.

## Features

### 1. Persistent Storage
- **Storage Backend**: electron-store (JSON-based local storage)
- **Location**: User data directory (platform-specific)
- **Encryption**: Optional AES-256-CBC encryption for sensitive content
- **Retention**: Configurable maximum entries (default: 1000)

### 2. History Entry Fields
Each translation is stored with:
- `id`: Unique identifier (UUID)
- `sourceText`: Original text
- `translatedText`: Translated result
- `sourceLang`: Detected source language code
- `targetLang`: Target language code
- `timestamp`: Unix timestamp (milliseconds)
- `isFavorite`: Boolean flag for favorites
- `usageCount`: Number of times the translation was used

### 3. Automatic Deduplication
When translating the same text to the same language:
- Existing entry is updated instead of creating a duplicate
- Usage count is incremented
- Timestamp is updated to current time
- Translation text is refreshed

### 4. Search & Filtering
Users can filter history by:
- **Search Query**: Text search in source and translated text
- **Source Language**: Filter by detected source language
- **Target Language**: Filter by target language
- **Date Range**: Today, This Week, This Month, or custom range
- **Favorites Only**: Show only favorited translations

### 5. Context Actions
Each history entry supports:
- **Copy**: Copy translation to clipboard
- **Copy Source**: Copy source text to clipboard
- **Retranslate**: Perform translation again with current API
- **Toggle Favorite**: Mark/unmark as favorite
- **Delete**: Remove from history

### 6. Favorites
- Quick-access to frequently used translations
- Protected from retention policy cleanup
- Sorted by usage count (most used first)
- Available in overlay window for quick insertion
- Up to 5 favorites shown in overlay panel

### 7. Retention Policy
- Configurable maximum entries (10-10000)
- When limit is reached:
  - Favorites are always preserved
  - Oldest non-favorite entries are removed
- Settings available in History Settings tab

### 8. Privacy & Security
- Optional encryption for sensitive content
- Encryption key derived from machine ID
- AES-256-CBC cipher
- All data stored locally (no cloud sync)

## Usage

### Main Window

#### Accessing History
1. Open the main window
2. Click "История переводов" tab in the sidebar
3. View all translation history with search and filters

#### Search & Filter
1. Use the search box to find specific translations
2. Filter by source/target language using dropdowns
3. Filter by date using the date filter dropdown
4. Toggle "Избранное" filter to show only favorites

#### Managing Entries
- **Hover** over an entry to reveal action buttons
- **Star icon**: Toggle favorite status
- **Copy icon**: Copy translation to clipboard
- **Refresh icon**: Retranslate the text
- **Trash icon**: Delete entry

#### Clearing History
1. Click "Очистить историю" button
2. Choose to keep or delete favorites
3. Confirm the action

### Overlay Window

#### Quick Favorites Access
1. Open overlay with Win+T (or Ctrl+Shift+T)
2. Click the star icon in the header
3. View top 5 favorites
4. Click any favorite to insert into the translation result

### Settings

#### Configuring History
1. Open Settings tab in main window
2. Adjust "Максимум записей" (Max entries)
3. Toggle "Шифрование данных" (Encryption)
4. Click "Сохранить" (Save)

## API Reference

### Main Process (IPC Handlers)

```typescript
// Get history with optional filter
ipcMain.handle('history:get', (_, filter?: HistoryFilter) => TranslationHistoryEntry[])

// Get only favorites (sorted by usage)
ipcMain.handle('history:get-favorites', () => TranslationHistoryEntry[])

// Toggle favorite status
ipcMain.handle('history:toggle-favorite', (_, id: string) => TranslationHistoryEntry | null)

// Delete entry
ipcMain.handle('history:delete', (_, id: string) => boolean)

// Clear history (keepFavorites: boolean)
ipcMain.handle('history:clear', (_, keepFavorites: boolean) => number)

// Get statistics
ipcMain.handle('history:get-stats', () => HistoryStats)

// Get configuration
ipcMain.handle('history:get-config', () => HistoryConfig)

// Update configuration
ipcMain.handle('history:update-config', (_, config: Partial<HistoryConfig>) => HistoryConfig)
```

### Renderer (Zustand Store)

```typescript
import { useHistoryStore } from './stores/historyStore';

const {
  entries,           // TranslationHistoryEntry[]
  favorites,         // TranslationHistoryEntry[]
  filter,           // HistoryFilter
  isLoading,        // boolean
  error,            // string | null
  loadHistory,      // (filter?: HistoryFilter) => Promise<void>
  loadFavorites,    // () => Promise<void>
  toggleFavorite,   // (id: string) => Promise<void>
  deleteEntry,      // (id: string) => Promise<void>
  clearHistory,     // (keepFavorites: boolean) => Promise<void>
  setFilter,        // (filter: HistoryFilter) => void
  retranslate,      // (entry: TranslationHistoryEntry) => Promise<void>
} = useHistoryStore();
```

### Types

```typescript
interface TranslationHistoryEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
  isFavorite: boolean;
  usageCount: number;
}

interface HistoryFilter {
  search?: string;
  sourceLang?: string;
  targetLang?: string;
  onlyFavorites?: boolean;
  startDate?: number;
  endDate?: number;
}

interface HistoryConfig {
  maxEntries: number;
  enableEncryption: boolean;
}
```

## Technical Implementation

### Storage Location
- **Windows**: `%APPDATA%/yandextranslate/translation-history.json`
- **macOS**: `~/Library/Application Support/yandextranslate/translation-history.json`
- **Linux**: `~/.config/yandextranslate/translation-history.json`

### Performance Considerations
- All filtering done in-memory for instant results
- Entries sorted by timestamp (most recent first)
- Favorites sorted by usage count
- Efficient deduplication using source text + language combo

### Error Handling
- All operations wrapped in try-catch
- User-friendly error messages via toast notifications
- Silent failure for non-critical operations
- Graceful degradation if storage fails

## Testing

Run the history service tests:
```bash
npm test -- history.test.ts
```

Test coverage includes:
- Adding entries with deduplication
- Filtering by various criteria
- Favorite management
- Deletion and clearing
- Configuration updates
- Statistics generation
- Encryption (when enabled)

## Future Enhancements

Potential improvements:
1. Export/Import history to JSON/CSV
2. Sync across devices (optional cloud storage)
3. Advanced search with regex support
4. Custom retention rules per language pair
5. Translation quality rating system
6. Batch operations (delete multiple, export selected)
7. History analytics and usage statistics
8. Keyboard shortcuts for history actions
