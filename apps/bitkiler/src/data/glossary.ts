export interface GlossaryEntry {
  term: string;
  short: string;
  long: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  totem: {
    term: 'Totem Hayvan',
    short: 'Seninle doğan, ömür boyu kalan ruh hayvanı.',
    long:
      'Totem hayvan, her insanın doğasında taşıdığı ruhsal eşlikçidir. Şamanik geleneklerden gelen bu kavram, bir insanın temel enerjisini, ' +
      'güçlü yanlarını ve gizli yeteneklerini temsil eden hayvan figürüne işaret eder.\n\n' +
      'Totem değişmez — seninle doğar, seninle gelişir. Onu tanımak, kendini tanımanın en eski yollarından biridir.',
  },
  nagual: {
    term: 'Nagual',
    short: 'Belirli bir dönemde sana eşlik eden geçici rehber.',
    long:
      'Nagual, Mezoamerikan ve şamanik geleneklerden gelen bir kavramdır. Totem hayvanın seninle doğar, ömür boyu kalır; nagual ise ' +
      'belirli bir döneminde sana eşlik eden geçici bir rehberdir.\n\n' +
      'Bir sınav, bir dönüşüm, bir kriz anında yanına gelir. Görevini tamamlayınca yerini başka bir rehbere bırakır. Bu uygulamada haftalık ' +
      'olarak değişen evrensel bir nagual ve doğum haritana göre belirlenen kişisel naguelin gösterilir.',
  },
  mit: {
    term: 'Mit',
    short: 'Ruhun karşılaştığı sembolik bir güç — Gölge, Eşik, Şimşek...',
    long:
      'Mitler, hayvan biçiminde değil de sembolik güç olarak gelen ruh rehberleridir: Gölge, Ayna, Köprü, Eşik, Şimşek, Volkan...\n\n' +
      'Jung\'un arketipleri gibi, mitler bilinçaltının dilini taşır. Karşına çıkan mit, o anda ruhunun hangi öğreniyle karşı karşıya olduğunu ' +
      'gösterir. Mitler Sözlüğü\'nde 50 sembolik güç bulabilirsin.',
  },
  hayatYolu: {
    term: 'Hayat Yolu Sayısı',
    short: 'Doğum tarihinin numerolojik özetidir — ana enerjini gösterir.',
    long:
      'Hayat yolu sayısı, doğum tarihinin tüm rakamlarının tek bir sayıya indirgenmesiyle bulunur (örn. 15.06.1990 → 1+5+0+6+1+9+9+0=31→4).\n\n' +
      '1\'den 9\'a, ek olarak usta sayıları 11, 22 ve 33. Her sayı belirli bir arketipi temsil eder: Öncü, Arabulucu, Yaratıcı, Yapıcı, Özgür Ruh, ' +
      'Sevgi Elçisi, Bilge, Güç ve Öğretmen. Hayat yolun, dünyaya geldiğin temel görevin sembolüdür.',
  },
  numeroloji: {
    term: 'Numeroloji',
    short: 'Sayıların ardındaki ruhsal anlamları okuma sanatı.',
    long:
      'Numeroloji, sayıların sembolik ve ruhsal anlamlarını inceleyen antik bir bilgi sistemidir. Doğum tarihin ve isminin harfleri, ' +
      'kişiliğinin farklı katmanlarını gösteren sayılara dönüştürülür.\n\n' +
      'Dört temel sayı: Hayat Yolu (kaderin), İfade (yetenekler), Ruh İsteği (içsel arzular) ve Kişilik (dışa yansıttığın yüz). Her biri ' +
      'farklı bir aynadır.',
  },
  ifade: {
    term: 'İfade Sayısı',
    short: 'İsminin harflerinden gelen — doğal yeteneklerin ve potansiyelin.',
    long:
      'İfade sayısı (Destiny / Expression number), tam isminin (isim+soyisim) harflerinin sayısal karşılıklarının toplamından bulunur. ' +
      'Bu sayı, doğuştan getirdiğin yetenekleri ve hayatında gerçekleştirmen gereken potansiyeli temsil eder.',
  },
  ruhIstegi: {
    term: 'Ruh İsteği Sayısı',
    short: 'İsmindeki sesli harflerden — içsel motivasyonun.',
    long:
      'Ruh İsteği (Soul Urge / Heart\'s Desire), ismindeki sesli harflerin numerolojik toplamıdır. Sana ne yaptığını değil, neden yaptığını söyler. ' +
      'Gizli motivasyonların, içsel arzuların ve neyle gerçekten doyduğunun göstergesidir.',
  },
  kisilik: {
    term: 'Kişilik Sayısı',
    short: 'İsmindeki sessiz harflerden — dünyaya gösterdiğin yüz.',
    long:
      'Kişilik sayısı, ismindeki sessiz harflerin numerolojik toplamıdır. İlk izlenim olarak dışa yansıttığın enerjiyi, başkalarının seni nasıl ' +
      'algıladığını gösterir. Maskeyle gerçek arasında bir köprüdür.',
  },
  humanDesign: {
    term: 'Human Design',
    short: 'Astroloji, I Ching, çakra ve Kabala\'yı birleştiren bir sistem.',
    long:
      'Human Design, 1987\'de Ra Uru Hu tarafından geliştirilen modern bir ruhsal sistemdir. Doğum bilgilerine göre 5 ana tipten birine ' +
      'aitsindir: Jeneratör, Manifesting Jeneratör, Projektör, Manifestor veya Reflektör.\n\n' +
      'Her tipin kendine özgü bir stratejisi (karar verme yolu) ve "not-self" teması (yanlış yolda olduğunu hissettiren duygu) vardır. ' +
      'Kendi tasarımını yaşamak, akışa girmenin anahtarıdır.',
  },
  jeneratör: {
    term: 'Jeneratör',
    short: 'Yaşam enerjisinin kaynağı. Strateji: Yanıt vermek.',
    long:
      'Jeneratörler popülasyonun yaklaşık %37\'sidir. Sakral merkezleri tanımlıdır, yani derin bir içgüdüsel evet/hayır enerjisi taşırlar.\n\n' +
      'Stratejileri yanıt vermektir — yani bir şeyi başlatmak yerine, hayatın onlara getirdiğine evet veya hayır demek. Doğru şeylere evet ' +
      'derlerse tatmin (satisfaction); yanlışlara evet derlerse hayal kırıklığı (frustration) yaşarlar.',
  },
  manifestingJeneratör: {
    term: 'Manifesting Jeneratör',
    short: 'Çok boyutlu, hızlı bir Jeneratör. Strateji: Yanıt ver, harekete geç.',
    long:
      'Manifesting Jeneratörler, Jeneratörün sakral enerjisini Manifestor\'un başlatma gücüyle birleştirir. Birden fazla şeyi aynı anda ' +
      'yapabilir, hızlı yön değiştirebilirler.\n\n' +
      'Strateji: Önce yanıt ver (sakralın evet desin), sonra harekete geç ve adımlarını başkalarına bildir. Not-self teması öfke ve hayal ' +
      'kırıklığıdır.',
  },
  projektör: {
    term: 'Projektör',
    short: 'Sistemleri ve insanları derinden gören rehber. Strateji: Davet bekle.',
    long:
      'Projektörler popülasyonun %20\'sidir. Sakral merkezleri tanımlı değildir; sürekli enerji üretmezler. Ama insanları ve sistemleri ' +
      'derinden okuma yetenekleri vardır.\n\n' +
      'Strateji: Davet beklemek. Davet edilmeden öncülük etmeye çalışırlarsa acı (bitterness) yaşarlar. Doğru davet geldiğinde ise muazzam ' +
      'rehberlik enerjisi sunarlar.',
  },
  manifestor: {
    term: 'Manifestor',
    short: 'Bağımsız başlatıcı. Strateji: Bildirmek.',
    long:
      'Manifestor\'lar popülasyonun %9\'udur. Doğal başlatıcılardır — yeni döngüler açabilir, hareket yaratabilirler. Sakral merkezleri ' +
      'tanımlı değildir.\n\n' +
      'Strateji: Harekete geçmeden önce etrafındakilere bildirmek. Bu, kontrol kaybı korkusuyla doğan öfkeyi (anger) önler. Özgürlük onlar ' +
      'için hayatidir.',
  },
  reflektör: {
    term: 'Reflektör',
    short: 'Toplumun aynası. Strateji: 28 gün bekle.',
    long:
      'Reflektörler popülasyonun yalnızca %1\'idir. Hiçbir merkezleri tanımlı değildir — yani çevrenin enerjisini tamamen yansıtırlar. ' +
      'Bir topluluğun sağlığının aynasıdırlar.\n\n' +
      'Strateji: Önemli kararlar için Ay\'ın 28 günlük döngüsünü beklemek. Bu süre boyunca aynı kararı farklı ortamlarda hissetmek, doğru ' +
      'cevabı verir. Not-self teması hayal kırıklığıdır.',
  },
  notSelf: {
    term: 'Not-Self Tema',
    short: 'Yanlış yolda olduğunu hissettiren duygu.',
    long:
      'Human Design\'da her tipin kendine özgü bir "not-self" teması vardır — bu, kendi tasarımınla uyumsuz yaşadığında hissedilen duygudur.\n\n' +
      '• Jeneratör/Manifesting Jeneratör: Hayal kırıklığı\n' +
      '• Projektör: Acı, kızgınlık\n' +
      '• Manifestor: Öfke\n' +
      '• Reflektör: Hayal kırıklığı\n\n' +
      'Bu duygu, yön değiştirmen için gelen içsel sinyaldir — yargılayıp bastırmak değil, dinlemek gerekir.',
  },
  unsur: {
    term: 'Unsur (Element)',
    short: 'Doğanın dört temel niteliği: Ateş, Su, Toprak, Hava.',
    long:
      'Unsurlar, antik dünyanın dört temel yapı taşıdır. Her unsur belirli bir mizacı ve enerjiyi temsil eder:\n\n' +
      '△ ATEŞ — Tutku, irade, dönüşüm, eylem\n' +
      '▽ SU — Duygu, sezgi, akış, derinlik\n' +
      '⊕ TOPRAK — Beden, sabır, gerçeklik, kök\n' +
      '○ HAVA — Akıl, iletişim, fikir, hareket\n\n' +
      'Doğduğun mevsim ve yıldız hareketleri sana baskın bir unsur verir. Bu unsuru tanımak, kendi doğasının ritmiyle uyum kurmayı sağlar.',
  },
  arketip: {
    term: 'Arketip',
    short: 'Tüm insanlığın paylaştığı evrensel sembolik figür.',
    long:
      'Arketip, Carl Jung\'un derinlik psikolojisindeki temel kavramdır. Kollektif bilinçaltında yer alan, tüm kültürlerce paylaşılan ' +
      'evrensel figürlerdir: Anne, Baba, Kahraman, Bilge, Gölge, Trickster...\n\n' +
      'Hayvanlar da arketip olarak gelir — Yılan (dönüşüm), Kartal (yüksek vizyon), Kurt (sezgi). Karşına çıkan arketip, içindeki o yanın ' +
      'uyanması gerektiğini söyler.',
  },
  golge: {
    term: 'Gölge (Shadow)',
    short: 'Bilincimizde reddettiğimiz, bastırdığımız yanımız.',
    long:
      'Jung\'un "gölge" kavramı, kişiliğimizin görmek istemediğimiz, bastırdığımız ya da utandığımız yanlarını ifade eder. Bunlar ' +
      'kötü değildir — sadece bilinçli benliğimizin reddettiği parçalardır.\n\n' +
      'Gölge işi, bu yanları görmek, anlamak ve bütünleştirmektir. Tanımlanmayan gölge dışarıda — başkalarında ya da olaylarda — kendini ' +
      'gösterir. Tanındığında ise muazzam bir güce dönüşür.',
  },
  kisiselYil: {
    term: 'Kişisel Yıl',
    short: 'Numerolojik yılına özgü tema — 9 yıllık döngünün hangi adımında olduğun.',
    long:
      'Kişisel yıl, doğum gününün ve ayının içinde bulunduğun yılla toplanmasıyla bulunur. 1\'den 9\'a kadar bir döngü oluşturur:\n\n' +
      '1: Başlangıç · 2: İlişki · 3: Yaratım · 4: Temel · 5: Değişim · 6: Sorumluluk · 7: İçe dönüş · 8: Hasat · 9: Tamamlanma\n\n' +
      'Her yıl farklı bir ders sunar. Hangi yılda olduğunu bilmek, yılın akışıyla uyum kurmana yardımcı olur.',
  },
  rehber: {
    term: 'Rehber Hayvan',
    short: 'Kişiliğinin ve enerjinin yansıdığı totem hayvan.',
    long:
      'Rehber hayvan, bu uygulamada totem hayvanın eş anlamlısı olarak kullanılır. Doğum tarihin, mevsimin, saatin ve kişilik soruların ' +
      'üzerinden hangi hayvanın enerjisini en güçlü taşıdığın belirlenir.\n\n' +
      'Rehber hayvanın seni temsil eden değil, sana eşlik eden bir öğretmendir. Onun özelliklerini incelemek, kendi yanlarını da daha ' +
      'görünür kılar.',
  },
};

export function getGlossaryEntry(key: string): GlossaryEntry | undefined {
  return GLOSSARY[key];
}
