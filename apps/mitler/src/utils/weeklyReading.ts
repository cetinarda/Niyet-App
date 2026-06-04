import { NumerologyProfile } from './numerology';

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return Math.ceil((dayOfYear + start.getDay() + 1) / 7);
}

function getPersonalYear(lifePath: number): number {
  const y = new Date().getFullYear();
  let n = y.toString().split('').reduce((s, d) => s + parseInt(d, 10), 0) + lifePath;
  while (n > 9 && n !== 11 && n !== 22) {
    n = n.toString().split('').reduce((s, d) => s + parseInt(d, 10), 0);
  }
  return n;
}

const WEEKLY_MESSAGES: Record<number, string[]> = {
  1: [
    'Bu hafta liderlik içgüdülerine güven. Yeni bir proje başlatmak için doğru zaman.',
    'Bağımsız adımlar at. Kendi yolunu kendin belirliyorsun.',
    'Cesaret enerjisi yüksek. Ertelediğin şeyi bu hafta başlat.',
    'Özgün fikirlerini paylaş. Öncülüğün ilham verici.',
  ],
  2: [
    'Bu hafta ilişkilerine özen göster. Dinlemek seni güçlendiriyor.',
    'Sezgilerine kulak ver. İçin sana yol gösteriyor.',
    'İşbirliği ve uyum içinde ilerle. Birlikte güçlüsün.',
    'Sabır enerjisi yüksek. Acele etme, zamanlaması mükemmel.',
  ],
  3: [
    'Bu hafta yaratıcılığını ifade et. Sanatsal projeler için mükemmel zaman.',
    'Neşeni paylaş. Etrafına ışık saçıyorsun.',
    'Yeni fikirler ve projeler için enerjin güçlü.',
    'Sesini yükselt. Sözcüklerin bu hafta özellikle güçlü.',
  ],
  4: [
    'Bu hafta düzene odaklan. Planlarını hayata geçirme zamanı.',
    'Sabır ve kararlılıkla ilerle. Sağlam temeller atıyorsun.',
    'Pratik adımlar at. Her küçük adım büyük hedefe götürüyor.',
    'Disiplin enerjisi yüksek. Rutinlerin seni destekliyor.',
  ],
  5: [
    'Bu hafta yeni deneyimlere açık ol. Değişim kapında.',
    'Macera ve merak enerjisi yüksek. Keşfetmekten korkma.',
    'Rutini kır. Farklı bir yol dene.',
    'Özgürlüğünü hisset. Sınırlarını genişletme zamanı.',
  ],
  6: [
    'Bu hafta sevdiklerine zaman ayır. Sevgi enerjisi yüksek.',
    'Bakım ve şefkatle ilerle. Hizmet etmek seni güçlendiriyor.',
    'Ev ve aile odak noktanız. Güvenli alan yarat.',
    'Uyum ve denge arıyorsan, içinden gelen cevaba güven.',
  ],
  7: [
    'Bu hafta içe dön. Sessizlik ve meditasyon enerjisi yüksek.',
    'Derin sorular sor. Cevaplar içinde saklı.',
    'Araştırma ve öğrenme için mükemmel bir hafta.',
    'Yalnızlık verimli. Ruhsal çalışmalar için ideal zaman.',
  ],
  8: [
    'Bu hafta gücüne güven. Büyük hedeflere odaklan.',
    'Maddi ve manevi denge arıyorsun. İkisi de önemli.',
    'Liderlik enerjisi yüksek. Kararlar almak için doğru zaman.',
    'Dönüşüm enerjisi aktif. Eski kalıpları bırak.',
  ],
  9: [
    'Bu hafta tamamlanma enerjisi var. Bitmemiş işleri kapatma zamanı.',
    'Merhamet ve bağışlama enerjisi yüksek. Bırakmak özgürleştiriyor.',
    'Evrensel bakış açısıyla bak. Büyük resmi görüyorsun.',
    'Hizmet ve katkı zamanı. Verdiğin kat kat geri dönüyor.',
  ],
  11: [
    'Bu hafta sezgilerin keskin. İlham anlarına dikkat et.',
    'Manevi mesajlar geliyor. Sessizlikte duymayı dene.',
    'Aydınlatıcı enerjin başkalarına ilham veriyor.',
    'Yüksek bilinç çağrısı var. Ruhsal pratiğine alan aç.',
  ],
  22: [
    'Bu hafta büyük vizyonlar için harekete geç.',
    'Hayallerini somutlaştırma zamanı. Pratik adımlar at.',
    'İnşa etme enerjisi güçlü. Her adım kalıcı.',
    'Liderlik ve vizyon bir arada. Büyük değişimler başlatıyorsun.',
  ],
};

