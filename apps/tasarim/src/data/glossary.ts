import { TYPES } from '../data/types';
import { AUTHORITIES } from '../data/authorities';
import { CENTERS } from '../data/centers';
import { PROFILES, LINES } from '../data/profiles';
import { GATES } from '../data/gates';
import { CHANNELS } from '../data/channels';
import { circuitLabel } from './channels';

export type GlossaryCategory =
  | 'tip' | 'yetki' | 'merkez' | 'profil' | 'cizgi' | 'kapi' | 'kanal';

export interface GlossaryEntry {
  id: string;
  category: GlossaryCategory;
  categoryLabel: string;
  categoryLabelEn?: string;
  name: string;
  nameEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  aliases: string[];
  aliasesEn?: string[];
  body: string;         // tek paragraf özet
  bodyEn?: string;
  details?: string[];   // opsiyonel ek satırlar (madde madde)
  detailsEn?: string[];
}

function tr(s: string) {
  return s.toLocaleLowerCase('tr');
}

// Türkçe karakter normalize — arama için
export function fold(s: string): string {
  return tr(s)
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// EN sibling okuyucu — veri nesnesinden `<field>En` döndürür, yoksa TR'ye düşer.
function en<T extends Record<string, any>>(obj: T, field: string): any {
  const v = obj[field + 'En'];
  return v !== undefined && v !== null && v !== '' ? v : obj[field];
}

function buildEntries(): GlossaryEntry[] {
  const out: GlossaryEntry[] = [];

  // Tipler
  for (const t of Object.values(TYPES)) {
    out.push({
      id: `tip-${t.type}`,
      category: 'tip',
      categoryLabel: 'Tip',
      categoryLabelEn: 'Type',
      name: t.type,
      nameEn: en(t, 'name'),
      subtitle: t.rolePrimary,
      subtitleEn: en(t, 'rolePrimary'),
      aliases: [t.type, ...t.keywords],
      body: t.longDesc,
      bodyEn: en(t, 'longDesc'),
      details: [
        `Strateji: ${t.strategy}`,
        `Doğru frekans: ${t.signature}`,
        `Yanlış frekans: ${t.notSelf}`,
        `Aura: ${t.aura}`,
        `Oran: ${t.oran}`,
      ],
      detailsEn: [
        `Strategy: ${en(t, 'strategy')}`,
        `Signature: ${en(t, 'signature')}`,
        `Not-self: ${en(t, 'notSelf')}`,
        `Aura: ${en(t, 'aura')}`,
        `Population: ${en(t, 'oran')}`,
      ],
    });
  }

  // Yetkiler
  for (const a of Object.values(AUTHORITIES)) {
    if (a.key === 'none') continue;
    out.push({
      id: `yetki-${a.key}`,
      category: 'yetki',
      categoryLabel: 'İçsel Yetki',
      categoryLabelEn: 'Inner Authority',
      name: a.name,
      nameEn: en(a, 'name'),
      subtitle: a.emoji,
      subtitleEn: a.emoji,
      aliases: [a.name, a.name.replace(' Yetki', ''), `${a.name} ne demek`],
      body: a.shortDesc,
      bodyEn: en(a, 'shortDesc'),
      details: [
        ...a.howToDecide.map(s => `Karar: ${s}`),
        ...(a.caution ? [`Dikkat: ${a.caution}`] : []),
      ],
      detailsEn: [
        ...(en(a, 'howToDecide') as string[]).map(s => `Decision: ${s}`),
        ...(en(a, 'caution') ? [`Caution: ${en(a, 'caution')}`] : []),
      ],
    });
  }

  // Merkezler
  for (const c of Object.values(CENTERS)) {
    out.push({
      id: `merkez-tanimli-${c.key}`,
      category: 'merkez',
      categoryLabel: 'Merkez · Tanımlı',
      categoryLabelEn: 'Center · Defined',
      name: `Tanımlı ${c.name}`,
      nameEn: `Defined ${en(c, 'name')}`,
      subtitle: c.bio,
      subtitleEn: en(c, 'bio'),
      aliases: [c.name, `tanimli ${c.name}`, c.defined.title],
      body: c.defined.desc,
      bodyEn: en(c.defined, 'desc'),
      details: c.defined.gifts.map(g => `Hediye: ${g}`),
      detailsEn: (en(c.defined, 'gifts') as string[]).map(g => `Gift: ${g}`),
    });
    out.push({
      id: `merkez-tanimsiz-${c.key}`,
      category: 'merkez',
      categoryLabel: 'Merkez · Tanımsız',
      categoryLabelEn: 'Center · Undefined',
      name: `Tanımsız ${c.name}`,
      nameEn: `Undefined ${en(c, 'name')}`,
      subtitle: c.bio,
      subtitleEn: en(c, 'bio'),
      aliases: [c.name, `tanimsiz ${c.name}`, c.undefined.title],
      body: c.undefined.desc,
      bodyEn: en(c.undefined, 'desc'),
      details: [
        `Yanlış benlik sorusu: ${c.undefined.notSelfQuestion}`,
        `Bilgelik: ${c.undefined.wisdom}`,
      ],
      detailsEn: [
        `Not-self question: ${en(c.undefined, 'notSelfQuestion')}`,
        `Wisdom: ${en(c.undefined, 'wisdom')}`,
      ],
    });
  }

  // Profiller
  for (const p of Object.values(PROFILES)) {
    out.push({
      id: `profil-${p.key}`,
      category: 'profil',
      categoryLabel: 'Profil',
      categoryLabelEn: 'Profile',
      name: `${p.key} — ${p.name}`,
      nameEn: `${p.key} — ${en(p, 'name')}`,
      subtitle: p.theme,
      subtitleEn: en(p, 'theme'),
      aliases: [p.key, p.name, `profil ${p.key}`],
      body: p.longDesc,
      bodyEn: en(p, 'longDesc'),
    });
  }

  // Çizgiler
  for (const ln of Object.values(LINES)) {
    out.push({
      id: `cizgi-${ln.number}`,
      category: 'cizgi',
      categoryLabel: 'Çizgi',
      categoryLabelEn: 'Line',
      name: `${ln.number}. ${ln.name}`,
      nameEn: `${ln.number}. ${en(ln, 'name')}`,
      subtitle: `Profil çizgisi · ${ln.number}`,
      subtitleEn: `Profile line · ${ln.number}`,
      aliases: [`${ln.number}. cizgi`, ln.name, `cizgi ${ln.number}`],
      body: ln.shortDesc,
      bodyEn: en(ln, 'shortDesc'),
      details: [`Gölge: ${ln.shadow}`],
      detailsEn: [`Shadow: ${en(ln, 'shadow')}`],
    });
  }

  // Kapılar
  for (const g of Object.values(GATES)) {
    out.push({
      id: `kapi-${g.number}`,
      category: 'kapi',
      categoryLabel: 'Kapı',
      categoryLabelEn: 'Gate',
      name: `Kapı ${g.number} — ${g.name}`,
      nameEn: `Gate ${g.number} — ${en(g, 'name')}`,
      subtitle: CENTERS[g.center].name,
      subtitleEn: en(CENTERS[g.center], 'name'),
      aliases: [`kapi ${g.number}`, g.name, `gate ${g.number}`],
      body: g.theme,
      bodyEn: en(g, 'theme'),
      details: [
        `Hediye: ${g.gift}`,
        `Gölge: ${g.shadow}`,
        `Merkez: ${CENTERS[g.center].name}`,
      ],
      detailsEn: [
        `Gift: ${en(g, 'gift')}`,
        `Shadow: ${en(g, 'shadow')}`,
        `Center: ${en(CENTERS[g.center], 'name')}`,
      ],
    });
  }

  // Kanallar
  for (const ch of CHANNELS) {
    out.push({
      id: `kanal-${ch.id}`,
      category: 'kanal',
      categoryLabel: 'Kanal',
      categoryLabelEn: 'Channel',
      name: `${ch.id} — ${ch.name}`,
      nameEn: `${ch.id} — ${en(ch, 'name')}`,
      subtitle: `${CENTERS[ch.centers[0]].name} ↔ ${CENTERS[ch.centers[1]].name}`,
      subtitleEn: `${en(CENTERS[ch.centers[0]], 'name')} ↔ ${en(CENTERS[ch.centers[1]], 'name')}`,
      aliases: [ch.id, ch.name, `kanal ${ch.id}`, `${ch.gates[0]}-${ch.gates[1]}`],
      body: ch.shortDesc,
      bodyEn: en(ch, 'shortDesc'),
      details: [`Devre: ${ch.circuit}`],
      detailsEn: [`Circuit: ${circuitLabel(ch.circuit, 'en')}`],
    });
  }

  return out;
}

export const GLOSSARY: GlossaryEntry[] = buildEntries();

export const CATEGORY_LABELS: Record<GlossaryCategory, string> = {
  tip: 'Tipler',
  yetki: 'Yetkiler',
  merkez: 'Merkezler',
  profil: 'Profiller',
  cizgi: 'Çizgiler',
  kapi: 'Kapılar',
  kanal: 'Kanallar',
};

export const CATEGORY_LABELS_EN: Record<GlossaryCategory, string> = {
  tip: 'Types',
  yetki: 'Authorities',
  merkez: 'Centers',
  profil: 'Profiles',
  cizgi: 'Lines',
  kapi: 'Gates',
  kanal: 'Channels',
};

export const CATEGORY_ORDER: GlossaryCategory[] = [
  'tip', 'yetki', 'merkez', 'profil', 'cizgi', 'kapi', 'kanal',
];

export function searchGlossary(query: string, category?: GlossaryCategory | 'all'): GlossaryEntry[] {
  let pool = GLOSSARY;
  if (category && category !== 'all') {
    pool = pool.filter(e => e.category === category);
  }
  const q = fold(query);
  if (!q) return pool;
  const tokens = q.split(' ').filter(Boolean);
  return pool.filter(entry => {
    const hay = fold(
      entry.name + ' ' + (entry.subtitle || '') + ' ' +
      entry.aliases.join(' ') + ' ' + entry.body + ' ' +
      (entry.nameEn || '') + ' ' + (entry.subtitleEn || '') + ' ' +
      (entry.bodyEn || '')
    );
    return tokens.every(t => hay.includes(t));
  });
}
