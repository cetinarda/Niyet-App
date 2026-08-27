/**
 * Human Design — Jean Meeus "Astronomical Algorithms" Ch. 25 tabanlı
 * Güneş boylamı hesabı (~0.01° doğruluk, HD kapı çözünürlüğü 5.625°).
 *
 * SINIR: Tam HD tipi için doğum anında VE 88.736 gün öncesinde
 * tüm 9 gezegenin konumu gerekir. Burada sadece Güneş + Yeryüzü
 * hesaplanıyor (4 kapı aktif) — bu gerçek, doğru veri ama tip
 * belirlemek için yetersiz olabilir. Kullanıcıya açıkça söylenir.
 */

export type HDType =
  | 'Jeneratör'
  | 'Manifesting Jeneratör'
  | 'Projektör'
  | 'Manifestor'
  | 'Reflektör';

export interface HDProfile {
  type: HDType;
  strategy: string;
  authority: string;
  desc: string;
  notSelf: string;
}

export interface HDGates {
  consciousSun: number;
  consciousEarth: number;
  designSun: number;
  designEarth: number;
  consciousSunLine: number;
  designSunLine: number;
}

// Standart Jovian Archive gate dizisi — 0° Koç'tan başlayarak her 5.625°
const GATE_SEQUENCE = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42,  3,
  27, 24,  2, 23,  8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33,  7,  4, 29, 59, 40, 64, 47,  6, 46, 18, 48, 57, 32, 50,
  28, 44,  1, 43, 14, 34,  9,  5, 26, 11, 10, 58, 38, 54, 61, 60,
];

// Sakral merkezi tanımlayan kanallar (Generator / MG)
const SACRAL_CHANNELS: [number, number][] = [
  [5, 15], [14, 2], [29, 46], [34, 57], [34, 10], [27, 50], [59, 6], [9, 52],
];

// Motor→Boğaz kanalları (Sakral YOK ise → Manifestor)
const MOTOR_THROAT_CHANNELS: [number, number][] = [
  [45, 21], [35, 36], [12, 22], [16, 48], [26, 44],
];

// Sakral→Boğaz kanalları (hem Sakral hem motor→boğaz = MG)
const SACRAL_THROAT_CHANNELS: [number, number][] = [
  [34, 20], [20, 34],
];

// ─── Julian Gün Sayısı ────────────────────────────────────────────────────
function julianDay(
  year: number, month: number, day: number, hour = 12, minute = 0,
): number {
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day + (hour + minute / 60) / 24 + B - 1524.5
  );
}

// ─── Güneş boylam açısı (Meeus Ch. 25) ───────────────────────────────────
function sunLongitude(jde: number): number {
  const T = (jde - 2451545.0) / 36525;
  let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  let M  = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  L0 = ((L0 % 360) + 360) % 360;
  M  = ((M  % 360) + 360) % 360;
  const Mr = (M * Math.PI) / 180;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);
  const lon =
    L0 + C - 0.00569 -
    0.00478 * Math.sin(((125.04 - 1934.136 * T) * Math.PI) / 180);
  return ((lon % 360) + 360) % 360;
}

// ─── Boylam → HD kapı + çizgi ────────────────────────────────────────────
function gateFromLon(lon: number): { gate: number; line: number } {
  const idx = Math.floor(lon / 5.625) % 64;
  const line = Math.floor((lon % 5.625) / (5.625 / 6)) + 1;
  return { gate: GATE_SEQUENCE[idx], line: Math.min(line, 6) };
}

function oppositeGate(gate: number): number {
  const idx = GATE_SEQUENCE.indexOf(gate);
  return GATE_SEQUENCE[(idx + 32) % 64];
}

// ─── 4 kapı hesabı (Conscious + Design Güneş/Yeryüzü) ────────────────────
export function calcHDGates(
  birthDate: string,
  birthHour = 12,
  birthMinute = 0,
): HDGates {
  const [year, month, day] = birthDate.split('-').map(Number);
  const jdB = julianDay(year, month, day, birthHour, birthMinute);
  const cS = gateFromLon(sunLongitude(jdB));
  const dS = gateFromLon(sunLongitude(jdB - 88.736));
  return {
    consciousSun:     cS.gate,
    consciousEarth:   oppositeGate(cS.gate),
    designSun:        dS.gate,
    designEarth:      oppositeGate(dS.gate),
    consciousSunLine: cS.line,
    designSunLine:    dS.line,
  };
}

// ─── Tip çıkarımı (4 kapıdan, güven skoru ile) ───────────────────────────
function inferType(gates: HDGates): { type: HDType; confident: boolean } {
  const a = new Set([
    gates.consciousSun, gates.consciousEarth,
    gates.designSun,    gates.designEarth,
  ]);
  if (SACRAL_THROAT_CHANNELS.some(([x, y]) => a.has(x) && a.has(y)))
    return { type: 'Manifesting Jeneratör', confident: true };
  if (SACRAL_CHANNELS.some(([x, y]) => a.has(x) && a.has(y)))
    return { type: 'Jeneratör', confident: true };
  if (MOTOR_THROAT_CHANNELS.some(([x, y]) => a.has(x) && a.has(y)))
    return { type: 'Manifestor', confident: true };
  // 4 kapı yeterli değil — kesin belirlenemiyor
  return { type: 'Jeneratör', confident: false };
}

