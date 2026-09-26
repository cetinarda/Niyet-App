// Mit Bulucu doğrulaması (Node). Uygulamaya girmez, yalnızca elle çalıştırılır:
//   npx esbuild apps/mitler/src/utils/finder.verify.ts --bundle --platform=node \
//     --outfile=/tmp/finder-verify.cjs && node /tmp/finder-verify.cjs
// Denetler: (1) aynı cevaplar/doğum 7 dilde AYNI arketip/mit/imge id'sini
// verir, (2) farklı cevaplar farklı sonuç verir (quiz ayırt ediyor),
// (3) gösterilen kayıt seçili dilin dosyasından gelir. Karşılaştırma için eski
// algoritma (o anki dilin verisiyle eşleştirme) da basılır.

import archTR from '../data/archetypes.json';
import archEN from '../data/archetypes_en.json';
import archDE from '../data/archetypes_de.json';
import archES from '../data/archetypes_es.json';
import archPT from '../data/archetypes_pt.json';
import archFR from '../data/archetypes_fr.json';
import archJA from '../data/archetypes_ja.json';
import mythTR from '../data/myths.json';
import mythEN from '../data/myths_en.json';
import mythDE from '../data/myths_de.json';
import mythES from '../data/myths_es.json';
import mythPT from '../data/myths_pt.json';
import mythFR from '../data/myths_fr.json';
import mythJA from '../data/myths_ja.json';
import imgTR from '../data/images.json';
import imgEN from '../data/images_en.json';
import imgDE from '../data/images_de.json';
import imgES from '../data/images_es.json';
import imgPT from '../data/images_pt.json';
import imgFR from '../data/images_fr.json';
import imgJA from '../data/images_ja.json';
import {
  FINDER_QUIZ, quizProfile, birthProfile, pickFinderIds, byId, scoreEntry,
  elementLabel, FinderProfile, ScorableEntry,
} from './finder';

type Pools = { archetypes: ScorableEntry[]; myths: ScorableEntry[]; images: ScorableEntry[] };
const LANGS = ['tr', 'en', 'de', 'es', 'pt', 'fr', 'ja'] as const;
const DATA: Record<string, Pools> = {
  tr: { archetypes: archTR, myths: mythTR, images: imgTR },
  en: { archetypes: archEN, myths: mythEN, images: imgEN },
  de: { archetypes: archDE, myths: mythDE, images: imgDE },
  es: { archetypes: archES, myths: mythES, images: imgES },
  pt: { archetypes: archPT, myths: mythPT, images: imgPT },
  fr: { archetypes: archFR, myths: mythFR, images: imgFR },
  ja: { archetypes: archJA, myths: mythJA, images: imgJA },
};
const CANON = DATA.tr;

let failures = 0;
const fail = (msg: string) => { failures++; console.log('FAIL ' + msg); };

// Ekrandaki akışın aynısı: tr'ye karşı puanla, seçili dilin kaydını göster.
function run(profile: FinderProfile, lang: string) {
  const ids = pickFinderIds(profile, CANON);
  const d = DATA[lang];
  return {
    ids,
    archetype: byId(d.archetypes, CANON.archetypes, ids.archetypeId),
    myth: byId(d.myths, CANON.myths, ids.mythId),
    image: byId(d.images, CANON.images, ids.imageId),
  };
}
// Eski davranış: o anki dilin verisine karşı puanlama.
function legacy(profile: FinderProfile, lang: string) {
  return scoreEntry(DATA[lang].myths, profile).id;
}

// Şekil: 7 soru x 4 seçenek (ekrandaki QUESTIONS ile aynı olmalı).
if (FINDER_QUIZ.length !== 7 || FINDER_QUIZ.some(q => q.length !== 4)) fail('FINDER_QUIZ shape is not 7x4');
// Tüm dillerde id sırası temel veriyle aynı mı?
for (const l of LANGS) for (const k of ['archetypes', 'myths', 'images'] as const) {
  const a = DATA[l][k].map(x => x.id).join(','), b = CANON[k].map(x => x.id).join(',');
  if (a !== b) fail(`${l}/${k} ids differ from tr`);
}

