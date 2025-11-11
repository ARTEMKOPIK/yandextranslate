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
        general: { historyMaxEntries: value },
      });
    }
  };

  return (
    <SettingsSection title={t('settings.general.title')}>
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
    </SettingsSection>
  );
}
