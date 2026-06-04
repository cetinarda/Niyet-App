export const tr = {
  // ─── Tab bar ──────────────────────────────────────────────────────────────────
  tabs: {
    today: 'Bugün',
    animals: 'Hayvanlar',
    archive: 'Arşiv',
    profile: 'Profil',
  },

  // ─── Home screen ──────────────────────────────────────────────────────────────
  home: {
    greeting: {
      night: 'Gece',
      morning: 'Günaydın',
      afternoon: 'İyi günler',
      evening: 'İyi akşamlar',
    },
    defaultUser: 'Yolcu',
    decks: {
      animal: {
        title: 'Hayvan',
        short: 'HAYVAN',
        subtitle: 'Ruhunun yoldaşını dinle',
      },
      quote: {
        title: 'Sözler',
        short: 'SÖZ',
        subtitle: 'Anadolu bilgeliğinden',
      },
    },
    tapHint: 'salla · dokun',
    nextDeck: 'Sıradaki Deste →',
    completed: 'Tamamlandı ✦',
    doneTitle: 'Günlük rehberlik\ntamamlandı',
    doneSub: 'Yarın yeni bir yolculuk başlar',
    detailBtn: "'ın derin rehberliği →",
  },

  // ─── Animals hub ─────────────────────────────────────────────────────────────
  animalsHub: {
    eyebrow: 'SAKİN · HAYVAN',
    panels: {
      library: 'Hayvanlar',
      finder: 'Bul',
      guidance: 'Rehberlik',
    },
  },

  // ─── Animal library ───────────────────────────────────────────────────────────
  animalLibrary: {
    back: '← Geri',
    familyTag: 'SAKİN · HAYVAN',
    subtitle: "Anadolu'dan dünyaya · {count} hayvan rehberi",
    searchPlaceholder: 'İsim, sembol veya unsur ile ara...',
    noResults: 'Arama sonucu yok.',
  },

  // ─── Animal detail ────────────────────────────────────────────────────────────
  animalDetail: {
    back: '← Geri',
    familyTag: 'SAKİN · HAYVAN',
    sections: {
      anatolian: "Anadolu'da",
      todayMessage: 'Bugün Sana Söylediği',
      guidance: 'REHBERLİK',
      jung: 'Jung Diliyle',
      dream: 'Rüyada Görmek',
      traditions: 'Geleneklerde',
      myths: 'Efsaneler',
      shadow: 'Gölge Tarafı',
      whenAppears: 'Ne Zaman Gelir',
      thisPractice: 'Bu Hafta Pratik',
      relatedMyth: 'İlgili Mit',
    },
    missingLore:
      'Bu hayvanın derin rehberliği yakında genişleyecek.\nŞimdilik Anadolu sesini ve günün okumasını taşıyor.',
    resonanceHint: 'Bu hayvanla rezonans kuran sembolik güç →',
    footer: 'SAKİN AİLESİ ✦',
  },

  // ─── Animal finder ────────────────────────────────────────────────────────────
  animalFinder: {
    headerTitle: 'Hayvan Rehberini Bul',
    intro: {
      title: 'Rehber Hayvanını Keşfet',
      desc: 'Ruhunla uyumlu totem hayvanını bulmak için iki yol var.',
      note: 'Sakin sana bir ayna tutar — içinde zaten var olanı yansıtır ve olası olanı fısıldar.\nOnu kalbinde uyandıracak, hissedip özümseyecek olan ise yalnızca sensin.',
      quizBtn: {
        title: 'Sorularla Keşfet',
        desc: '7 soru, karakterine göre eşleşir',
      },
      birthBtn: {
        title: 'Doğum Bilgilerimle Bul',
        desc: 'Tarih ve saate göre natal totem',
      },
    },
    birth: {
      title: 'Doğum Bilgilerini Gir',
      desc: 'Doğum anının mevsimi, yılı ve saati — hepsi senin totem hayvanını şekillendiriyor.',
      dateLabel: 'Doğum Tarihi',
      dayPlaceholder: 'Gün',
      monthPlaceholder: 'Ay',
      yearPlaceholder: 'Yıl',
      cityLabel: 'Doğum Şehri',
      cityOptional: '(isteğe bağlı)',
      cityPlaceholder: 'Örn. İstanbul, Konya, Diyarbakır...',
      cityHint: 'Doğduğun yerin enerjisi yorumuna derinlik katar.',
      hourLabel: 'Doğum Saati',
      hourOptional: '(isteğe bağlı)',
      hourPlaceholder: 'Saat (0–23)',
      hourHint: 'Saat bilmiyorsan boş bırak — yine de güçlü bir eşleşme yapılır.',
      submitBtn: 'Rehberimi Bul ✦',
    },
    result: {
      label: 'Rehber Hayvanın',
      rediscoverBtn: 'Yeniden Keşfet ✦',
      closeBtn: 'Kapat ✦',
    },
    quiz: {
      questions: [
        {
          q: 'Doğada hangi ortam seni çağırıyor?',
          options: [
            'Dağlar ve açık gökyüzü',
            'Orman ve ıssız toprak',
            'Nehir, deniz, derin sular',
            'Sıcak alev ve ateş',
          ],
        },
        {
          q: 'Zor bir durumla karşılaştığında tepkin ne?',
          options: [
            'Dur, gözlemle, strateji kur',
            'Hızla harekete geç',
            'Çevrendekilerini bir araya getir',
            'İçine çekil, ruhsal güç ara',
          ],
        },
        {
          q: 'Seni en iyi anlatan sözcük hangisi?',
          options: ['Özgür', 'Güçlü', 'Bilge', 'Sevgi dolu'],
        },
        {
          q: 'Bir grupta hangi rolü üstlenirsin?',
          options: [
            'Öncü ve yol açan',
            'Arabulucu ve dengeleyici',
            'Yaratıcı ve ilham veren',
            'Gözlemci ve analizci',
          ],
        },
        {
          q: 'En büyük gücün nedir?',
          options: [
            'İçgüdülerim ve sezgim',
            'Sabrım ve dayanıklılığım',
            'Zekâm ve esnekliğim',
            'Cesaret ve tutkum',
          ],
        },
        {
          q: 'Hayatta neyi özgürlük hissettiriyor?',
          options: [
            'Bağımsız karar verebilmek',
            'Sevdiklerimle güvende olmak',
            'Değişip dönüşebilmek',
            'Gerçeği bulmak, derinleşmek',
          ],
        },
        {
          q: 'Şu an içinde hangi enerji daha güçlü?',
          options: [
            'Hareket ve hız enerjisi',
            'Sessizlik ve gözlem enerjisi',
            'Bereket ve topluluk enerjisi',
            'Güç ve dönüşüm enerjisi',
          ],
        },
      ],
    },
  },

  // ─── Nagual screen ────────────────────────────────────────────────────────────
  nagual: {
    back: '← Geri',
    familyTag: 'SAKİN · NAGUAL',
    introTitle: 'Nagual — Dönemsel Rehber',
    introText:
      'Totem hayvanın seninle doğar, ömür boyu kalır. Nagual ise belirli bir\ndöneminde sana eşlik eden geçici rehberdir. Bir sınav, bir dönüşüm,\nbir kriz anında yanına gelir. Görevini tamamlayınca yerini başka bir\nrehbere bırakır.',
    weekTag: 'BU HAFTA · EVRENSEL',
    thisWeek: 'BU DÖNEMDE',
    daysLeft: '{n} gün kaldı',
    personalTag: 'KİŞİSEL REHBERİM',
    guidance: 'REHBERLİK',
    locked: {
      title: 'Kişisel Rehberim',
      text: 'Doğum haritana göre sana özel dönemsel bir rehber hayvan belirlemek için\nprofil bilgilerini tamamla.\n\nProfil → Kişisel Harita bölümünden doğum tarihi ve unsurunu ekleyebilirsin.',
    },
  },

  // ─── Archive screen ───────────────────────────────────────────────────────────
  archive: {
    title: 'Arşiv',
    readingsCount: '{n} okuma',
    spiritualMap: 'Ruhsal Harita',
    reportLabels: {
      guide: 'Rehber',
      stone: 'Taş',
      animal: 'Hayvan',
      nagual: 'Nagual',
    },
    filters: {
      all: 'Tümü',
      quote: 'Mesaj',
      stone: 'Taş',
      animal: 'Hayvan',
      nagual: 'Nagual',
    },
    empty: {
      title: 'Henüz okuma yok.',
      subtitle: 'Ana ekrandan kartını aç.',
    },
  },

  // ─── Profile screen ───────────────────────────────────────────────────────────
  profile: {
    // Onboarding
    onboarding: {
      title: "TURA'ya Hoş Geldin",
      subtitle: "Anadolu'nun kadim geleneğinden günlük rehberlik",
      step1Question: 'Adın nedir, yolcu?',
      step1Placeholder: 'Adını yaz...',
      step2Question: 'Hangi unsura yakın hissediyorsun?',
      step3Question: 'Kişisel harita için',
      step3Hint: 'Numaroloji, Human Design ve element analizi.\nDaha fazla bilgi = daha güçlü tahmin.',
      fullNamePlaceholder: 'İsim Soyisim...',
      birthDateLabel: 'Doğum Tarihi',
      dayPlaceholder: 'Gün',
      monthPlaceholder: 'Ay',
      yearPlaceholder: 'Yıl',
      birthHourLabel: 'Doğum Saati',
      hourOptional: '(opsiyonel · HD için)',
      hourPlaceholder: 'Saat',
      minutePlaceholder: 'Dk',
      birthCityLabel: 'Doğum Şehri',
      cityOptional: '(opsiyonel)',
      cityPlaceholder: 'İstanbul, Ankara...',
      continueBtn: 'Devam Et →',
      startBtn: 'Yola Çık ✦',
      skipBtn: 'Şimdi değil, atla',
    },
    // Stats
    stats: {
      totalReadings: 'Toplam Okuma',
      streak: 'Gün Silsile',
      level: 'Seviye',
    },
    // Level
    levelProgress: 'Seviye İlerlemesi',
    readingsProgress: '{current} / {next} okuma',
    // Account
    account: {
      title: 'Hesap',
      premiumLabel: 'Üstad ✦',
      freeLabel: 'Üretsiz Yolcu',
      premiumRenewal: 'Yenileme: {date}',
      premiumLifetime: 'Süresiz',
      freeCta: 'Derin analiz için Üstad olun',
      upgradeBtn: 'Üstad Ol ✦',
      cancelBtn: 'İptal',
      remindersLabel: 'Günlük Hatırlatma',
      remindersSub: "Her sabah 08:00'de rehberin gelsin",
      cloudBackup: 'Veriler buluta yedekleniyor',
      signOutBtn: 'Çıkış',
      licenseTitle: 'Lisans Kodu',
      licensePlaceholder: 'XXXX-XXXX-XXXX',
      licenseApply: 'Uygula',
      licenseSuccess: 'Premium aktifleşti! Sakin ailesine hoş geldin.',
      licenseAlready: 'Bu hesapta premium zaten aktif.',
      licenseInvalid: 'Geçersiz veya kullanılmış kod.',
      licenseNetwork: 'Bağlantı hatası. Tekrar dene.',
      licenseSignInRequired: 'Kodu uygulamak için önce hesabına giriş yap.',
      deleteLabel: 'Hesabı Sil',
      deleteSub: 'Hesabını ve tüm verilerini kalıcı olarak siler.',
      deleteBtn: 'Sil',
      deleteConfirmTitle: 'Hesabı silmek istediğine emin misin?',
      deleteConfirmMessage: 'Tüm okumalar, arşiv, profil ve istatistikler kalıcı olarak silinecek. Bu işlem geri alınamaz.',
      deleteConfirm: 'Evet, Sil',
      deleteCancel: 'Vazgeç',
    },
    // Personal Map
    personalMap: {
      title: 'Kişisel Harita',
      editBtn: '✎ Düzenle',
      lifePath: 'Hayat Yolu',
      expression: 'İfade',
      soulUrge: 'Ruh İsteği',
      personality: 'Kişilik',
      humanDesign: 'Human Design',
      strategy: 'Strateji',
      estimated: '(tahmini)',
      hdTypeSelectHint: 'Tipini seç:',
      hdDisclaimer:
        '⚠ Hesaplama tahminidir — gerçek HD doğum saati ve efemeris gerektirir.\nTipini biliyorsan yukarıdan seçebilirsin.',
      sunGates: 'Güneş Kapıları',
      consciousSun: 'Bilinçli Güneş',
      designSun: 'Tasarım Güneşi',
      gatesNote: 'Tip tahmini · Kesin sonuç için doğum saatini ekle ve ✎ ile kendin seç',
      notSelf: 'Not-Self Tema',
      weeklyReading: 'Haftalık Rehberlik',
      weeklyThisWeek: 'Bu haftaya özel okuma',
      weeklyMeta: 'Haftalık Rehberlik · {week}. hafta',
      personalYear: 'Kişisel yıl: {year}',
      unlock: {
        title: 'Kişisel Haritanı Aç',
        desc: 'İsim soyisim ve doğum tarihini gir.\nNumaroloji, Human Design ve haftalık analiz.',
      },
      birthForm: {
        title: 'Doğum Haritası Bilgileri',
        hint: 'Saat ve şehir bilgisi Human Design hesabı için gereklidir.',
        fullNamePlaceholder: 'İsim Soyisim (numaroloji için)',
        dateLabel: 'Doğum Tarihi',
        dayPlaceholder: 'Gün',
        monthPlaceholder: 'Ay',
        yearPlaceholder: 'Yıl',
        hourLabel: 'Doğum Saati',
        hourOptional: '(HD için önemli)',
        hourPlaceholder: 'Saat (0-23)',
        minutePlaceholder: 'Dakika',
        cityLabel: 'Doğum Şehri',
        cityOptional: '(saat dilimi için)',
        cityPlaceholder: 'İstanbul, Ankara, Londra...',
        saveBtn: 'Haritamı Oluştur ✦',
        cancelBtn: 'İptal',
      },
    },
    // Animal Guidance section
    animalGuidance: {
      sectionTitle: 'Hayvan Rehberliği Nedir?',
      totemTitle: '⊕ Totem Hayvan',
      totemText:
        'Her insan, doğasında bir hayvanın ruhunu taşır. Bu totem hayvan seni temsil eder; enerjin, güçlü yanların ve yürüdüğün yol onun izlerini taşır. Totem değişmez — seninle doğar, seninle gelişir.',
      nagualTitle: '◎ Nagual — Dönemsel Rehber',
      nagualText:
        'Nagual ise belirli bir dönem için yanına gelen geçici rehberdir. Bir sınav, bir dönüşüm, bir kriz anında çağrılır. Görevini tamamlayınca yerini başka bir rehbere bırakır. Günlük çekilişinde gelen hayvan, bugünkü naguelin sesini taşır.',
      finderTitle: 'Hayvan Rehberini Bul',
      finderDescPremium: 'Sorularla ya da doğum tarih/saatinle',
      finderDescFree: 'Üstad özelliği ✦',
    },
    // Spiritual Map
    spiritualMap: {
      title: 'Ruhsal Harita',
      topGuide: 'En Çok Rehber Şair',
      topStone: 'Koruyucu Taşın',
      topAnimal: 'Totem Hayvanın',
      topNagual: 'Nagual Rehberin',
      companionCount: '{n} kez eşlik etti',
      stoneCount: '{n} kez geldi · {chakra}',
      nagualCount: '{n} kez çağrıldı · {aspect}',
      emptyHint: 'İlk kartını aç, ruhsal haritanız oluşmaya başlasın.',
    },
    // Sakin Family
    sakinFamily: {
      title: 'Sakin Ailesi',
      intro: 'Tek ekosistem. Tek abonelik. Birçok kapı.',
      masterDesc: 'Ana merkez — tüm uygulamalara giriş',
      apps: {
        animalGuidance: 'Hayvan Rehberliği',
        stoneGuidance: 'Taş Rehberliği',
        plantGuidance: 'Bitki Rehberliği',
        myths: 'Mitler ve İmgeler',
        humanDesign: 'Human Design',
        numerology: 'Numeroloji',
      },
      appDescs: {
        animalGuidance: 'Bu uygulama',
        stoneGuidance: 'Kristallerin dili',
        plantGuidance: 'Bitkisel bilgelik',
        myths: 'Arketip ve sembol',
        humanDesign: 'Tasarımını tanı',
        numerology: 'Sayıların ardındaki sen',
      },
      active: 'AKTİF',
      comingSoon: 'YAKINDA',
    },
    // Badges
    badges: {
      title: 'Rozetler',
      list: {
        b001: { title: 'Yol Başlangıcı', desc: 'İlk 7 okuma' },
        b002: { title: 'Ateş Dervişi',   desc: '21 gün silsile' },
        b003: { title: 'Mesnevi Yolcusu', desc: '30 okuma' },
        b004: { title: 'Tesbih',          desc: '33 taş görüldü' },
        b005: { title: 'Hak Dostu',       desc: '100 okuma' },
        b006: { title: 'ışık Yolcusu',    desc: '365 okuma' },
      },
    },
    // Premium teaser
    premium: {
      hdTeaser: 'Stratejin, otoriteni ve not-self temanı detaylı oku',
      weeklyTeaser: '52 haftalık döngüde nereye geldiğini öğren',
      upgradeCta: 'Üstad Ol →',
    },
    // Dev
    dev: {
      enablePremium: '⚙ DEV · Premium Aç',
      disablePremium: '⚙ DEV · Premium Kapat',
    },
    // Notification rationale (App Store 4.5.4 / Play Console)
    notif: {
      rationaleTitle: 'Günlük hatırlatma',
      rationaleMessage: 'Tura, her sabah 08:00\'de günün kartını çekmen için sessiz bir hatırlatma göndersin mi? Bildirim hiçbir şekilde reklam veya pazarlama amacıyla kullanılmaz.',
      rationaleConfirm: 'İzin Ver',
      rationaleCancel: 'Şimdi Değil',
    },
    // Language
    language: {
      title: 'Dil',
      note: 'Seçilen dilde arayüz ve içerik görüntülenir.',
    },
    elementNotSet: 'Unsur seçilmedi',
  },

  // ─── Myths screen ─────────────────────────────────────────────────────────────
  myths: {
    back: '← Geri',
    familyTag: 'SAKİN · MİT',
    subtitle: "Ruhun karşılaştığı sembolik güçler · {count} mit",
    searchPlaceholder: "İsim, sembol veya unsur ile ara...",
    noResults: "Arama sonucu yok.",
    filterAll: "Tümü",
    msgSection: "MESAJ",
    guidanceSection: "REHBERLİK",
  },

  // ─── Auth screen ──────────────────────────────────────────────────────────────
  auth: {
    subtitle: "Anadolu'nun kadim geleneğinden\ngünlük rehberlik",
    orLabel: "ya da",
    emailPlaceholder: "E-posta",
    passwordPlaceholder: "Şifre",
    signinBtn: "Giriş Yap",
    signupBtn: "Hesap Oluştur",
    toSignup: "Hesabın yok mu? Oluştur",
    toSignin: "Hesabın var mı? Giriş yap",
    offlineBtn: "Hesapsız devam et",
    offlineHint: "Verilerin sadece bu cihazda kalır",
    errorNotConfigured: "Sunucu yapılandırılmamış. Şimdilik çevrimdışı devam et.",
    errorInvalidInput: "Geçerli e-posta ve en az 6 karakter şifre gerekli.",
    errorGeneric: "Bir şeyler ters gitti.",
    errorNotConfiguredShort: "Sunucu yapılandırılmamış.",
    errorAppleFailed: "Apple girişi tamamlanamadı.",
    errorAppleError: "Apple ile giriş başarısız.",
    infoEmailSent: "Onay e-postası gönderildi. Kutunu kontrol et.",
    errInvalidLogin: "E-posta veya şifre hatalı.",
    errAlreadyRegistered: "Bu e-posta zaten kayıtlı.",
    errNotConfirmed: "Önce e-postaını onayla.",
    errNetwork: "İnternet bağlantısı yok.",
  },

  // ─── Paywall screen ───────────────────────────────────────────────────────────
  paywall: {
    eyebrow: "SAKİN AİLESİ",
    mikroTitle: "Hayvan Rehberi ✦",
    premiumTitle: "Sakin Premium",
    mikroSub: "Hayvan rehberliğinin derinine in",
    premiumSub: "Bir hesap. Tüm Sakin app'leri.",
    mikroPlan: "Mikro",
    premiumPlan: "Premium",
    mikroCadence: "ay · sadece Hayvan",
    premiumCadence: "ay · tüm aile",
    mostPopular: "EN POPÜLER",
    iosPrice: "Fiyatlar App Store üzerinden gösterilir.",
    androidPrice: "Fiyatlar Play Store üzerinden gösterilir.",
    ctaBtn: "Üstad Ol ✦",
    restoreBtn: "Aboneliği Geri Yükle",
    legal: "Satın alma onaylandığında ücret App Store hesabınıza yansıtılır. Mevcut dönemin bitiminden en az 24 saat önce iptal edilmezse abonelik otomatik olarak yenilenir. Aboneliklerinizi App Store hesap ayarlarınızdan yönetebilir ve iptal edebilirsiniz.",
    errorPurchase: "Satın alma tamamlanamadı.",
    errorPurchaseTitle: "Hata",
    infoRestore: "Aboneliği geri yükleme servisi yakında.",
    infoRestoreTitle: "Bilgi",
    infoRestoreNone: "Bu hesaba bağlı aktif bir abonelik bulunamadı.",
    linkTerms: "Kullanım Şartları",
    linkPrivacy: "Gizlilik Politikası",
  },

  // ─── Elements ─────────────────────────────────────────────────────────────────
  elements: {
    fire: 'ateş',
    water: 'su',
    earth: 'toprak',
    air: 'hava',
  },

  // ─── Glossary terms ───────────────────────────────────────────────────────────
  glossary: {
    totem: {
      term: 'Totem Hayvan',
      short: 'Seninle doğan, ömür boyu kalan ruh hayvanı.',
    },
    nagual: {
      term: 'Nagual',
      short: 'Belirli bir dönemde sana eşlik eden geçici rehber.',
    },
    mit: {
      term: 'Mit',
      short: 'Ruhun karşılaştığı sembolik bir güç — Gölge, Eşik, Şimşek...',
    },
    hayatYolu: {
      term: 'Hayat Yolu Sayısı',
      short: 'Doğum tarihinin numerolojik özetidir — ana enerjini gösterir.',
    },
    numeroloji: {
      term: 'Numeroloji',
      short: 'Sayıların ardındaki ruhsal anlamları okuma sanatı.',
    },
    ifade: {
      term: 'İfade Sayısı',
      short: 'İsminin harflerinden gelen — doğal yeteneklerin ve potansiyelin.',
    },
    ruhIstegi: {
      term: 'Ruh İsteği Sayısı',
      short: 'İsmindeki sesli harflerden — içsel motivasyonun.',
    },
    kisilik: {
      term: 'Kişilik Sayısı',
      short: 'İsmindeki sessiz harflerden — dünyaya gösterdiğin yüz.',
    },
    humanDesign: {
      term: 'Human Design',
      short: "Astroloji, I Ching, çakra ve Kabala'yı birleştiren bir sistem.",
    },
    jeneratör: {
      term: 'Jeneratör',
      short: 'Yaşam enerjisinin kaynağı. Strateji: Yanıt vermek.',
    },
    manifestingJeneratör: {
      term: 'Manifesting Jeneratör',
      short: 'Çok boyutlu, hızlı bir Jeneratör. Strateji: Yanıt ver, harekete geç.',
    },
    projektör: {
      term: 'Projektör',
      short: 'Sistemleri ve insanları derinden gören rehber. Strateji: Davet bekle.',
    },
    manifestor: {
      term: 'Manifestor',
      short: 'Bağımsız başlatıcı. Strateji: Bildirmek.',
    },
    reflektör: {
      term: 'Reflektör',
      short: 'Toplumun aynası. Strateji: 28 gün bekle.',
    },
    notSelf: {
      term: 'Not-Self Tema',
      short: 'Yanlış yolda olduğunu hissettiren duygu.',
    },
    unsur: {
      term: 'Unsur (Element)',
      short: 'Doğanın dört temel niteliği: Ateş, Su, Toprak, Hava.',
    },
    arketip: {
      term: 'Arketip',
      short: 'Tüm insanlığın paylaştığı evrensel sembolik figür.',
    },
    golge: {
      term: 'Gölge (Shadow)',
      short: 'Bilincimizde reddettiğimiz, bastırdığımız yanımız.',
    },
    kisiselYil: {
      term: 'Kişisel Yıl',
      short: 'Numerolojik yılına özgü tema — 9 yıllık döngünün hangi adımında olduğun.',
    },
    rehber: {
      term: 'Rehber Hayvan',
      short: 'Kişiliğinin ve enerjinin yansıdığı totem hayvan.',
    },
  },
} as const;
