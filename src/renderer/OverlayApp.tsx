import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  Textarea,
  Select,
  P,
  Spinner,
  useToast,
  initGlobalToast,
} from './components';
import { SUPPORTED_LANGUAGES, getLanguageName } from '../shared/languages';
import { useHistoryStore } from './stores/historyStore';

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
  const [showFavorites, setShowFavorites] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { favorites, loadFavorites } = useHistoryStore();

  const [state, setState] = useState<TranslationState>({
    sourceText: '',
    targetLang: 'en',
    translatedText: '',
    detectedSourceLang: '',
    isTranslating: false,
    error: null,
  });

  useEffect(() => {
    initGlobalToast((message, type) => {
      showToast({ message, type });
    });
  }, [showToast]);

  useEffect(() => {
    const unsubscribeShown = window.api.onOverlayShown(() => {
      setIsVisible(true);
      loadFavorites();
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
  }, [loadFavorites]);

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

  const handleFavoriteInsert = (text: string) => {
    setState((prev) => ({
      ...prev,
      translatedText: text,
    }));
    setShowFavorites(false);
  };

  const handleOpenSettings = () => {
    showToast({ message: t('settings.openSettings'), type: 'info' });
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`p-1 rounded-lg transition-colors ${
                  showFavorites
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}
                aria-label="Favorites"
                title={t('favorites.title')}
              >
                <svg
                  className="w-5 h-5"
                  fill={showFavorites ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
              <button
                onClick={handleOpenSettings}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                aria-label="Settings"
                title={t('settings.title')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
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
          </div>

          <div className="space-y-3">
            {/* Favorites Panel */}
            {showFavorites && favorites.length > 0 && (
              <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1">
                {favorites.slice(0, 5).map((fav) => (
                  <button
                    key={fav.id}
                    onClick={() => handleFavoriteInsert(fav.translatedText)}
                    className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs"
                  >
                    <div className="text-gray-900 dark:text-white truncate">
                      {fav.translatedText}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 truncate text-xs">
                      {fav.sourceText}
                    </div>
                  </button>
                ))}
              </div>
            )}

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
