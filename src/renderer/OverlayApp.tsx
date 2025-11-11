import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Input, P } from './components';

export function OverlayApp() {
  const { t } = useTranslation();
  const [sourceText, setSourceText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribeShown = window.api.onOverlayShown(() => {
      setIsVisible(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    });

    const unsubscribeHidden = window.api.onOverlayHidden(() => {
      setIsVisible(false);
    });

    return () => {
      unsubscribeShown();
      unsubscribeHidden();
    };
  }, []);

  const handleTranslate = () => {
    console.log('Translating:', sourceText);
  };

  const handleClear = () => {
    setSourceText('');
    inputRef.current?.focus();
  };

  const handleClose = async () => {
    await window.api.hideOverlay();
  };

  return (
    <div
      className={`
        min-h-screen w-full p-3 
        transition-opacity duration-200
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <Card
        variant="elevated"
        className="p-4 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
        style={{
          background: document.documentElement.classList.contains('dark')
            ? 'rgba(17, 24, 39, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('app.title')}</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <Input
            ref={inputRef}
            placeholder={t('input.placeholder.source')}
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleTranslate();
              } else if (e.key === 'Escape') {
                handleClose();
              }
            }}
          />

          <div className="min-h-[60px] p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <P className="text-sm text-gray-600 dark:text-gray-400">
              {sourceText
                ? `${t('input.placeholder.target')}: ${sourceText}`
                : t('input.placeholder.target')}
            </P>
          </div>

          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={handleClear}>
              {t('button.clear')}
            </Button>
            <Button size="sm" variant="primary" onClick={handleTranslate}>
              {t('button.translate')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
