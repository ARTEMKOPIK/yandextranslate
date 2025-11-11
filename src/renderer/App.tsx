import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppShell, Button, Card, H1, H3, HotkeyStatus, Input, P, ThemeToggle } from './components';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [count, setCount] = useState(0);
  const [sourceText, setSourceText] = useState('');

  const handleTranslate = () => {
    setCount((prev) => prev + 1);
  };

  const handleClear = () => {
    setSourceText('');
    setCount(0);
  };

  return (
    <AppShell
      header={
        <div className="px-6 py-4 flex items-center justify-between">
          <H1 className="text-2xl">{t('app.title')}</H1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {theme === 'dark' ? t('theme.dark') : t('theme.light')}
            </span>
            <ThemeToggle />
          </div>
        </div>
      }
      main={
        <div className="p-8 max-w-4xl mx-auto w-full">
          <Card variant="elevated" className="p-6 mb-6">
            <H3 className="mb-4">{t('overlay.title')}</H3>
            <P className="text-gray-600 dark:text-gray-400 mb-4">{t('overlay.description')}</P>
            <HotkeyStatus />
          </Card>

          <Card variant="elevated" className="p-6 mb-6">
            <H3 className="mb-6">Демонстрация компонентов</H3>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Входные поля
                </h4>
                <div className="space-y-4">
                  <Input
                    label={t('label.source')}
                    placeholder={t('input.placeholder.source')}
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                  />
                  <Input
                    label={t('label.target')}
                    placeholder={t('input.placeholder.target')}
                    disabled
                    value={`Перевод (${count} раз)`}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Кнопки</h4>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary" onClick={handleTranslate}>
                    {t('button.translate')}
                  </Button>
                  <Button variant="secondary" onClick={handleClear}>
                    {t('button.clear')}
                  </Button>
                  <Button variant="ghost">{t('button.cancel')}</Button>
                  <Button variant="danger" size="sm">
                    {t('button.delete')}
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Размеры кнопок
                </h4>
                <div className="flex flex-wrap gap-4">
                  <Button size="sm">{t('button.save')}</Button>
                  <Button size="md">{t('button.save')}</Button>
                  <Button size="lg">{t('button.save')}</Button>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Состояния кнопок
                </h4>
                <div className="flex flex-wrap gap-4">
                  <Button isLoading>{t('button.save')}</Button>
                  <Button disabled>{t('button.save')}</Button>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Счётчик: {count}
                </h4>
                <Button onClick={() => setCount((c) => c + 1)}>Увеличить</Button>
              </div>
            </div>
          </Card>

          <Card variant="default" className="p-6 text-center">
            <P className="text-sm">
              {t('message.loading')} Редактируйте <code>src/renderer/App.tsx</code> и сохраняйте для
              HMR
            </P>
          </Card>
        </div>
      }
    />
  );
}

export default App;
