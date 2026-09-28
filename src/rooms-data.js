// ── SAKİN ODALAR: içerik (1.4.3) ─────────────────────────────────────────────
// Kaynak: kullanıcının diğer projesi Kozmik Gemi'nin "Gemi Odaları" (kozmikgemi.
// netlify.app, data.js), Sakin'in ruhuna uyarlandı:
//  - Doğrulanamayan sağlık/bilim iddiaları ÇIKARILDI ("bağışıklığı %30 güçlendirir",
//    "528 Hz DNA onarır", "45 dk = 4 saat uyku", "titreme = saatlerce terapi"):
//    App Store 1.4.1 sağlık iddiası riski + Sakin gelenek anlatısını "anlatılır" diye
//    yazar, bilim gibi değil.
//  - Kozmik Gemi'deki rehber adları/telefonları/adresleri ve etkinlikler KOPYALANMADI
//    (örnek veri gibi duruyor; gerçekmiş gibi göstermek yanıltıcı olurdu). Rehberler ve
//    etkinlikler yönetim panelinden girilir (netlify/functions/rooms-admin.mjs).
//  - Her oda Sakin'deki bir pratiğe bağlanır (`practice`): odayı okuyan kişi o frekansı
//    uygulamada hemen deneyebilir. Orkestra metaforu: her oda bir enstrüman.
//  - Tantra yalnızca 18 yaş ve üzeri (doğum tarihinden) görünür (`minAge`).
// Metinler 7 dil. Uzun gövde (hero/teachings) tr + en asıl, diğer diller çeviri.

export const ROOMS_MOTTO = {
  tr: "Evren bir orkestradır. Senin sessizliğin bile bir nota.",
  en: "The universe is an orchestra. Even your silence is a note.",
  de: "Das Universum ist ein Orchester. Selbst deine Stille ist ein Ton.",
  es: "El universo es una orquesta. Incluso tu silencio es una nota.",
  pt: "O universo é uma orquestra. Até o teu silêncio é uma nota.",
  fr: "L'univers est un orchestre. Même ton silence est une note.",
  ja: "宇宙はオーケストラ。あなたの沈黙さえ、ひとつの音。",
};

