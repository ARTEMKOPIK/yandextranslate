import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistoryStore } from '../stores/historyStore';
import { Input } from './Input';
import { Button } from './Button';
import { Toast } from './Toast';

export function HistorySettings() {
  const { t } = useTranslation();
  const { config, loadConfig, updateConfig } = useHistoryStore();
  const [maxEntries, setMaxEntries] = useState(1000);
  const [enableEncryption, setEnableEncryption] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (config) {
      setMaxEntries(config.maxEntries);
      setEnableEncryption(config.enableEncryption);
    }
  }, [config]);

  const handleSave = async () => {
    await updateConfig({ maxEntries, enableEncryption });
    setToast({ message: t('message.success'), type: 'success' });
  };

  const stats = useHistoryStore((state) => state.entries);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('settings.history.title')}
        </h3>

        <div className="space-y-4">
          <div>
            <Input
              type="number"
              label={t('settings.history.maxEntries')}
              value={maxEntries}
              onChange={(e) => setMaxEntries(Number(e.target.value))}
              min={10}
              max={10000}
              hint={`Текущее количество записей: ${stats.length}`}
            />
          </div>

          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableEncryption}
                onChange={(e) => setEnableEncryption(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {t('settings.history.encryption')}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('settings.history.encryptionDesc')}
                </div>
              </div>
            </label>
          </div>

          <Button onClick={handleSave}>{t('button.save')}</Button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
