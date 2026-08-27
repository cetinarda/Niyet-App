// Tam karne üretim testi: 07.04.1988 23:05 Kayseri
import { buildGalacticReport } from '../lib/report/index.ts';
// .ts import çalışmaz, doğrudan modülleri çağırarak test edelim:
import { calculateChart, findPlanet } from '../lib/astrology/index.js';
import { buildNumerology } from '../lib/numerology/index.js';
import { calculateHumanDesign } from '../lib/human-design/index.js';
import { calculateMaya } from '../lib/systems/maya.js';
import { calculateVedic } from '../lib/systems/vedic.js';
import { calculateChinese } from '../lib/systems/chinese.js';
import { calculateNorse } from '../lib/systems/norse.js';
import { calculateTarot } from '../lib/systems/tarot.js';

const SIGNS_TR = { Aries:'Koç', Taurus:'Boğa', Gemini:'İkizler', Cancer:'Yengeç', Leo:'Aslan',
  Virgo:'Başak', Libra:'Terazi', Scorpio:'Akrep', Sagittarius:'Yay', Capricorn:'Oğlak',
  Aquarius:'Kova', Pisces:'Balık' };

// 23:05 EEST (UTC+3) → 20:05 UTC
const birthISO = '1988-04-07T20:05:00Z';
const lat = 38.7322;
const lon = 35.4853;

const chart = calculateChart(birthISO, lat, lon);
const sun = findPlanet(chart, 'Sun');
const moon = findPlanet(chart, 'Moon');
const asc = findPlanet(chart, 'Ascendant');
const mc = findPlanet(chart, 'MC');
const nn = findPlanet(chart, 'NorthNode');
const sn = findPlanet(chart, 'SouthNode');

console.log('=== ASTROLOJİ ===');
console.log('Güneş   :', SIGNS_TR[sun.sign], sun.degreeInSign.toFixed(1)+'°', 'Ev', sun.house);
console.log('Ay      :', SIGNS_TR[moon.sign], moon.degreeInSign.toFixed(1)+'°', 'Ev', moon.house);
console.log('Yükselen:', SIGNS_TR[asc.sign], asc.degreeInSign.toFixed(1)+'°', '(beklenen: Yay)');
console.log('MC      :', SIGNS_TR[mc.sign], mc.degreeInSign.toFixed(1)+'°');
console.log('Kuzey Düğüm:', SIGNS_TR[nn.sign], nn.degreeInSign.toFixed(1)+'°', 'Ev', nn.house);
console.log('Güney Düğüm:', SIGNS_TR[sn.sign], sn.degreeInSign.toFixed(1)+'°', 'Ev', sn.house);

console.log('\n=== HUMAN DESIGN ===');
const hd = calculateHumanDesign(chart, birthISO);
console.log('Tip      :', hd.type);
console.log('Strateji :', hd.strategy);
console.log('Otorite  :', hd.authority);
console.log('Profil   :', hd.profile);

console.log('\n=== NUMEROLOJİ ===');
const num = buildNumerology('1988-04-07', 'Arda Çetin');
console.log('Yaşam Yolu  :', num.lifePath, '(1988+4+7 = 26+4+7=37→10→1; ya 1+9+8+8+4+7=37→1; ya 1+9+8+8+0+4+0+7=37→1; tek tek: 1+9+8+8+4+7=37→3+7=10→1)');
console.log('  beklenen: 1988=1+9+8+8=26→8; +4 +7 = 8+4+7 = 19 → 1+9 = 10 → 1');
console.log('İfade       :', num.expression);
console.log('Ruh Arzusu  :', num.soulUrge);
console.log('Kişisel Yıl :', num.personalYear);

console.log('\n=== MAYA TZOLKIN ===');
const maya = calculateMaya(birthISO);
console.log('Kin', maya.kin, '-', maya.tone.tr, maya.daySign.tr);

console.log('\n=== VEDİK NAKSHATRA ===');
const vedic = calculateVedic(moon.longitude, birthISO);
console.log('Nakshatra:', vedic.nakshatra.name, 'Pada', vedic.pada);
console.log('Ayanamsa :', vedic.ayanamsa.toFixed(3)+'°');

console.log('\n=== ÇİN ZODYAK ===');
const chinese = calculateChinese(birthISO);
console.log(chinese.signature, '(beklenen: Yang Toprak Ejderha — 1988)');

console.log('\n=== NORSE RUNE ===');
const norse = calculateNorse(birthISO);
console.log(norse.rune.glyph, norse.rune.name, '-', norse.rune.meaning);

console.log('\n=== TAROT ===');
const tarot = calculateTarot('1988-04-07');
console.log('Kişilik:', tarot.personality.name, '(#'+tarot.personality.num+')');
console.log('Ruh    :', tarot.soul.name, '(#'+tarot.soul.num+')');