export const ROOMS = [
  {
    id: "reiki", ico: "✋", freq: "7.83 Hz · Schumann", hue: ["#c8a2ff", "#5ad9ff"], practice: "chakra",
    title:   { tr:"Reiki Odası", en:"Reiki Room", de:"Reiki-Raum", es:"Sala de Reiki", pt:"Sala de Reiki", fr:"Salle de Reiki", ja:"レイキの部屋" },
    tagline: { tr:"Evrensel yaşam enerjisinin avuçlarındaki dansı.", en:"The dance of universal life energy in your palms.", de:"Der Tanz der universellen Lebensenergie in deinen Händen.", es:"La danza de la energía vital universal en tus manos.", pt:"A dança da energia vital universal nas tuas mãos.", fr:"La danse de l'énergie vitale universelle dans tes paumes.", ja:"手のひらで踊る、宇宙の生命エネルギー。" },
    hero: {
      tr:"Reiki, Japoncada \"rei\" (evrensel) ve \"ki\" (yaşam enerjisi) sözcüklerinden gelir. Mikao Usui'nin 1922'de Kurama Dağı'ndaki 21 günlük inzivasında yeniden hatırladığı anlatılan, ellerle yapılan bir dinginlik pratiğidir. Aynı akışın Tibet'te, eski Mısır'da ve Hint prana öğretisinde farklı adlarla anıldığı söylenir.",
      en:"Reiki comes from the Japanese \"rei\" (universal) and \"ki\" (life energy). It is a hands-on practice of stillness that Mikao Usui is said to have remembered during a 21-day retreat on Mount Kurama in 1922. The same flow is said to appear under other names in Tibet, ancient Egypt and the Indian teaching of prana.",
    },
    teachings: [
      { h:{ tr:"Kadim kök", en:"Ancient root" }, p:{ tr:"Sanskritçe \"prana\", Çincede \"qi\", Polinezyacada \"mana\": yaşam soluğunun farklı adları. Reiki bu soluğu avuçlardan akan sakin bir dikkat olarak ele alır.", en:"Sanskrit \"prana\", Chinese \"qi\", Polynesian \"mana\": different names for the breath of life. Reiki treats it as a calm attention flowing through the palms." } },
      { h:{ tr:"Beş ilke (Gokai)", en:"Five principles (Gokai)" }, p:{ tr:"Sadece bugün:", en:"Just for today:" },
        list:{ tr:["Öfkelenmeyeceğim.","Endişelenmeyeceğim.","Şükredeceğim.","İşimi dürüstçe yapacağım.","Tüm canlılara nazik olacağım."], en:["I will not be angry.","I will not worry.","I will be grateful.","I will do my work honestly.","I will be kind to every living thing."] } },
      { h:{ tr:"Üç derece", en:"Three degrees" }, p:{ tr:"Shoden (1. derece) kendine dokunmayı, Okuden (2. derece) sembollerle çalışmayı, Shinpiden (usta) öğretmeyi kapsar.", en:"Shoden (1st degree) is about touching yourself, Okuden (2nd degree) about working with symbols, Shinpiden (master) about teaching." } },
      { h:{ tr:"Pratik", en:"Practice" }, p:{ tr:"Avuçlar bedenin enerji merkezlerine sırayla konur: taç, üçüncü göz, boğaz, kalp, solar pleksus, sakral, kök. Çoğu kişi bunu derin bir gevşeme olarak anlatır.", en:"The palms rest on the body's energy centres in turn: crown, third eye, throat, heart, solar plexus, sacral, root. Most people describe it as a deep letting go." } },
    ],
  },
  {
    id: "kundalini", ico: "🐍", freq: "Mool Mantra", hue: ["#ff9ec7", "#ffd28a"], practice: "nefes",
    title:   { tr:"Kundalini Yoga", en:"Kundalini Yoga", de:"Kundalini Yoga", es:"Kundalini Yoga", pt:"Kundalini Yoga", fr:"Kundalini Yoga", ja:"クンダリーニ・ヨガ" },
    tagline: { tr:"Omurganda kıvrılan ışık yılanını uyandır.", en:"Wake the coiled serpent of light along your spine.", de:"Wecke die zusammengerollte Lichtschlange entlang deiner Wirbelsäule.", es:"Despierta la serpiente de luz enroscada en tu columna.", pt:"Desperta a serpente de luz enrolada na tua coluna.", fr:"Éveille le serpent de lumière lové le long de ta colonne.", ja:"背骨に眠る光の蛇を目覚めさせる。" },
    hero: {
      tr:"Kundalini, Sanskritçe \"kıvrılmış\" demektir. Kök çakranın derinliğinde uyuduğu anlatılan canlılık gücüdür; tantra geleneğinde Shakti olarak bilinir. Nefes, mantra, beden kilitleri (bandha) ve mudralarla yukarı yükseltildiğine inanılır. Yogi Bhajan 1968'de Batı'da açıkça öğretmeden önce kapalı kapılar ardında aktarılırdı.",
      en:"Kundalini means \"coiled\" in Sanskrit. It is described as a vital force sleeping at the base of the spine, known as Shakti in the tantric tradition, and believed to rise through breath, mantra, body locks (bandha) and mudras. Before Yogi Bhajan taught it openly in the West in 1968, it was passed on behind closed doors.",
    },
    teachings: [
      { h:{ tr:"Yedi çakra", en:"Seven chakras" }, p:{ tr:"Kök, sakral, solar pleksus, kalp, boğaz, üçüncü göz, taç. Kundalini'nin bu sütun boyunca yükseldiği anlatılır.", en:"Root, sacral, solar plexus, heart, throat, third eye, crown. Kundalini is said to rise along this column." } },
      { h:{ tr:"Ateş nefesi", en:"Breath of fire" }, p:{ tr:"Burundan ritmik, hızlı ve eşit nefes; karın körük gibi çalışır. Birkaç nefesle başla, başın dönerse hemen normal nefese dön. Hamilelikte ve tansiyon sorunlarında önerilmez.", en:"Rhythmic, quick, even breathing through the nose, the belly working like bellows. Start with a few breaths and return to normal breathing if you feel dizzy. Not advised in pregnancy or with blood pressure issues." } },
      { h:{ tr:"Kriya", en:"Kriya" }, p:{ tr:"Bir kriya; nefes, hareket, mantra ve odaktan oluşan tam bir diziliştir. Sat Kriya en temel olanıdır:", en:"A kriya is a full sequence of breath, movement, mantra and focus. Sat Kriya is the most basic one:" },
        list:{ tr:["Dik otur, eller başın üzerinde kenetli","İşaret parmakları yukarı","\"Sat\" derken göbeği hafifçe içeri çek, \"Nam\" derken bırak","Kısa başla, bedenin istediği kadar sür"], en:["Sit tall, hands clasped above your head","Index fingers pointing up","Gently draw the navel in on \"Sat\", release on \"Nam\"","Start short and continue as long as your body wants"] } },
      { h:{ tr:"Mool Mantra", en:"Mool Mantra" }, p:{ tr:"\"Ek Ong Kar Sat Nam...\": yaradan ile öz arasındaki köprü olarak söylenir; sabah üç kez yüksek sesle okunduğunda kalbi hizaladığına inanılır.", en:"\"Ek Ong Kar Sat Nam...\": chanted as a bridge between the creator and the self; three times aloud in the morning is believed to realign the heart." } },
    ],
  },
  {
    id: "ses", ico: "🎵", freq: "432 / 528 Hz", hue: ["#5ad9ff", "#b8a2ff"], practice: "ses",
    title:   { tr:"Ses Şifası", en:"Sound Healing", de:"Klangheilung", es:"Sanación con sonido", pt:"Cura pelo som", fr:"Guérison par le son", ja:"音の癒やし" },
    tagline: { tr:"Frekans, hücrenin anadilidir.", en:"Frequency is the mother tongue of the cell.", de:"Frequenz ist die Muttersprache der Zelle.", es:"La frecuencia es la lengua materna de la célula.", pt:"A frequência é a língua materna da célula.", fr:"La fréquence est la langue maternelle de la cellule.", ja:"周波数は、細胞の母語。" },
    hero: {
      tr:"Ses şifası, evrenin titreşimsel doğasına dayanan kadim bir anlatıdır. Pisagor gezegenlerin müziğinden (musica universalis) söz etti; Tibet'te yedi metalden çanaklar döküldü; Aborjinler didgeridoo ile rüya zamanını çağırdı. Bugün de pek çok kişi sesle derin bir dinginliğe iner.",
      en:"Sound healing is an ancient story built on the vibrational nature of the universe. Pythagoras spoke of the music of the spheres (musica universalis); bowls were cast from seven metals in Tibet; Aboriginal peoples called the dreamtime with the didgeridoo. Many people still drop into deep calm through sound.",
    },
    teachings: [
      { h:{ tr:"Solfej frekansları", en:"Solfeggio frequencies" }, p:{ tr:"174, 285, 396, 417, 528, 639, 741, 852, 963 Hz. Gelenekte her birinin ayrı bir kapıyı açtığı anlatılır. Sakin'in Ses ekranında hepsi var.", en:"174, 285, 396, 417, 528, 639, 741, 852, 963 Hz. Tradition says each one opens a different door. They are all in Sakin's Sound screen." } },
      { h:{ tr:"Tibet çanakları", en:"Tibetan bowls" }, p:{ tr:"Yedi metalden döküldüğü anlatılır: altın (Güneş), gümüş (Ay), cıva (Merkür), bakır (Venüs), demir (Mars), kalay (Jüpiter), kurşun (Satürn). Her gezegen bir nota.", en:"Said to be cast from seven metals: gold (Sun), silver (Moon), mercury (Mercury), copper (Venus), iron (Mars), tin (Jupiter), lead (Saturn). Each planet a note." } },
      { h:{ tr:"Gong banyosu", en:"Gong bath" }, p:{ tr:"Uzanırsın, gözler kapalı; gong dalgaları seni yavaşça içe doğru taşır. Çoğu kişi sonrasında uykuya yakın bir dinginlik anlatır.", en:"You lie down with eyes closed while the gong's waves carry you slowly inward. Many describe a calm close to sleep afterwards." } },
      { h:{ tr:"Om ile sesleme", en:"Toning with Om" }, p:{ tr:"\"Om\" evrenin ilk titreşimi olarak anılır. Uzun bir nefes verişiyle, diyaframdan söylenir; nefes vermeyi uzatmak bedeni yavaşlatır.", en:"\"Om\" is honoured as the first vibration of the universe. It is sung from the diaphragm on a long exhale; lengthening the exhale slows the body down." } },
    ],
  },
  {
    id: "su", ico: "💧", freq: "H₂O · Hafıza", hue: ["#5ad9ff", "#6fe6c1"], practice: "sabah",
    title:   { tr:"Su Terapisi", en:"Water Therapy", de:"Wassertherapie", es:"Terapia de agua", pt:"Terapia da água", fr:"Thérapie par l'eau", ja:"水のセラピー" },
    tagline: { tr:"Su, niyetin hafızasıdır.", en:"Water is the memory of intention.", de:"Wasser ist das Gedächtnis der Absicht.", es:"El agua es la memoria de la intención.", pt:"A água é a memória da intenção.", fr:"L'eau est la mémoire de l'intention.", ja:"水は、意図の記憶。" },
    hero: {
      tr:"Suyun niyeti taşıdığına dair anlatılar çok eskidir; Masaru Emoto'nun kristal fotoğrafları bu fikri yeniden sevdirdi. Antik Roma hamamlarından Osmanlı hamamına, Kneipp'ten yüzdürme tanklarına kadar insanlar hep suya gevşemek için döndü.",
      en:"Stories that water carries intention are very old; Masaru Emoto's crystal photographs made the idea loved again. From Roman baths to the Ottoman hammam, from Kneipp to floating tanks, people have always returned to water to let go.",
    },
    teachings: [
      { h:{ tr:"Watsu", en:"Watsu" }, p:{ tr:"Ilık suda yapılan shiatsu. Destekli yüzdürmeyle beden ağırlığını bırakır; çoğu kişi anne karnı hissinden söz eder.", en:"Shiatsu in warm water. Supported floating lets the body drop its weight; many speak of a feeling like the womb." } },
      { h:{ tr:"Sıcak ve serin", en:"Warm and cool" }, p:{ tr:"Kısa sıcak ve serin su geçişleri geleneksel bir canlanma pratiğidir. Nazik başla, bedenini dinle; sağlık sorunun varsa önce hekimine danış.", en:"Short switches between warm and cool water are a traditional way to feel refreshed. Start gently and listen to your body; if you have a health condition, ask your doctor first." } },
      { h:{ tr:"Niyetli su", en:"Water with intention" }, p:{ tr:"Bir bardak suyu avuçlarının arasına al, üç nefes boyunca kalbindeki şükranı düşün, sonra yavaşça iç. Küçük, her yerde yapılabilen bir ritüel.", en:"Hold a glass of water between your palms, think of what you're grateful for over three breaths, then drink slowly. A small ritual you can do anywhere." } },
      { h:{ tr:"Deniz", en:"The sea" }, p:{ tr:"Tuzlu suya girmek pek çok kültürde arınma ve eve dönüş olarak anlatılır.", en:"Entering salt water is told in many cultures as cleansing and coming home." } },
    ],
  },
  {
    id: "atolye", ico: "🛠", freq: "Birlikte yap", hue: ["#ffd28a", "#ff9ec7"], practice: "events",
    title:   { tr:"Atölyeler", en:"Workshops", de:"Workshops", es:"Talleres", pt:"Oficinas", fr:"Ateliers", ja:"ワークショップ" },
    tagline: { tr:"Eller toprakta, kalp gökyüzünde.", en:"Hands in the soil, heart in the sky.", de:"Hände in der Erde, Herz im Himmel.", es:"Las manos en la tierra, el corazón en el cielo.", pt:"Mãos na terra, coração no céu.", fr:"Les mains dans la terre, le cœur dans le ciel.", ja:"手は土に、心は空に。" },
    hero: {
      tr:"Atölye, çıraklığın ve aktarımın kadim biçimidir. Sümer rahipleri kil tabletlere yazarken, Anadolu kadınları kilim dokurken bilgiyi bedene işlerdi. Burada eller, ses ve niyet küçük dairelerde buluşur.",
      en:"The workshop is the ancient form of apprenticeship and passing on. Sumerian priests wrote on clay tablets, Anatolian women wove kilims, and knowledge was carried into the body. Here hands, voice and intention meet in small circles.",
    },
    teachings: [
      { h:{ tr:"Dönen pratikler", en:"Rotating practices" }, p:{ tr:"", en:"" },
        list:{ tr:["Çay seremonisi (Gong Fu Cha)","Bitki esansları ve aromaterapi","Kil ile çakraları tanıma","Tarot ve sembol okuma","Astroloji 101: doğum haritası"], en:["Tea ceremony (Gong Fu Cha)","Plant essences and aromatherapy","Getting to know the chakras through clay","Tarot and symbol reading","Astrology 101: the birth chart"] } },
      { h:{ tr:"Aktarım", en:"Passing on" }, p:{ tr:"Atölyeler küçük dairelerde yapılır. Öğrenilen şey önce kendi sofrana taşınır.", en:"Workshops happen in small circles. What you learn is first carried to your own table." } },
    ],
  },
  {
    id: "yaratim", ico: "✨", freq: "Sıfır nokta", hue: ["#b8a2ff", "#ffd28a"], practice: "harita",
    title:   { tr:"Yaratım Alanı", en:"Creation Space", de:"Raum der Schöpfung", es:"Espacio de creación", pt:"Espaço de criação", fr:"Espace de création", ja:"創造の場" },
    tagline: { tr:"Niyet, evrenin ham maddesidir.", en:"Intention is the raw material of the universe.", de:"Absicht ist der Rohstoff des Universums.", es:"La intención es la materia prima del universo.", pt:"A intenção é a matéria-prima do universo.", fr:"L'intention est la matière première de l'univers.", ja:"意図は、宇宙の原料。" },
    hero: {
      tr:"Hermes Trismegistos: \"Yukarıda nasılsa, aşağıda da öyle.\" Yaratım, görünmeyenden görünene geçen bir frekans olarak anlatılır. Burada niyet, ay ritüelleri ve vizyon bir araya gelir. Sen bir izleyici değil, eş-yaratıcısın.",
      en:"Hermes Trismegistus: \"As above, so below.\" Creation is described as a frequency moving from the unseen into the seen. Here intention, moon rituals and vision come together. You are not a spectator but a co-creator.",
    },
    teachings: [
      { h:{ tr:"Üç adımlı yaratım", en:"Creation in three steps" }, p:{ tr:"", en:"" },
        list:{ tr:["Net niyet: kelimeler açık","Bedende hissetmek: sanki olmuş gibi","Bırakmak: sonucu evrene emanet etmek"], en:["A clear intention: plain words","Feeling it in the body: as if it has happened","Letting go: entrusting the outcome to the universe"] } },
      { h:{ tr:"Yeni ay", en:"New moon" }, p:{ tr:"Yeni ay niyetin tohumu sayılır. Bir kâğıda \"Hayatıma çağırıyorum...\" diye başlayan üç cümle yaz, sesli oku, teşekkür et.", en:"The new moon is seen as the seed of intention. Write three sentences starting with \"I call into my life...\", read them aloud, give thanks." } },
      { h:{ tr:"Niyet Mektubu", en:"Intention Letter" }, p:{ tr:"Sakin'deki Niyet Mektubu bu odanın pratiği: niyetini yaz, 21 gün mühürlü kalsın, sonra açıp yeniden oku.", en:"Sakin's Intention Letter is this room's practice: write your intention, keep it sealed for 21 days, then open it and read it again." } },
    ],
  },
  {
    id: "tantra", ico: "🔥", freq: "Shiva · Shakti", hue: ["#ff7aa2", "#c8a2ff"], practice: "nefes", minAge: 18,
    title:   { tr:"Tantra", en:"Tantra", de:"Tantra", es:"Tantra", pt:"Tantra", fr:"Tantra", ja:"タントラ" },
    tagline: { tr:"Kutsalın ve bedenin buluştuğu eşik.", en:"The threshold where the sacred meets the body.", de:"Die Schwelle, an der sich das Heilige und der Körper begegnen.", es:"El umbral donde lo sagrado y el cuerpo se encuentran.", pt:"O limiar onde o sagrado e o corpo se encontram.", fr:"Le seuil où le sacré rencontre le corps.", ja:"聖なるものと身体が出会う敷居。" },
    hero: {
      tr:"Tantra, Sanskritçe \"dokuma\" demektir. Onu yalnızca cinsellikle eş tutmak Batı'nın bir yanlış anlamasıdır. Asıl tantra; bedenin, nefesin ve farkındalığın kutsal sayıldığı bir bütünlük yoludur. Keşmir Şivacılığında evren, Shiva'nın (saf farkındalık) ve Shakti'nin (yaratıcı güç) dansı olarak anlatılır.",
      en:"Tantra means \"weaving\" in Sanskrit. Equating it only with sexuality is a Western misunderstanding. True tantra is a path of wholeness in which the body, the breath and awareness are held as sacred. In Kashmir Shaivism the universe is told as the dance of Shiva (pure awareness) and Shakti (creative power).",
    },
    teachings: [
      { h:{ tr:"Beden tapınaktır", en:"The body is a temple" }, p:{ tr:"Tantra utancı çözer; bedenin her hücresi tapınağın bir taşı sayılır. Saygı ve sınır temeldir.", en:"Tantra dissolves shame; every cell of the body is a stone of the temple. Respect and boundaries come first." } },
      { h:{ tr:"Nefes dansı", en:"Breath dance" }, p:{ tr:"Burundan dairesel nefes: verirken kalbe selam, alırken karna iniş. Yalnız da yapılabilir.", en:"Circular breathing through the nose: greet the heart on the exhale, drop into the belly on the inhale. It can be done alone." } },
      { h:{ tr:"Trataka", en:"Trataka" }, p:{ tr:"Bir mum alevine ya da bir noktaya yumuşak, kesintisiz bakış. Önce huzursuzluk, sonra erime, sonra dinginlik.", en:"A soft, unbroken gaze at a candle flame or a point. First restlessness, then melting, then stillness." } },
      { h:{ tr:"Kutsal sınır", en:"Sacred boundary" }, p:{ tr:"Her pratik rıza ve \"durmak her zaman serbesttir\" ilkesiyle başlar. Kapı her zaman açıktır.", en:"Every practice begins with consent and the principle that stopping is always free. The door is always open." } },
    ],
  },
  {
    id: "beden", ico: "🌀", freq: "Fasya · Akış", hue: ["#6fe6c1", "#5ad9ff"], practice: "nefes",
    title:   { tr:"Beden Egzersizleri", en:"Body Practices", de:"Körperübungen", es:"Prácticas corporales", pt:"Práticas corporais", fr:"Pratiques corporelles", ja:"からだのワーク" },
    tagline: { tr:"Beden, ruhun ilk dilidir.", en:"The body is the soul's first language.", de:"Der Körper ist die erste Sprache der Seele.", es:"El cuerpo es el primer idioma del alma.", pt:"O corpo é a primeira língua da alma.", fr:"Le corps est la première langue de l'âme.", ja:"からだは、魂の最初の言葉。" },
    hero: {
      tr:"Hareket, antik şamandan bugünün beden terapistine kadar şifanın anahtarlarından biri olarak anlatılır. Wilhelm Reich \"karakter zırhı\"ndan söz etti. Tai Chi yüzyıllardır qi'yi bedende dolaştıran bir akış olarak yaşar. Bu odada nefes, fasya ve titreşim buluşur.",
      en:"From the ancient shaman to today's body therapist, movement is told as one of the keys to healing. Wilhelm Reich spoke of \"character armour\". Tai Chi has lived for centuries as a flow that moves qi through the body. In this room breath, fascia and vibration meet.",
    },
    teachings: [
      { h:{ tr:"Beş Tibet ritüeli", en:"The Five Tibetan Rites" }, p:{ tr:"Sabahları yapılan beş hareket; az tekrarla başla, bedenine göre artır:", en:"Five morning movements; start with few repetitions and increase as your body allows:" },
        list:{ tr:["Kendi etrafında dönme","Bacak kaldırma","Deve duruşu","Köprü","Yukarı ve aşağı bakan köpek geçişi"], en:["Spinning in place","Leg raises","Camel pose","Bridge","Moving between upward and downward dog"] } },
      { h:{ tr:"Titreyiş (TRE)", en:"Shaking (TRE)" }, p:{ tr:"Beden gerginliği titreyerek bırakabilir; hayvanlar bunu doğal olarak yapar. Nazik başla, istediğin an dur.", en:"The body can release tension by shaking; animals do it naturally. Begin gently and stop whenever you like." } },
      { h:{ tr:"Qi Gong", en:"Qi Gong" }, p:{ tr:"\"Kucakta altın taşımak\", \"bulutu elle dağıtmak\" gibi yavaş formlar. Eklemleri akıcı tutar.", en:"Slow forms such as \"carrying gold in your arms\" and \"parting the clouds\". They keep the joints flowing." } },
    ],
  },
];

