import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Textarea, Select, P, Spinner, useToast } from './components';
import { SUPPORTED_LANGUAGES, getLanguageName } from '../shared/languages';

interface TranslationState {
  sourceText: string;
  targetLang: string;
  translatedText: string;
  detectedSourceLang: string;
  isTranslating: boolean;
  error: string | null;
}

export function OverlayApp() {
  const { t } = useTranslation();
  const { showToast, ToastContainer } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [state, setState] = useState<TranslationState>({
    sourceText: '',
    targetLang: 'en',
    translatedText: '',
    detectedSourceLang: '',
    isTranslating: false,
    error: null,
  });

  useEffect(() => {
    const unsubscribeShown = window.api.onOverlayShown(() => {
      setIsVisible(true);
      setTimeout(() => {
        textareaRef.current?.focus();
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

  const handleTranslate = async () => {
    if (!state.sourceText.trim()) {
      return;
    }

    setState((prev) => ({ ...prev, isTranslating: true, error: null }));

    try {
      const result = await window.api.translate(state.sourceText, state.targetLang);

      if (result.success && result.data) {
        setState((prev) => ({
          ...prev,
          translatedText: result.data!.translatedText,
          detectedSourceLang: result.data!.detectedSourceLang,
          isTranslating: false,
          error: null,
        }));
      } else if (result.error) {
        const errorKey = `error.translation.${result.error.code.toLowerCase()}`;
        const translatedError = t(errorKey);
        const errorMessage = translatedError !== errorKey ? translatedError : result.error.message;
        setState((prev) => ({
          ...prev,
          isTranslating: false,
          error: errorMessage,
        }));
        showToast({ message: errorMessage, type: 'error' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('error.translation.unknown');
      setState((prev) => ({
        ...prev,
        isTranslating: false,
        error: errorMessage,
      }));
      showToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleClear = () => {
    setState({
      sourceText: '',
      targetLang: state.targetLang,
      translatedText: '',
      detectedSourceLang: '',
      isTranslating: false,
      error: null,
    });
    textareaRef.current?.focus();
  };

  const handleCopy = async () => {
    if (!state.translatedText) return;

    const success = await window.api.copyToClipboard(state.translatedText);
    if (success) {
      showToast({ message: t('message.copied'), type: 'success' });
    } else {
      showToast({ message: t('message.error'), type: 'error' });
    }
  };

  const handlePaste = async () => {
    if (!state.translatedText) return;

    const success = await window.api.pasteIntoActiveWindow(state.translatedText);
    if (success) {
      showToast({ message: t('message.pasted'), type: 'success', duration: 2000 });
    } else {
      showToast({ message: t('message.error'), type: 'error' });
    }
  };

  const handleClose = async () => {
    await window.api.hideOverlay();
  };

  return (
    <>
      <ToastContainer />
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
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('app.title')}
            </h2>
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
            {/* Source Text Input */}
            <Textarea
              ref={textareaRef}
              placeholder={t('input.placeholder.source')}
              value={state.sourceText}
              onChange={(e) => setState((prev) => ({ ...prev, sourceText: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  handleTranslate();
                } else if (e.key === 'Escape') {
                  handleClose();
                }
              }}
              rows={3}
              className="text-sm"
            />

            {/* Target Language Selector */}
            <div className="flex items-center gap-2">
              <Select
                value={state.targetLang}
                onChange={(e) => setState((prev) => ({ ...prev, targetLang: e.target.value }))}
                className="text-sm flex-1"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </Select>

              <Button
                size="sm"
                variant="primary"
                onClick={handleTranslate}
                disabled={state.isTranslating || !state.sourceText.trim()}
                className="min-w-[100px]"
              >
                {state.isTranslating ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    <span>{t('message.translating')}</span>
                  </div>
                ) : (
                  t('button.translate')
                )}
              </Button>
            </div>

            {/* Detected Source Language */}
            {state.detectedSourceLang && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  {t('label.detectedLanguage')}: {getLanguageName(state.detectedSourceLang)}
                </span>
              </div>
            )}

            {/* Translation Result */}
            <div className="min-h-[80px] p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {state.isTranslating ? (
                <div className="flex items-center justify-center h-full">
                  <Spinner size="md" />
                </div>
              ) : state.error ? (
                <P className="text-sm text-red-600 dark:text-red-400">{state.error}</P>
              ) : state.translatedText ? (
                <P className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {state.translatedText}
                </P>
              ) : (
                <P className="text-sm text-gray-400 dark:text-gray-500">
                  {t('input.placeholder.target')}
                </P>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={handleClear}>
                {t('button.clear')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCopy}
                disabled={!state.translatedText}
              >
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{t('button.copy')}</span>
                </div>
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handlePaste}
                disabled={!state.translatedText}
              >
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span>{t('button.paste')}</span>
                </div>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
