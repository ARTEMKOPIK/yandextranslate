import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input, P } from '../';
import { Tooltip } from '../Tooltip';
import { SettingsSection } from './SettingsSection';
import { useSettingsStore } from '../../stores/settingsStore';

export function GeneralSettings() {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();

  if (!settings) return null;

  const handleMaxEntriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      updateSettings({
        general: {
          ...settings.general,
          historyMaxEntries: value,
        },
      });
    }
  };

  const handleStartMinimizedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      general: {
        ...settings.general,
        startMinimizedToTray: e.target.checked,
      },
    });
  };

  const handleCloseToTrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      general: {
        ...settings.general,
        closeToTray: e.target.checked,
      },
    });
  };

  return (
    <SettingsSection title={t('settings.general.title')}>
      <div className="space-y-4">
        <div>
          <Tooltip content={t('settings.general.historyMaxEntriesDesc')}>
            <div>
              <Input
                type="number"
                label={t('settings.general.historyMaxEntries')}
                value={settings.general.historyMaxEntries}
                onChange={handleMaxEntriesChange}
                min={1}
                max={10000}
              />
            </div>
          </Tooltip>
          <P className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {t('settings.general.historyMaxEntriesDesc')}
          </P>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="startMinimized"
              checked={settings.general.startMinimizedToTray}
              onChange={handleStartMinimizedChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="startMinimized"
              className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              {t('settings.general.startMinimizedToTray')}
            </label>
          </div>
          <P className="text-xs text-gray-500 dark:text-gray-500 ml-6">
            {t('settings.general.startMinimizedToTrayDesc')}
          </P>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="closeToTray"
              checked={settings.general.closeToTray}
              onChange={handleCloseToTrayChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="closeToTray"
              className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              {t('settings.general.closeToTray')}
            </label>
          </div>
          <P className="text-xs text-gray-500 dark:text-gray-500 ml-6">
            {t('settings.general.closeToTrayDesc')}
          </P>
        </div>
      </div>
    </SettingsSection>
  );
}
