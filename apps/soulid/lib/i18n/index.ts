'use client';

import { MESSAGES } from './messages';
import { useLocaleStore, type Locale } from './store';

export type { Locale };
export { useLocaleStore, initLocale } from './store';

/** UI çevirisi hook'u. t('home.title1') gibi kullanılır. */
export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  function t(key: string, vars?: Record<string, string | number>): string {
    let str = MESSAGES[locale][key] ?? MESSAGES.tr[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  }
  return { t, locale };
}
