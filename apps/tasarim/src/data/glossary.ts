import { TYPES } from '../data/types';
import { AUTHORITIES } from '../data/authorities';
import { CENTERS } from '../data/centers';
import { PROFILES, LINES } from '../data/profiles';
import { GATES } from '../data/gates';
import { CHANNELS } from '../data/channels';

export type GlossaryCategory =
  | 'tip' | 'yetki' | 'merkez' | 'profil' | 'cizgi' | 'kapi' | 'kanal';

export interface GlossaryEntry {
  id: string;
  category: GlossaryCategory;
  categoryLabel: string;
  name: string;
  subtitle?: string;
  aliases: string[];
  body: string;         // tek paragraf özet
  details?: string[];   // opsiyonel ek satırlar (madde madde)
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

function buildEntries(): GlossaryEntry[] {
  const out: GlossaryEntry[] = [];

  // Tipler
  for (const t of Object.values(TYPES)) {
    out.push({
      id: `tip-${t.type}`,
      category: 'tip',
      categoryLabel: 'Tip',
      name: t.type,
      subtitle: t.rolePrimary,
      aliases: [t.type, ...t.keywords],
      body: t.longDesc,
      details: [
        `Strateji: ${t.strategy}`,
        `Doğru frekans: ${t.signature}`,
        `Yanlış frekans: ${t.notSelf}`,
        `Aura: ${t.aura}`,
        `Oran: ${t.oran}`,
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
      name: a.name,
      subtitle: a.emoji,
      aliases: [a.name, a.name.replace(' Yetki', ''), `${a.name} ne demek`],
      body: a.shortDesc,
      details: [
        ...a.howToDecide.map(s => `Karar: ${s}`),
        ...(a.caution ? [`Dikkat: ${a.caution}`] : []),
      ],
    });
  }

  // Merkezler
  for (const c of Object.values(CENTERS)) {
    out.push({
      id: `merkez-tanimli-${c.key}`,
      category: 'merkez',
      categoryLabel: 'Merkez · Tanımlı',
      name: `Tanımlı ${c.name}`,
      subtitle: c.bio,
      aliases: [c.name, `tanimli ${c.name}`, c.defined.title],
      body: c.defined.desc,
      details: c.defined.gifts.map(g => `Hediye: ${g}`),
    });
    out.push({
      id: `merkez-tanimsiz-${c.key}`,
      category: 'merkez',
      categoryLabel: 'Merkez · Tanımsız',
      name: `Tanımsız ${c.name}`,
      subtitle: c.bio,
      aliases: [c.name, `tanimsiz ${c.name}`, c.undefined.title],
      body: c.undefined.desc,
      details: [
        `Yanlış benlik sorusu: ${c.undefined.notSelfQuestion}`,
        `Bilgelik: ${c.undefined.wisdom}`,
      ],
    });
  }

  // Profiller
  for (const p of Object.values(PROFILES)) {
    out.push({
      id: `profil-${p.key}`,
      category: 'profil',
      categoryLabel: 'Profil',
      name: `${p.key} — ${p.name}`,
      subtitle: p.theme,
      aliases: [p.key, p.name, `profil ${p.key}`],
      body: p.longDesc,
    });
  }

  // Çizgiler
  for (const ln of Object.values(LINES)) {
    out.push({
      id: `cizgi-${ln.number}`,
      category: 'cizgi',
      categoryLabel: 'Çizgi',
      name: `${ln.number}. ${ln.name}`,
      subtitle: `Profil çizgisi · ${ln.number}`,
      aliases: [`${ln.number}. cizgi`, ln.name, `cizgi ${ln.number}`],
      body: ln.shortDesc,
      details: [`Gölge: ${ln.shadow}`],
    });
  }

  // Kapılar
  for (const g of Object.values(GATES)) {
    out.push({
      id: `kapi-${g.number}`,
      category: 'kapi',
      categoryLabel: 'Kapı',
      name: `Kapı ${g.number} — ${g.name}`,
      subtitle: CENTERS[g.center].name,
      aliases: [`kapi ${g.number}`, g.name, `gate ${g.number}`],
      body: g.theme,
      details: [
        `Hediye: ${g.gift}`,
        `Gölge: ${g.shadow}`,
        `Merkez: ${CENTERS[g.center].name}`,
      ],
    });
  }

  // Kanallar
  for (const ch of CHANNELS) {
    out.push({
      id: `kanal-${ch.id}`,
      category: 'kanal',
      categoryLabel: 'Kanal',
      name: `${ch.id} — ${ch.name}`,
      subtitle: `${CENTERS[ch.centers[0]].name} ↔ ${CENTERS[ch.centers[1]].name}`,
      aliases: [ch.id, ch.name, `kanal ${ch.id}`, `${ch.gates[0]}-${ch.gates[1]}`],
      body: ch.shortDesc,
      details: [`Devre: ${ch.circuit}`],
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
      entry.aliases.join(' ') + ' ' + entry.body
    );
    return tokens.every(t => hay.includes(t));
  });
}
