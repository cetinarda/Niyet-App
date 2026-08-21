'use client';

// Instagram hikâyesi için 9:16 paylaşım görseli.
// ---------------------------------------------------------------------------
// TASARIM KARARI: Kartta kişinin SONUCU değil, MERAK UYANDIRAN soru öne çıkar.
// Sebep: hikâyeyi izleyen kişi başkasının sonucunu görünce tıklamaz; "peki ben
// hangisiyim?" diye sorduğunda tıklar. Sonuç küçük bir rozet olarak durur.
//
// QR KOYMADIK: hikâyeyi izleyen kişi kendi ekranındaki QR'ı tarayamaz. Instagram'da
// tıklanabilirliğin gerçek yolu Bağlantı (Link) çıkartmasıdır; o yüzden adres
// büyük ve okunur yazılıyor, paylaşım anında da panoya kopyalanıyor.

import type { AttachmentStyle } from '@/lib/attachment';

const COLORS: Record<AttachmentStyle, string> = {
  secure: '#5bd9a0',
  anxious: '#f5b942',
  avoidant: '#c77dff',
  disorganized: '#7aa2f7',
};

type Props = {
  style: AttachmentStyle;
  styleName: string;
  emoji: string;
  locale: 'tr' | 'en';
  /** Ekranda görünmez, yalnızca yakalanır. */
  innerRef: React.RefObject<HTMLDivElement | null>;
};

export function AttachmentStoryCard({ style, styleName, emoji, locale, innerRef }: Props) {
  const tr = locale === 'tr';
  const c = COLORS[style];

  return (
    // Ekran dışına konumlandırılır (display:none OLMAZ — html-to-image
    // görünmeyen düğümü boş yakalar).
    <div style={{ position: 'fixed', left: -9999, top: 0, pointerEvents: 'none' }} aria-hidden>
      <div
        ref={innerRef}
        style={{
          width: 540,
          height: 960, // 9:16
          background: 'radial-gradient(120% 80% at 50% 18%, #1b1430 0%, #0d0a17 52%, #05040a 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '64px 44px',
          fontFamily: "'Inter', system-ui, sans-serif",
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* üst: marka */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, letterSpacing: 6, color: '#e8c07a', fontWeight: 700 }}>
            SOULID
          </div>
          <div style={{ marginTop: 8, fontSize: 12, letterSpacing: 1, color: 'rgba(255,255,255,0.42)' }}>
            {tr ? 'Sakin ailesinin bir ferdi' : 'Part of the Sakin family'}
          </div>
        </div>

        {/* orta: merak uyandıran soru */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 68, lineHeight: 1 }}>{emoji}</div>
          <div
            style={{
              marginTop: 26,
              fontSize: 42,
              lineHeight: 1.2,
              color: '#ffffff',
              fontWeight: 300,
              letterSpacing: -0.4,
            }}
          >
            {tr ? 'İlişkilerinde' : 'Do your'}
            <br />
            {tr ? 'dejavu mu' : 'relationships'}
            <br />
            {tr ? 'yaşıyorsun?' : 'keep rhyming?'}
          </div>

          <div
            style={{
              marginTop: 30,
              display: 'inline-block',
              padding: '10px 20px',
              borderRadius: 100,
              border: `1px solid ${c}66`,
              background: `${c}18`,
              color: c,
              fontSize: 16,
              letterSpacing: 0.4,
            }}
          >
            {tr ? 'Benimki: ' : 'Mine: '}
            <b>{styleName}</b>
          </div>

          <div
            style={{
              marginTop: 26,
              fontSize: 17,
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.62)',
              maxWidth: 380,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {tr
              ? '16 soru, 3 dakika. Yakınlık karşısındaki varsayılan hamleni gösteriyor.'
              : '16 questions, 3 minutes. It reveals your default move around closeness.'}
          </div>
        </div>

        {/* alt: adres */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, letterSpacing: 3, color: 'rgba(255,255,255,0.40)' }}>
            {tr ? 'SEN HANGİSİSİN?' : 'WHICH ONE ARE YOU?'}
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 25,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: 0.2,
            }}
          >
            soulprofile.life/attachment
          </div>
        </div>
      </div>
    </div>
  );
}
