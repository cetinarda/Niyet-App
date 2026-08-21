// Bağlanma Stili — iki boyutlu ölçüm + 4 stil.
// ---------------------------------------------------------------------------
// YÖNTEM (bilerek böyle): Stil YALNIZCA kullanıcının soru yanıtlarından çıkar.
// Doğum haritası stili BELİRLEMEZ — sadece sonuçtaki ÖNERİLERİ kişiselleştirir
// (bkz. ./chart-lens.ts). Sebep: bağlanma stili erken ilişki deneyimiyle oluşan
// psikolojik bir örüntüdür; doğum tarihinden türetmek hem yanlış olurdu hem de
// aynı gün doğan herkese aynı stili verirdi. Ayrıca gerçek bir bağlanma yarasını
// "burcum böyle" diye geçiştirmek zararlı olur.
//
// Model: Brennan/Clark/Shaver'ın iki eksenli yaklaşımı (kaygı + kaçınma).
// İki eksen → 4 çeyrek: güvenli, kaygılı, kaçıngan, düzensiz.
// Bu bir TARAMA değil, farkındalık aracıdır; tanı koymaz (uygulama genelinde
// footer + sonuç ekranında açıkça yazar).

export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'disorganized';
export type Axis = 'anxiety' | 'avoidance';
export type Locale = 'tr' | 'en';

export type L = { tr: string; en: string };
export const pick = (v: L, l: Locale): string => v[l] ?? v.tr;

export type Question = {
  id: string;
  axis: Axis;
  /** true ise yüksek puan DÜŞÜK eksen değeri demektir (ters kodlama). */
  reverse?: boolean;
  text: L;
};

// 16 madde: 8 kaygı + 8 kaçınma. Ters kodlanmış maddeler kalıp yanıtı
// (hep "katılıyorum" işaretleme) kırar, ölçümü dürüst tutar.
export const QUESTIONS: Question[] = [
  // ── Kaygı ekseni ─────────────────────────────────────────────────────────
  {
    id: 'a1',
    axis: 'anxiety',
    text: {
      tr: 'Sevdiğim kişi bir süre yazmazsa, benden uzaklaştığını düşünmeye başlarım.',
      en: 'If someone I love goes quiet for a while, I start thinking they are pulling away.',
    },
  },
  {
    id: 'a2',
    axis: 'anxiety',
    text: {
      tr: 'İlişkide bende olduğu kadar karşımda da istek olup olmadığını sık sık merak ederim.',
      en: 'I often wonder whether my partner wants me as much as I want them.',
    },
  },
  {
    id: 'a3',
    axis: 'anxiety',
    text: {
      tr: 'Tartışma sonrası, konu kapanana kadar içim rahat etmez.',
      en: 'After an argument I cannot settle until things are resolved.',
    },
  },
  {
    id: 'a4',
    axis: 'anxiety',
    text: {
      tr: 'Terk edilme ihtimali aklıma geldiğinde bedenimde bir gerginlik hissederim.',
      en: 'The thought of being left brings a physical tension in my body.',
    },
  },
  {
    id: 'a5',
    axis: 'anxiety',
    text: {
      tr: 'Karşımdakinin ses tonundaki küçük değişimleri hemen fark eder, anlam yüklerim.',
      en: 'I quickly notice small shifts in someone’s tone and read meaning into them.',
    },
  },
  {
    id: 'a6',
    axis: 'anxiety',
    text: {
      tr: 'Yakınlık isteğimin karşı tarafı kaçırdığından endişelenirim.',
      en: 'I worry that my need for closeness pushes people away.',
    },
  },
  {
    id: 'a7',
    axis: 'anxiety',
    reverse: true,
    text: {
      tr: 'Sevildiğimi, karşımdaki her gün söylemese de bilirim.',
      en: 'I know I am loved even when it is not said out loud every day.',
    },
  },
  {
    id: 'a8',
    axis: 'anxiety',
    reverse: true,
    text: {
      tr: 'Sevdiğim kişi kendine zaman ayırdığında bunu rahatlıkla karşılarım.',
      en: 'I am comfortable when someone I love takes time for themselves.',
    },
  },

  // ── Kaçınma ekseni ───────────────────────────────────────────────────────
  {
    id: 'v1',
    axis: 'avoidance',
    text: {
      tr: 'Zorlandığımda derdimi paylaşmak yerine kendi başıma çözmeyi tercih ederim.',
      en: 'When I struggle, I would rather handle it alone than share it.',
    },
  },
  {
    id: 'v2',
    axis: 'avoidance',
    text: {
      tr: 'İlişki çok yakınlaştığında içimde bir sıkışma, geri çekilme isteği doğar.',
      en: 'When a relationship gets very close, I feel a pull to step back.',
    },
  },
  {
    id: 'v3',
    axis: 'avoidance',
    text: {
      tr: 'Duygularımı anlatmak bana zor gelir; kelimeler geç gelir.',
      en: 'Putting my feelings into words is hard; the words arrive late.',
    },
  },
  {
    id: 'v4',
    axis: 'avoidance',
    text: {
      tr: 'Bağımsızlığım, ilişkideki derin yakınlıktan daha önemli gelir.',
      en: 'My independence feels more important than deep closeness.',
    },
  },
  {
    id: 'v5',
    axis: 'avoidance',
    text: {
      tr: 'Biri çok muhtaç davrandığında içimde bir mesafe koyma isteği belirir.',
      en: 'When someone gets very needy, something in me wants distance.',
    },
  },
  {
    id: 'v6',
    axis: 'avoidance',
    text: {
      tr: 'Yardım istemek yerine idare etmeyi seçerim.',
      en: 'I would rather manage on my own than ask for help.',
    },
  },
  {
    id: 'v7',
    axis: 'avoidance',
    reverse: true,
    text: {
      tr: 'Kırıldığımda bunu karşımdakine söyleyebilirim.',
      en: 'When I am hurt, I can tell the other person.',
    },
  },
  {
    id: 'v8',
    axis: 'avoidance',
    reverse: true,
    text: {
      tr: 'Birine yaslanmak bana güvenli gelir.',
      en: 'Leaning on someone feels safe to me.',
    },
  },
];

