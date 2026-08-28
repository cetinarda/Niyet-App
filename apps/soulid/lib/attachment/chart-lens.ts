// Doğum haritası MERCEĞİ: bağlanma sonucunun kişiselleştirme katmanı.
// ---------------------------------------------------------------------------
// ⚠️ KIRMIZI ÇİZGİ: Buradaki hiçbir şey bağlanma STİLİNİ belirlemez.
// Stil yalnızca soru yanıtlarından çıkar (bkz. ./index.ts scoreAttachment).
// Bu dosya "ölçülen stile göre, senin haritana uygun hangi pratik daha kolay
// tutar?" sorusunu yanıtlar. Yani sıralama şudur:
//     sorular → stil        (ölçüm)
//     harita  → öneri tonu  (kişiselleştirme)
// Tersi yapılsaydı aynı gün doğan herkes aynı bağlanma stilini alırdı ve
// gerçek bir bağlanma yarası "burcum böyle" diye geçiştirilebilirdi.

import type { Chart, HumanDesign, GalacticReport, ZodiacSign } from '../types';
import type { AttachmentStyle, L } from './index';

export type LensRow = { label: L; source: L; body: L };

// Ay burcu = duygunun nasıl yatıştığı. Bağlanma açısından en anlamlı karşılık,
// çünkü tetiklenme anında işe yarayan şey kişiden kişiye değişir.
const MOON_SOOTHE: Record<ZodiacSign, L> = {
  Aries: {
    tr: 'Senin sistemin hareketle boşalır. Tetiklendiğinde oturup düşünmek işe yaramaz; önce yürü, koş, bir şeyi fiziksel olarak boşalt. Sonra konuş.',
    en: 'Your system discharges through movement. Sitting and thinking will not do it; walk, run, move something physically first. Then talk.',
  },
  Taurus: {
    tr: 'Sen bedensel konforla yatışırsın: sıcak bir şey iç, battaniye, tanıdık bir koku, yavaş bir şarkı. Acele ettirilmek seni daha da kapatır.',
    en: 'You settle through bodily comfort: something warm to drink, a blanket, a familiar scent, a slow song. Being rushed closes you further.',
  },
  Gemini: {
    tr: 'Senin için konuşmak ya da yazmak boşaltıcıdır. Kafandaki döngüyü kelimeye dökmeden sakinleşmen zor; günlük tut ya da sesli not bırak.',
    en: 'For you, talking or writing is the release. It is hard to settle before the loop in your head becomes words; keep a journal or leave a voice note.',
  },
  Cancer: {
    tr: 'Sen temasla yatışırsın: sarılma, yakınlık, tanıdık bir ev hissi. Ama aynı hassasiyet seni en çok kırılgan yapan şey; kendine geri çekilme izni ver.',
    en: 'You settle through contact: a hug, closeness, a familiar sense of home. That same sensitivity is what makes you most tender; give yourself permission to retreat.',
  },
  Leo: {
    tr: 'Görülmek seni yatıştırır. Tetiklendiğinde asıl ihtiyacın bir çözüm değil, "seni görüyorum" cümlesi. Bunu istemekten utanma.',
    en: 'Being seen settles you. When triggered, what you need is not a solution but the sentence "I see you". Do not be ashamed to ask for it.',
  },
  Virgo: {
    tr: 'Sen düzenle sakinleşirsin: listeye dökmek, ortalığı toplamak, somut bir adım atmak. Ama dikkat, aşırı analiz duyguyu ertelemenin bir yolu olabilir.',
    en: 'Order settles you: making a list, tidying, taking one concrete step. Careful though, over-analysis can be a way of postponing the feeling.',
  },
  Libra: {
    tr: 'Güzellik ve denge seni yatıştırır. Ama uyumu korumak için kendi ihtiyacını gizleme eğilimin var; "iyiyim" demeden önce iki saniye düşün.',
    en: 'Beauty and balance settle you. Yet you tend to hide your own need to keep the peace; pause two seconds before saying "I am fine".',
  },
  Scorpio: {
    tr: 'Sen yüzeysel teselliyi reddedersin; ancak gerçek konuşulduğunda yatışırsın. Derinden konuşabileceğin tek bir kişi, on yüzeysel destekten iyidir.',
    en: 'You reject surface comfort; you settle only when the real thing is spoken. One person you can go deep with beats ten shallow supports.',
  },
  Sagittarius: {
    tr: 'Sen genişlikle nefes alırsın: dışarı çık, ufka bak, anlam ara. Dar bir odada çözülmeye çalışmak seni boğar.',
    en: 'You breathe through expansion: get outside, look at a horizon, search for meaning. Trying to resolve it in a small room suffocates you.',
  },
  Capricorn: {
    tr: 'Sen yapı ve kontrolle yatışırsın. Ama duyguyu "verimsiz" bulup atlamaya meyillisin; hissetmek de yapılacaklar listesine girsin.',
    en: 'Structure and control settle you. Yet you tend to skip feeling as "unproductive"; let feeling onto the to-do list too.',
  },
  Aquarius: {
    tr: 'Sen mesafe alıp yukarıdan bakınca sakinleşirsin. Bu işe yarar ama fazlası soğukluk gibi algılanır; döneceğini söyleyip git.',
    en: 'You settle by stepping back and viewing from above. It works, but too much reads as coldness; say you will return before you go.',
  },
  Pisces: {
    tr: 'Sen müzik, su, uyku ve hayalle yatışırsın. Ama duygu sınırların geçirgen; bazen taşıdığın hissin sana mı ait olduğunu ayırt et.',
    en: 'Music, water, sleep and reverie settle you. Your emotional boundaries are porous though; check whether the feeling you carry is even yours.',
  },
};

