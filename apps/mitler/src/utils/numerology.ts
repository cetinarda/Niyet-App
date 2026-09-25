const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, Ç: 4, D: 5, E: 6, F: 7, G: 8, Ğ: 9,
  H: 1, I: 2, İ: 3, J: 4, K: 5, L: 6, M: 7, N: 8, O: 9,
  Ö: 1, P: 2, R: 3, S: 4, Ş: 5, T: 6, U: 7, Ü: 8, V: 9,
  Y: 1, Z: 2,
};

const VOWELS = new Set(['A', 'E', 'I', 'İ', 'O', 'Ö', 'U', 'Ü']);

function reduce(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  while (n > 9) {
    n = String(n).split('').reduce((s, d) => s + parseInt(d, 10), 0);
    if (n === 11 || n === 22 || n === 33) return n;
  }
  return n;
}

export function calcLifePath(birthDate: string): number {
  const digits = birthDate.replace(/-/g, '').split('').map(Number);
  return reduce(digits.reduce((a, b) => a + b, 0));
}

export function calcExpression(fullName: string): number {
  const sum = fullName.toUpperCase().replace(/\s/g, '').split('')
    .reduce((s, l) => s + (LETTER_VALUES[l] || 0), 0);
  return reduce(sum);
}

export function calcSoulUrge(fullName: string): number {
  const sum = fullName.toUpperCase().replace(/\s/g, '').split('')
    .filter(l => VOWELS.has(l))
    .reduce((s, l) => s + (LETTER_VALUES[l] || 0), 0);
  return reduce(sum);
}

export function calcPersonality(fullName: string): number {
  const sum = fullName.toUpperCase().replace(/\s/g, '').split('')
    .filter(l => !VOWELS.has(l) && LETTER_VALUES[l] !== undefined)
    .reduce((s, l) => s + (LETTER_VALUES[l] || 0), 0);
  return reduce(sum);
}

export interface NumerologyProfile {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
}

export function calcNumerology(fullName: string, birthDate: string): NumerologyProfile {
  return {
    lifePath: calcLifePath(birthDate),
    expression: calcExpression(fullName),
    soulUrge: calcSoulUrge(fullName),
    personality: calcPersonality(fullName),
  };
}

export type NumLang = string;

export interface LifePathMeaning { title: string; keyword: string; desc: string }

export const LIFE_PATH_MEANINGS: Record<number, LifePathMeaning> = {
  1: { title: 'Öncü', keyword: 'Liderlik', desc: 'Yeni yollar açmak, bağımsız düşünmek ve öncü olmak senin doğandasın. Cesaret ve irade en büyük güçlerin.' },
  2: { title: 'Arabulucu', keyword: 'Denge', desc: 'Sezgi, uyum ve işbirliği enerjisi taşırsın. İlişkilerde köprü kurma ve dinleme gücün eşsizdir.' },
  3: { title: 'Yaratıcı', keyword: 'İfade', desc: 'Yaratıcılık, neşe ve özgün ifade seni tanımlar. Sanatın, müziğin ve sözcüklerin dünyasında parlarsın.' },
  4: { title: 'Yapıcı', keyword: 'Düzen', desc: 'Çalışkanlık, güvenilirlik ve sistematik düşünce temel enerjin. Sağlam temeller inşa etmeyi seversin.' },
  5: { title: 'Özgür Ruh', keyword: 'Özgürlük', desc: 'Macera, değişim ve özgürlük senin özündedir. Her deneyimden öğrenir, hayatı dolu yaşarsın.' },
  6: { title: 'Sevgi Elçisi', keyword: 'Şefkat', desc: 'Sorumluluk, derin sevgi ve hizmet etme kaderinde var. Ailenin ve toplumunun kalbi olursun.' },
  7: { title: 'Bilge', keyword: 'Derinlik', desc: 'Manevi arayış, derin analiz ve içe dönüş yolunu aydınlatır. Sorular sormak ve cevaplar aramak ruhunun işidir.' },
  8: { title: 'Güç', keyword: 'Dönüşüm', desc: 'Maddi ve manevi güç dengesini bulmak hayat yolun. Büyük hedefler için doğdun, liderlik enerjin güçlüdür.' },
  9: { title: 'Öğretmen', keyword: 'Merhamet', desc: 'Evrensel sevgi, merhamet ve insanlığa hizmet enerjisi taşırsın. Döngülerin tamamlanması ve bırakabilme gücün var.' },
  11: { title: 'Aydınlayıcı', keyword: 'Sezgi', desc: 'Usta sayı 11: Yüksek sezgi ve manevi aydınlanma yolundaki rehbersin. İlham kaynağısın.' },
  22: { title: 'Usta Yapıcı', keyword: 'Vizyon', desc: 'Usta sayı 22: Büyük hayalleri somut gerçeğe dönüştürme gücüne sahipsin. Dünyanı değiştirirsin.' },
  33: { title: 'Usta Öğretmen', keyword: 'Evrensel Sevgi', desc: 'Usta sayı 33: Sonsuz şefkat, iyileştirme ve evrensel öğretmenlik misyonundansın.' },
};