// Oda arayüz metinleri (7 dil).
export const ROOMS_TXT = {
  title:    { tr:"Sakin Odalar", en:"Sakin Rooms", de:"Sakin-Räume", es:"Salas Sakin", pt:"Salas Sakin", fr:"Salles Sakin", ja:"Sakinの部屋" },
  lead:     { tr:"Her oda bir frekans. Senin notan hangisi? Orkestrada yerini al, Sakin senin sesini bekliyor.", en:"Every room is a frequency. Which note is yours? Take your place in the orchestra, Sakin is waiting for your voice.", de:"Jeder Raum ist eine Frequenz. Welcher Ton ist deiner? Nimm deinen Platz im Orchester ein, Sakin wartet auf deine Stimme.", es:"Cada sala es una frecuencia. ¿Cuál es tu nota? Ocupa tu lugar en la orquesta, Sakin espera tu voz.", pt:"Cada sala é uma frequência. Qual é a tua nota? Toma o teu lugar na orquestra, a Sakin espera a tua voz.", fr:"Chaque salle est une fréquence. Quelle est ta note ? Prends ta place dans l'orchestre, Sakin attend ta voix.", ja:"部屋ごとに、ひとつの周波数。あなたの音はどれ？オーケストラに加わって。Sakinはあなたの声を待っています。" },
  sub:      { tr:"{n} oda, yaklaşan buluşmalar", en:"{n} rooms, upcoming gatherings", de:"{n} Räume, kommende Treffen", es:"{n} salas, próximos encuentros", pt:"{n} salas, próximos encontros", fr:"{n} salles, rencontres à venir", ja:"{n}つの部屋と、これからの集い" },
  rooms:    { tr:"Odalar", en:"Rooms", de:"Räume", es:"Salas", pt:"Salas", fr:"Salles", ja:"部屋" },
  events:   { tr:"Yaklaşan buluşmalar", en:"Upcoming gatherings", de:"Kommende Treffen", es:"Próximos encuentros", pt:"Próximos encontros", fr:"Rencontres à venir", ja:"これからの集い" },
  all:      { tr:"Tümü", en:"All", de:"Alle", es:"Todas", pt:"Todas", fr:"Toutes", ja:"すべて" },
  noEvents: { tr:"Şimdilik planlanmış bir buluşma yok. Yeni buluşmalar burada görünecek.", en:"No gatherings planned yet. New ones will appear here.", de:"Noch keine Treffen geplant. Neue erscheinen hier.", es:"Aún no hay encuentros previstos. Los nuevos aparecerán aquí.", pt:"Ainda não há encontros marcados. Os novos vão aparecer aqui.", fr:"Aucune rencontre prévue pour l'instant. Les nouvelles apparaîtront ici.", ja:"いまは予定された集いはありません。新しい集いはここに表示されます。" },
  guides:   { tr:"Rehberler", en:"Guides", de:"Begleiter", es:"Guías", pt:"Guias", fr:"Guides", ja:"ガイド" },
  noGuides: { tr:"Bu odanın rehberleri yakında burada.", en:"This room's guides will be here soon.", de:"Die Begleiter dieses Raums sind bald hier.", es:"Los guías de esta sala estarán aquí pronto.", pt:"Os guias desta sala vão estar aqui em breve.", fr:"Les guides de cette salle seront bientôt ici.", ja:"この部屋のガイドはまもなくここに。" },
  practice: { tr:"Bu frekansı Sakin'de dene", en:"Try this frequency in Sakin", de:"Probier diese Frequenz in Sakin", es:"Prueba esta frecuencia en Sakin", pt:"Experimenta esta frequência na Sakin", fr:"Essaie cette fréquence dans Sakin", ja:"この周波数をSakinで試す" },
  practiceName: {
    chakra: { tr:"Çakra", en:"Chakra", de:"Chakra", es:"Chakra", pt:"Chakra", fr:"Chakra", ja:"チャクラ" },
    nefes:  { tr:"Nefes", en:"Breath", de:"Atem", es:"Respiración", pt:"Respiração", fr:"Souffle", ja:"呼吸" },
    ses:    { tr:"Ses", en:"Sound", de:"Klang", es:"Sonido", pt:"Som", fr:"Son", ja:"音" },
    sabah:  { tr:"Sabah niyeti", en:"Morning intention", de:"Morgenabsicht", es:"Intención de la mañana", pt:"Intenção da manhã", fr:"Intention du matin", ja:"朝の意図" },
    harita: { tr:"Niyet Mektubu", en:"Intention Letter", de:"Absichtsbrief", es:"Carta de intención", pt:"Carta de intenção", fr:"Lettre d'intention", ja:"意図の手紙" },
    events: { tr:"Buluşmalar", en:"Gatherings", de:"Treffen", es:"Encuentros", pt:"Encontros", fr:"Rencontres", ja:"集い" },
  },
  back:     { tr:"Geri", en:"Back", de:"Zurück", es:"Atrás", pt:"Voltar", fr:"Retour", ja:"戻る" },
  call:     { tr:"Ara", en:"Call", de:"Anrufen", es:"Llamar", pt:"Ligar", fr:"Appeler", ja:"電話" },
  open:     { tr:"Aç", en:"Open", de:"Öffnen", es:"Abrir", pt:"Abrir", fr:"Ouvrir", ja:"開く" },
  details:  { tr:"Ayrıntı", en:"Details", de:"Details", es:"Detalles", pt:"Detalhes", fr:"Détails", ja:"詳細" },
};

// SABİT BAŞLANGIÇ BULUŞMALARI (kullanıcı: "örnek bir etkinlik gir: 1 Ekim 21:00
// tanışma çemberine bir selam ver"). Sunucudaki (panel) buluşmalarla BİRLEŞİR; tarihi
// geçince kendiliğinden gizlenir. `room: "cember"` = dokununca canlı oda açılır.
export const SEED_EVENTS = [
  {
    id: "seed-tanisma-2026-10-01", room: "cember", date: "2026-10-01T18:00:00.000Z", // 21:00 İstanbul
    title: { tr:"Tanışma çemberi: bir selam ver", en:"Welcome circle: come say hello", de:"Kennenlern-Kreis: sag Hallo", es:"Círculo de bienvenida: ven a saludar", pt:"Círculo de boas-vindas: vem dizer olá", fr:"Cercle de bienvenue : viens dire bonjour", ja:"はじめましての輪：あいさつしに来てね" },
    where: { tr:"Çember · Canlı oda", en:"Circle · Live room", de:"Kreis · Live-Raum", es:"Círculo · Sala en vivo", pt:"Círculo · Sala ao vivo", fr:"Cercle · Salon en direct", ja:"サークル・ライブルーム" },
  },
];
