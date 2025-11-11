import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, H1, Spinner } from '../';
import { GeneralSettings } from './GeneralSettings';
import { HotkeySettings } from './HotkeySettings';
import { InterfaceSettings } from './InterfaceSettings';
import { ThemeSettings } from './ThemeSettings';
import { useSettingsStore } from '../../stores/settingsStore';
import { showToast } from '../Toast';

type SettingsTab = 'general' | 'hotkeys' | 'interface' | 'theme';

export function Settings() {
  const { t } = useTranslation();
  const { settings, isLoading, loadSettings, resetSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleReset = async () => {
    if (!confirm(t('settings.resetConfirm'))) {
      return;
    }

    setIsResetting(true);
    await resetSettings();
    setIsResetting(false);
    showToast(t('settings.resetSuccess'), 'success');
    window.api.reloadShortcuts();
    window.location.reload();
  };

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'general', label: t('settings.general.title') },
    { id: 'hotkeys', label: t('settings.hotkeys.title') },
    { id: 'interface', label: t('settings.interface.title') },
    { id: 'theme', label: t('settings.theme.title') },
  ];

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <H1>{t('settings.title')}</H1>
        <Button variant="danger" size="sm" onClick={handleReset} isLoading={isResetting}>
          {t('settings.reset')}
        </Button>
      </div>

      <div className="flex gap-6">
        <nav className="w-48 flex-shrink-0">
          <Card className="p-2">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </Card>
        </nav>

        <div className="flex-1">
          <Card className="p-6">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'hotkeys' && <HotkeySettings />}
            {activeTab === 'interface' && <InterfaceSettings />}
            {activeTab === 'theme' && <ThemeSettings />}
          </Card>
        </div>
      </div>
    </div>
  );
}