const WEEKLY_MESSAGES_EN: Record<number, string[]> = {
  1: [
    'Trust your leadership instincts this week. The right time to start a new project.',
    'Take independent steps. You are setting your own path.',
    'Courage energy is high. Begin what you have postponed this week.',
    'Share your authentic ideas. Your leadership is inspiring.',
  ],
  2: [
    'Take care of your relationships this week. Listening strengthens you.',
    'Listen to your intuition. Your inner self is showing the way.',
    'Move in cooperation and harmony. You are stronger together.',
    'Patience energy is high. Don\'t rush — the timing is perfect.',
  ],
  3: [
    'Express your creativity this week. A perfect time for artistic projects.',
    'Share your joy. You scatter light around you.',
    'Your energy for new ideas and projects is strong.',
    'Raise your voice. Your words are especially powerful this week.',
  ],
  4: [
    'Focus on order this week. Time to put your plans into action.',
    'Move with patience and resolve. You are laying solid foundations.',
    'Take practical steps. Each small step takes you to the great goal.',
    'Discipline energy is high. Your routines support you.',
  ],
  5: [
    'Be open to new experiences this week. Change is at your door.',
    'Adventure and curiosity energy is high. Don\'t be afraid to explore.',
    'Break the routine. Try a different way.',
    'Feel your freedom. Time to expand your boundaries.',
  ],
  6: [
    'Make time for your loved ones this week. Love energy is high.',
    'Move with care and compassion. Serving strengthens you.',
    'Home and family are your focus. Create a safe space.',
    'If you seek harmony and balance, trust the answer that comes from within.',
  ],
  7: [
    'Turn inward this week. Silence and meditation energy is high.',
    'Ask deep questions. Answers are hidden inside.',
    'A perfect week for research and learning.',
    'Solitude is fertile. Ideal time for spiritual work.',
  ],
  8: [
    'Trust your power this week. Focus on big goals.',
    'You are seeking material and spiritual balance. Both matter.',
    'Leadership energy is high. The right time to take decisions.',
    'Transformation energy is active. Let go of old patterns.',
  ],
  9: [
    'There is completion energy this week. Time to close unfinished work.',
    'Mercy and forgiveness energy is high. Letting go frees.',
    'Look from a universal perspective. You see the big picture.',
    'Time of service and contribution. What you give returns multiplied.',
  ],
  11: [
    'Your intuitions are sharp this week. Watch the moments of inspiration.',
    'Spiritual messages are coming. Try to hear in the silence.',
    'Your illuminating energy inspires others.',
    'There is a call to higher consciousness. Make room for your spiritual practice.',
  ],
  22: [
    'Move for big visions this week.',
    'Time to materialise your dreams. Take practical steps.',
    'Building energy is strong. Each step is lasting.',
    'Leadership and vision together. You are starting big changes.',
  ],
};

const THEMES_TR: Record<number, string> = {
  1: 'Başlangıç ve Liderlik', 2: 'Denge ve İşbirliği', 3: 'Yaratıcılık ve İfade',
  4: 'Yapı ve Disiplin', 5: 'Özgürlük ve Değişim', 6: 'Sevgi ve Sorumluluk',
  7: 'İç Dünya ve Derinlik', 8: 'Güç ve Dönüşüm', 9: 'Tamamlanma ve Merhamet',
  11: 'Sezgi ve Aydınlanma', 22: 'Büyük Yapı ve Vizyon',
};

const THEMES_EN: Record<number, string> = {
  1: 'Beginning and Leadership', 2: 'Balance and Cooperation', 3: 'Creativity and Expression',
  4: 'Structure and Discipline', 5: 'Freedom and Change', 6: 'Love and Responsibility',
  7: 'Inner World and Depth', 8: 'Power and Transformation', 9: 'Completion and Mercy',
  11: 'Intuition and Enlightenment', 22: 'Great Structure and Vision',
};

export interface WeeklyReading {
  theme: string;
  message: string;
  personalYear: number;
  weekNumber: number;
}

export type WRLang = 'tr' | 'en';

export function getWeeklyReading(nums: NumerologyProfile, lang: WRLang = 'tr'): WeeklyReading {
  const week = getWeekNumber();
  const personalYear = getPersonalYear(nums.lifePath);
  const msgDict = lang === 'en' ? WEEKLY_MESSAGES_EN : WEEKLY_MESSAGES;
  const themeDict = lang === 'en' ? THEMES_EN : THEMES_TR;
  const messages = msgDict[nums.lifePath] || msgDict[9];
  const message = messages[week % messages.length];

  return {
    theme: themeDict[nums.lifePath] || themeDict[9],
    message,
    personalYear,
    weekNumber: week,
  };
}
