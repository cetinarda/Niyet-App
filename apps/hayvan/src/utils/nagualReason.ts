// Kişisel Nagual kartındaki gerekçe satırı: "Ateş unsuru · Yaşam yolu 7 · Projektör tipi: ..."
// Dahili değerler Türkçe kalır (element 'ateş', HD tipi 'Jeneratör'); burada her dile çevrilir.
// Bilinmeyen dil İngilizceye düşer.

type Lang = 'tr' | 'en' | 'de' | 'es' | 'pt' | 'fr' | 'ja';

const ELEMENTS: Record<Lang, Record<string, string>> = {
  tr: { 'ateş': 'ateş', 'su': 'su', 'toprak': 'toprak', 'hava': 'hava' },
  en: { 'ateş': 'fire', 'su': 'water', 'toprak': 'earth', 'hava': 'air' },
  de: { 'ateş': 'Feuer', 'su': 'Wasser', 'toprak': 'Erde', 'hava': 'Luft' },
  es: { 'ateş': 'fuego', 'su': 'agua', 'toprak': 'tierra', 'hava': 'aire' },
  pt: { 'ateş': 'fogo', 'su': 'água', 'toprak': 'terra', 'hava': 'ar' },
  fr: { 'ateş': 'feu', 'su': 'eau', 'toprak': 'terre', 'hava': 'air' },
  ja: { 'ateş': '火', 'su': '水', 'toprak': '地', 'hava': '風' },
};

// HD tip adının görünen hâli. "Jeneratör" İngilizcede Generator (elektrik jeneratörü değil).
const HD_TYPES: Record<Lang, Record<string, string>> = {
  tr: { 'Jeneratör': 'Jeneratör', 'Manifesting Jeneratör': 'Manifesting Jeneratör', 'Projektör': 'Projektör', 'Manifestor': 'Manifestor', 'Reflektör': 'Reflektör' },
  en: { 'Jeneratör': 'Generator', 'Manifesting Jeneratör': 'Manifesting Generator', 'Projektör': 'Projector', 'Manifestor': 'Manifestor', 'Reflektör': 'Reflector' },
  de: { 'Jeneratör': 'Generator', 'Manifesting Jeneratör': 'Manifestierender Generator', 'Projektör': 'Projektor', 'Manifestor': 'Manifestor', 'Reflektör': 'Reflektor' },
  es: { 'Jeneratör': 'Generador', 'Manifesting Jeneratör': 'Generador manifestante', 'Projektör': 'Proyector', 'Manifestor': 'Manifestador', 'Reflektör': 'Reflector' },
  pt: { 'Jeneratör': 'Gerador', 'Manifesting Jeneratör': 'Gerador manifestante', 'Projektör': 'Projetor', 'Manifestor': 'Manifestador', 'Reflektör': 'Refletor' },
  fr: { 'Jeneratör': 'Générateur', 'Manifesting Jeneratör': 'Générateur manifesteur', 'Projektör': 'Projecteur', 'Manifestor': 'Manifesteur', 'Reflektör': 'Réflecteur' },
  ja: { 'Jeneratör': 'ジェネレーター', 'Manifesting Jeneratör': 'マニフェスティング・ジェネレーター', 'Projektör': 'プロジェクター', 'Manifestor': 'マニフェスター', 'Reflektör': 'リフレクター' },
};

