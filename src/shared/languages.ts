export interface Language {
  code: string;
  name: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'Английский' },
  { code: 'ru', name: 'Русский' },
  { code: 'de', name: 'Немецкий' },
  { code: 'fr', name: 'Французский' },
  { code: 'es', name: 'Испанский' },
  { code: 'it', name: 'Итальянский' },
  { code: 'pt', name: 'Португальский' },
  { code: 'pl', name: 'Польский' },
  { code: 'uk', name: 'Украинский' },
  { code: 'tr', name: 'Турецкий' },
  { code: 'zh', name: 'Китайский' },
  { code: 'ja', name: 'Японский' },
  { code: 'ko', name: 'Корейский' },
  { code: 'ar', name: 'Арабский' },
  { code: 'he', name: 'Иврит' },
  { code: 'nl', name: 'Нидерландский' },
  { code: 'sv', name: 'Шведский' },
  { code: 'fi', name: 'Финский' },
  { code: 'da', name: 'Датский' },
  { code: 'no', name: 'Норвежский' },
  { code: 'cs', name: 'Чешский' },
  { code: 'sk', name: 'Словацкий' },
  { code: 'bg', name: 'Болгарский' },
  { code: 'ro', name: 'Румынский' },
  { code: 'hu', name: 'Венгерский' },
  { code: 'el', name: 'Греческий' },
  { code: 'vi', name: 'Вьетнамский' },
  { code: 'th', name: 'Тайский' },
  { code: 'id', name: 'Индонезийский' },
  { code: 'hi', name: 'Хинди' },
];

export function getLanguageName(code: string): string {
  const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
  return language?.name || code.toUpperCase();
}
