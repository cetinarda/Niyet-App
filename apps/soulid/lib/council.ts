// ── 7'LER MECLİSİ ───────────────────────────────────────────────────────────
// Doğum tarihine dayalı, KUŞAK/NESİL psikolojisi okuması. Karneden (astroloji)
// KASITLI olarak AYRI: burada doğum haritası yok, yalnızca "o dönemde doğan
// insanların ortak deneyimi" temelli 7 kısa analiz.
//
// AI BACKEND KARARI: SoulID embed'inin kendi AI çağrıları uzak host'a
// (soulprofile.life) gider ve o backend BU REPODA DEĞİL, yeni endpoint
// eklenemez. Bunun yerine SAKİN HOST'un netlify fonksiyonu (`ai-call`)
// kullanılıyor: bu repoda, main -> Netlify ile deploy edilebilir.
//   - Web embed (sakin.life / *.netlify.app): aynı-origin relative çağrı.
//   - iOS native (capacitor://localhost): absolute https://sakin.life; bu origin
//     ai-call'un allowlist'inde ("capacitor://localhost" allowed).

import { isCapacitorNative } from './platform';
import { fetchWithTimeout } from './fetch-timeout';

export type CouncilSection = { n: number; title: string; body: string };
export type CouncilResult = { sections: CouncilSection[] };

const SAKIN_HOST = 'https://sakin.life';

function aiCallUrl(): string {
  // Web (herhangi bir http origin: sakin.life ya da deploy preview): aynı origin.
  if (
    typeof window !== 'undefined' &&
    !isCapacitorNative() &&
    window.location.protocol.startsWith('http')
  ) {
    return '/.netlify/functions/ai-call';
  }
  // Native: mutlak host (Origin başlığı capacitor://localhost, allowlist'te).
  return `${SAKIN_HOST}/.netlify/functions/ai-call`;
}

// 7 meclis başlığı (görünürde de kullanılıyor, parse'ta değil: parse [n] ile).
export const COUNCIL_TITLES: Record<'tr' | 'en', string[]> = {
  tr: [
    'Çocukluk Arka Planı',
    'Kişilik Evrim Haritası',
    'Mesleki Pusula',
    'İlişki Deseni',
    'Finansal Zihniyet',
    'Gizli Tuzak Dedektörü',
    'Hayat Yol Haritası',
  ],
  en: [
    'Childhood Background',
    'Personality Evolution',
    'Career Compass',
    'Relationship Pattern',
    'Financial Mindset',
    'Hidden Trap Detector',
    'Life Roadmap',
  ],
};

function buildSystem(locale: 'tr' | 'en'): string {
  if (locale === 'en') {
    return [
      'You are the Council of Sevens: seven analysts who read a person only through the lens of the GENERATION they were born into.',
      'You work ONLY from the birth date: global events, cultural shifts, technology and economy of that era, and generational psychology.',
      'This is NOT astrology. Never mention zodiac, planets, birth charts, numerology or horoscopes. If the date alone is not enough, reason from the birth-year cohort.',
      'Write a SHORT summary for each of the seven sections (about 3 to 4 sentences each), warm, concrete and second person ("you").',
      'Output EXACTLY seven sections, each starting on its own line with its number in square brackets, like: [1] then the text. No headings, no titles, no extra text before [1] or after [7].',
      'Never use the long dash characters (em dash, en dash). Use a plain hyphen, comma or a new sentence instead.',
    ].join(' ');
  }
  return [
    "Sen 7'ler Meclisi'sin: bir insanı YALNIZCA doğduğu NESLİN penceresinden okuyan yedi çözümleyici.",
    'Sadece doğum tarihinden çalışırsın: o dönemin küresel olayları, kültürel değişimleri, teknolojisi, ekonomisi ve nesil psikolojisi.',
    'Bu ASTROLOJİ DEĞİL. Burç, gezegen, doğum haritası, numeroloji ya da yıldız falına ASLA değinme. Tarih tek başına yetmiyorsa doğum yılı kuşağından akıl yürüt.',
    'Yedi bölümün her biri için KISA bir özet yaz (her biri yaklaşık 3-4 cümle), sıcak, somut ve ikinci tekil şahıs ("sen") diliyle.',
    'TAM OLARAK yedi bölüm çıkar; her biri kendi satırında köşeli parantez içinde numarasıyla başlasın: [1] sonra metin. Başlık yazma, [1] öncesine ya da [7] sonrasına fazladan metin koyma.',
    'Uzun çizgi (em dash, en dash) karakterlerini asla kullanma; yerine düz kısa çizgi, virgül ya da ayrı cümle kullan.',
  ].join(' ');
}

