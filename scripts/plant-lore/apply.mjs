// plants.json'a myth/mythEn/mythDe/... ekler (LORE'dan, plant id ile). Idempotent: var olanı günceller.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LORE } from './lore.mjs';
import { LORE2 } from './lore2.mjs';
import { LORE3 } from './lore3.mjs';
import { LORE4 } from './lore4.mjs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const P = path.resolve(__dirname, '../../apps/bitkiler/src/data/plants.json');
const SUF = { tr:'', en:'En', de:'De', es:'Es', fr:'Fr', ja:'Ja', pt:'Pt' };
const arr = JSON.parse(fs.readFileSync(P,'utf8'));
const byId = {}; for (const p of arr) byId[p.id] = p;
let n = 0, miss = [];
const ALL = { ...LORE, ...LORE2, ...LORE3, ...LORE4 };
for (const [id, L] of Object.entries(ALL)) {
  const p = byId[id]; if (!p) { miss.push(id); continue; }
  for (const [lang, suf] of Object.entries(SUF)) { if (L[lang]) { p['myth'+suf] = L[lang]; n++; } }
}
fs.writeFileSync(P, JSON.stringify(arr,null,2)+'\n');
console.log('[plant-lore] '+Object.keys(ALL).length+' bitki, '+n+' alan yazıldı');
if (miss.length) console.log('  BULUNAMAYAN id:', miss.join(', '));
