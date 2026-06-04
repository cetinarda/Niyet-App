export interface GlossaryEntry {
  term: string;
  short: string;
  long: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  arketip: {
    term: 'Arketip',
    short: 'Tüm insanlığın paylaştığı evrensel iç desen.',
    long:
      'Arketip, Jung\'un kuramında, kolektif bilinçdışında yatan ve tüm kültürlerde tekrar tekrar ortaya çıkan ' +
      'evrensel iç desenlere verilen addır. Persona, Gölge, Anima, Animus, Self, Kahraman, Trickster, Bilge Yaşlı ' +
      'gibi figürler birer arketiptir.\n\n' +
      'Arketipler tek başına "iyi" ya da "kötü" değildir; her birinin aydınlık ve gölge yüzü vardır. Onları tanımak, ' +
      'içsel yapını anlamanın ve bütünleşmenin yoludur.',
  },
  mit: {
    term: 'Mit',
    short: 'Bir kültürün bilinçaltını taşıyan derin hikaye.',
    long:
      'Mit, tarihsel olarak doğru olmasa da psikolojik olarak çok derin bir gerçeği taşıyan anlatıdır. Prometheus\'un ateşi, ' +
      'İnanna\'nın yer altına inişi, Orpheus ve Eurydike — hepsi insan ruhunun temel meselelerini sembolik dilde anlatır.\n\n' +
      'Jung der ki mitler, bir halkın rüyalarıdır. Bireyin rüyaları nasıl bilinçaltını taşıyorsa, mitler de bir kültürün ' +
      'kolektif bilinçaltını taşır.',
  },
  imge: {
    term: 'İmge / Sembol',
    short: 'Bir kavramı görsel/duyusal yoğunlukta taşıyan biçim.',
    long:
      'İmge ya da sembol, soyut bir gerçeği somut bir biçime büründüren araçtır. Mandala bütünlüğü, yılan dönüşümü, ' +
      'ağaç yaşamı, su bilinçaltını taşır.\n\n' +
      'Bir sembolün gücü, onun çok katmanlı oluşundadır. Tek anlama indirgenmez — kişiye, kültüre, ana göre farklı tonlarda konuşur. ' +
      'Sakin Mitler\'de 30 evrensel imge yer alır.',
  },
  rüya: {
    term: 'Rüyada Görmek',
    short: 'Bir sembol rüya içinde geldiğinde ne söylüyor?',
    long:
      'Jung\'a göre rüyalar, bilinçaltının bilinçle kurduğu en doğrudan diyalog kanalıdır. Bir arketip ya da mit ' +
      'rüyanda görüldüğünde, çoğunlukla içsel bir denge ya da bir farkındalık çağrısı taşır.\n\n' +
      'Aynı sembol uyanık hayatta karşına çıktığında farklı bir şey söyler; rüyada görüldüğünde ise bilinçdışının ' +
      'işlemekte olduğu içsel bir gerçeği işaret eder. Her kartta hem rüya hem gerçek hayat yorumu birlikte sunulur.',
  },
  gerçek: {
    term: 'Gerçek Hayatta',
    short: 'Bir sembol uyanık deneyimde karşına çıktığında ne söylüyor?',
    long:
      'Bir arketip, mit ya da sembolün uyanık hayatta belirmesi — bir kitapta görmek, bir kişide tanımak, ' +
      'art arda denk gelmek, ısrarla tekrar etmek — onun şu an seninle bir iletişim kurmaya çalıştığını gösterir.\n\n' +
      '"Eşzamanlılık" (synchronicity) dediğimiz olay tam olarak budur. Jung bunu, dış olayların iç süreçle anlamlı ' +
      'biçimde örtüşmesi olarak tanımlar.',
  },
  bul: {
    term: 'Rehber Mitini Bulmak',
    short: 'İki yol: sorularla ya da doğum bilgileriyle.',
    long:
      'Rehber arketip ve mitini bulmak için iki yol vardır:\n\n' +
      '• Sorularla Keşfet: 7 kısa soru. Cevaplarındaki örüntü, hangi arketipin bu dönemde sana en güçlü ' +
      'eşlik ettiğini gösterir.\n\n' +
      '• Doğum Bilgilerimle Bul: Doğum tarihi, saati ve şehri. Hayat Yolu sayın, doğduğun mevsimin enerjisi ve ' +
      'doğum saatinin tonu birleşerek sana özel bir arketip + mit + sembol üçlüsü öneriyor.',
  },
  hafta: {
    term: 'Haftalık Rehber',
    short: 'Bir dönem boyunca seninle olan geçici arketip.',
    long:
      'Arketipinin tamamı seninle doğar, ömür boyu kalır. Haftalık rehber ise belirli bir döneminde sana eşlik eden ' +
      'geçici figürdür. Bir sınav, bir dönüşüm, bir kriz anında yanına gelir; görevini tamamlayınca yerini başka birine bırakır.\n\n' +
      'Sakin Mitler\'de her hafta evrensel bir arketip rotasyonla gelir; doğum bilgilerin tamamsa ek olarak kişisel ' +
      'haftalık rehberin de hesaplanır.',
  },
  hayatYolu: {
    term: 'Hayat Yolu Sayısı',
    short: 'Doğum tarihinin numerolojik özeti — ana enerjini gösterir.',
    long:
      'Hayat Yolu sayısı, doğum tarihinin tüm rakamlarının tek bir sayıya indirgenmesiyle bulunur ' +
      '(örn. 15.06.1990 → 1+5+0+6+1+9+9+0=31→4).\n\n' +
      '1\'den 9\'a, ek olarak usta sayıları 11, 22 ve 33. Her sayı belirli bir arketipi temsil eder: Öncü, Arabulucu, ' +
      'Yaratıcı, Yapıcı, Özgür Ruh, Sevgi Elçisi, Bilge, Güç ve Öğretmen.',
  },
  numeroloji: {
    term: 'Numeroloji',
    short: 'Sayıların ardındaki ruhsal anlamları okuma sanatı.',
    long:
      'Numeroloji, sayıların sembolik ve ruhsal anlamlarını inceleyen antik bir bilgi sistemidir. Doğum tarihin ve ' +
      'isminin harfleri, kişiliğinin farklı katmanlarını gösteren sayılara dönüştürülür.\n\n' +
      'Dört temel sayı: Hayat Yolu (kaderin), İfade (yetenekler), Ruh İsteği (içsel arzular) ve Kişilik ' +
      '(dışa yansıttığın yüz). Her biri farklı bir aynadır.',
  },
  humanDesign: {
    term: 'Human Design',
    short: 'Karar verme stratejini gösteren modern sentez.',
    long:
      'Human Design, astroloji, I-Ching, Kabala, çakralar ve kuantum fiziğini birleştiren modern bir sistemdir. ' +
      'Doğum bilgilerine göre beş ana tipten birine düşersin: Jeneratör, Manifesting Jeneratör, Projektör, Manifestor ve Reflektör.\n\n' +
      'Her tipin kendi karar verme stratejisi ve "Not-Self" temaları vardır. Stratejine göre yaşamak içsel sürtünmeyi azaltır.',
  },
  persona: {
    term: 'Persona',
    short: 'Dünyaya gösterdiğin maske.',
    long:
      'Persona, Latince "maske" demektir. Jung\'a göre, dünyaya çıkarken giydiğin sosyal yüzdür — işteki kimliğin, ' +
      'ailedeki rolün, görünürdeki kişiliğin.\n\n' +
      'Persona zorunludur; tamamen onsuz toplumsal hayat sürdüremezsin. Ama persona ile tamamen özdeşleşirsen kendi ' +
      'gerçek yüzünü kaybedersin.',
  },
  gölge: {
    term: 'Gölge',
    short: 'Kendinde kabul etmediğin yan.',
    long:
      'Gölge, bilinçli olarak reddettiğin, bastırdığın ya da kabul edemediğin tüm özelliklerin toplamıdır. Öfke, ' +
      'kıskançlık, hırs, tembellik — bunlar genelde gölgenin parçalarıdır. Ama bazen sahiplenilmemiş yaratıcılık, ' +
      'cesaret ve sevgi de gölgede saklanır.\n\n' +
      'Jung der ki: "Gölgeni bilmek aydınlanmaktan değil, karanlığını bilinçli görmekten gelir."',
  },
  anima: {
    term: 'Anima / Animus',
    short: 'İçindeki karşı-cins ruh.',
    long:
      'Anima, erkek psikesindeki dişil ruhtur — sezgi, duygu, ilham. Animus ise kadın psikesindeki eril ruh — mantık, ' +
      'irade, sınır kurma.\n\n' +
      'Bunlar bilinçaltında uyuyorsa dışarıya yansıtılır — kişi karşı cinste aslında kendi içsel imgesinin peşinden ' +
      'koşar. Tanınınca, içsel bir denge ve yaratıcılık olarak entegre olur.',
  },
  self: {
    term: 'Self (Öz)',
    short: 'Psikenin merkezi ve bütünlüğü.',
    long:
      'Self, Jung\'un kuramında, bilinç ve bilinçaltının birlikte oluşturduğu psişik merkez ve bütünlüktür. Egonun ' +
      'çok ötesinde, "içsel Tanrı-imgesi" olarak da adlandırılır.\n\n' +
      'Bireyleşme sürecinin varış noktası Self\'tir. Mandalada görülen merkez, mitlerde görülen "büyük yaşlı" ya da ' +
      '"kutsal çocuk", hep Self\'in sembolleridir.',
  },
  trickster: {
    term: 'Trickster (Hilebaz)',
    short: 'Kuralı kırarak gerçeği gösteren oyunbaz.',
    long:
      'Trickster, mitolojide kuralları çiğneyen ama bu sayede bir hakikati gösteren figürdür — Hermes, Loki, Coyote, ' +
      'Nasreddin Hoca, Keloğlan.\n\n' +
      'Modern hayatta Trickster, beklenmedik şakaların, yaratıcı kaosun ve sınır aşan ilhamın kaynağıdır. Gölge ' +
      'yanında ise manipülatör ve dolandırıcı olarak görünür.',
  },
  kahraman: {
    term: 'Kahraman',
    short: 'Çağrıyı duyup eşiği geçen ruh.',
    long:
      'Kahraman arketipi, içsel ya da dışsal bir çağrıya yanıt vererek bildiği dünyadan ayrılan, sınanan, gölgesiyle ' +
      'yüzleşen ve dönüp ödülünü paylaşan kişidir. Joseph Campbell\'ın "monomit" haritası bu yolculuğu anlatır.\n\n' +
      'Modern hayatta kahramanı her büyük geçişte aktif olur: yeni iş, yeni şehir, ebeveynlik, hastalık. Korku doğal — ' +
      'kahraman korkmaz değil, korkuya rağmen ilerler.',
  },
  bilgeYaşlı: {
    term: 'Bilge Yaşlı',
    short: 'Zor anda yol gösteren iç ses.',
    long:
      'Bilge Yaşlı (senex), mitolojide Merlin, Gandalf, Hızır, Yoda gibi figürlerle temsil edilir. Yolculuğun en sıkışık ' +
      'anında belirip "yol şuradan" diyen iç sestir.\n\n' +
      'Jung\'a göre bilge yaşlı, krizde bilinçaltından yükselen bilgeliktir. Modern karşılığı: doğru anda söz alan terapist, ' +
      'mentor, dürüst dost.',
  },
  içÇocuk: {
    term: 'İç Çocuk',
    short: 'Hâlâ içinde yaşayan ilk halin.',
    long:
      'İç Çocuk arketipi iki yön taşır: ilahi çocuk (saf neşe, merak, hayret) ve yaralı çocuk (terk edilmişlik, ihmal, korku).\n\n' +
      'Bir yetişkinin krizleri genellikle iç çocuğun bakım çığlığıdır. Onu görmek, ona sahip çıkmak, hem yaratıcılığı ' +
      'hem dayanıklılığı çağırır.',
  },
  sakinAilesi: {
    term: 'Sakin Ailesi',
    short: 'Aynı kökten beslenen rehber uygulamalar serisi.',
    long:
      'Sakin Ailesi, aynı ruhu farklı sembol dilleriyle taşıyan rehber uygulamalardan oluşur:\n\n' +
      '• Sakin Hayvan — Anadolu\'dan dünyaya 50 totem hayvan.\n' +
      '• Sakin Mitler — Jung\'un izinde arketipler, mitler ve sembolik imgeler.\n\n' +
      'Tasarım aynı, içerik farklı. Her biri ruhun başka bir köşesine konuşur.',
  },
};

export function getGlossaryEntry(key: string): GlossaryEntry | null {
  return GLOSSARY[key] || null;
}
