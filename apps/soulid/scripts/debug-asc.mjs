import { Body, GeoVector, Ecliptic, MakeTime, SiderealTime } from 'astronomy-engine';

function normalize(d) { let v = d % 360; if (v < 0) v += 360; return v; }
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const signOf = lon => SIGNS[Math.floor(normalize(lon)/30)];

function computeAsc(date, lat, lon) {
  const time = MakeTime(date);
  const gmst = SiderealTime(time);
  const lst = (gmst + lon / 15) * 15;
  const ramc = ((lst % 360) + 360) % 360;
  const JD = time.tt + 2451545.0;
  const T = (JD - 2451545.0) / 36525;
  const eps = (23.43929111 - (46.8150 * T + 0.00059 * T*T - 0.001813 * T*T*T)/3600) * Math.PI/180;
  const phi = lat * Math.PI / 180;
  const ramcRad = ramc * Math.PI / 180;

  const mcRad = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(eps));
  const mcDeg = normalize(mcRad * 180 / Math.PI);

  // CORRECT formula (flatlib / Swiss Ephemeris style)
  const ascRad = Math.atan2(
    Math.cos(ramcRad),
    -(Math.sin(ramcRad) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))
  );
  const ascDeg = normalize(ascRad * 180 / Math.PI);

  return { ramc, mcDeg, ascDeg };
}

const TESTS = [
  { name: 'Kayseri', date: new Date('1988-04-07T20:05:00Z'), lat: 38.7322, lon: 35.4853, expectedSign: 'Sagittarius' },
  { name: 'İstanbul gündoğumu (Mart eşitnoktası ~06:00)', date: new Date('2024-03-20T03:30:00Z'), lat: 41.0, lon: 28.97, expectedSign: 'Pisces' }, // 6:30 local; Sun at 0° Aries rising
  { name: 'NYC öğle', date: new Date('2000-06-21T16:00:00Z'), lat: 40.7, lon: -74.0, expectedSign: 'Virgo' }, // noon local NYC summer solstice — Virgo rising
];

for (const t of TESTS) {
  const { ramc, mcDeg, ascDeg } = computeAsc(t.date, t.lat, t.lon);
  console.log(`\n=== ${t.name} ===`);
  console.log(`  UTC: ${t.date.toISOString()}, lat ${t.lat}, lon ${t.lon}`);
  console.log(`  RAMC: ${ramc.toFixed(2)}°, MC: ${mcDeg.toFixed(2)}° = ${signOf(mcDeg)}`);
  console.log(`  ASC: ${ascDeg.toFixed(2)}° = ${signOf(ascDeg)}  (expected ${t.expectedSign})`);
  console.log(`  ${signOf(ascDeg) === t.expectedSign ? '✓ MATCH' : '✗ MISMATCH'}`);
}
