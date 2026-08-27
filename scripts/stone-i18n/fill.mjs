// stones.json'a 5-dil alanları ekler (idempotent — varsa dokunmaz).
// Bu pass: element, chakra, origin (sözlükten). properties/plant/name/sentences
// ayrı dosyalar yüklendikçe eklenir.
// Çalıştır: node scripts/stone-i18n/fill.mjs        (yazar)
//          node scripts/stone-i18n/fill.mjs --check (sadece kapsam raporu)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ELEMENT, CHAKRA, LANGS, translateOrigin } from './lexicon.mjs';
import { PROPERTIES } from './properties.mjs';
import { PLANT } from './plants.mjs';
import { SENTENCES } from './sentences.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STONES = path.resolve(__dirname, '../../apps/taslar/src/data/stones.json');
const PLANTS_JSON = path.resolve(__dirname, '../../apps/bitkiler/src/data/plants.json');
const check = process.argv.includes('--check');

// Bitki adları için plants.json fallback (PLANT sözlüğünde yoksa oradan al).
const plantsData = JSON.parse(fs.readFileSync(PLANTS_JSON, 'utf8'));
const PLANT_FALLBACK = {};
for (const p of plantsData) PLANT_FALLBACK[p.name] = { de: p.nameDe, es: p.nameEs, fr: p.nameFr, ja: p.nameJa, pt: p.namePt };
const plantName = (tr, lang) => (PLANT[tr] && PLANT[tr][lang]) || (PLANT_FALLBACK[tr] && PLANT_FALLBACK[tr][lang]) || null;

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const arr = JSON.parse(fs.readFileSync(STONES, 'utf8'));

let filled = 0;
const miss = { name:0, element:0, chakra:0, origin:0, properties:0, plant:0, dailyMessage:0, howToUse:0, affirmation:0 };

function set(stone, field, lang, val) {
  if (val == null) return;
  const key = field + cap(lang);
  if (stone[key] == null || stone[key] === '') { stone[key] = val; filled++; }
}

for (const s of arr) {
  for (const lang of LANGS) {
    const L = cap(lang);
    // element
    if (s.element && ELEMENT[s.element]) set(s, 'element', lang, ELEMENT[s.element][lang]);
    // chakra
    if (s.chakra && CHAKRA[s.chakra]) set(s, 'chakra', lang, CHAKRA[s.chakra][lang]);
    // origin
    if (s.origin) set(s, 'origin', lang, translateOrigin(s.origin, lang));
    // properties (array)
    if (Array.isArray(s.properties)) {
      const tr = s.properties.map(p => (PROPERTIES[p] && PROPERTIES[p][lang]) || null);
      if (tr.every(x => x != null)) set(s, 'properties', lang, tr);
    }
    // plant (sözlük → plants.json fallback)
    if (s.plant) set(s, 'plant', lang, plantName(s.plant, lang));
    // name + sentences (per-stone)
    const sent = SENTENCES[s.id];
    if (sent && sent[lang]) {
      if (sent[lang].name) set(s, 'name', lang, sent[lang].name);
      if (sent[lang].dailyMessage) set(s, 'dailyMessage', lang, sent[lang].dailyMessage);
      if (sent[lang].howToUse) set(s, 'howToUse', lang, sent[lang].howToUse);
      if (sent[lang].affirmation) set(s, 'affirmation', lang, sent[lang].affirmation);
    }
    // eksik sayımı
    for (const f of Object.keys(miss)) {
      const v = s[f]; if (v == null || v === '') continue;
      if (s[f + L] == null || s[f + L] === '') miss[f]++;
    }
  }
}

if (!check) {
  fs.writeFileSync(STONES, JSON.stringify(arr, null, 2) + '\n');
  console.log(`[fill] ${filled} alan yazıldı → stones.json`);
}
console.log('\n5-dil eksik alan sayısı (×5 dil toplam):');
for (const [f, n] of Object.entries(miss)) console.log(`  ${f.padEnd(14)} eksik: ${n}`);
const total = Object.values(miss).reduce((a, b) => a + b, 0);
console.log(`  TOPLAM eksik: ${total}`);