const LIFE_PATH_EN: Record<number, LifePathMeaning> = {
  1: { title: 'Pioneer', keyword: 'Leadership', desc: 'Opening new paths, independent thinking and being a forerunner are in your nature. Courage and will are your greatest powers.' },
  2: { title: 'Mediator', keyword: 'Balance', desc: 'You carry the energy of intuition, harmony and cooperation. Your power to build bridges in relationships and to listen is unique.' },
  3: { title: 'Creator', keyword: 'Expression', desc: 'Creativity, joy and authentic expression define you. You shine in the world of art, music and words.' },
  4: { title: 'Builder', keyword: 'Order', desc: 'Diligence, reliability and systematic thinking are your basic energy. You love to build firm foundations.' },
  5: { title: 'Free Spirit', keyword: 'Freedom', desc: 'Adventure, change and freedom are your essence. You learn from every experience and live life fully.' },
  6: { title: 'Messenger of Love', keyword: 'Compassion', desc: 'Responsibility, deep love and serving are in your destiny. You become the heart of your family and your community.' },
  7: { title: 'Sage', keyword: 'Depth', desc: 'Spiritual quest, deep analysis and turning inward light up your path. To ask questions and seek answers is your soul\'s work.' },
  8: { title: 'Power', keyword: 'Transformation', desc: 'Finding the balance of material and spiritual power is your life path. You were born for big goals; your leadership energy is strong.' },
  9: { title: 'Teacher', keyword: 'Mercy', desc: 'You carry universal love, mercy and the energy of serving humanity. You have the power to complete cycles and to release.' },
  11: { title: 'Illuminator', keyword: 'Intuition', desc: 'Master number 11: a guide on the path of high intuition and spiritual enlightenment. You are a source of inspiration.' },
  22: { title: 'Master Builder', keyword: 'Vision', desc: 'Master number 22: you have the power to turn great dreams into concrete reality. You change your world.' },
  33: { title: 'Master Teacher', keyword: 'Universal Love', desc: 'Master number 33: you carry the mission of endless compassion, healing and universal teaching.' },
};

type LifePathText = LifePathMeaning;