// Venüs = sevgiyi verme/alma biçimi. "Sevgi dilinin" haritadaki karşılığı.
const VENUS_LOVE: Record<ZodiacSign, L> = {
  Aries: { tr: 'doğrudan, hızlı ve cesur bir sevgi; istediğini açıkça söylersin', en: 'direct, fast, brave love; you say what you want plainly' },
  Taurus: { tr: 'dokunuş, süreklilik ve somut özenle sevgi', en: 'love through touch, constancy and tangible care' },
  Gemini: { tr: 'kelimeyle, sohbetle, birlikte gülmekle sevgi', en: 'love through words, conversation and laughing together' },
  Cancer: { tr: 'besleyerek, koruyarak, yuva kurarak sevgi', en: 'love by nourishing, protecting, making a home' },
  Leo: { tr: 'cömert, sıcak, açıkça ilan edilen sevgi', en: 'generous, warm, openly declared love' },
  Virgo: { tr: 'hizmetle, detayı hatırlayarak, işini kolaylaştırarak sevgi', en: 'love through service, remembering details, easing their load' },
  Libra: { tr: 'incelik, uyum ve karşılıklı zarafetle sevgi', en: 'love through grace, harmony and mutual courtesy' },
  Scorpio: { tr: 'yoğun, tamamen verilen, derinlik isteyen sevgi', en: 'intense, all-in love that demands depth' },
  Sagittarius: { tr: 'özgürlük tanıyan, birlikte keşfeden sevgi', en: 'love that grants freedom and explores together' },
  Capricorn: { tr: 'sadakat, sorumluluk ve uzun vadeyle sevgi', en: 'love through loyalty, responsibility and the long term' },
  Aquarius: { tr: 'arkadaşlıkla, alan tanıyarak, özgün kalarak sevgi', en: 'love through friendship, space and staying original' },
  Pisces: { tr: 'şefkatli, sınırsız, kendini karşıya bırakan sevgi', en: 'compassionate, boundless love that dissolves into the other' },
};