export const SCALE: { value: number; label: L }[] = [
  { value: 1, label: { tr: 'Hiç değil', en: 'Not at all' } },
  { value: 2, label: { tr: 'Nadiren', en: 'Rarely' } },
  { value: 3, label: { tr: 'Bazen', en: 'Sometimes' } },
  { value: 4, label: { tr: 'Sık sık', en: 'Often' } },
  { value: 5, label: { tr: 'Tamamen', en: 'Completely' } },
];

export type Answers = Record<string, number>;

export type AttachmentResult = {
  /** 0-100 */
  anxiety: number;
  /** 0-100 */
  avoidance: number;
  style: AttachmentStyle;
  /** İkinci en yakın stil — çeyrek sınırına yakınsa anlamlı. */
  secondary: AttachmentStyle | null;
  /** Sınıra ne kadar yakın (0-1). Yüksekse "karma" bir örüntü. */
  blend: number;
  answered: number;
  total: number;
};

const MID = 50;

function axisScore(answers: Answers, axis: Axis): { score: number; answered: number } {
  const items = QUESTIONS.filter((q) => q.axis === axis);
  let sum = 0;
  let n = 0;
  for (const q of items) {
    const raw = answers[q.id];
    if (typeof raw !== 'number') continue;
    const v = q.reverse ? 6 - raw : raw;
    sum += v;
    n += 1;
  }
  if (n === 0) return { score: MID, answered: 0 };
  // 1..5 ortalama → 0..100
  return { score: Math.round(((sum / n - 1) / 4) * 100), answered: n };
}

export function quadrant(anxiety: number, avoidance: number): AttachmentStyle {
  const hiAnx = anxiety >= MID;
  const hiAvo = avoidance >= MID;
  if (!hiAnx && !hiAvo) return 'secure';
  if (hiAnx && !hiAvo) return 'anxious';
  if (!hiAnx && hiAvo) return 'avoidant';
  return 'disorganized';
}

export function scoreAttachment(answers: Answers): AttachmentResult {
  const anx = axisScore(answers, 'anxiety');
  const avo = axisScore(answers, 'avoidance');
  const style = quadrant(anx.score, avo.score);

  // Sınıra yakınlık: iki eksende de merkeze uzaklığın küçüğü.
  const dAnx = Math.abs(anx.score - MID);
  const dAvo = Math.abs(avo.score - MID);
  const nearest = Math.min(dAnx, dAvo);
  const blend = Math.max(0, 1 - nearest / 15); // 15 puandan yakınsa karma say

  // Hangi ekseni çevirirsek en yakın komşu çeyreğe geçeriz?
  let secondary: AttachmentStyle | null = null;
  if (blend > 0) {
    secondary =
      dAnx <= dAvo
        ? quadrant(anx.score >= MID ? MID - 1 : MID + 1, avo.score)
        : quadrant(anx.score, avo.score >= MID ? MID - 1 : MID + 1);
    if (secondary === style) secondary = null;
  }

  return {
    anxiety: anx.score,
    avoidance: avo.score,
    style,
    secondary,
    blend: Math.round(blend * 100) / 100,
    answered: anx.answered + avo.answered,
    total: QUESTIONS.length,
  };
}

// ── Stil içerikleri ────────────────────────────────────────────────────────

