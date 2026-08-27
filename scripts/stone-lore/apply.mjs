// stones.json'a myth/mythEn/mythDe/... ekler (STONELORE gruplarından, taş id ile). Idempotent.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { STONELORE_G1 } from './lore-g1.mjs';
import { STONELORE_G2 } from './lore-g2.mjs';
import { STONELORE_G3 } from './lore-g3.mjs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const P = path.resolve(__dirname, '../../apps/taslar/src/data/stones.json');
const SUF = { tr:'', en:'En', de:'De', es:'Es', fr:'Fr', ja:'Ja', pt:'Pt' };
const arr = JSON.parse(fs.readFileSync(P,'utf8'));
const byId = {}; for (const s of arr) byId[s.id] = s;
let n = 0, miss = [];
const ALL = { ...STONELORE_G1, ...STONELORE_G2, ...STONELORE_G3 };
for (const [id, L] of Object.entries(ALL)) {
  const s = byId[id]; if (!s) { miss.push(id); continue; }
  for (const [lang, suf] of Object.entries(SUF)) { if (L[lang]) { s['myth'+suf] = L[lang]; n++; } }
}
fs.writeFileSync(P, JSON.stringify(arr,null,2)+'\n');
console.log('[stone-lore] '+Object.keys(ALL).length+' taş, '+n+' alan yazıldı');
if (miss.length) console.log('  BULUNAMAYAN id:', miss.join(', '));
