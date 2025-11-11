import React from 'react';
import { useTranslation } from 'react-i18next';
import { P } from '../';
import { SettingsSection } from './SettingsSection';
import { useSettingsStore } from '../../stores/settingsStore';

export function TraySettings() {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();

  if (!settings) return null;

  const handleShowNotificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      tray: {
        ...settings.tray,
        showNotifications: e.target.checked,
      },
    });
  };

  const handleShowTranslationCompleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      tray: {
        ...settings.tray,
        showTranslationComplete: e.target.checked,
      },
    });
  };

  return (
    <SettingsSection title={t('settings.tray.title')}>
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showNotifications"
              checked={settings.tray.showNotifications}
              onChange={handleShowNotificationsChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="showNotifications"
              className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              {t('settings.tray.showNotifications')}
            </label>
          </div>
          <P className="text-xs text-gray-500 dark:text-gray-500 ml-6">
            {t('settings.tray.showNotificationsDesc')}
          </P>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showTranslationComplete"
              checked={settings.tray.showTranslationComplete}
              onChange={handleShowTranslationCompleteChange}
              disabled={!settings.tray.showNotifications}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label
              htmlFor="showTranslationComplete"
              className={`ml-2 text-sm font-medium ${
                settings.tray.showNotifications
                  ? 'text-gray-900 dark:text-gray-300'
                  : 'text-gray-500 dark:text-gray-500'
              }`}
            >
              {t('settings.tray.showTranslationComplete')}
            </label>
          </div>
          <P className="text-xs text-gray-500 dark:text-gray-500 ml-6">
            {t('settings.tray.showTranslationCompleteDesc')}
          </P>
        </div>
      </div>
    </SettingsSection>
  );
}
