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

const THEMES: Record<number, string> = {
  1: 'Başlangıç ve Liderlik', 2: 'Denge ve İşbirliği', 3: 'Yaratıcılık ve İfade',
  4: 'Yapı ve Disiplin', 5: 'Özgürlük ve Değişim', 6: 'Sevgi ve Sorumluluk',
  7: 'İç Dünya ve Derinlik', 8: 'Güç ve Dönüşüm', 9: 'Tamamlanma ve Merhamet',
  11: 'Sezgi ve Aydınlanma', 22: 'Büyük Yapı ve Vizyon',
};

export interface WeeklyReading {
  theme: string;
  message: string;
  personalYear: number;
  weekNumber: number;
}

export function getWeeklyReading(nums: NumerologyProfile): WeeklyReading {
  const week = getWeekNumber();
  const personalYear = getPersonalYear(nums.lifePath);
  const messages = WEEKLY_MESSAGES[nums.lifePath] || WEEKLY_MESSAGES[9];
  const message = messages[week % messages.length];

  return {
    theme: THEMES[nums.lifePath] || THEMES[9],
    message,
    personalYear,
    weekNumber: week,
  };
}