export type StyleContent = {
  name: L;
  emoji: string;
  color: string;
  /** Tek cümlelik öz. */
  essence: L;
  /** Nasıl hissettirir (birinci ağızdan, tanıma anı). */
  feels: L;
  strengths: L[];
  triggers: L[];
  /** İhtiyaç duyduğun ama istemekte zorlandığın şey. */
  needs: L[];
  /** Çatışma anında tipik hamle. */
  inConflict: L;
  /** Somut, uygulanabilir öneriler. */
  practices: L[];
  /** Partner/yakınına söyleyebileceğin cümle. */
  script: L;
};

export const STYLES: Record<AttachmentStyle, StyleContent> = {
  secure: {
    name: { tr: 'Güvenli bağlanma', en: 'Secure attachment' },
    emoji: '🌿',
    color: '#5bd9a0',
    essence: {
      tr: 'Yakınlık da özerklik de seni tehdit etmez; ikisinin arasında rahatça gidip gelirsin.',
      en: 'Neither closeness nor autonomy threatens you; you move between them with ease.',
    },
    feels: {
      tr: 'Bir şey seni üzdüğünde söyleyebilirsin. Karşındaki geri çekildiğinde bunu hemen kendine mal etmezsin. İlişki sarsıldığında dünya yıkılmaz, konuşulur.',
      en: 'When something hurts you, you can say it. When someone withdraws, you do not instantly take it personally. When things shake, it gets talked through.',
    },
    strengths: [
      { tr: 'Duyguyu suçlamadan ifade edebilme', en: 'Expressing feeling without blame' },
      { tr: 'Karşındakinin alanına tahammül', en: 'Tolerating the other person’s space' },
      { tr: 'Onarım başlatabilme (özür, geri dönüş)', en: 'Initiating repair (apology, return)' },
      { tr: 'Sınır koyarken ilişkiyi kaybetmeme', en: 'Setting limits without losing the bond' },
    ],
    triggers: [
      { tr: 'Sürekli belirsiz bırakan, net konuşmayan ilişkiler', en: 'Relationships kept vague and unspoken' },
      { tr: 'Onarımın hiç gelmediği tekrar eden kırılmalar', en: 'Repeated ruptures where repair never comes' },
    ],
    needs: [
      { tr: 'Karşılıklılık: verdiğin özenin geri dönmesi', en: 'Reciprocity: the care you give coming back' },
      { tr: 'Net iletişim ve tutulan sözler', en: 'Clear communication and kept promises' },
    ],
    inConflict: {
      tr: 'Konuyu bırakmadan ama saldırmadan üstüne gidersin; ara vermeyi de dönmeyi de bilirsin.',
      en: 'You stay with the issue without attacking; you know how to pause and how to return.',
    },
    practices: [
      {
        tr: 'Güvenli oluşun bulaşıcıdır: kaygılı bir partnere ritim, kaçıngan bir partnere alan verebilirsin. Ama bunu kendini silerek yapma.',
        en: 'Your security is contagious: you can offer rhythm to an anxious partner and space to an avoidant one. Just do not erase yourself doing it.',
      },
      {
        tr: 'Kendi ihtiyaçlarını da masaya koy. Hep "iyiyim" diyen taraf olmak zamanla yorar.',
        en: 'Put your own needs on the table too. Always being the one who is "fine" wears thin.',
      },
      {
        tr: 'Onarımı sen başlatıyorsan, arada bir bekle. Karşı tarafın da adım atmasına yer aç.',
        en: 'If repair is always yours to start, sometimes wait. Leave room for the other to step in.',
      },
    ],
    script: {
      tr: '"Bu bana dokundu. Sana kızgın değilim ama konuşmak istiyorum."',
      en: '"That landed hard on me. I am not angry at you, but I want to talk about it."',
    },
  },

  anxious: {
    name: { tr: 'Kaygılı bağlanma', en: 'Anxious attachment' },
    emoji: '🌊',
    color: '#f5b942',
    essence: {
      tr: 'Sevgiyi derinden verirsin, ama karşılığının süreceğinden emin olmakta zorlanırsın.',
      en: 'You love deeply, yet struggle to trust that the love will stay.',
    },
    feels: {
      tr: 'Mesaj gecikince zihnin senaryo üretir. Konu kapanmadan uyuyamazsın. Bazen "fazla mı istiyorum" diye kendini kısarsın, sonra taşarsın.',
      en: 'When a message is late, your mind writes scenarios. You cannot sleep before it is resolved. Sometimes you shrink to avoid "wanting too much", then it overflows.',
    },
    strengths: [
      { tr: 'Yüksek duygusal duyarlılık, ince algı', en: 'High emotional sensitivity, fine perception' },
      { tr: 'İlişkiye yatırım yapma cesareti', en: 'Courage to invest in the bond' },
      { tr: 'Sadakat ve derin bağlılık', en: 'Loyalty and deep devotion' },
      { tr: 'İlişkideki çatlağı ilk fark eden sensin', en: 'You are the first to notice a crack' },
    ],
    triggers: [
      { tr: 'Yanıtsız kalan mesaj, açıklanmayan sessizlik', en: 'Unanswered messages, unexplained silence' },
      { tr: 'Ses tonundaki ani soğukluk', en: 'A sudden coolness in tone' },
      { tr: 'Planın belirsiz bırakılması', en: 'Plans left undefined' },
      { tr: 'Karşındakinin geri çekilmesi', en: 'The other person withdrawing' },
    ],
    needs: [
      { tr: 'Öngörülebilirlik: ne zaman, nasıl bağlanacağınızın belli olması', en: 'Predictability: knowing when and how you will connect' },
      { tr: 'Sözle teyit — "buradayım" cümlesinin duyulması', en: 'Verbal reassurance: hearing "I am here"' },
      { tr: 'Ara verilse bile geri dönüleceğinin bilinmesi', en: 'Knowing that a pause still ends in return' },
    ],
    inConflict: {
      tr: 'Protesto edersin: üst üste yazmak, sitem, "hiç umursamıyorsun" cümlesi. Aslında söylemek istediğin: "gitme".',
      en: 'You protest: repeated texts, reproach, "you do not care at all". What you mean is: "do not leave".',
    },
    practices: [
      {
        tr: 'Tetiklendiğinde 20 dakika kuralı: mesajı yaz ama gönderme. Süre sonunda hâlâ aynı şeyi söylemek istiyorsan gönder. Çoğu zaman dalga geçer.',
        en: 'The 20-minute rule: write the message but do not send it. If you still want to say it after, send it. Most of the time the wave passes.',
      },
      {
        tr: 'İhtiyacını suçlama değil, istek olarak kur: "Neden aramadın?" yerine "Akşam kısa bir sesli mesaj atsan içim rahatlar."',
        en: 'Frame the need as a request, not an accusation: instead of "why didn’t you call?", try "a short voice note in the evening settles me".',
      },
      {
        tr: 'Bedeni önce sakinleştir: 4 saniye al, 6 saniye ver, 10 tur. Sinir sistemi yatışmadan konuşma işe yaramaz.',
        en: 'Calm the body first: inhale 4, exhale 6, ten rounds. Talking before the nervous system settles rarely works.',
      },
      {
        tr: 'Kendine ait, ilişkiden bağımsız bir ritim kur (spor, üretim, arkadaş). Boşluğu doldurmaz ama zemin verir.',
        en: 'Build a rhythm of your own outside the relationship (movement, making, friends). It does not fill the gap but it gives ground.',
      },
      {
        tr: 'Kaçınganla eşleştiysen: kovalamak mesafeyi büyütür. Geri çekilmesini kişisel değil, onun düzenleme biçimi olarak oku.',
        en: 'Paired with an avoidant: chasing widens the gap. Read their retreat as their regulation, not a verdict on you.',
      },
    ],
    script: {
      tr: '"Şu an kaygım yükseldi ve bu benim örüntüm. Senden bir şey istemiyorum, sadece bilmeni istedim. Biraz sonra sakinleşeceğim."',
      en: '"My anxiety is high right now and this is my pattern. I need nothing from you, I just wanted you to know. It will settle soon."',
    },
  },

  avoidant: {
    name: { tr: 'Kaçıngan bağlanma', en: 'Avoidant attachment' },
    emoji: '🏔',
    color: '#c77dff',
    essence: {
      tr: 'Kendi ayaklarının üstünde durursun; yakınlık arttığında içeride bir kapı usulca kapanır.',
      en: 'You stand on your own; as closeness grows, a door quietly closes inside.',
    },
    feels: {
      tr: 'Derdini anlatmak yerine hallediyorsun. Biri çok yaklaşınca nefes alanı arıyorsun. Duyguyu hissetmiyor değilsin, sadece geç ve sessiz geliyor.',
      en: 'You handle things instead of telling them. When someone gets very close you look for air. It is not that you do not feel; the feeling arrives late and quiet.',
    },
    strengths: [
      { tr: 'Kriz anında sakin kalabilme', en: 'Staying calm in a crisis' },
      { tr: 'Özerklik ve kendine yetebilme', en: 'Autonomy and self-reliance' },
      { tr: 'Duygusal fırtınaya kapılmadan düşünebilme', en: 'Thinking clearly without being swept up' },
      { tr: 'Sınırlara saygı, alan tanıma', en: 'Respecting boundaries, granting space' },
    ],
    triggers: [
      { tr: 'Yoğun duygusal talep, "hemen konuşalım" baskısı', en: 'Intense emotional demand, "we need to talk now" pressure' },
      { tr: 'Kontrol edildiğini hissetmek', en: 'Feeling controlled' },
      { tr: 'Beklentinin sözsüz yüklenmesi', en: 'Expectation loaded without words' },
      { tr: 'Yetersiz bulunmak', en: 'Being told you are not enough' },
    ],
    needs: [
      { tr: 'Baskısız alan — döneceğine güvenilmesi', en: 'Space without pressure, trusted to return' },
      { tr: 'Duyguyu işlemek için zaman', en: 'Time to process feeling' },
      { tr: 'Takdir: yaptıklarının görülmesi', en: 'Appreciation: your doing being seen' },
    ],
    inConflict: {
      tr: 'Susarsın, konuyu kapatırsın, mantığa geçersin ya da fiziken uzaklaşırsın. Bu ilgisizlik değil, aşırı yüklenmiş bir sistemin freni.',
      en: 'You go quiet, close the topic, switch to logic, or physically step out. This is not indifference; it is an overloaded system braking.',
    },
    practices: [
      {
        tr: 'Kaçmak yerine SÜRE ver: "Şu an konuşamıyorum ama kaçmıyorum. Bir saat sonra dönerim." Sonra gerçekten dön. Bu tek cümle kaygılı partneri panikten çıkarır.',
        en: 'Instead of leaving, name a time: "I cannot talk right now, but I am not disappearing. I will come back in an hour." Then actually return. This one sentence pulls an anxious partner out of panic.',
      },
      {
        tr: 'Küçük paylaşımlarla ısın: günde bir cümle, tam bir itiraf değil. "Bugün iş yorucuydu" bile köprüdür.',
        en: 'Warm up with small disclosures: one sentence a day, not a full confession. Even "work was heavy today" is a bridge.',
      },
      {
        tr: 'Bedendeki sıkışmayı fark et: kapanma isteği geldiğinde göğsünde/boğazında ne oluyor? İsimlendirmek otomatiği yavaşlatır.',
        en: 'Notice the squeeze in the body: when the urge to close comes, what happens in your chest or throat? Naming it slows the automatic move.',
      },
      {
        tr: 'Yardım istemeyi bilerek çalış: küçük bir şey iste, gelmesine izin ver. Bağ, ihtiyaç görüldüğünde derinleşir.',
        en: 'Practice asking on purpose: request something small, let it arrive. Bonds deepen when a need is met.',
      },
      {
        tr: 'Kaygılıyla eşleştiysen: sessizliğin ona en pahalı gelen şey. Kısa bir "buradayım" mesajı, uzun bir açıklamadan daha çok işe yarar.',
        en: 'Paired with an anxious partner: your silence is the costliest thing. A short "I am here" does more than a long explanation.',
      },
    ],
    script: {
      tr: '"Seni önemsiyorum ama şu an dolu hissediyorum. Biraz alan alıp bir saat sonra döneceğim, kaçmıyorum."',
      en: '"I care about you, but I feel full right now. I am taking some space and coming back in an hour. I am not running."',
    },
  },

  disorganized: {
    name: { tr: 'Düzensiz bağlanma', en: 'Disorganized attachment' },
    emoji: '🌗',
    color: '#7aa2f7',
    essence: {
      tr: 'Hem çok yaklaşmak hem kaçmak istersin; yakınlık aynı anda hem yuva hem tehlike gibi gelir.',
      en: 'You want to come very close and to run; intimacy feels like home and danger at once.',
    },
    feels: {
      tr: 'Bir gün açılırsın, ertesi gün duvar örersin. Yakınlaştıkça huzursuzlanır, uzaklaşınca özlersin. Bu tutarsızlık seni de yorar.',
      en: 'One day you open, the next you build a wall. Closeness makes you restless, distance makes you long. The inconsistency tires you too.',
    },
    strengths: [
      { tr: 'Derin duygusal derinlik ve empati', en: 'Deep emotional range and empathy' },
      { tr: 'İnsanların gizlediğini sezme', en: 'Sensing what people hide' },
      { tr: 'Zoru göze alabilme, dönüşüm kapasitesi', en: 'Willingness to face hard things, capacity to transform' },
    ],
    triggers: [
      { tr: 'Öngörülemeyen davranış, karışık sinyaller', en: 'Unpredictable behaviour, mixed signals' },
      { tr: 'Yakınlığın aniden artması', en: 'Closeness intensifying suddenly' },
      { tr: 'Güvenin sarsıldığı anlar', en: 'Moments when trust is shaken' },
    ],
    needs: [
      { tr: 'Yavaşlık — acele etmeyen, istikrarlı bir tempo', en: 'Slowness: a steady pace that does not rush' },
      { tr: 'Tutarlılık: söylenenle yapılanın örtüşmesi', en: 'Consistency: words matching actions' },
      { tr: 'Güvenli bir zemin (çoğu zaman profesyonel destek dahil)', en: 'A safe base, often including professional support' },
    ],
    inConflict: {
      tr: 'Önce yaklaşır, sonra aniden kaparsın. Kendi tepkine sen de şaşırırsın.',
      en: 'You move in, then shut suddenly. Your own reaction surprises you too.',
    },
    practices: [
      {
        tr: 'Örüntüyü yaz: hangi an yaklaştın, hangi an kapandın? Yazıya dökülen döngü fark edilir hale gelir.',
        en: 'Write the pattern: when did you move in, when did you close? A cycle on paper becomes visible.',
      },
      {
        tr: 'Küçük ve tutulabilir sözler ver. Tutulan her küçük söz, sistemine "güvenli olabilir" bilgisini yükler.',
        en: 'Make small promises you can keep. Every kept promise teaches your system that safe is possible.',
      },
      {
        tr: 'Topraklanma: 5 şey gör, 4 şey duy, 3 şey dokun. Fırtına anında bedeni şimdiye çağır.',
        en: 'Grounding: 5 things you see, 4 you hear, 3 you touch. In the storm, call the body back to now.',
      },
      {
        tr: 'Bu örüntü çoğu zaman eski bir yaranın izidir ve tek başına çözülmesi zordur. Bir uzmanla çalışmak burada gerçekten fark yaratır — zayıflık değil, doğru araç.',
        en: 'This pattern often traces an old wound and is hard to untangle alone. Working with a professional genuinely helps here. Not weakness, just the right tool.',
      },
    ],
    script: {
      tr: '"İçimde iki ses var: biri yaklaş diyor, biri kaç. Sana kızgın değilim, kendi dalgamı geçiriyorum. Yavaş gidebilir miyiz?"',
      en: '"There are two voices in me: one says come closer, one says run. I am not angry at you, I am riding my own wave. Can we go slowly?"',
    },
  },
};

