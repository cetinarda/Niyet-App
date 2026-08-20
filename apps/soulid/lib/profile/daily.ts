// "Profilim → Günün Pusulası" — kişiye özel, deterministik günlük rehber.
// HD günlük transiti (Güneş'in bugünkü kapısı) + Ay evresine göre söz +
// bakılacak alan + haftaya bakış. AI yok; her gün değişir.

import { Body, GeoVector, Ecliptic, MakeTime } from 'astronomy-engine';
import type { GalacticReport } from '../types';
import { longitudeToGate } from '../human-design';
import { GATE_TO_CENTER } from '../human-design/gates';
import { moonPhase } from '../astrology/transits';

function norm(d: number): number {
  let x = d % 360;
  if (x < 0) x += 360;
  return x;
}

// HD merkez → günlük tema (transit kapının merkezi)
const CENTER_THEME: Record<string, { tr: string; en: string }> = {
  Head: { tr: 'ilham ve merak', en: 'inspiration and wonder' },
  Ajna: { tr: 'zihin ve kavrayış', en: 'the mind and insight' },
  Throat: { tr: 'ifade ve eylem', en: 'expression and action' },
  G: { tr: 'kimlik ve yön', en: 'identity and direction' },
  Heart: { tr: 'irade ve öz-değer', en: 'willpower and self-worth' },
  SolarPlexus: { tr: 'duygular ve arzu', en: 'emotions and desire' },
  Sacral: { tr: 'yaşam gücü ve yanıt', en: 'life force and response' },
  Spleen: { tr: 'sezgi ve iyi oluş', en: 'intuition and well-being' },
  Root: { tr: 'ivme ve dinginlik', en: 'momentum and stillness' },
};

// Ay evresine (0..7) göre sakin günlük söz.
const ADVICE: { tr: string; en: string }[] = [
  { tr: 'Yeni bir tohum ek — küçük bir niyet bugün yeter.', en: 'Plant a seed — one small intention is enough today.' },
  { tr: 'İvmeni nazikçe büyüt; acele etme, yönünü hisset.', en: 'Grow your momentum gently; feel your direction, don’t rush.' },
  { tr: 'Bir eşiğin başındasın — cesaretle tek bir adım at.', en: 'You’re at a threshold — take one brave step.' },
  { tr: 'Neredeyse doldun; sabrı bırakma, meyve yakın.', en: 'Almost full; keep your patience, the fruit is near.' },
  { tr: 'Bugün dolulukta dur; ne getirdiğini gör ve kutla.', en: 'Rest in fullness today; see what you brought and celebrate.' },
  { tr: 'Fazlalığı bırakmaya başla; sadeleştikçe hafiflersin.', en: 'Begin releasing excess; you lighten as you simplify.' },
  { tr: 'Gözden geçir ve affet — kapanışlar da bir armağandır.', en: 'Review and forgive — endings are a gift too.' },
  { tr: 'Dinlen ve içe dön; boşluk yeni başlangıcı besler.', en: 'Rest and turn inward; the void feeds the new beginning.' },
];

export type ProfileDaily = {
  moon: { fraction: number; waxing: boolean; name: { tr: string; en: string } };
  hd: {
    gate: number;
    line: number;
    center: string | null;
    theme: { tr: string; en: string };
    personal: boolean; // bugünkü transit kapı kişinin tanımlı kapılarından mı
  };
  advice: { tr: string; en: string };
  focus: { tr: string; en: string };
  week: { tr: string; en: string };
};

function transitingSunLon(date: Date): number {
  return norm(Ecliptic(GeoVector(Body.Sun, MakeTime(date), true)).elon);
}

export function buildProfileDaily(report: GalacticReport, date: Date = new Date()): ProfileDaily {
  const moon = moonPhase(date);

  const sunLon = transitingSunLon(date);
  const { gate, line } = longitudeToGate(sunLon);
  const center = (GATE_TO_CENTER[gate] as string | undefined) ?? null;
  const theme = center ? CENTER_THEME[center] ?? { tr: 'akış', en: 'flow' } : { tr: 'akış', en: 'flow' };
  const personal = Array.isArray(report.humanDesign.gates) && report.humanDesign.gates.includes(gate);

  const focus = {
    tr: `${cap(theme.tr)} alanına bak — bugün burada küçük bir netlik seni ileri taşır.`,
    en: `Look to ${theme.en} — a little clarity here carries you forward today.`,
  };

  const week = moon.waxing
    ? {
        tr: 'Bu hafta ivme büyüyor: başlat, iste, alan aç. Dolunaya doğru netleşirsin.',
        en: 'Momentum builds this week: start, ask, make space. You clarify toward the full moon.',
      }
    : {
        tr: 'Bu hafta sadeleşme zamanı: bırak, tamamla, dinlen. Yeni aya doğru boşluk aç.',
        en: 'A week to simplify: release, complete, rest. Make space toward the new moon.',
      };

  return {
    moon: { fraction: moon.fraction, waxing: moon.waxing, name: moon.name },
    hd: { gate, line, center, theme, personal },
    advice: ADVICE[moon.index] ?? ADVICE[0]!,
    focus,
    week,
  };
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