// HD otoritesi = ilişkide "evet/hayır"a ne zaman güvenmeli.
function authorityAdvice(authority: string): L | null {
  if (authority.includes('Duygusal')) {
    return {
      tr: 'Duygusal otoriten var: net bir dalgan var, tepe ve dip arasında gidip gelirsin. KURAL: dalganın tepesinde de dibinde de karar verme. Tartışmanın sıcağında "bitirdim" deme, tutkulu anda büyük söz verme. Bir gece uyu, sabah hâlâ aynıysa gerçektir.',
      en: 'You have emotional authority: a real wave, moving between peak and trough. RULE: decide at neither end. Do not say "I am done" in the heat, do not make big promises at the peak. Sleep on it; if it still holds in the morning, it is true.',
    };
  }
  if (authority.includes('Sakral')) {
    return {
      tr: 'Sakral otoriten var: bedenin sen düşünmeden önce cevabı biliyor. Bir buluşma teklifinde göğsünde açılma mı oluyor, çökme mi? O ilk tepki, sonradan ürettiğin gerekçelerden daha dürüst.',
      en: 'You have sacral authority: your body knows before you think. At an invitation, does your chest open or sink? That first response is more honest than the reasons you build afterwards.',
    };
  }
  if (authority.includes('Splenik')) {
    return {
      tr: 'Splenik otoriten var: sezgin ANLIK ve bir kez konuşur, tekrar etmez. İlk anda içinden geçen "bu doğru değil" hissini sonradan mantıkla ezme.',
      en: 'You have splenic authority: your intuition speaks once, in the moment, and does not repeat. Do not let logic later crush that first quiet "this is not right".',
    };
  }
  if (authority.includes('Ego')) {
    return {
      tr: 'Ego otoriten var: gerçekten İSTİYOR musun, yoksa istenmek mi istiyorsun? Bu ayrımı sorman, kalmakla gitmek arasındaki kararı netleştirir.',
      en: 'You have ego authority: do you actually WANT this, or do you want to be wanted? Asking that separates staying from leaving.',
    };
  }
  if (authority.includes('Kendini Yansıtan')) {
    return {
      tr: 'Kendini yansıtan otoriten var: kararın sesli konuşarak netleşir. Güvendiğin birine anlat, ama tavsiye isteme; sadece kendi sesini duy.',
      en: 'You have self-projected authority: your decision clarifies when spoken aloud. Talk to someone you trust, but do not ask for advice; just hear your own voice.',
    };
  }
  if (authority.includes('Ay Döngüsü') || authority.includes('Lunar')) {
    return {
      tr: 'Ay döngüsü otoriten var: büyük ilişki kararların için yaklaşık bir ay tanı kendine. Acele ettirilmek senin için en zararlı şey.',
      en: 'You have lunar authority: give yourself about a month for big relationship decisions. Being rushed is the most harmful thing for you.',
    };
  }
  return null;
}

/**
 * Ölçülen stile göre, kişinin haritasından türeyen 3 kişiselleştirme satırı.
 * Harita yoksa boş dizi döner (özellik yine çalışır, harita zorunlu değil).
 */
export function buildChartLens(
  report: GalacticReport | null,
  style: AttachmentStyle,
): LensRow[] {
  if (!report) return [];
  const rows: LensRow[] = [];
  const chart: Chart = report.chart;
  const hd: HumanDesign = report.humanDesign;

  const moon = chart.planets.find((p) => p.name === 'Moon');
  const venus = chart.planets.find((p) => p.name === 'Venus');

  if (moon) {
    rows.push({
      label: { tr: 'Sistemin nasıl yatışır', en: 'How your system settles' },
      source: { tr: `Ay ${moon.sign} burcunda`, en: `Moon in ${moon.sign}` },
      body: MOON_SOOTHE[moon.sign],
    });
  }

  if (venus) {
    const flavour = VENUS_LOVE[venus.sign];
    const tail: L =
      style === 'avoidant'
        ? {
            tr: 'Bunu içinden yaşıyor olman yetmez; karşı taraf ancak dışa vurulanı görebilir.',
            en: 'Feeling it inwardly is not enough; the other person can only see what is expressed.',
          }
        : style === 'anxious'
          ? {
              tr: 'Bu kadar verirken kendi kabını doldurmayı da unutma; tek yönlü akış zamanla kırgınlığa döner.',
              en: 'While giving this much, keep filling your own cup; a one-way flow turns into resentment.',
            }
          : {
              tr: 'Karşındakinin sevgi dili farklı olabilir; senin verdiğin biçim ona ulaşmıyorsa mesele sevgisizlik değil, çeviri.',
              en: 'Their love language may differ; if your form is not landing, the issue is translation, not a lack of love.',
            };
    rows.push({
      label: { tr: 'Sevgiyi nasıl verirsin', en: 'How you give love' },
      source: { tr: `Venüs ${venus.sign} burcunda`, en: `Venus in ${venus.sign}` },
      body: {
        tr: `Senin doğal biçimin: ${flavour.tr}. ${tail.tr}`,
        en: `Your natural form: ${flavour.en}. ${tail.en}`,
      },
    });
  }

  const auth = authorityAdvice(hd.authority);
  if (auth) {
    rows.push({
      label: { tr: 'Kararına ne zaman güven', en: 'When to trust your decision' },
      source: { tr: hd.authority, en: hd.authority },
      body: auth,
    });
  }

  return rows;
}
