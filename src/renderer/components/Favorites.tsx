import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistoryStore } from '../stores/historyStore';
import { Spinner } from './Spinner';
import { Toast } from './Toast';
import { SUPPORTED_LANGUAGES, type Language } from '../../shared/languages';

interface FavoritesProps {
  onInsert?: (text: string) => void;
}

export function Favorites({ onInsert }: FavoritesProps) {
  const { t } = useTranslation();
  const { favorites, isLoading, error, loadFavorites, toggleFavorite } = useHistoryStore();
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const getLanguageName = (code: string) => {
    const lang = SUPPORTED_LANGUAGES.find((l: Language) => l.code === code);
    return lang?.name || code;
  };

  const handleCopy = async (text: string) => {
    const success = await window.api.copyToClipboard(text);
    if (success) {
      setToast({ message: t('message.copied'), type: 'success' });
    }
  };

  const handleInsert = async (text: string) => {
    if (onInsert) {
      onInsert(text);
    } else {
      const success = await window.api.pasteIntoActiveWindow(text);
      if (success) {
        setToast({ message: t('message.pasted'), type: 'success' });
      }
    }
  };

  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id);
    if (!error) {
      setToast({ message: t('favorites.removedFromFavorites'), type: 'success' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner size="lg" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <svg
          className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('history.emptyFavorites')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('favorites.title')}
      </h3>

      <div className="space-y-2">
        {favorites.slice(0, 10).map((favorite) => (
          <div
            key={favorite.id}
            className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {getLanguageName(favorite.sourceLang)} → {getLanguageName(favorite.targetLang)}
                  </span>
                  {favorite.usageCount > 1 && (
                    <>
                      <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        {favorite.usageCount}x
                      </span>
                    </>
                  )}
                </div>

                <p className="text-sm text-gray-900 dark:text-white truncate mb-1">
                  {favorite.translatedText}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {favorite.sourceText}
                </p>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleInsert(favorite.translatedText)}
                  className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                  title={t('favorites.quickInsert')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => handleCopy(favorite.translatedText)}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                  title={t('history.action.copy')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => handleToggleFavorite(favorite.id)}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-yellow-500 transition-colors"
                  title={t('history.action.unfavorite')}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {favorites.length > 10 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Показано 10 из {favorites.length}
        </p>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {error && <Toast message={error} type="error" onClose={() => setToast(null)} />}
    </div>
  );
}
