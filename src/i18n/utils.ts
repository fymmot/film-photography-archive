import { ui, defaultLang } from './ui';

type Ui = typeof ui[typeof defaultLang];
type NestedKeys = keyof Ui;

type TranslationParams = {
  count?: number;
  start?: string | number;
  end?: string | number;
  year?: string | number;
  // Roll detail page params
  format?: string;
  photographer?: string;
  camera?: string;
  film?: string;
  speed?: string | number;
  developer?: string;
  date?: string;
  location?: string;
  notes?: string;
  alt?: string;
  number?: number;
  // Component params
  username?: string;
  highlights?: string;
  tags?: string;
  visible?: number;
  filters?: string;
  total?: number;
  title?: string;
};

export function useTranslations(lang: keyof typeof ui = defaultLang) {
  return function t(key: NestedKeys, params?: TranslationParams): string {
    const translation = (ui[lang]?.[key] || ui[defaultLang][key]) as string;
    
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key.toString();
    }

    if (!params) {
      return translation;
    }

    return Object.entries(params).reduce(
      (result, [key, value]) => result.replace(`{${key}}`, value?.toString() || ''),
      translation
    );
  }
}

// Export translations for use in scripts
export const translations = ui;