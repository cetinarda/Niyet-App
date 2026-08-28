'use client';

/**
 * İKİ DAİRE: "Siz" + partner. Eşleşme ekranında ve sonuç ekranında aynı
 * bileşen kullanılır, böylece kullanıcı akış boyunca aynı görseli takip eder.
 *
 * TASARIM NOTU (kullanıcı: "özgünlüğümüzü koru, kişi farklı bir appe gittiğini
 * düşünmesin"): referans görselleri AKIŞ için örnekti, GÖRÜNÜM için değil.
 * Burada Sakin'in kendi dili var: ince hatlar, altın/kozmik palet, Jost ile
 * uppercase ve geniş harf aralığı, ✦ işareti. Hazır kütüphane görünümü yok.
 *
 * "Siz" dairesi sırayla şunu gösterir:
 *   1) Galaktik Kimlik'e yüklenen fotoğraf (Sakin `sakin_avatar` anahtarı),
 *   2) yoksa burç sembolü,
 *   3) o da yoksa ✦.
 */

const SIGN_GLYPH: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

export function signGlyph(sign?: string | null): string {
  return (sign && SIGN_GLYPH[sign]) || '✦';
}

function Ring({
  children,
  tone,
  dashed = false,
  onClick,
  label,
}: {
  children: React.ReactNode;
  tone: 'gold' | 'cosmic';
  dashed?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  const ringColor = tone === 'gold' ? 'var(--gold)' : 'var(--cosmic)';
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={label}
      className="group flex flex-col items-center gap-3"
      // iOS WKWebView native buton görünümünü çizip şişiriyor: appearance kapalı.
      style={{ WebkitAppearance: 'none', appearance: 'none', background: 'none', border: 0, padding: 0 }}
    >
      <span
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: 122,
          height: 122,
          border: `1px ${dashed ? 'dashed' : 'solid'} ${ringColor}`,
          background: dashed
            ? 'transparent'
            : `radial-gradient(circle at 50% 35%, ${ringColor}22, transparent 70%)`,
          boxShadow: dashed ? 'none' : `0 0 30px ${ringColor}33`,
          opacity: dashed ? 0.65 : 1,
        }}
      >
        {children}
      </span>
    </Tag>
  );
}

export function PairAvatars({
  meLabel,
  meSign,
  mePhoto,
  otherLabel,
  otherSign,
  onAdd,
  addLabel,
}: {
  meLabel: string;
  meSign?: string | null;
  mePhoto?: string | null;
  otherLabel: string;
  /** Partner belliyse burcu; boşsa sağ daire "ekle" halinde kalır. */
  otherSign?: string | null;
  onAdd?: () => void;
  addLabel?: string;
}) {
  const filled = !!otherSign;
  return (
    <div className="flex items-start justify-center gap-5 font-brand">
      <div className="flex flex-col items-center">
        <Ring tone="gold">
          {mePhoto ? (
            <span
              className="block rounded-full"
              style={{ width: 106, height: 106, background: `url(${mePhoto}) center/cover` }}
            />
          ) : (
            <span style={{ fontSize: 44, lineHeight: 1, color: 'var(--gold)' }}>{signGlyph(meSign)}</span>
          )}
        </Ring>
        <span className="mt-3 text-[11px] uppercase tracking-[0.3em] text-muted">{meLabel}</span>
      </div>

      <span
        className="select-none text-center text-2xl font-light text-faint"
        style={{ lineHeight: '122px' }}
        aria-hidden
      >
        +
      </span>

      <div className="flex flex-col items-center">
        <Ring
          tone="cosmic"
          dashed={!filled}
          onClick={filled ? undefined : onAdd}
          label={filled ? undefined : addLabel}
        >
          {filled ? (
            <span style={{ fontSize: 44, lineHeight: 1, color: 'var(--cosmic)' }}>{signGlyph(otherSign)}</span>
          ) : (
            <span
              className="flex items-center justify-center rounded-full text-2xl font-light"
              style={{
                width: 46,
                height: 46,
                color: 'var(--cosmic)',
                border: '1px solid var(--cosmic)',
                background: 'var(--cosmic)11',
              }}
            >
              +
            </span>
          )}
        </Ring>
        <span className="mt-3 text-[11px] uppercase tracking-[0.3em] text-muted">{otherLabel}</span>
      </div>
    </div>
  );
}
