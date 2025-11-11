import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Spinner } from '../';
import { SettingsSection } from './SettingsSection';
import { showToast } from '../Toast';

export function LogsSettings() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleViewLogs = async () => {
    setIsLoading(true);
    try {
      const response = await window.api.getLogs(500); // Last 500 lines
      if (response.success && response.data) {
        setLogs(response.data);
      } else {
        showToast(t('settings.logs.loadError'), 'error');
      }
    } catch (error) {
      showToast(t('settings.logs.loadError'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm(t('settings.logs.clearConfirm'))) {
      return;
    }

    setIsClearing(true);
    try {
      const response = await window.api.clearLogs();
      if (response.success) {
        setLogs('');
        showToast(t('settings.logs.cleared'), 'success');
      } else {
        showToast(t('settings.logs.clearError'), 'error');
      }
    } catch (error) {
      showToast(t('settings.logs.clearError'), 'error');
    } finally {
      setIsClearing(false);
    }
  };

  const handleOpenLogsFolder = async () => {
    try {
      await window.api.openLogsFolder();
    } catch (error) {
      showToast(t('settings.logs.openFolderError'), 'error');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await window.api.getLogs();
      if (response.success && response.data) {
        const blob = new Blob([response.data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `app-logs-${new Date().toISOString().split('T')[0]}.log`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(t('settings.logs.exported'), 'success');
      } else {
        showToast(t('settings.logs.exportError'), 'error');
      }
    } catch (error) {
      showToast(t('settings.logs.exportError'), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SettingsSection title={t('settings.logs.title')} description={t('settings.logs.description')}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm" onClick={handleViewLogs} isLoading={isLoading}>
            {t('settings.logs.view')}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport} isLoading={isExporting}>
            {t('settings.logs.export')}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleOpenLogsFolder}>
            {t('settings.logs.openFolder')}
          </Button>
          <Button variant="danger" size="sm" onClick={handleClearLogs} isLoading={isClearing}>
            {t('settings.logs.clear')}
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        )}

        {logs && !isLoading && (
          <div className="mt-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 max-h-96 overflow-auto">
              <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                {logs || t('settings.logs.empty')}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>{t('settings.logs.privacy.title')}:</strong>{' '}
            {t('settings.logs.privacy.description')}
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