// ─── HD profil veritabanı ────────────────────────────────────────────────
const HD_PROFILES: Record<HDType, Omit<HDProfile, 'type'>> = {
  'Jeneratör': {
    strategy:  'Yanıt vermek',
    authority: 'Sakral',
    desc:    'Yaşam enerjisinin kaynağısın. Güçlü içgüdüsel yanıtlarınla doğru kararlar alırsın. Sevdiğin işe tam enerji verirsin.',
    notSelf: 'Hayal kırıklığı hissediyorsan, yanlış şeylere evet diyorsundur.',
  },
  'Manifesting Jeneratör': {
    strategy:  'Yanıt ver, sonra harekete geç',
    authority: 'Sakral',
    desc:    'Çok boyutlu hızlı bir enerjin var. Birden fazla şeyi aynı anda yapabilirsin. Verimliliğin ve esnekliğin eşsizdir.',
    notSelf: 'Sinirleniyorsan ya da hayal kırıklığı yaşıyorsan, yanlış yöndesindir.',
  },
  'Projektör': {
    strategy:  'Davetleri beklemek',
    authority: 'Kişisel yetki',
    desc:    'Sistemleri ve insanları derinlemesine görme yeteneğin var. Rehberlik etmek ve yönetmek için doğdun. Davet edildiğinde en iyi çıkarsın.',
    notSelf: 'Acı ve kızgınlık, davetin gelmediğine işarettir.',
  },
  'Manifestor': {
    strategy:  'Bildirmek',
    authority: 'Duygusal ya da içsel',
    desc:    'Bağımsız başlatma enerjisine sahipsin. Harekete geçirme ve yeni döngüler açma gücündürsün. Özgürlük senin için hayatidir.',
    notSelf: 'Öfke hissediyorsan, kontrol kaybı yaşıyorsundur.',
  },
  'Reflektör': {
    strategy:  '28 gün beklemek',
    authority: 'Lunar yetki',
    desc:    'Toplumun aynasısın. Çevrenin enerjisini yansıtır, toplulukların sağlığını gösterirsin. Ay döngüsüyle kararlar alırsın.',
    notSelf: 'Hayal kırıklığı yaşıyorsan, ortamın doğru değildir.',
  },
};

// ─── Dışa açık API ───────────────────────────────────────────────────────

export function calcHDType(
  birthDate: string,
  birthHour = 12,
  birthMinute = 0,
  override?: string,
): HDType {
  if (override && override in HD_PROFILES) return override as HDType;
  return inferType(calcHDGates(birthDate, birthHour, birthMinute)).type;
}

export function getHDProfile(
  birthDate: string,
  birthHour = 12,
  birthMinute = 0,
  override?: string,
): HDProfile & { gates: HDGates; confident: boolean } {
  const gates = calcHDGates(birthDate, birthHour, birthMinute);
  if (override && override in HD_PROFILES) {
    return { type: override as HDType, ...HD_PROFILES[override as HDType], gates, confident: true };
  }
  const { type, confident } = inferType(gates);
  return { type, ...HD_PROFILES[type], gates, confident };
}

export const GATE_NAMES: Record<number, string> = {
   1:'Yaratıcılık',      2:'Alıcı',             3:'Düzenin Zorluğu',  4:'Formül',
   5:'Sabit Ritim',      6:'Sürtüşme',          7:'Öz Roller',        8:'Birlik',
   9:'Odaklanma',       10:'Öz Sevgi',          11:'Fikirler',        12:'Durgunluk',
  13:'Dinleyici',       14:'Güç Becerileri',    15:'Aşırılık',        16:'Beceriler',
  17:'Görüşler',        18:'Düzeltme',          19:'Yaklaşım',        20:'Şimdiki An',
  21:'Kontrol',         22:'Açıklık',           23:'Özümleme',        24:'Rasyonalizasyon',
  25:'Masumiyet',       26:'Benlik',            27:'Beslenme',        28:'Oyun',
  29:'Evet Demek',      30:'Tutkular',          31:'Etki',            32:'Süreklilik',
  33:'Gizlilik',        34:'Güç',               35:'Değişim',         36:'Karanlık',
  37:'Dostluk',         38:'Muhalefet',         39:'Kışkırtma',       40:'Yalnızlık',
  41:'Daralma',         42:'Büyüme',            43:'Kavrayış',        44:'Uyarılar',
  45:'Toplayıcı',       46:'Beden Sevinci',     47:'Farkındalık',     48:'Derinlik',
  49:'İlkeler',         50:'Değerler',          51:'Şok',             52:'Hareketsizlik',
  53:'Başlangıç',       54:'Hırs',              55:'Ruh',             56:'Uyarıcı',
  57:'Sezgisel Netlik', 58:'Neşe',              59:'Mahremiyet',      60:'Kabullenme',
  61:'İç Gerçek',       62:'Ayrıntı',           63:'Şüphe',           64:'Karışıklık',
};