// ── İkili dinamik ──────────────────────────────────────────────────────────

export type PairDynamic = { headline: L; body: L };

const PAIR: Record<string, PairDynamic> = {
  'anxious|avoidant': {
    headline: { tr: 'Kovalayan ve geri çekilen', en: 'The chaser and the retreater' },
    body: {
      tr: 'En sık rastlanan ve en yorucu döngü. Biri yaklaştıkça diğeri geri çekilir, geri çekildikçe ilki daha çok yaklaşır. Kırılma noktası: kaçıngan tarafın "döneceğim" demesi ve dönmesi, kaygılı tarafın kovalamayı 20 dakika geciktirmesi. İkisi de aynı anda yapılırsa döngü gevşer.',
      en: 'The most common and most exhausting loop. One moves closer, the other pulls back, which makes the first move closer still. The break point: the avoidant saying "I will come back" and returning, the anxious delaying the chase by twenty minutes. Done together, the loop loosens.',
    },
  },
  'anxious|anxious': {
    headline: { tr: 'İki hassas anten', en: 'Two sensitive antennas' },
    body: {
      tr: 'Birbirinizi çabuk anlarsınız ama küçük bir belirsizlik ikinizi birden alarma geçirir. Yararlı olan: net ritüeller (günlük tek bir bağlanma anı) ve "ikimiz de kaygılıyız, bu bizim ortak dalgamız" diyebilmek.',
      en: 'You understand each other fast, but one small uncertainty alarms you both. What helps: clear rituals (one daily point of connection) and naming it: "we are both anxious, this is our shared wave".',
    },
  },
  'avoidant|avoidant': {
    headline: { tr: 'İki ada', en: 'Two islands' },
    body: {
      tr: 'Sakin, çatışmasız ama zamanla mesafe sessizce büyür. Kimse ilk adımı atmadığı için ilişki yavaşça soğur. Yararlı olan: takvime yazılmış, planlı yakınlık anları. Kendiliğinden gelmiyorsa, kasten kurun.',
      en: 'Calm, conflict-free, yet the distance quietly grows. Nobody takes the first step so the bond slowly cools. What helps: closeness that is scheduled on purpose. If it does not arise on its own, build it deliberately.',
    },
  },
  'secure|anxious': {
    headline: { tr: 'Zemin ve dalga', en: 'Ground and wave' },
    body: {
      tr: 'Güvenli tarafın istikrarı, kaygılı tarafın sistemini zamanla yatıştırır. Bağlanma stili sabit değildir; bu eşleşme kaygılı tarafı güvenliye doğru taşıyabilir. Dikkat: güvenli taraf sürekli "sakinleştiren" role sıkışmasın.',
      en: 'The steady one settles the anxious one’s system over time. Attachment style is not fixed; this pairing can move the anxious partner toward security. Watch out: the secure partner should not get stuck as the permanent soother.',
    },
  },
  'secure|avoidant': {
    headline: { tr: 'Zemin ve dağ', en: 'Ground and mountain' },
    body: {
      tr: 'Güvenli taraf baskı kurmadan yakınlık sunar; bu, kaçıngan tarafın açılması için en uygun iklimdir. Yavaş ama gerçek bir yumuşama olur. Dikkat: sessizlik kalıcı hâle gelirse konuşulmalı.',
      en: 'The secure partner offers closeness without pressure, the best climate for an avoidant to open. The softening is slow but real. Watch out: if the silence becomes permanent, it needs naming.',
    },
  },
  'secure|secure': {
    headline: { tr: 'İki sağlam zemin', en: 'Two steady grounds' },
    body: {
      tr: 'Çatışma olur ama onarım gelir. Bu eşleşmenin riski dışarıda değil, rehavette: konuşulan şeyler azalırsa ilişki durağanlaşır. Merakı canlı tutun.',
      en: 'Conflict happens, but repair follows. The risk here is not rupture but complacency: if you stop talking about real things, it stalls. Keep curiosity alive.',
    },
  },
  'secure|disorganized': {
    headline: { tr: 'Sabır ve fırtına', en: 'Patience and storm' },
    body: {
      tr: 'Güvenli tarafın tutarlılığı iyileştiricidir ama tek başına yeterli olmayabilir. Düzensiz tarafın profesyonel destek alması bu eşleşmeyi gerçekten dönüştürür.',
      en: 'The secure partner’s consistency heals, but may not be enough alone. Professional support for the disorganized partner genuinely transforms this pairing.',
    },
  },
  'anxious|disorganized': {
    headline: { tr: 'İki dalga üst üste', en: 'Two waves overlapping' },
    body: {
      tr: 'Yoğun ve tutkulu ama öngörülemez. İkiniz de tetiklendiğinde zemin kalmaz. Yararlı olan: tetiklenme anında ayrı düzenlenip sonra buluşma sözü.',
      en: 'Intense and passionate, yet unpredictable. When you are both triggered there is no ground left. What helps: regulating separately when triggered, with a promise to meet after.',
    },
  },
  'avoidant|disorganized': {
    headline: { tr: 'Kapanan ve savrulan', en: 'The one who closes and the one who swings' },
    body: {
      tr: 'Kaçıngan taraf kapandıkça düzensiz tarafın en derin korkusu (terk) tetiklenir, o da hem yaklaşır hem saldırır. Kırılma noktası yine aynı: kaçıngan tarafın "döneceğim" sözünü tutması.',
      en: 'As the avoidant closes, the disorganized partner’s deepest fear (abandonment) fires, and they both reach and lash out. The break point is the same: the avoidant keeping the promise to return.',
    },
  },
  'disorganized|disorganized': {
    headline: { tr: 'İki fırtına', en: 'Two storms' },
    body: {
      tr: 'Derin bir anlaşılma hissi ama çok değişken bir zemin. Bu eşleşmede dışarıdan destek (terapi) neredeyse zorunludur; suç değil, gereklilik.',
      en: 'A deep sense of being understood on very shifting ground. Outside support (therapy) is close to necessary here. Not a fault, a requirement.',
    },
  },
};

