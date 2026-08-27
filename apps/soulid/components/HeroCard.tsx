'use client';

import Image from 'next/image';
import { forwardRef, useEffect, useRef, useState } from 'react';
import type { GalacticReport } from '@/lib/types';
import { calculateStats, STAT_META, type StatKey } from '@/lib/stats';
import { SIGN_GLYPHS, SIGN_NAMES_TR } from '@/lib/content/astrology-content';
import { captureNode, downloadDataUrl, shareDataUrl } from '@/lib/share';
import { stylizePortrait } from '@/lib/portrait/stylize';
import { generateAiPortrait, getCachedPortrait } from '@/lib/portrait/ai';
import { useT } from '@/lib/i18n';

const GOLD = '#e8c877';
const GOLD_DIM = 'rgba(232,200,119,0.34)';

const STAT_EN: Record<StatKey, string> = {
  'Güç': 'Power',
  'Sezgi': 'Intuition',
  'Dayanıklılık': 'Endurance',
  'Yaratıcılık': 'Creativity',
  'Şefkat': 'Compassion',
  'Hız': 'Speed',
  'Şifa': 'Healing',
  'Manifestasyon': 'Manifest',
  'Bilgelik': 'Wisdom',
  'Karizma': 'Charisma',
};

/** Köşe elması — ornate çerçeve süsü (RPG kart hissi). */
function Corner({ style }: { style: React.CSSProperties }) {
  return (
    <span
      style={{
        position: 'absolute',
        width: 7,
        height: 7,
        background: GOLD,
        transform: 'rotate(45deg)',
        boxShadow: '0 0 6px rgba(232,200,119,0.6)',
        ...style,
      }}
    />
  );
}

/**
 * "Kahraman Kartı" — indirilebilir RPG stil karne kartı.
 * Kullanıcının profil fotoğrafı otomatik gelir (yoksa yıldız ırkı emojisi),
 * 10 stat oyun karakteri gibi küçük yazılarla sergilenir. En yüksek 3 stat
 * altın vurgulu. html-to-image ile PNG'ye çevrilir (photoUri data-URL → CORS yok).
 */
