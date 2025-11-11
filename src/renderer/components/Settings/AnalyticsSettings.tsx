import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Spinner } from '../';
import { SettingsSection } from './SettingsSection';
import { showToast } from '../Toast';

interface AnalyticsStats {
  translations: number;
  favorites: number;
  pastes: number;
  copies: number;
  overlayShows: number;
  errors: number;
  since: string;
  daysTracked: number;
}

export function AnalyticsSettings() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await window.api.getAnalyticsStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      showToast(t('settings.analytics.loadError'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleReset = async () => {
    if (!confirm(t('settings.analytics.resetConfirm'))) {
      return;
    }

    setIsResetting(true);
    try {
      const response = await window.api.resetAnalytics();
      if (response.success) {
        await loadStats();
        showToast(t('settings.analytics.resetSuccess'), 'success');
      } else {
        showToast(t('settings.analytics.resetError'), 'error');
      }
    } catch (error) {
      showToast(t('settings.analytics.resetError'), 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await window.api.exportAnalytics();
      if (response.success && response.data) {
        const blob = new Blob([response.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(t('settings.analytics.exported'), 'success');
      } else {
        showToast(t('settings.analytics.exportError'), 'error');
      }
    } catch (error) {
      showToast(t('settings.analytics.exportError'), 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <SettingsSection
      title={t('settings.analytics.title')}
      description={t('settings.analytics.description')}
    >
      <div className="space-y-6">
        {stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.translations.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('settings.analytics.translations')}
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.favorites.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('settings.analytics.favorites')}
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.pastes.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('settings.analytics.pastes')}
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.copies.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('settings.analytics.copies')}
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                  {stats.overlayShows.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('settings.analytics.overlayShows')}
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.errors.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('settings.analytics.errors')}
                </div>
              </Card>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('settings.analytics.trackingSince')}: {new Date(stats.since).toLocaleDateString()}{' '}
              ({stats.daysTracked} {t('settings.analytics.days')})
            </div>
          </>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            {t('settings.analytics.export')}
          </Button>
          <Button variant="danger" size="sm" onClick={handleReset} isLoading={isResetting}>
            {t('settings.analytics.reset')}
          </Button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>{t('settings.analytics.privacy.title')}:</strong>{' '}
            {t('settings.analytics.privacy.description')}
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
