import { useTranslation } from 'react-i18next';
import type { TranslationHistoryEntry } from '../../shared/types';
import { SUPPORTED_LANGUAGES, type Language } from '../../shared/languages';

interface HistoryEntryProps {
  entry: TranslationHistoryEntry;
  onCopy: (text: string) => void;
  onRetranslate: (entry: TranslationHistoryEntry) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HistoryEntry({
  entry,
  onCopy,
  onRetranslate,
  onToggleFavorite,
  onDelete,
}: HistoryEntryProps) {
  const { t } = useTranslation();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} д назад`;

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getLanguageName = (code: string) => {
    const lang = SUPPORTED_LANGUAGES.find((l: Language) => l.code === code);
    return lang?.name || code;
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getLanguageName(entry.sourceLang)} → {getLanguageName(entry.targetLang)}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(entry.timestamp)}
            </span>
            {entry.usageCount > 1 && (
              <>
                <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {entry.usageCount} {entry.usageCount === 1 ? 'раз' : 'раза'}
                </span>
              </>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {entry.sourceText}
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
              {entry.translatedText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleFavorite(entry.id)}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              entry.isFavorite ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'
            }`}
            title={entry.isFavorite ? t('history.action.unfavorite') : t('history.action.favorite')}
          >
            <svg
              className="w-5 h-5"
              fill={entry.isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>

          <button
            onClick={() => onCopy(entry.translatedText)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            title={t('history.action.copy')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>

          <button
            onClick={() => onRetranslate(entry)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            title={t('history.action.retranslate')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 dark:text-red-400 transition-colors"
            title={t('history.action.delete')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
