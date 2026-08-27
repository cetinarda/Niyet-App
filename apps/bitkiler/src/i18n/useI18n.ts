import { useLanguage } from './LanguageContext';
import { t, TranslationKey, Lang } from './index';

export function useI18n() {
  const { language } = useLanguage();
  const lang: Lang = language ?? 'tr';
  return {
    t: (key: TranslationKey) => t(key, lang),
    lang,
  };
}