export const HeroCard = forwardRef<HTMLDivElement, { report: GalacticReport; portrait?: string }>(
  function HeroCard({ report, portrait }, ref) {
    const { locale } = useT();
    const tr = locale === 'tr';
    const stats = calculateStats(report.chart, report.numerology, report.humanDesign);
    const entries = Object.entries(stats) as Array<[StatKey, number]>;
    const top3 = [...entries].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);

    const sun = report.chart.planets.find((p) => p.name === 'Sun');
    const moon = report.chart.planets.find((p) => p.name === 'Moon');
    const asc = report.chart.ascendantSign;
    const sign = (s: string) => (tr ? SIGN_NAMES_TR[s as keyof typeof SIGN_NAMES_TR] : s);


    return (
      <div
        ref={ref}
        data-theme="dark"
        style={{
          width: 360,
          padding: 3,
          borderRadius: 20,
          background: 'linear-gradient(150deg,#f3dfa2 0%,#b8892f 22%,#6b4d18 50%,#b8892f 78%,#f3dfa2 100%)',
          boxShadow: '0 24px 60px -20px rgba(0,0,0,0.8)',
          fontFamily: 'var(--font-sans), Inter, sans-serif',
        }}
      >
        <div
          style={{
            position: 'relative',
            borderRadius: 17,
            padding: '18px 16px 14px',
            background:
              'radial-gradient(120% 80% at 50% 0%, #241041 0%, #14082e 45%, #0a0420 100%)',
            border: `1px solid ${GOLD_DIM}`,
            overflow: 'hidden',
          }}
        >
          {/* iç ince çerçeve + köşe elmasları */}
          <div
            style={{
              position: 'absolute',
              inset: 7,
              border: `1px solid rgba(232,200,119,0.20)`,
              borderRadius: 12,
              pointerEvents: 'none',
            }}
          />
          <Corner style={{ top: 4, left: 4 }} />
          <Corner style={{ top: 4, right: 4 }} />
          <Corner style={{ bottom: 4, left: 4 }} />
          <Corner style={{ bottom: 4, right: 4 }} />

          <div style={{ position: 'relative' }}>
            {/* Başlık */}
            <p
              style={{
                textAlign: 'center',
                fontSize: 8,
                letterSpacing: '0.42em',
                color: GOLD,
                fontWeight: 700,
                margin: 0,
              }}
            >
              ◆ SOULPROFILE ◆
            </p>

            {/* Portre */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              <div
                style={{
                  position: 'relative',
                  width: 108,
                  height: 108,
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: `2px solid ${GOLD}`,
                  background: '#0a0420',
                  boxShadow: '0 0 22px rgba(232,200,119,0.28)',
                }}
              >
                {portrait ? (
                  <Image
                    src={portrait}
                    alt={report.birth.fullName}
                    fill
                    priority
                    unoptimized
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 42,
                    }}
                  >
                    {report.origin.emoji}
                  </div>
                )}
              </div>
            </div>

            {/* Sınıf rozeti */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: -9 }}>
              <span
                style={{
                  fontSize: 8.5,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: '#1a0a40',
                  background: `linear-gradient(180deg,#f3dfa2,${GOLD})`,
                  padding: '3px 12px',
                  borderRadius: 999,
                  textTransform: 'uppercase',
                }}
              >
                {report.humanDesign.type}
              </span>
            </div>

            {/* İsim + unvan */}
            <h3
              style={{
                margin: '9px 0 0',
                textAlign: 'center',
                fontFamily: 'var(--font-display), serif',
                fontSize: 23,
                lineHeight: 1.12,
                color: '#f7f2ff',
              }}
            >
              {report.birth.fullName}
            </h3>
            <p style={{ margin: '3px 0 0', textAlign: 'center', fontSize: 10, color: GOLD }}>
              {report.origin.emoji} {report.origin.race}
            </p>

            <Divider />

            {/* STATLAR — 2 sütun, oyun karakteri gibi */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                columnGap: 8,
                rowGap: 6,
              }}
            >
              {entries.map(([key, value]) => {
                const meta = STAT_META[key];
                const isTop = top3.includes(key);
                return (
                  <div
                    key={key}
                    style={{
                      padding: '4px 6px 5px',
                      borderRadius: 7,
                      border: `1px solid ${isTop ? GOLD_DIM : 'rgba(255,255,255,0.08)'}`,
                      background: isTop ? 'rgba(232,200,119,0.07)' : 'rgba(255,255,255,0.035)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 9, color: meta.color, lineHeight: 1 }}>{meta.glyph}</span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: 8.5,
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          color: '#e9e2ff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {tr ? key : STAT_EN[key]}
                      </span>
                      {isTop ? <span style={{ fontSize: 7, color: GOLD }}>★</span> : null}
                      <span
                        style={{
                          fontFamily: 'var(--font-display), serif',
                          fontSize: 12,
                          lineHeight: 1,
                          color: isTop ? GOLD : '#cfc6e8',
                        }}
                      >
                        {value}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 3,
                        height: 3,
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.10)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${value}%`,
                          height: '100%',
                          borderRadius: 999,
                          background: meta.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <Divider />

            {/* Burç üçlüsü */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              <SignCell
                label={tr ? 'Güneş' : 'Sun'}
                glyph={sun ? SIGN_GLYPHS[sun.sign] : '☉'}
                value={sun ? sign(sun.sign) : '—'}
              />
              <SignCell
                label={tr ? 'Ay' : 'Moon'}
                glyph={moon ? SIGN_GLYPHS[moon.sign] : '☽'}
                value={moon ? sign(moon.sign) : '—'}
              />
              <SignCell
                label={tr ? 'Yükselen' : 'Rising'}
                glyph={SIGN_GLYPHS[asc]}
                value={sign(asc)}
              />
            </div>

            {/* Alt bilgi */}
            <p
              style={{
                margin: '11px 0 0',
                textAlign: 'center',
                fontSize: 7,
                letterSpacing: '0.3em',
                color: 'rgba(232,200,119,0.75)',
              }}
            >
              SOULPROFILE.LIFE
            </p>
            <p
              style={{
                margin: '3px 0 0',
                textAlign: 'center',
                fontSize: 6.5,
                color: 'rgba(255,255,255,0.32)',
              }}
            >
              {tr
                ? 'Sembolik gözlem · tıbbi tavsiye değildir'
                : 'Symbolic reading · not medical advice'}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '11px 0 9px' }}>
      <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(232,200,119,0.42))' }} />
      <span style={{ fontSize: 7, color: GOLD }}>◆</span>
      <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(232,200,119,0.42),transparent)' }} />
    </div>
  );
}

function SignCell({ label, glyph, value }: { label: string; glyph: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 7,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.035)',
        padding: '5px 3px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 13, color: GOLD, lineHeight: 1 }}>{glyph}</div>
      <div style={{ marginTop: 2, fontSize: 6.5, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.45)' }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#e9e2ff' }}>{value}</div>
    </div>
  );
}

/** Kahraman kartı + AI portre + indir/paylaş butonları. */
export function HeroCardShare({ report }: { report: GalacticReport }) {
  const { locale } = useT();
  const tr = locale === 'tr';
  const cardRef = useRef<HTMLDivElement>(null);
  const [working, setWorking] = useState<'share' | 'download' | null>(null);

  const photo = report.birth.photoUri;
  const [portrait, setPortrait] = useState<string | undefined>(photo);
  const [isAi, setIsAi] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  // Önce önbellekteki AI portresi (varsa) — yoksa cihaz-üstü boyama efekti.
  // AI dönüşümü ASLA otomatik çalışmaz: fotoğraf ancak kullanıcı butona
  // bastığında üçüncü taraf sağlayıcıya gider.
  useEffect(() => {
    if (!photo) return;
    let cancelled = false;
    (async () => {
      const cached = await getCachedPortrait(report.id);
      if (cancelled) return;
      if (cached) {
        setPortrait(cached);
        setIsAi(true);
        return;
      }
      try {
        const styled = await stylizePortrait(photo);
        if (!cancelled) setPortrait(styled);
      } catch {
        /* orijinal foto kalır */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photo, report.id]);

  async function runAi() {
    setAiBusy(true);
    setAiNote(null);
    const res = await generateAiPortrait(report);
    if (res.ok) {
      setPortrait(res.dataUrl);
      setIsAi(true);
    } else {
      setAiNote(
        res.fallback
          ? tr
            ? 'AI portre şu an kullanılamıyor — boyanmış portre gösteriliyor.'
            : 'AI portrait unavailable right now — showing the painted portrait.'
          : res.error,
      );
    }
    setAiBusy(false);
  }

  async function run(kind: 'share' | 'download') {
    if (!cardRef.current) return;
    setWorking(kind);
    try {
      const dataUrl = await captureNode(cardRef.current);
      if (kind === 'share') await shareDataUrl(dataUrl, 'soulprofile-kahraman-karti.png');
      else downloadDataUrl(dataUrl, 'soulprofile-kahraman-karti.png');
    } catch (err) {
      console.error('[hero-card]', err);
    } finally {
      setWorking(null);
    }
  }

  return (
    <section className="mt-12">
      <div className="mb-5 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-gold">
          {tr ? 'KAHRAMAN KARTIN' : 'YOUR HERO CARD'}
        </p>
        <h2 className="mt-2 font-display text-3xl text-ink">
          {tr ? 'Karneni kart olarak indir' : 'Download your profile as a card'}
        </h2>
      </div>

      <div className="flex justify-center">
        <HeroCard ref={cardRef} report={report} portrait={portrait} />
      </div>

      {/* AI karakter dönüşümü — yalnız kullanıcı isteğiyle */}
      {photo ? (
        <div className="mx-auto mt-5 max-w-md text-center">
          {!isAi ? (
            <>
              <button
                type="button"
                onClick={runAi}
                disabled={aiBusy}
                className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-5 py-2.5 text-sm font-bold text-gold transition-colors hover:bg-gold/20 disabled:opacity-60"
              >
                <span>✦</span>
                {aiBusy
                  ? tr
                    ? 'Karakterin çiziliyor…'
                    : 'Painting your character…'
                  : tr
                    ? 'AI ile karaktere dönüştür'
                    : 'Turn into an AI character'}
              </button>
              <p className="mt-2 text-[11px] leading-relaxed text-faint">
                {tr
                  ? 'Fotoğrafın, karakter portresi üretilmesi için AI görsel servisine gönderilir. Sonuç cihazında saklanır.'
                  : 'Your photo is sent to an AI image service to paint the character. The result is stored on your device.'}
              </p>
            </>
          ) : (
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
              {tr ? '✦ AI karakter portresi' : '✦ AI character portrait'}
            </p>
          )}
          {aiNote ? <p className="mt-2 text-[12px] text-muted">{aiNote}</p> : null}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => run('share')}
          disabled={working !== null}
          className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-[#1a0a40] disabled:opacity-60"
        >
          {working === 'share' ? (tr ? 'Hazırlanıyor…' : 'Preparing…') : tr ? 'Paylaş' : 'Share'}
        </button>
        <button
          type="button"
          onClick={() => run('download')}
          disabled={working !== null}
          className="rounded-full border border-panelBorder bg-panel px-6 py-3 text-sm font-bold text-ink hover:border-gold disabled:opacity-60"
        >
          {working === 'download' ? (tr ? 'Hazırlanıyor…' : 'Preparing…') : tr ? 'PNG İndir' : 'Download PNG'}
        </button>
      </div>
    </section>
  );
}