const LIFE_PATH_DE: Record<number, LifePathText> = {
  1: { title: 'Wegbereiter', keyword: 'Führung', desc: 'Neue Wege zu öffnen, unabhängig zu denken und voranzugehen liegt in deiner Natur. Mut und Willenskraft sind deine größten Stärken.' },
  2: { title: 'Vermittler', keyword: 'Gleichgewicht', desc: 'Du trägst die Energie von Intuition, Harmonie und Zusammenarbeit. Deine Gabe, in Beziehungen Brücken zu bauen und zuzuhören, ist einzigartig.' },
  3: { title: 'Schöpfer', keyword: 'Ausdruck', desc: 'Kreativität, Freude und echter Ausdruck zeichnen dich aus. In der Welt der Kunst, der Musik und der Worte strahlst du.' },
  4: { title: 'Erbauer', keyword: 'Ordnung', desc: 'Fleiß, Verlässlichkeit und systematisches Denken sind deine Grundenergie. Du liebst es, feste Fundamente zu legen.' },
  5: { title: 'Freigeist', keyword: 'Freiheit', desc: 'Abenteuer, Wandel und Freiheit sind dein Wesenskern. Du lernst aus jeder Erfahrung und lebst das Leben in voller Fülle.' },
  6: { title: 'Botschafter der Liebe', keyword: 'Mitgefühl', desc: 'Verantwortung, tiefe Liebe und das Dienen liegen in deiner Bestimmung. Du wirst zum Herzen deiner Familie und deiner Gemeinschaft.' },
  7: { title: 'Weiser', keyword: 'Tiefe', desc: 'Spirituelle Suche, tiefgehende Betrachtung und Einkehr erhellen deinen Weg. Fragen zu stellen und nach Antworten zu suchen ist die Aufgabe deiner Seele.' },
  8: { title: 'Kraft', keyword: 'Wandlung', desc: 'Das Gleichgewicht zwischen materieller und spiritueller Kraft zu finden ist dein Lebensweg. Du bist für große Ziele geboren, deine Führungsenergie ist stark.' },
  9: { title: 'Lehrer', keyword: 'Barmherzigkeit', desc: 'Du trägst die Energie universeller Liebe, der Barmherzigkeit und des Dienstes an der Menschheit. Du hast die Kraft, Kreise zu schließen und loszulassen.' },
  11: { title: 'Erleuchter', keyword: 'Intuition', desc: 'Meisterzahl 11: Du bist ein Wegweiser auf dem Pfad hoher Intuition und spiritueller Erleuchtung. Du bist eine Quelle der Inspiration.' },
  22: { title: 'Meister-Erbauer', keyword: 'Vision', desc: 'Meisterzahl 22: Du hast die Kraft, große Träume in greifbare Wirklichkeit zu verwandeln. Du veränderst deine Welt.' },
  33: { title: 'Meister-Lehrer', keyword: 'Universelle Liebe', desc: 'Meisterzahl 33: Du trägst die Aufgabe grenzenlosen Mitgefühls, der Heilung und des universellen Lehrens.' },
};

const LIFE_PATH_ES: Record<number, LifePathText> = {
  1: { title: 'Pionero', keyword: 'Liderazgo', desc: 'Abrir caminos nuevos, pensar con independencia e ir por delante está en tu naturaleza. El valor y la voluntad son tus mayores fuerzas.' },
  2: { title: 'Mediador', keyword: 'Equilibrio', desc: 'Llevas la energía de la intuición, la armonía y la cooperación. Tu capacidad de tender puentes en las relaciones y de escuchar es única.' },
  3: { title: 'Creador', keyword: 'Expresión', desc: 'La creatividad, la alegría y la expresión auténtica te definen. Brillas en el mundo del arte, la música y las palabras.' },
  4: { title: 'Constructor', keyword: 'Orden', desc: 'La diligencia, la fiabilidad y el pensamiento sistemático son tu energía de base. Te gusta construir cimientos sólidos.' },
  5: { title: 'Espíritu libre', keyword: 'Libertad', desc: 'La aventura, el cambio y la libertad están en tu esencia. Aprendes de cada experiencia y vives la vida con plenitud.' },
  6: { title: 'Mensajero del amor', keyword: 'Compasión', desc: 'La responsabilidad, el amor profundo y el servicio forman parte de tu destino. Te conviertes en el corazón de tu familia y de tu comunidad.' },
  7: { title: 'Sabio', keyword: 'Profundidad', desc: 'La búsqueda espiritual, el análisis profundo y la introspección iluminan tu camino. Hacer preguntas y buscar respuestas es tarea de tu alma.' },
  8: { title: 'Poder', keyword: 'Transformación', desc: 'Encontrar el equilibrio entre el poder material y el espiritual es tu camino de vida. Naciste para grandes metas y tu energía de liderazgo es fuerte.' },
  9: { title: 'Maestro', keyword: 'Misericordia', desc: 'Llevas la energía del amor universal, la misericordia y el servicio a la humanidad. Tienes la fuerza de cerrar ciclos y de soltar.' },
  11: { title: 'Iluminador', keyword: 'Intuición', desc: 'Número maestro 11: eres guía en el camino de la intuición elevada y la iluminación espiritual. Eres fuente de inspiración.' },
  22: { title: 'Maestro constructor', keyword: 'Visión', desc: 'Número maestro 22: tienes el poder de convertir grandes sueños en realidad concreta. Transformas tu mundo.' },
  33: { title: 'Gran maestro', keyword: 'Amor universal', desc: 'Número maestro 33: tu misión es la compasión infinita, la sanación y la enseñanza universal.' },
};

