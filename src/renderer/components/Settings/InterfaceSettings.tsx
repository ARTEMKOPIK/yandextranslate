import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, P } from '../';
import { Tooltip } from '../Tooltip';
import { SettingsSection } from './SettingsSection';
import { useSettingsStore } from '../../stores/settingsStore';
import type { Language } from '../../../shared/types';

export function InterfaceSettings() {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();

  if (!settings) return null;

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const language = e.target.value as Language;
    updateSettings({
      interface: { language },
    });
  };

  return (
    <SettingsSection title={t('settings.interface.title')}>
      <div>
        <Tooltip content={t('settings.interface.languageDesc')}>
          <div>
            <Select
              label={t('settings.interface.language')}
              value={settings.interface.language}
              onChange={handleLanguageChange}
            >
              <option value="ru">{t('settings.interface.languageRu')}</option>
              <option value="en">{t('settings.interface.languageEn')}</option>
            </Select>
          </div>
        </Tooltip>
        <P className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {t('settings.interface.languageDesc')}
        </P>
      </div>
    </SettingsSection>
  );
}
