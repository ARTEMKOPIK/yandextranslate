import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistoryStore } from '../stores/historyStore';
import { HistoryEntry } from './HistoryEntry';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { Toast } from './Toast';
import { SUPPORTED_LANGUAGES, type Language } from '../../shared/languages';
import type { HistoryFilter } from '../../shared/types';

export function History() {
  const { t } = useTranslation();
  const {
    entries,
    isLoading,
    error,
    loadHistory,
    toggleFavorite,
    deleteEntry,
    clearHistory,
    setFilter,
    retranslate,
  } = useHistoryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sourceLangFilter, setSourceLangFilter] = useState('');
  const [targetLangFilter, setTargetLangFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [keepFavorites, setKeepFavorites] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const newFilter: HistoryFilter = {};

    if (searchQuery) {
      newFilter.search = searchQuery;
    }

    if (sourceLangFilter) {
      newFilter.sourceLang = sourceLangFilter;
    }

    if (targetLangFilter) {
      newFilter.targetLang = targetLangFilter;
    }

    if (dateFilter === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      newFilter.startDate = startOfDay.getTime();
    } else if (dateFilter === 'week') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      newFilter.startDate = startOfWeek.getTime();
    } else if (dateFilter === 'month') {
      const startOfMonth = new Date();
      startOfMonth.setDate(startOfMonth.getDate() - 30);
      newFilter.startDate = startOfMonth.getTime();
    } else if (dateFilter === 'favorites') {
      newFilter.onlyFavorites = true;
    }

    setFilter(newFilter);
  }, [searchQuery, sourceLangFilter, targetLangFilter, dateFilter, setFilter]);

  const handleCopy = async (text: string) => {
    const success = await window.api.copyToClipboard(text);
    if (success) {
      setToast({ message: t('message.copied'), type: 'success' });
    }
  };

  const handleRetranslate = async (entry: Parameters<typeof retranslate>[0]) => {
    await retranslate(entry);
    if (!error) {
      setToast({ message: t('message.success'), type: 'success' });
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const entry = entries.find((e) => e.id === id);
    await toggleFavorite(id);
    if (!error) {
      setToast({
        message: entry?.isFavorite
          ? t('favorites.removedFromFavorites')
          : t('favorites.addedToFavorites'),
        type: 'success',
      });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
    if (!error) {
      setToast({ message: t('history.deleted'), type: 'success' });
    }
  };

  const handleClearHistory = async () => {
    await clearHistory(keepFavorites);
    setShowClearConfirm(false);
    if (!error) {
      setToast({ message: t('history.cleared'), type: 'success' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('history.title')}</h2>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            disabled={entries.length === 0}
          >
            {t('history.clear')}
          </Button>
        </div>

        <div className="space-y-3">
          <Input
            placeholder={t('history.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3">
            <Select value={sourceLangFilter} onChange={(e) => setSourceLangFilter(e.target.value)}>
              <option value="">
                {t('label.source')} ({t('history.filter.all')})
              </option>
              {SUPPORTED_LANGUAGES.map((lang: Language) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </Select>

            <Select value={targetLangFilter} onChange={(e) => setTargetLangFilter(e.target.value)}>
              <option value="">
                {t('label.target')} ({t('history.filter.all')})
              </option>
              {SUPPORTED_LANGUAGES.map((lang: Language) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </Select>

            <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="all">{t('history.filter.all')}</option>
              <option value="today">{t('history.filter.today')}</option>
              <option value="week">{t('history.filter.week')}</option>
              <option value="month">{t('history.filter.month')}</option>
              <option value="favorites">{t('history.filter.favorites')}</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg
              className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              {dateFilter === 'favorites' ? t('history.emptyFavorites') : t('history.empty')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <HistoryEntry
                key={entry.id}
                entry={entry}
                onCopy={handleCopy}
                onRetranslate={handleRetranslate}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('history.clear')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{t('history.clearConfirm')}</p>

            <label className="flex items-center gap-2 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={keepFavorites}
                onChange={(e) => setKeepFavorites(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('history.clearKeepFavorites')}
              </span>
            </label>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1"
              >
                {t('button.cancel')}
              </Button>
              <Button variant="danger" onClick={handleClearHistory} className="flex-1">
                {t('button.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {error && <Toast message={error} type="error" onClose={() => setToast(null)} />}
    </div>
  );
}