const LIFE_PATH_PT: Record<number, LifePathText> = {
  1: { title: 'Pioneiro', keyword: 'Liderança', desc: 'Abrir novos caminhos, pensar de forma independente e ir à frente está na tua natureza. A coragem e a vontade são as tuas maiores forças.' },
  2: { title: 'Mediador', keyword: 'Equilíbrio', desc: 'Trazes a energia da intuição, da harmonia e da cooperação. A tua capacidade de criar pontes nas relações e de escutar é única.' },
  3: { title: 'Criador', keyword: 'Expressão', desc: 'A criatividade, a alegria e a expressão autêntica definem-te. Brilhas no mundo da arte, da música e das palavras.' },
  4: { title: 'Construtor', keyword: 'Ordem', desc: 'A dedicação, a fiabilidade e o pensamento sistemático são a tua energia de base. Gostas de construir alicerces sólidos.' },
  5: { title: 'Espírito livre', keyword: 'Liberdade', desc: 'A aventura, a mudança e a liberdade estão na tua essência. Aprendes com cada experiência e vives a vida em pleno.' },
  6: { title: 'Mensageiro do amor', keyword: 'Compaixão', desc: 'A responsabilidade, o amor profundo e o serviço fazem parte do teu destino. Tornas-te o coração da tua família e da tua comunidade.' },
  7: { title: 'Sábio', keyword: 'Profundidade', desc: 'A busca espiritual, a análise profunda e a introspeção iluminam o teu caminho. Fazer perguntas e procurar respostas é o trabalho da tua alma.' },
  8: { title: 'Poder', keyword: 'Transformação', desc: 'Encontrar o equilíbrio entre o poder material e o espiritual é o teu caminho de vida. Nasceste para grandes objetivos e a tua energia de liderança é forte.' },
  9: { title: 'Mestre', keyword: 'Misericórdia', desc: 'Trazes a energia do amor universal, da misericórdia e do serviço à humanidade. Tens a força de fechar ciclos e de deixar ir.' },
  11: { title: 'Iluminador', keyword: 'Intuição', desc: 'Número mestre 11: és guia no caminho da intuição elevada e da iluminação espiritual. És uma fonte de inspiração.' },
  22: { title: 'Mestre construtor', keyword: 'Visão', desc: 'Número mestre 22: tens o poder de transformar grandes sonhos em realidade concreta. Mudas o teu mundo.' },
  33: { title: 'Grande mestre', keyword: 'Amor universal', desc: 'Número mestre 33: a tua missão é a compaixão infinita, a cura e o ensino universal.' },
};

const LIFE_PATH_FR: Record<number, LifePathText> = {
  1: { title: 'Pionnier', keyword: 'Leadership', desc: "Ouvrir de nouveaux chemins, penser par toi-même et montrer la voie est dans ta nature. Le courage et la volonté sont tes plus grandes forces." },
  2: { title: 'Médiateur', keyword: 'Équilibre', desc: "Tu portes l'énergie de l'intuition, de l'harmonie et de la coopération. Ton don pour créer des ponts dans les relations et pour écouter est unique." },
  3: { title: 'Créateur', keyword: 'Expression', desc: "La créativité, la joie et l'expression authentique te définissent. Tu rayonnes dans le monde de l'art, de la musique et des mots." },
  4: { title: 'Bâtisseur', keyword: 'Ordre', desc: "L'assiduité, la fiabilité et la pensée méthodique sont ton énergie de fond. Tu aimes bâtir des fondations solides." },
  5: { title: 'Esprit libre', keyword: 'Liberté', desc: "L'aventure, le changement et la liberté sont ton essence. Tu apprends de chaque expérience et tu vis pleinement." },
  6: { title: "Messager de l'amour", keyword: 'Compassion', desc: "La responsabilité, l'amour profond et le service font partie de ton destin. Tu deviens le cœur de ta famille et de ta communauté." },
  7: { title: 'Sage', keyword: 'Profondeur', desc: "La quête spirituelle, l'analyse profonde et le retour sur soi éclairent ton chemin. Poser des questions et chercher des réponses est l'œuvre de ton âme." },
  8: { title: 'Puissance', keyword: 'Transformation', desc: "Trouver l'équilibre entre puissance matérielle et spirituelle est ton chemin de vie. Les grands objectifs t'appellent, ton énergie de leader est forte." },
  9: { title: 'Enseignant', keyword: 'Miséricorde', desc: "Tu portes l'énergie de l'amour universel, de la miséricorde et du service à l'humanité. Tu as la force de clore les cycles et de lâcher prise." },
  11: { title: 'Éclaireur', keyword: 'Intuition', desc: "Nombre maître 11 : tu es un guide sur le chemin de la haute intuition et de l'éveil spirituel. Tu es une source d'inspiration." },
  22: { title: 'Maître bâtisseur', keyword: 'Vision', desc: "Nombre maître 22 : tu as le pouvoir de transformer de grands rêves en réalité concrète. Tu changes ton monde." },
  33: { title: 'Maître enseignant', keyword: 'Amour universel', desc: "Nombre maître 33 : ta mission est la compassion infinie, la guérison et l'enseignement universel." },
};

