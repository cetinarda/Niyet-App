'use client';

// "Hesaplanan veri" paneli — anlatı metninin ARKASINDAKİ deterministik motor
// çıktısını ham/etiketli olarak gösterir. Amaç: uygulamanın bir horoscope
// içerik akışı değil, bir HESAPLAYICI/araç olduğunu görünür kılmak (App Store
// 4.3(b) savunması). Aynı doğum verisi her zaman aynı değerleri üretir.

import { useT } from '@/lib/i18n';
import type { GalacticReport } from '@/lib/types';
import { SIGN_NAMES_TR } from '@/lib/content/astrology-content';

const SIGN_EN: Record<string, string> = {
  Aries: 'Aries', Taurus: 'Taurus', Gemini: 'Gemini', Cancer: 'Cancer',
  Leo: 'Leo', Virgo: 'Virgo', Libra: 'Libra', Scorpio: 'Scorpio',
  Sagittarius: 'Sagittarius', Capricorn: 'Capricorn', Aquarius: 'Aquarius', Pisces: 'Pisces',
};

function signName(sign: string, tr: boolean): string {
  return tr ? (SIGN_NAMES_TR[sign as keyof typeof SIGN_NAMES_TR] ?? sign) : (SIGN_EN[sign] ?? sign);
}

type Row = { label: string; value: string };

function Group({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="rounded-2xl border border-panelBorder bg-panel/50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">{title}</p>
      <dl className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-3 text-[12px]">
            <dt className="text-muted">{r.label}</dt>
            <dd className="text-right font-mono text-[11px] text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function EngineMechanics({ report }: { report: GalacticReport }) {
  const { locale } = useT();
  const tr = locale === 'tr';

  const { chart, humanDesign: hd, numerology: num, systems: s } = report;
  const sun = chart.planets.find((p) => p.name === 'Sun');
  const moon = chart.planets.find((p) => p.name === 'Moon');
  const asc = chart.ascendant;
  const mc = chart.midheaven;
  const deg = (lon: number) => `${(((lon % 30) + 30) % 30).toFixed(2)}°`;

  const astro: Row[] = [
    { label: tr ? 'Güneş' : 'Sun', value: sun ? `${signName(sun.sign, tr)} ${sun.degreeInSign.toFixed(2)}°` : '—' },
    { label: tr ? 'Ay' : 'Moon', value: moon ? `${signName(moon.sign, tr)} ${moon.degreeInSign.toFixed(2)}°` : '—' },
    { label: tr ? 'Yükselen (ASC)' : 'Ascendant', value: `${signName(chart.ascendantSign, tr)} ${deg(asc)}` },
    { label: tr ? 'Tepe Noktası (MC)' : 'Midheaven (MC)', value: deg(mc) },
    { label: tr ? 'Ev sistemi' : 'Houses', value: `${chart.houses.length} · ${tr ? 'eşit/plasidus' : 'cusps'}` },
  ];

  const hdRows: Row[] = [
    { label: tr ? 'Tip' : 'Type', value: hd.type },
    { label: tr ? 'Otorite' : 'Authority', value: hd.authority },
    { label: tr ? 'Profil' : 'Profile', value: hd.profile },
    { label: tr ? 'Tanımlı merkez' : 'Defined centers', value: `${hd.definedCenters.length}/9` },
    { label: tr ? 'Aktif kapı' : 'Active gates', value: `${hd.gates.length}/64` },
    { label: tr ? 'Kanallar' : 'Channels', value: hd.channels.length ? hd.channels.join(', ') : '—' },
  ];

  const vedicRows: Row[] = [
    { label: 'Nakshatra', value: `${s.vedic.nakshatra.name} · Pada ${s.vedic.pada}` },
    { label: 'Ayanamsa (Lahiri)', value: `${s.vedic.ayanamsa.toFixed(3)}°` },
    { label: tr ? 'Sidereal Ay' : 'Sidereal Moon', value: `${s.vedic.moonSiderealLongitude.toFixed(2)}°` },
  ];

  const otherRows: Row[] = [
    { label: 'Maya Tzolkin', value: `Kin ${s.maya.kin} · ${tr ? s.maya.daySign.tr : s.maya.daySign.en} · ${tr ? s.maya.tone.tr : `Tone ${s.maya.tone.num}`}` },
    { label: tr ? 'Çin' : 'Chinese', value: `${tr ? s.chinese.animal.tr : s.chinese.animal.en} · ${tr ? s.chinese.element.tr : s.chinese.element.en} · ${s.chinese.yinYang}` },
  ];

  const numRows: Row[] = [
    { label: tr ? 'Yaşam Yolu' : 'Life Path', value: String(num.lifePath) },
    { label: tr ? 'İfade' : 'Expression', value: String(num.expression) },
    { label: tr ? 'Ruh Arzusu' : 'Soul Urge', value: String(num.soulUrge) },
    { label: tr ? 'Kişilik' : 'Personality', value: String(num.personality) },
    { label: tr ? 'Kişisel Yıl' : 'Personal Year', value: String(num.personalYear) },
  ];

  return (
    <details className="card-surface group rounded-3xl border border-panelBorder p-4 md:p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.4em] text-gold">
            {tr ? 'HESAPLANAN VERİ' : 'THE MATH BEHIND IT'}
          </span>
          <span className="mt-1 block text-[12px] text-muted">
            {tr
              ? 'Anlatının arkasındaki ham motor çıktısı — aynı doğum verisi her zaman aynı sonucu verir.'
              : 'The raw engine output behind the narrative — same birth data always yields the same result.'}
          </span>
        </span>
        <span className="shrink-0 text-gold transition-transform group-open:rotate-180">▾</span>
      </summary>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Group title={tr ? 'Astroloji (tropikal)' : 'Astrology (tropical)'} rows={astro} />
        <Group title="Human Design" rows={hdRows} />
        <Group title={tr ? 'Vedik (sidereal)' : 'Vedic (sidereal)'} rows={vedicRows} />
        <Group title={tr ? 'Maya · Çin' : 'Maya · Chinese'} rows={otherRows} />
        <Group title={tr ? 'Numeroloji' : 'Numerology'} rows={numRows} />
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-faint">
        {tr
          ? 'Tüm değerler cihazda astronomy-engine (efemeris) ve takvim matematiğiyle hesaplanır; önceden yazılmış içerik değildir.'
          : 'All values are computed on-device from astronomy-engine (ephemeris) and calendar math — not pre-written content.'}
      </p>
    </details>
  );
}