export function pairDynamic(a: AttachmentStyle, b: AttachmentStyle): PairDynamic | null {
  return PAIR[`${a}|${b}`] ?? PAIR[`${b}|${a}`] ?? null;
}

/** Nüfus içinde kabaca ne kadar yaygın (araştırma literatürü, yetişkin örneklemleri). */
export const PREVALENCE: Record<AttachmentStyle, number> = {
  secure: 55,
  anxious: 20,
  avoidant: 20,
  disorganized: 5,
};

// ── Zihnin devreye soktuğu stratejiler ─────────────────────────────────────
// Bağlanma literatüründeki "activating / deactivating strategies" ayrımı.
// Kullanıcının kendi otomatik hamlesini ANINDA tanıması için: örüntüyü
// isimlendirmek, ona kapılmakla arasına bir milimetre mesafe koyar.

export type StrategyKind = 'activating' | 'deactivating';

export type Strategy = {
  kind: StrategyKind;
  title: L;
  intro: L;
  signs: L[];
  antidote: L;
};

export const STRATEGIES: Record<StrategyKind, Strategy> = {
  activating: {
    kind: 'activating',
    title: { tr: 'Yaklaştırıcı hamleler', en: 'Activating moves' },
    intro: {
      tr: 'Bağ tehlikeye girdi sanan zihnin, teması geri kurmak için otomatik olarak devreye soktuğu hamleler. Amaç mantıklı olmak değil, mesafeyi kapatmak.',
      en: 'When your mind reads the bond as at risk, these moves fire automatically to restore contact. The goal is not to be reasonable; it is to close the distance.',
    },
    signs: [
      { tr: 'Telefonu tekrar tekrar kontrol etmek', en: 'Checking the phone over and over' },
      { tr: 'Karşındakini zihninde idealize etmek, kusurlarını unutmak', en: 'Idealising them in your head, forgetting the flaws' },
      { tr: 'Başka hiçbir şeye odaklanamamak', en: 'Being unable to focus on anything else' },
      { tr: 'Kıskandırma, geç yanıt verme gibi dolaylı testler', en: 'Indirect tests: provoking jealousy, replying late on purpose' },
      { tr: '"Bir daha böylesini bulamam" düşüncesi', en: 'The thought "I will never find someone like this again"' },
    ],
    antidote: {
      tr: 'Hamleyi ismiyle çağır: "bu bir yaklaştırıcı hamle, tehlike gerçek olmayabilir." Sonra ihtiyacını dolaylı test yerine düz cümleyle söyle.',
      en: 'Name the move: "this is an activating move, the danger may not be real." Then say the need in a plain sentence instead of an indirect test.',
    },
  },
  deactivating: {
    kind: 'deactivating',
    title: { tr: 'Uzaklaştırıcı hamleler', en: 'Deactivating moves' },
    intro: {
      tr: 'Yakınlık arttığında sistemin basıncı düşürmek için ürettiği hamleler. Sevgisizlik değil; fazla gelen teması azaltma refleksi.',
      en: 'As closeness rises, the system produces these to drop the pressure. Not a lack of love; a reflex to reduce contact that feels like too much.',
    },
    signs: [
      { tr: 'Küçük kusurlara odaklanıp büyütmek', en: 'Zooming in on small flaws and magnifying them' },
      { tr: 'Zihinde bir "hayalet eski sevgili" ile kıyaslamak', en: 'Comparing them to a "phantom ex" in your mind' },
      { tr: 'Sevgi sözü söylememek, mesafeyi koruyacak kadar açık kalmak', en: 'Withholding words of love, staying open only enough to keep distance' },
      { tr: 'Bir sonraki adımı (taşınmak, tanıştırmak) sürekli ertelemek', en: 'Endlessly postponing the next step' },
      { tr: 'Yakınlık anından sonra ani geri çekilme', en: 'Sudden withdrawal right after a moment of closeness' },
    ],
    antidote: {
      tr: 'Geri çekilme isteği geldiğinde önce sor: "gerçekten sorun mu var, yoksa yakınlık mı arttı?" Alan al ama süre vererek al, sessizce kaybolmadan.',
      en: 'When the urge to withdraw arrives, ask first: "is there a real problem, or did closeness just rise?" Take space, but name a time. Do not vanish.',
    },
  },
};