const LIFE_PATH_JA: Record<number, LifePathText> = {
  1: { title: '先駆者', keyword: 'リーダーシップ', desc: '新しい道を切り開き、自由に考え、先頭に立つことはあなたの本質です。勇気と意志があなたの最大の力です。' },
  2: { title: '調停者', keyword: 'バランス', desc: '直感、調和、協力のエネルギーを持っています。人との間に橋をかけ、耳を傾ける力はかけがえのないものです。' },
  3: { title: '創造者', keyword: '表現', desc: '創造性、喜び、そして自分らしい表現があなたを形づくります。芸術、音楽、言葉の世界で輝きます。' },
  4: { title: '建設者', keyword: '秩序', desc: '勤勉さ、信頼性、体系的な思考があなたの基本のエネルギーです。しっかりとした土台を築くことを好みます。' },
  5: { title: '自由な魂', keyword: '自由', desc: '冒険、変化、自由があなたの本質です。あらゆる経験から学び、人生を存分に生きます。' },
  6: { title: '愛の使者', keyword: '思いやり', desc: '責任、深い愛、そして人に尽くすことがあなたの運命に刻まれています。家族や周りの人々の心の支えとなります。' },
  7: { title: '賢者', keyword: '深み', desc: '精神的な探求、深い洞察、内省があなたの道を照らします。問いを立て、答えを探すことは、あなたの魂の仕事です。' },
  8: { title: '力', keyword: '変容', desc: '物質と精神、二つの力のバランスを見つけることがあなたの人生の道です。大きな目標のために生まれ、リーダーとしてのエネルギーは力強いものです。' },
  9: { title: '教師', keyword: '慈悲', desc: '普遍的な愛、慈悲、そして人々に尽くすエネルギーを持っています。巡りを完結させ、手放す力があります。' },
  11: { title: '光をもたらす者', keyword: '直感', desc: 'マスターナンバー11：高い直感と精神的な目覚めへの道を照らす導き手です。インスピレーションの源です。' },
  22: { title: 'マスタービルダー', keyword: 'ビジョン', desc: 'マスターナンバー22：大きな夢を確かな現実へと変える力を持っています。あなたの世界を変えていきます。' },
  33: { title: 'マスターティーチャー', keyword: '普遍の愛', desc: 'マスターナンバー33：限りない思いやり、癒し、そして普遍的な教えという使命を担っています。' },
};

const LIFE_PATH_BY_LANG: Record<string, Record<number, LifePathText>> = {
  tr: LIFE_PATH_MEANINGS,
  en: LIFE_PATH_EN,
  de: LIFE_PATH_DE,
  es: LIFE_PATH_ES,
  pt: LIFE_PATH_PT,
  fr: LIFE_PATH_FR,
  ja: LIFE_PATH_JA,
};

// Her dil kendi metnini alır; bilinmeyen dil ya da eksik anahtar İngilizceye düşer.
export function getLifePathMeaning(n: number, lang: NumLang = 'tr'): LifePathMeaning {
  const base = String(lang || 'tr').slice(0, 2).toLowerCase();
  const dict = LIFE_PATH_BY_LANG[base] || LIFE_PATH_EN;
  return dict[n] || LIFE_PATH_EN[n] || dict[9] || LIFE_PATH_EN[9];
}