// "bu dönemde ___ desteklemek için" boşluğuna giren ifade (Türkçede belirtme hâli ekiyle).
const HD_REASONS: Record<Lang, Record<string, string>> = {
  tr: { 'Jeneratör': 'yanıtlama gücünü', 'Manifesting Jeneratör': 'çok boyutlu enerjini', 'Projektör': 'yönlendirme sezgini', 'Manifestor': 'başlatma gücünü', 'Reflektör': 'yansıtma bilgeliğini' },
  en: { 'Jeneratör': 'your power of response', 'Manifesting Jeneratör': 'your multidimensional energy', 'Projektör': 'your guiding intuition', 'Manifestor': 'your initiating power', 'Reflektör': 'your reflective wisdom' },
  de: { 'Jeneratör': 'deine Kraft des Antwortens', 'Manifesting Jeneratör': 'deine vielschichtige Energie', 'Projektör': 'deine lenkende Intuition', 'Manifestor': 'deine Kraft des Anstoßens', 'Reflektör': 'deine spiegelnde Weisheit' },
  es: { 'Jeneratör': 'tu poder de respuesta', 'Manifesting Jeneratör': 'tu energía multidimensional', 'Projektör': 'tu intuición guía', 'Manifestor': 'tu poder de iniciar', 'Reflektör': 'tu sabiduría reflectora' },
  pt: { 'Jeneratör': 'o teu poder de resposta', 'Manifesting Jeneratör': 'a tua energia multidimensional', 'Projektör': 'a tua intuição orientadora', 'Manifestor': 'o teu poder de iniciar', 'Reflektör': 'a tua sabedoria refletora' },
  fr: { 'Jeneratör': 'ton pouvoir de réponse', 'Manifesting Jeneratör': 'ton énergie multidimensionnelle', 'Projektör': 'ton intuition qui guide', 'Manifestor': "ton pouvoir d'initier", 'Reflektör': 'ta sagesse de miroir' },
  ja: { 'Jeneratör': '応答する力', 'Manifesting Jeneratör': '多次元的なエネルギー', 'Projektör': '導く直感', 'Manifestor': '始める力', 'Reflektör': '映し出す知恵' },
};

const FALLBACK_REASON: Record<Lang, string> = {
  tr: 'içsel gücünü',
  en: 'your inner strength',
  de: 'deine innere Kraft',
  es: 'tu fuerza interior',
  pt: 'a tua força interior',
  fr: 'ta force intérieure',
  ja: '内なる力',
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const TEMPLATES: Record<Lang, (el: string, n: number, type: string, reason: string) => string> = {
  tr: (el, n, type, reason) => `${cap(el)} unsuru · Yaşam yolu ${n} · ${type} tipi: bu dönemde ${reason} desteklemek için seninle.`,
  en: (el, n, type, reason) => `${cap(el)} element · Life path ${n} · ${type} type: here to support ${reason} in this period.`,
  de: (el, n, type, reason) => `Element ${el} · Lebensweg ${n} · Typ ${type}: in dieser Zeit an deiner Seite, um ${reason} zu stärken.`,
  es: (el, n, type, reason) => `Elemento ${el} · Camino de vida ${n} · Tipo ${type}: está contigo en este periodo para apoyar ${reason}.`,
  pt: (el, n, type, reason) => `Elemento ${el} · Caminho de vida ${n} · Tipo ${type}: está contigo neste período para apoiar ${reason}.`,
  fr: (el, n, type, reason) => `Élément ${el} · Chemin de vie ${n} · Type ${type} : à tes côtés en cette période pour soutenir ${reason}.`,
  ja: (el, n, type, reason) => `${el}のエレメント · ライフパス${n} · ${type}タイプ：この時期、あなたの${reason}を支えるためにそばにいます。`,
};

export const NAGUAL_REASON_LANGS = Object.keys(TEMPLATES) as Lang[];

export function buildNagualReason(lang: string, element: string, lifePath: number, hdType: string): string {
  const base = String(lang || 'tr').slice(0, 2).toLowerCase();
  const L: Lang = (base in TEMPLATES ? base : 'en') as Lang;
  const el = ELEMENTS[L][element] || ELEMENTS.en[element] || element;
  const type = HD_TYPES[L][hdType] || HD_TYPES.en[hdType] || hdType;
  const reason = HD_REASONS[L][hdType] || FALLBACK_REASON[L];
  return TEMPLATES[L](el, lifePath, type, reason);
}
