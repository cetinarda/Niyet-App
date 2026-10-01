'use client';

import Image from 'next/image';
import { forwardRef } from 'react';
import type { GalacticReport, ZodiacSign } from '@/lib/types';
import { SIGN_GLYPHS, SIGN_NAMES_TR } from '@/lib/content/astrology-content';
import { LIFE_PATH_MEANINGS } from '@/lib/content/numerology-content';
import {
  CHINESE_ANIMAL_TRAITS_EN,
  CHINESE_ELEMENT_POWER_EN,
  LIFE_PATH_MEANINGS_EN,
  MAYA_DAY_SIGNS_EN,
  MAYA_TONES_EN,
  NAKSHATRAS_EN,
  NORTH_NODE_GUIDE_EN,
  RUNES_EN,
  SIGN_NAMES_EN,
  SOUTH_NODE_RELEASE_EN,
  STAR_ORIGIN_EN,
  TAROT_EN,
  hdAuthorityEn,
  hdProfileEn,
  hdStrategyEn,
  hdTypeEn,
  ordinalEn,
} from '@/lib/content/concepts-en';
import { useT } from '@/lib/i18n';

type Props = { report: GalacticReport };

export const ReportCard = forwardRef<HTMLDivElement, Props>(function ReportCard({ report }, ref) {
  const sun = report.chart.planets.find((p) => p.name === 'Sun')!;
  const moon = report.chart.planets.find((p) => p.name === 'Moon')!;
  const nn = report.chart.planets.find((p) => p.name === 'NorthNode')!;
  const sn = report.chart.planets.find((p) => p.name === 'SouthNode')!;
  const s = report.systems;
  const { locale } = useT();
  const en = locale === 'en';

  // Share card text: Turkish as before; English via stable-id lookups with a
  // Turkish fallback (SoulID is tr + en only).
  const sign = (z: ZodiacSign) => (en ? SIGN_NAMES_EN[z] ?? SIGN_NAMES_TR[z] : SIGN_NAMES_TR[z]);
  const house = (h?: number) => (en ? (h ? `${ordinalEn(h)} house` : '') : `${h}. ev`);
  const lp = (en ? LIFE_PATH_MEANINGS_EN[report.numerology.lifePath] : undefined) ?? LIFE_PATH_MEANINGS[report.numerology.lifePath];
  const originEn = en ? STAR_ORIGIN_EN[report.origin.race] : undefined;
  const hd = report.humanDesign;
  const hdLine = en
    ? `${hdStrategyEn(hd.type, hd.strategy)} · ${hdAuthorityEn(hd.authority)} · ${hdProfileEn(hd.profile)}`
    : `${hd.strategy} · ${hd.authority} · ${hd.profile}`;
  const dayEn = en ? MAYA_DAY_SIGNS_EN[s.maya.daySign.index] : undefined;
  const toneEn = en ? MAYA_TONES_EN[s.maya.tone.num] : undefined;
  const nakEn = en ? NAKSHATRAS_EN[s.vedic.nakshatra.name] : undefined;
  const chineseTitle = en
    ? `${s.chinese.yinYang} ${s.chinese.element.en} ${s.chinese.animal.en}`
    : s.chinese.signature;
  const chineseSub = en
    ? `${CHINESE_ELEMENT_POWER_EN[s.chinese.element.en] ?? s.chinese.element.power} · ${CHINESE_ANIMAL_TRAITS_EN[s.chinese.animal.en] ?? s.chinese.animal.traits}`
    : `${s.chinese.element.power} · ${s.chinese.animal.traits}`;
  const runeEn = en ? RUNES_EN[s.norse.rune.name] : undefined;
  const pName = (en ? TAROT_EN[s.tarot.personality.num]?.name : undefined) ?? s.tarot.personality.name;
  const soulEn = en ? TAROT_EN[s.tarot.soul.num] : undefined;
  const nnMessage = (en ? NORTH_NODE_GUIDE_EN[nn.sign] : undefined) ?? report.northNodeMessage;
  const snMessage = (en ? SOUTH_NODE_RELEASE_EN[sn.sign] : undefined) ?? report.southNodeMessage;

  return (
    <div
      ref={ref}
      data-theme="dark"
      className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-galaxy p-6 text-ink card-glow"
      style={{ fontFamily: 'var(--font-sans), Inter, sans-serif' }}
    >
      <div className="starfield" />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-[radial-gradient(40%_60%_at_50%_0%,rgba(124,92,255,0.45),transparent_70%)]" />

      <div className="relative flex flex-col gap-4">
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-[0.5em] text-gold">SOULID</p>
          <p className="font-display text-xl text-ink">{en ? 'Galactic Profile' : 'Galaktik Karne'}</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gold bg-panel">
            {report.birth.photoUri ? (
              <Image
                src={report.birth.photoUri}
                alt={report.birth.fullName}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-3xl text-gold">
                {report.origin.emoji}
              </div>
            )}
          </div>
          <h2 className="mt-3 text-center font-display text-2xl text-ink">{report.birth.fullName}</h2>
          <p className="mt-1 text-sm font-bold tracking-wide text-gold">
            {report.origin.emoji} {originEn?.race ?? report.origin.race}
          </p>
          <p className="text-[11px] text-starlight">{originEn?.starSystem ?? report.origin.starSystem}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <BigCell label={en ? 'Sun' : 'Güneş'} value={sign(sun.sign)} glyph={SIGN_GLYPHS[sun.sign]} />
          <BigCell label={en ? 'Moon' : 'Ay'} value={sign(moon.sign)} glyph={SIGN_GLYPHS[moon.sign]} />
          <BigCell
            label={en ? 'Rising' : 'Yükselen'}
            value={sign(report.chart.ascendantSign)}
            glyph={SIGN_GLYPHS[report.chart.ascendantSign]}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[9px] font-bold tracking-[0.25em] text-gold">{en ? 'ENERGY PROFILE' : 'ENERJİ PROFİLİ'}</p>
          <p className="mt-1 font-display text-xl text-ink">{en ? hdTypeEn(hd.type) : hd.type}</p>
          <p className="text-[10px] leading-snug text-muted">{hdLine}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MiniCell label={en ? 'Life Path' : 'Yaşam Yolu'} value={report.numerology.lifePath} sub={lp?.title ?? ''} />
          <MiniCell
            label={en ? 'Personal Year' : 'Kişisel Yıl'}
            value={report.numerology.personalYear}
            sub={en ? 'Your current cycle' : 'Şu anki döngü'}
          />
        </div>

        <SystemRow
          kicker={en ? 'MAYA TZOLKIN' : 'MAYA TZOLKİN'}
          title={`Kin ${s.maya.kin} · ${dayEn?.name ?? s.maya.daySign.tr}`}
          sub={`${toneEn?.name ?? s.maya.tone.tr} · ${dayEn?.power ?? s.maya.daySign.power}`}
        />

        <SystemRow
          kicker={en ? 'VEDIC NAKSHATRA' : 'VEDİK NAKSHATRA'}
          title={`${s.vedic.nakshatra.name} · Pada ${s.vedic.pada}`}
          sub={`${s.vedic.nakshatra.deity}: ${nakEn?.power ?? s.vedic.nakshatra.power}`}
        />

        <SystemRow
          kicker={en ? 'CHINESE ZODIAC' : 'ÇİN ZODYAK'}
          title={`${s.chinese.element.glyph} ${chineseTitle}`}
          sub={chineseSub}
        />

        <SystemRow
          kicker="NORSE RUNE"
          title={`${s.norse.rune.glyph} ${s.norse.rune.name}`}
          sub={`${runeEn?.meaning ?? s.norse.rune.meaning}: ${runeEn?.power ?? s.norse.rune.power}`}
        />

        <SystemRow
          kicker={en ? 'TAROT BIRTH CARD' : 'TAROT DOĞUM KARTI'}
          title={`${s.tarot.personality.glyph} ${pName}`}
          sub={
            en
              ? `Soul: ${soulEn?.name ?? s.tarot.soul.name}: ${soulEn?.power ?? s.tarot.soul.power}`
              : `Ruh: ${s.tarot.soul.name}: ${s.tarot.soul.power}`
          }
        />

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[9px] font-bold tracking-[0.25em] text-gold">{en ? 'NORTH NODE · TASK' : 'KUZEY AY DÜĞÜMÜ · GÖREV'}</p>
          <p className="mt-1 text-[11px] font-bold text-ink">
            {SIGN_GLYPHS[nn.sign]} {sign(nn.sign)} · {house(nn.house)}
          </p>
          <p className="mt-1 text-[10px] leading-snug text-muted">{nnMessage}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[9px] font-bold tracking-[0.25em] text-gold">{en ? 'SOUTH NODE · LET GO' : 'GÜNEY AY DÜĞÜMÜ · BIRAK'}</p>
          <p className="mt-1 text-[11px] font-bold text-ink">
            {SIGN_GLYPHS[sn.sign]} {sign(sn.sign)} · {house(sn.house)}
          </p>
          <p className="mt-1 text-[10px] leading-snug text-muted">{snMessage}</p>
        </div>

        <p className="pt-2 text-center text-[8px] leading-relaxed text-faint">
          {en
            ? 'A symbolic reflection · Not medical or psychological advice'
            : 'Sembolik gözlem · Tıbbi/psikolojik tavsiye değildir'}
        </p>
        <p className="text-center text-[9px] tracking-[0.35em] text-faint">
          sakin.life
        </p>
      </div>
    </div>
  );
});

function BigCell({ label, value, glyph }: { label: string; value: string; glyph: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center">
      <div className="text-lg text-gold">{glyph}</div>
      <div className="mt-1 text-[9px] tracking-widest text-muted">{label}</div>
      <div className="text-[11px] font-bold text-ink">{value}</div>
    </div>
  );
}

function MiniCell({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-[9px] tracking-widest text-muted">{label}</div>
      <div className="font-display text-3xl leading-none text-gold">{value}</div>
      <div className="mt-1 text-[10px] text-muted">{sub}</div>
    </div>
  );
}

function SystemRow({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-[9px] font-bold tracking-[0.25em] text-gold">{kicker}</p>
      <p className="mt-1 text-[12px] font-bold text-ink">{title}</p>
      <p className="mt-0.5 text-[10px] leading-snug text-muted">{sub}</p>
    </div>
  );
}