export function strategyFor(style: AttachmentStyle): StrategyKind | null {
  if (style === 'anxious') return 'activating';
  if (style === 'avoidant') return 'deactivating';
  if (style === 'disorganized') return null; // ikisi de dönüşümlü çalışır
  return null;
}

/** Bağımlılık paradoksu — güvenli bağ bağımlı yapmaz, özerkliği ARTIRIR. */
export const DEPENDENCY_PARADOX: { title: L; body: L } = {
  title: { tr: 'Bağımlılık paradoksu', en: 'The dependency paradox' },
  body: {
    tr: 'Sezgiye ters gelir: ihtiyaçları karşılanan insan daha yapışkan değil, daha özgür olur. Arkanda güvenilir bir zemin olduğunu bildiğinde daha çok risk alır, daha rahat yalnız kalır, daha net sınır koyarsın. Yani "kimseye ihtiyacım yok" bağımsızlık değil; birine güvenle yaslanabilmek asıl bağımsızlığı üretir.',
    en: 'It runs against intuition: a person whose needs are met becomes freer, not clingier. Knowing there is solid ground behind you, you take more risks, sit more easily alone, set clearer limits. "I need no one" is not independence; being able to lean on someone safely is what produces it.',
  },
};

/** Etkili iletişimin üç kuralı — her stil için geçerli, sonuç ekranında gösterilir. */
export const COMMUNICATION_RULES: { title: L; body: L }[] = [
  {
    title: { tr: 'Doğrudan söyle', en: 'Say it directly' },
    body: {
      tr: 'İma, test ve "anlaması gerekirdi" işe yaramaz. İhtiyacı açık cümleyle kur: "Akşamları on dakika konuşmak bana iyi geliyor."',
      en: 'Hints, tests and "they should have known" do not work. State the need plainly: "Ten minutes of talking in the evening does me good."',
    },
  },
  {
    title: { tr: 'Suçlama değil, kendi tarafından anlat', en: 'Speak from your side, not in blame' },
    body: {
      tr: '"Sen hep..." cümlesi savunma doğurur. "Ben ... hissettim" cümlesi kapı açar. Amaç haklı çıkmak değil, anlaşılmak.',
      en: '"You always..." breeds defence. "I felt..." opens a door. The aim is to be understood, not to win.',
    },
  },
  {
    title: { tr: 'Yanıtı bilgi olarak oku', en: 'Read the response as information' },
    body: {
      tr: 'İhtiyacını net söylediğinde gelen yanıt sana çok şey öğretir. Karşılanıyorsa zemin sağlam. Sürekli küçümseniyor ya da görmezden geliniyorsa, sorun senin "fazla istemen" değil, uyumsuzluktur.',
      en: 'When you state a need clearly, the response teaches you a lot. If it is met, the ground is solid. If it is repeatedly dismissed, the problem is not that you "want too much"; it is a mismatch.',
    },
  },
];
