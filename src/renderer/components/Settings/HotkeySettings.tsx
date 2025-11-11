import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Button, P } from '../';
import { Tooltip } from '../Tooltip';
import { SettingsSection } from './SettingsSection';
import { useSettingsStore } from '../../stores/settingsStore';
import { showToast } from '../Toast';

export function HotkeySettings() {
  const { t } = useTranslation();
  const { settings, updateSettings, validateHotkey } = useSettingsStore();
  const [tempHotkey, setTempHotkey] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  if (!settings) return null;

  const currentHotkey = settings.hotkeys.overlay;

  const handleValidateAndApply = async () => {
    const hotkeyToValidate = tempHotkey || currentHotkey;
    setIsValidating(true);

    const validation = await validateHotkey(hotkeyToValidate);
    setIsValidating(false);

    if (validation.valid) {
      await updateSettings({
        hotkeys: { overlay: hotkeyToValidate },
      });
      setTempHotkey('');
      showToast(t('settings.hotkeys.validationSuccess'), 'success');
      window.api.reloadShortcuts();
    } else {
      showToast(`${t('settings.hotkeys.validationError')}: ${validation.error}`, 'error');
    }
  };

  return (
    <SettingsSection title={t('settings.hotkeys.title')}>
      <div>
        <Tooltip content={t('settings.hotkeys.overlayDesc')}>
          <div>
            <Input
              label={t('settings.hotkeys.overlay')}
              value={tempHotkey || currentHotkey}
              onChange={(e) => setTempHotkey(e.target.value)}
              placeholder="Super+T"
            />
          </div>
        </Tooltip>
        <P className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {t('settings.hotkeys.overlayDesc')}
        </P>
        <div className="mt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleValidateAndApply}
            isLoading={isValidating}
            disabled={!tempHotkey && !currentHotkey}
          >
            {t('settings.hotkeys.validate')}
          </Button>
        </div>
        <P className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
          ⚠️ {t('settings.hotkeys.applyWarning')}
        </P>
      </div>
    </SettingsSection>
  );
}
