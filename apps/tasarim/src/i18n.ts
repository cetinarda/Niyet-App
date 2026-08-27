// Sakin Tasarım — hafif iki dilli (tr/en) yerelleştirme katmanı.
//
// Tasarım içeriği TR yazıldı; veri dosyalarına `<field>En` kardeş alanları eklendi
// (gates/profiles/channels/centers/authorities/glossary). Host (sakin.life) seçili
// dili `sakin_lang` localStorage anahtarına yazar ve embed ayni origin'de senkron
// okur. Tasarım yalnız iki dil destekler: host dili `tr` ise Türkçe; aksi halde
// (en/de/es/pt/fr/ja veya host varsayılanı `en`) İngilizce gösterilir.

export type Lang = 'tr' | 'en';

export function getLang(): Lang {
  try {
    if (typeof localStorage === 'undefined') return 'tr';
    return localStorage.getItem('sakin_lang') === 'tr' ? 'tr' : 'en';
  } catch {
    return 'tr';
  }
}

// L(obj, 'name') → İngilizce modda obj.nameEn (varsa), yoksa obj.name.
// Türkçe modda her zaman obj.name. Hem string hem string[] alanlar için çalışır.
export function L<T extends Record<string, any>>(obj: T | null | undefined, field: string): any {
  if (!obj) return undefined;
  if (getLang() === 'en') {
    const en = obj[field + 'En'];
    if (en !== undefined && en !== null && en !== '') return en;
  }
  return obj[field];
}

// Statik UI metinleri için küçük sözlük (ekranlardaki sabit etiketler).
const UI: Record<string, { tr: string; en: string }> = {};

export function t(key: string, fallback?: string): string {
  const e = UI[key];
  if (!e) return fallback ?? key;
  return getLang() === 'en' ? e.en : e.tr;
}
