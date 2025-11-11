import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../Button';
import { Spinner } from '../Spinner';
import { SettingsSection } from './SettingsSection';
import { showToast } from '../Toast';
import type { UpdateInfo, UpdateProgress, UpdateStatus, UpdateConfig } from '../../../shared/types';

export function UpdatesSettings() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [config, setConfig] = useState<UpdateConfig | null>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<UpdateProgress | null>(null);
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [skippedVersions, setSkippedVersions] = useState<
    Array<{ version: string; skippedAt: number }>
  >([]);

  useEffect(() => {
    loadStatus();
    loadConfig();
    loadSkippedVersions();
    setupEventListeners();

    return () => {
      // Cleanup event listeners
      const unsubscribers = [
        window.api.onUpdateChecking(() => {}),
        window.api.onUpdateAvailable(() => {}),
        window.api.onUpdateNotAvailable(() => {}),
        window.api.onUpdateDownloadProgress(() => {}),
        window.api.onUpdateDownloaded(() => {}),
        window.api.onUpdateError(() => {}),
      ];
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  const loadStatus = async () => {
    try {
      const statusData = await window.api.updater.getStatus();
      setStatus(statusData);
      setIsCheckingForUpdates(statusData.checking);
      setIsDownloading(statusData.downloading);
      setUpdateDownloaded(statusData.downloaded);
    } catch (error) {
      console.error('Failed to load update status:', error);
    }
  };

  const loadConfig = async () => {
    try {
      const configData = await window.api.updater.getConfig();
      setConfig(configData);
    } catch (error) {
      console.error('Failed to load update config:', error);
    }
  };

  const loadSkippedVersions = async () => {
    try {
      const versions = await window.api.updater.getSkippedVersions();
      setSkippedVersions(versions);
    } catch (error) {
      console.error('Failed to load skipped versions:', error);
    }
  };

  const setupEventListeners = () => {
    window.api.onUpdateChecking(() => {
      setIsCheckingForUpdates(true);
      setUpdateAvailable(false);
      setUpdateInfo(null);
    });

    window.api.onUpdateAvailable((info: UpdateInfo) => {
      setIsCheckingForUpdates(false);
      setUpdateAvailable(true);
      setUpdateInfo(info);
      showToast(`${t('settings.updates.updateAvailable')}: ${info.version}`, 'info');
    });

    window.api.onUpdateNotAvailable(() => {
      setIsCheckingForUpdates(false);
      setUpdateAvailable(false);
      setUpdateInfo(null);
    });

    window.api.onUpdateDownloadProgress((progress: UpdateProgress) => {
      setIsDownloading(true);
      setDownloadProgress(progress);
    });

    window.api.onUpdateDownloaded((info: { version: string }) => {
      setIsDownloading(false);
      setUpdateDownloaded(true);
      setDownloadProgress(null);
      showToast(`${t('settings.updates.updateDownloaded')}: ${info.version}`, 'success');
    });

    window.api.onUpdateError((error: { message: string }) => {
      setIsCheckingForUpdates(false);
      setIsDownloading(false);
      showToast(error.message || t('settings.updates.error'), 'error');
    });
  };

  const handleCheckForUpdates = async () => {
    setIsCheckingForUpdates(true);
    try {
      const result = await window.api.updater.checkForUpdates(false);

      if (result.success && !result.updateAvailable) {
        showToast(t('settings.updates.updateNotAvailable'), 'success');
      } else if (!result.success && result.error) {
        showToast(result.error, 'error');
      }
    } catch (error) {
      showToast(t('settings.updates.updateCheckError'), 'error');
    } finally {
      setIsCheckingForUpdates(false);
    }
  };

  const handleDownloadUpdate = async () => {
    setIsDownloading(true);
    try {
      const result = await window.api.updater.downloadUpdate();

      if (!result.success && result.error) {
        showToast(result.error, 'error');
        setIsDownloading(false);
      }
    } catch (error) {
      showToast(t('settings.updates.downloadError'), 'error');
      setIsDownloading(false);
    }
  };

  const handleInstallNow = () => {
    window.api.updater.quitAndInstall();
  };

  const handleSkipVersion = () => {
    if (updateInfo) {
      window.api.updater.skipVersion(updateInfo.version);
      setUpdateAvailable(false);
      setUpdateInfo(null);
      loadSkippedVersions();
      showToast(t('settings.updates.skipVersion'), 'info');
    }
  };

  const handleClearSkippedVersions = () => {
    window.api.updater.clearSkippedVersions();
    setSkippedVersions([]);
    showToast(t('settings.updates.clearSkippedVersions'), 'success');
  };

  const handleConfigChange = async (key: keyof UpdateConfig, value: boolean) => {
    try {
      await window.api.updater.updateConfig({ [key]: value });
      setConfig((prev: UpdateConfig | null) => (prev ? { ...prev, [key]: value } : null));
      showToast(t('settings.saved'), 'success');
    } catch (error) {
      showToast(t('message.error'), 'error');
    }
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title={t('settings.updates.title')}
        description={t('settings.updates.description')}
      >
        {/* Current Version */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('settings.updates.currentVersion')}
          </label>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {status?.currentVersion || '0.1.0'}
          </div>
        </div>

        {/* Check for Updates Button */}
        <div className="mb-4">
          <Button
            onClick={handleCheckForUpdates}
            disabled={isCheckingForUpdates || isDownloading}
            variant="primary"
          >
            {isCheckingForUpdates ? (
              <>
                <Spinner size="sm" />
                <span className="ml-2">{t('settings.updates.checking')}</span>
              </>
            ) : (
              t('settings.updates.checkForUpdates')
            )}
          </Button>
        </div>

        {/* Update Available */}
        {updateAvailable && updateInfo && !updateDownloaded && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {t('settings.updates.updateAvailable')}
            </h3>
            <p className="text-blue-700 dark:text-blue-300 mb-2">
              {t('settings.updates.newVersion')}: {updateInfo.version}
            </p>
            {updateInfo.releaseNotes && (
              <div className="mb-3">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  {t('settings.updates.releaseNotes')}:
                </p>
                <div className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
                  {updateInfo.releaseNotes}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleDownloadUpdate} disabled={isDownloading} variant="primary">
                {isDownloading ? (
                  <>
                    <Spinner size="sm" />
                    <span className="ml-2">{t('settings.updates.downloading')}</span>
                  </>
                ) : (
                  t('settings.updates.downloadUpdate')
                )}
              </Button>
              <Button onClick={handleSkipVersion} variant="secondary">
                {t('settings.updates.skipVersion')}
              </Button>
            </div>
          </div>
        )}

        {/* Download Progress */}
        {isDownloading && downloadProgress && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.updates.downloading')}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress.percent}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('settings.updates.downloadProgress')}: {formatBytes(downloadProgress.transferred)}{' '}
              / {formatBytes(downloadProgress.total)} ({downloadProgress.percent.toFixed(1)}%)
            </p>
          </div>
        )}

        {/* Update Downloaded */}
        {updateDownloaded && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              {t('settings.updates.updateDownloaded')}
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-3">
              {t('settings.updates.installSuccess')}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleInstallNow} variant="primary">
                {t('settings.updates.installNow')}
              </Button>
              <Button onClick={() => setUpdateDownloaded(false)} variant="secondary">
                {t('settings.updates.installLater')}
              </Button>
            </div>
          </div>
        )}

        {/* Auto-download Configuration */}
        {config && (
          <div className="space-y-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="autoDownload"
                checked={config.autoDownload}
                onChange={(e) => handleConfigChange('autoDownload', e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="ml-3">
                <label
                  htmlFor="autoDownload"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {t('settings.updates.autoDownload')}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('settings.updates.autoDownloadDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="allowPrerelease"
                checked={config.allowPrerelease}
                onChange={(e) => handleConfigChange('allowPrerelease', e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="ml-3">
                <label
                  htmlFor="allowPrerelease"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {t('settings.updates.allowPrerelease')}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('settings.updates.allowPrereleaseDesc')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Skipped Versions */}
        {skippedVersions.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.updates.skippedVersions')}
              </h3>
              <Button onClick={handleClearSkippedVersions} variant="ghost" size="sm">
                {t('settings.updates.clearSkippedVersions')}
              </Button>
            </div>
            <div className="space-y-2">
              {skippedVersions.map((sv) => (
                <div
                  key={sv.version}
                  className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded p-2"
                >
                  <span className="font-medium">{sv.version}</span> - {formatDate(sv.skippedAt)}
                </div>
              ))}
            </div>
          </div>
        )}
      </SettingsSection>
    </div>
  );
}