type Case = { label: string; profile: FinderProfile };
const cases: Case[] = [
  { label: 'quiz A (dag/dur/bilge/gozlem/sezgi/anlam/butun)', profile: quizProfile([0, 0, 1, 3, 0, 3, 0]) },
  { label: 'quiz B (ates/cesaret/asik/lider/cesaret/kontrol/donusum)', profile: quizProfile([3, 1, 2, 0, 3, 2, 1]) },
  { label: 'quiz C (su/koru/asik/arabulucu/sabir/terk/hizmet)', profile: quizProfile([2, 2, 2, 1, 1, 0, 3]) },
  { label: 'quiz D (orman/kural/asi/ilham/zeka/gorunmemek/ifade)', profile: quizProfile([1, 3, 3, 2, 2, 1, 2]) },
  { label: 'quiz E (su/dur/yaratici/gozlem/sezgi/anlam/donusum)', profile: quizProfile([2, 0, 0, 3, 0, 3, 1]) },
  { label: 'birth 1992-10-19 19:45', profile: birthProfile(19, 10, 1992, 19) },
  { label: 'birth 1985-03-04 07:10', profile: birthProfile(4, 3, 1985, 7) },
  { label: 'birth 2001-07-28 (no hour)', profile: birthProfile(28, 7, 2001) },
  { label: 'birth 1978-12-11 02:30', profile: birthProfile(11, 12, 1978, 2) },
];

console.log('\nNEW (tr canonical scoring, displayed per language)');
console.log('case'.padEnd(58) + 'arch   myth   image  same-in-7  legacy myth per lang (tr en de es pt fr ja)');
const winners: string[] = [];
for (const c of cases) {
  const per = LANGS.map(l => run(c.profile, l));
  const key = (r: typeof per[0]) => `${r.ids.archetypeId}/${r.ids.mythId}/${r.ids.imageId}`;
  const same = per.every(r => key(r) === key(per[0]));
  if (!same) fail(`${c.label}: winners differ across languages`);
  // Gösterilen kayıt seçili dilin dosyasından mı?
  LANGS.forEach((l, i) => {
    const r = per[i];
    if (r.myth !== DATA[l].myths.find(m => m.id === r.ids.mythId)) fail(`${c.label}/${l}: myth not from ${l} table`);
    if (r.archetype !== DATA[l].archetypes.find(m => m.id === r.ids.archetypeId)) fail(`${c.label}/${l}: archetype not from ${l} table`);
  });
  winners.push(key(per[0]));
  const leg = LANGS.map(l => legacy(c.profile, l)).join(' ');
  console.log(
    c.label.padEnd(58) + per[0].ids.archetypeId.padEnd(7) + per[0].ids.mythId.padEnd(7) +
    per[0].ids.imageId.padEnd(7) + (same ? 'yes' : 'NO').padEnd(11) + leg,
  );
}

console.log('\nDisplayed myth name per language:');
for (const c of cases.slice(0, 3)) {
  console.log('  ' + c.label.slice(0, 8) + ': ' + LANGS.map(l => `${l}=${run(c.profile, l).myth.name}`).join(' | '));
}
console.log('Element tag per language (myth of case 1): ' +
  LANGS.map(l => `${l}=${elementLabel(run(cases[0].profile, l).myth.element, l)}`).join(' | '));

// Ayırt edicilik: sabit vakalarda farklı kazananlar + tüm 4^7 kombinasyon.
const distinctCases = new Set(winners).size;
if (distinctCases < cases.length - 1) fail(`fixed cases give only ${distinctCases} distinct winner triples`);
const seen = { a: new Set<string>(), m: new Set<string>(), i: new Set<string>() };
let oldMythsDe = new Set<string>();
for (let n = 0; n < 4 ** 7; n++) {
  const ans = Array.from({ length: 7 }, (_, q) => Math.floor(n / 4 ** q) % 4);
  const p = quizProfile(ans);
  const ids = pickFinderIds(p, CANON);
  seen.a.add(ids.archetypeId); seen.m.add(ids.mythId); seen.i.add(ids.imageId);
  oldMythsDe.add(legacy(p, 'de'));
}
console.log(`\nAll 16384 answer sets: distinct archetypes=${seen.a.size}, myths=${seen.m.size}, images=${seen.i.size}` +
  ` (legacy de myths=${oldMythsDe.size})`);
if (seen.a.size < 10 || seen.m.size < 10 || seen.i.size < 8) fail('quiz does not discriminate enough');

console.log(failures ? `\n${failures} FAILURE(S)` : '\nPASS');
if (failures) process.exitCode = 1;