function buildUser(birthDate: string, locale: 'tr' | 'en'): string {
  const P =
    locale === 'en'
      ? [
          '1. Childhood Background: describe the most common childhood experiences of people born then, shaped by global events, culture and generational psychology, and how these shaped their thinking, behaviour and early self-image.',
          '2. Personality Evolution: the personality traits and worldview likely to form over time, and where exactly this generation is unique compared to those born a few years before and after.',
          '3. Career Compass: career paths or sectors this cohort naturally fits, given the economy, cultural trends and technology of the era, and how these connect to generational advantages and long-term fulfilment.',
          '4. Relationship Pattern: common relationship tendencies (communication style, attachment tendencies, conflict handling, growth areas). Do not mention astrology.',
          '5. Financial Mindset: how this cohort tends to approach money, risk, saving and long-term wealth, plus common advantages, blind spots and thought patterns.',
          '6. Hidden Trap Detector: psychological blind spots shaped by this generation timeline, how they show up day to day, and practical strategies to turn them into advantages.',
          '7. Life Roadmap: the key opportunities, challenges and growth points across life stages, as a clear roadmap of what to focus on at each stage.',
        ]
      : [
          '1. Çocukluk Arka Planı: o dönemde doğan bireylerin küresel olaylar, kültür ve nesil psikolojisiyle şekillenen en yaygın çocukluk deneyimleri ve bunların düşünce tarzını, davranışları ve erken benlik algısını nasıl şekillendirdiği.',
          '2. Kişilik Evrim Haritası: zamanla oluşabilecek kişilik özellikleri ve dünya görüşü; birkaç yıl önce ve sonra doğanlarla karşılaştırıldığında bu neslin tam olarak nerede eşsiz olduğu.',
          '3. Mesleki Pusula: dönemin ekonomisi, kültürel eğilimleri ve teknolojisi göz önünde tutularak doğal uyum sağlanabilecek kariyer yolları veya sektörler; bunların nesil avantajları ve uzun vadeli tatminle bağı.',
          '4. İlişki Deseni: yaygın ilişki eğilimleri (iletişim tarzı, bağlanma eğilimleri, çatışma yönetimi, gelişim alanları). Astrolojiye hiç değinme.',
          '5. Finansal Zihniyet: bu neslin paraya, riske, birikime ve uzun vadeli servete yaklaşımı; yaygın avantajlar, kör noktalar ve karar kalıpları.',
          '6. Gizli Tuzak Dedektörü: neslin zaman çizgisinin şekillendirdiği psikolojik kör noktalar, günlük hayatta nasıl ortaya çıktıkları ve bunları avantaja çevirmek için pratik stratejiler.',
          '7. Hayat Yol Haritası: hayatın farklı aşamalarındaki kilit fırsatlar, zorluklar ve büyüme noktaları; her aşamada neye odaklanılacağını gösteren net bir yol haritası.',
        ];
  const intro =
    locale === 'en'
      ? `My birth date is ${birthDate}. Give the seven-section generational reading.`
      : `Doğum tarihim ${birthDate}. Yedi bölümlük nesil okumasını ver.`;
  return `${intro}\n\n${P.join('\n')}`;
}

function parseSections(text: string, locale: 'tr' | 'en'): CouncilSection[] {
  const titles = COUNCIL_TITLES[locale];
  const out: CouncilSection[] = [];
  const re = /\[(\d)\]\s*([\s\S]*?)(?=\n?\[\d\]|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const n = parseInt(m[1], 10);
    const body = m[2].trim();
    if (n >= 1 && n <= 7 && body) {
      out.push({ n, title: titles[n - 1] || `${n}`, body });
    }
  }
  // Sıra + tekrarsız (aynı numara iki kez gelirse ilki kalır).
  const seen = new Set<number>();
  return out
    .filter((s) => (seen.has(s.n) ? false : (seen.add(s.n), true)))
    .sort((a, b) => a.n - b.n);
}

/**
 * 7'ler Meclisi okumasını üretir. Başarısızsa hata fırlatır (çağıran taraf
 * kullanıcıya nazik bir mesaj gösterir + tekrar dener).
 */
export async function runCouncil(
  birthDate: string,
  locale: 'tr' | 'en',
): Promise<CouncilResult> {
  const res = await fetchWithTimeout(
    aiCallUrl(),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: buildSystem(locale),
        messages: [{ role: 'user', content: buildUser(birthDate, locale) }],
        max_tokens: 2000,
        lang: locale,
      }),
    },
    20_000,
  );
  if (!res.ok) throw new Error(`ai-call ${res.status}`);
  const data = (await res.json()) as { text?: string; error?: string };
  const text = (data.text || '').trim();
  if (!text) throw new Error('empty');
  const sections = parseSections(text, locale);
  if (sections.length < 4) throw new Error('parse'); // çoğu bölüm gelmediyse başarısız say
  return { sections };
}
