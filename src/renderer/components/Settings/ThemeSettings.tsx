import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, P } from '../';
import { Tooltip } from '../Tooltip';
import { SettingsSection } from './SettingsSection';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTheme } from '../../contexts/ThemeContext';
import type { ThemeMode } from '../../../shared/types';

export function ThemeSettings() {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();
  const { setThemeMode } = useTheme();

  if (!settings) return null;

  const handleThemeModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as ThemeMode;
    updateSettings({
      theme: { mode },
    });
    setThemeMode(mode);
  };

  return (
    <SettingsSection title={t('settings.theme.title')}>
      <div>
        <Tooltip content={t('settings.theme.modeDesc')}>
          <div>
            <Select
              label={t('settings.theme.mode')}
              value={settings.theme.mode}
              onChange={handleThemeModeChange}
            >
              <option value="light">{t('settings.theme.light')}</option>
              <option value="dark">{t('settings.theme.dark')}</option>
              <option value="system">{t('settings.theme.system')}</option>
            </Select>
          </div>
        </Tooltip>
        <P className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {t('settings.theme.modeDesc')}
        </P>
      </div>
    </SettingsSection>
  );
}
