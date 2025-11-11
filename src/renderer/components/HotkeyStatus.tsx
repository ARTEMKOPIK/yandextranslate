import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import type { HotkeyStatus as HotkeyStatusType } from '../../shared/types';

export function HotkeyStatus() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<
    (HotkeyStatusType & { primary?: string; fallback?: string }) | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      const hotkeyStatus = await window.api.getHotkeyStatus();
      setStatus(hotkeyStatus);
      setError(hotkeyStatus.error || null);
    } catch (err) {
      console.error('Failed to get hotkey status:', err);
      setError('Failed to load hotkey status');
    }
  };

  useEffect(() => {
    loadStatus();

    const unsubscribe = window.api.onHotkeyStatus((newStatus) => {
      setStatus((prev) => ({ ...prev, ...newStatus }));
      setError(newStatus.error || null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleReload = () => {
    window.api.reloadShortcuts();
    setTimeout(loadStatus, 500);
  };

  const handleToggleOverlay = async () => {
    try {
      await window.api.toggleOverlay();
    } catch (err) {
      console.error('Failed to toggle overlay:', err);
    }
  };

  if (!status) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          {t('hotkey.title')}
        </h4>

        {status.registered ? (
          <div className="space-y-2">
            <p className="text-sm text-green-600 dark:text-green-400">
              {t('hotkey.registered')}{' '}
              <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                {status.shortcut}
              </code>
            </p>
            {status.primary && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t('hotkey.primary')}{' '}
                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                  {status.primary}
                </code>
              </p>
            )}
            {status.fallback && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t('hotkey.fallback')}{' '}
                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                  {status.fallback}
                </code>
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-red-600 dark:text-red-400">{t('hotkey.notRegistered')}</p>
        )}

        {error && (
          <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button size="sm" variant="secondary" onClick={handleReload}>
          {t('hotkey.reload')}
        </Button>
        <Button size="sm" variant="primary" onClick={handleToggleOverlay}>
          {t('button.toggleOverlay')}
        </Button>
      </div>
    </div>
  );
}
