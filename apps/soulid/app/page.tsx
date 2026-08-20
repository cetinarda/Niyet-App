'use client';

import { Link } from '@/components/Link';
import { CosmicBackground } from '@/components/CosmicBackground';
import { NowSkyChip } from '@/components/NowSkyChip';
import { StoreBadges } from '@/components/StoreBadges';
import { IS_CAPACITOR } from '@/lib/nav';
import { WEB_APP_OPEN } from '@/lib/feature-flags';
import { useT } from '@/lib/i18n';

export default function Welcome() {
  const { t, locale } = useT();

  const steps = [
    { n: '01', icon: '📅', title: t('home.step1.title'), desc: t('home.step1.desc') },
    { n: '02', icon: '✶', title: t('home.step2.title'), desc: t('home.step2.desc') },
    { n: '03', icon: '✦', title: t('home.step3.title'), desc: t('home.step3.desc') },
  ];

  const systems =
    locale === 'tr'
      ? [
          { emoji: '🌞', title: 'Batı Astrolojisi', desc: 'Güneş, Ay, Yükselen + Kuzey/Güney Düğüm' },
          { emoji: '◇', title: 'Human Design', desc: 'Tip, otorite, profil, strateji, beden grafiği' },
          { emoji: '⌖', title: 'Numeroloji', desc: 'Yaşam Yolu, master sayılar, Kişisel Yıl' },
          { emoji: '🪷', title: 'Vedik Nakshatra', desc: "Ay'ın 27 yıldız evi + pada" },
          { emoji: '🦋', title: 'Maya Tzolkin', desc: 'Kin numarası, gün mührü, galaktik ton' },
          { emoji: '🐉', title: 'Çin Zodyak', desc: '12 hayvan × 5 element × Yin/Yang' },
          { emoji: 'ᛒ', title: 'Norse Rune', desc: 'Elder Futhark doğum runun' },
          { emoji: '🃏', title: 'Tarot Doğum Kartı', desc: 'Kişilik + Ruh, Major Arcana' },
          { emoji: '✦', title: 'Yıldız Irkı', desc: '10 galaktik arketipten dominant' },
        ]
      : [
          { emoji: '🌞', title: 'Western Astrology', desc: 'Sun, Moon, Rising + North/South Node' },
          { emoji: '◇', title: 'Human Design', desc: 'Type, authority, profile, strategy, body graph' },
          { emoji: '⌖', title: 'Numerology', desc: 'Life Path, master numbers, Personal Year' },
          { emoji: '🪷', title: 'Vedic Nakshatra', desc: "Moon's 27 lunar mansions + pada" },
          { emoji: '🦋', title: 'Mayan Tzolkin', desc: 'Kin number, day sign, galactic tone' },
          { emoji: '🐉', title: 'Chinese Zodiac', desc: '12 animals × 5 elements × Yin/Yang' },
          { emoji: 'ᛒ', title: 'Norse Rune', desc: 'Your Elder Futhark birth rune' },
          { emoji: '🃏', title: 'Tarot Birth Card', desc: 'Personality + Soul, Major Arcana' },
          { emoji: '✦', title: 'Starseed Origin', desc: 'Dominant of 10 galactic archetypes' },
        ];

  return (
    <div className="relative">
      <CosmicBackground variant="galaxy" />

      {/* HERO — uzayda asılı sakin alan */}
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-20 md:pt-32">
        <div className="text-center">
          <div className="mb-7 flex justify-center">
            <NowSkyChip />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-gold/80">
            {t('home.kicker')}
          </p>
          <h1 className="mx-auto mt-8 max-w-3xl font-display text-4xl leading-[1.1] text-ink md:text-6xl">
            {t('home.title1')} <span className="text-gold">{t('home.title2')}</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-[15px] leading-[1.75] text-muted md:text-[17px]">
            {t('home.subtitle')}
          </p>

          {IS_CAPACITOR || WEB_APP_OPEN ? (
            <>
              <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/compatibility"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-gold px-7 py-3.5 text-sm font-bold tracking-wide text-[#1a0a40] transition-transform hover:scale-[1.02]"
                  style={{ boxShadow: '0 16px 44px -20px rgba(245, 208, 97, 0.5)' }}
                >
                  <span className="text-base">⚯</span>
                  {t('home.cta.primary')}
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
                <Link
                  href="/birth"
                  className="card-surface inline-flex items-center gap-2 rounded-full border border-gold/30 px-6 py-3.5 text-sm font-bold text-ink transition-colors hover:border-gold/70 hover:bg-gold/[0.04]"
                >
                  <span className="text-gold">✦</span> {t('home.cta.secondary')}
                </Link>
              </div>
              <p className="mt-6 text-[11px] leading-relaxed text-faint">{t('home.cta.note')}</p>
            </>
          ) : (
            <div className="mt-12">
              <StoreBadges className="justify-center" />
              <p className="mt-6 text-[11px] leading-relaxed text-faint">
                {locale === 'tr'
                  ? 'SoulProfile mobil uygulamada. Web sürümü çok yakında.'
                  : 'SoulProfile is in the mobile app. Web version coming very soon.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* NASIL ÇALIŞIR */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-gold">{t('home.how.kicker')}</p>
          <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">{t('home.how.title')}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="card-surface relative rounded-3xl border border-panelBorder p-7 transition-all hover:border-gold/40"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="font-display text-3xl text-gold/40">{s.n}</span>
                <span className="text-3xl">{s.icon}</span>
              </div>
              <h3 className="font-display text-2xl text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* İKİ ANA YOL */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-gold">{t('home.paths.kicker')}</p>
          <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">{t('home.paths.title')}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {/* Kendi karnen */}
          <div className="surface-warm-grad relative overflow-hidden rounded-3xl border border-gold/40 p-7 transition-transform hover:-translate-y-1">
            <div className="starfield opacity-30" />
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15 text-4xl">✦</div>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.4em] text-gold">{t('home.path1.kicker')}</p>
              <h3 className="mt-2 font-display text-3xl text-ink">{t('home.path1.title')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t('home.path1.desc')}</p>
              <ul className="mt-5 space-y-2 text-sm text-ink">
                <li className="flex gap-2"><span className="text-gold">🌍</span><span>{t('home.path1.b1')}</span></li>
                <li className="flex gap-2"><span className="text-gold">🌳</span><span>{t('home.path1.b2')}</span></li>
                <li className="flex gap-2"><span className="text-gold">🎴</span><span>{t('home.path1.b3')}</span></li>
                <li className="flex gap-2"><span className="text-gold">📸</span><span>{t('home.path1.b4')}</span></li>
              </ul>
              <Link
                href="/birth"
                className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold py-3.5 text-[13px] font-bold tracking-wide text-[#1a0a40] shadow-glow transition-transform hover:scale-[1.01]"
              >
                {t('home.path1.cta')}
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
          </div>

          {/* İkili uyum */}
          <div className="surface-cool-grad relative overflow-hidden rounded-3xl border border-cosmic/50 p-7 transition-transform hover:-translate-y-1">
            <div className="starfield opacity-30" />
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cosmic/20 text-4xl">⚯</div>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.4em] text-cosmic">{t('home.path2.kicker')}</p>
              <h3 className="mt-2 font-display text-3xl text-ink">{t('home.path2.title')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t('home.path2.desc')}</p>
              <ul className="mt-5 space-y-2 text-sm text-ink">
                <li className="flex gap-2"><span className="text-cosmic">⚡</span><span>{t('home.path2.b1')}</span></li>
                <li className="flex gap-2"><span className="text-cosmic">◐</span><span>{t('home.path2.b2')}</span></li>
                <li className="flex gap-2"><span className="text-cosmic">💞</span><span>{t('home.path2.b3')}</span></li>
                <li className="flex gap-2"><span className="text-cosmic">📊</span><span>{t('home.path2.b4')}</span></li>
              </ul>
              <Link
                href="/compatibility"
                className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cosmic py-3.5 text-[13px] font-bold tracking-wide text-white shadow-glow transition-transform hover:scale-[1.01]"
              >
                {t('home.path2.cta')}
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 SEMBOLİK ARKETİP — twin flame yerine */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-gold">{t('home.archetypes.kicker')}</p>
          <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">{t('home.archetypes.title')}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { key: 'lesson', accent: '#9CAF88', glyph: '🌿' },
            { key: 'mirror', accent: '#C9A0A6', glyph: '🪞' },
            { key: 'union',  accent: '#C7B8E8', glyph: '✦' },
          ].map((a) => (
            <div
              key={a.key}
              className="card-surface rounded-3xl border p-6"
              style={{ borderColor: `${a.accent}40` }}
            >
              <div className="text-3xl">{a.glyph}</div>
              <h3 className="mt-3 font-display text-2xl text-ink">{t(`home.archetypes.${a.key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(`home.archetypes.${a.key}.desc`)}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-[11px] text-faint">{t('home.archetypes.disclaimer')}</p>
      </section>

      {/* 9 SİSTEM */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-gold">{t('home.systems.kicker')}</p>
          <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">{t('home.systems.title')}</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {systems.map((s) => (
            <div
              key={s.title}
              className="card-surface rounded-2xl border border-panelBorder p-4 transition-colors hover:border-gold/40"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{s.emoji}</span>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-ink">{s.title}</h3>
                  <p className="mt-0.5 text-xs leading-snug text-muted">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_0.85fr]">
          <div className="relative mx-auto aspect-[9/16] w-full max-w-xs overflow-hidden rounded-[28px] border border-panelBorder bg-[#0a0524] p-6 card-glow">
            <div className="absolute inset-0 bg-galaxy opacity-90" />
            <div className="starfield" />
            <div className="relative flex h-full flex-col items-center text-center">
              <span className="text-xs font-bold tracking-[0.4em] text-gold">PREVIEW</span>
              <span className="mt-2 text-4xl">✦</span>
              <h2 className="mt-3 font-display text-2xl leading-tight text-ink">{locale === 'tr' ? 'Ada Yıldız' : 'Ada Star'}</h2>
              <p className="mt-2 text-sm text-gold">Pleiadian · Heart Healer</p>
              <div className="mt-3 grid w-full grid-cols-3 gap-2 text-[10px] text-muted">
                <div className="rounded-lg border border-white/10 p-2"><div className="text-gold">♋</div>{locale === 'tr' ? 'Yengeç Güneş' : 'Cancer Sun'}</div>
                <div className="rounded-lg border border-white/10 p-2"><div className="text-gold">♓</div>{locale === 'tr' ? 'Balık Ay' : 'Pisces Moon'}</div>
                <div className="rounded-lg border border-white/10 p-2"><div className="text-gold">♍</div>{locale === 'tr' ? 'Başak Yükselen' : 'Virgo Rising'}</div>
              </div>
              <div className="mt-3 w-full rounded-xl border border-white/10 p-3 text-left">
                <p className="text-[9px] uppercase tracking-widest text-gold">Human Design</p>
                <p className="mt-1 font-display text-lg text-ink">Generator</p>
                <p className="text-[10px] text-muted">{locale === 'tr' ? 'Sakral Otorite · 3/5 Profil' : 'Sacral Authority · 3/5 Profile'}</p>
              </div>
              <p className="mt-auto text-[9px] tracking-widest text-faint">soulprofile.life</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-gold">{t('home.final.kicker')}</p>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">{t('home.final.title')}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">{t('home.final.desc')}</p>
            <Link
              href="/birth"
              className="group mt-6 inline-flex items-center gap-2.5 rounded-full bg-gold px-7 py-3.5 text-sm font-bold tracking-wide text-[#1a0a40] shadow-glow transition-transform hover:scale-[1.02]"
            >
              <span className="text-base">✦</span>
              {t('home.final.cta')}
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <p className="mt-4 text-xs text-faint">{t('home.final.note')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
