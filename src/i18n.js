export const TRANS = {
  tr: {
    // Top nav
    nav_about:    "SAKİN NEDİR?",
    nav_pricing:  "FİYATLANDIRMA",
    nav_terms:    "HİZMET ŞARTLARI",
    nav_privacy:  "GİZLİLİK",
    nav_refund:   "İADE POLİTİKASI",

    // Bottom nav
    nav_morning:  "Sabah",
    nav_breath:   "Nefes",
    nav_chakra:   "Çakra",
    nav_day:      "Gün",
    nav_evening:  "Akşam",
    nav_map:      "Harita",
    nav_guide:    "Rehber",

    // Giris
    tagline:      "Kendini hep hatırla",
    intro_text1:  "Bu uygulama sana bir şey öğretmez.",
    intro_text2:  "Sadece hatırlatır.",
    btn_ready:    "Hazırım",

    // Sabah
    intention_q:        "Bugün nasıl bir gün geçirmek istersin?",
    intention_ph:       "Kendine bugün için bir niyet armağan et...",
    choose_words:       "3 kelime seç",
    birth_profile:      "DOĞUM PROFİLİ",
    birth_sign:         "Burç",
    birth_life_path:    "Yaşam Yolu",
    birth_personal_yr:  "Kişisel Yıl",
    bio_label:          "BİYORİTM — BU HAFTA",
    bio_physical:       "Fiziksel",
    bio_emotional:      "Duygusal",
    bio_mental:         "Zihinsel",
    birth_time_label:   "doğum saati",
    change_date:        "tarihi değiştir",
    birth_desc:         "Doğum tarihinle sana özel\nenerji yorumu alırsın.",
    birth_date_label:   "Doğum tarihin",
    birth_time_input:   "Doğum saatin",
    optional:           "(isteğe bağlı)",
    cancel:             "vazgeç",
    save:               "kaydet",
    btn_continue:       "devam et →",

    // Nefes
    breath_title:  "Nefes",
    youre_here:    "Buradasın.",
    breath_count:  (n) => `${n} nefes`,
    back:          "← geri",
    btn_start:     "başla",
    btn_next:      "ileri →",
    breath_inhale: "al",
    breath_hold:   "tut",
    breath_exhale: "ver",
    breath_rest:   "dinlen",
    breath_voice_inhale: "Nefes al",
    breath_voice_hold:   "Tut",
    breath_voice_exhale: "Ver",
    breath_voice_rest:   "Dinlen",
    breath_choose: "bir mod seç",
    breath_calming:"gün içi sakinleştirme",
    breath_change: "← mod değiştir",
    breath_mode_standart:    "Standart",
    breath_mode_diyafram:    "Diyafram",
    breath_mode_akciger:     "Akciğer",
    breath_mode_478:         "4-7-8",
    breath_mode_kutu:        "Kutu",
    breath_mode_sakinletici: "Sakinleştirici",
    breath_desc_standart:    "Temel nefes ritmi. Nefes alıp vermeye odaklan, zihni yavaşlat.",
    breath_desc_diyafram:    "Karın bölgesini şişirerek nefes al. Göğüs değil, karın hareket eder. Derin gevşeme sağlar.",
    breath_desc_akciger:     "Akciğerleri tam kapasiteyle doldur. Göğüs kafesi genişler, enerji artar.",
    breath_desc_478:         "4 sn nefes al, 7 sn tut, 8 sn ver. Sinir sistemini sakinleştirir, uykuya hazırlar.",
    breath_desc_kutu:        "Eşit sürelerle al, tut, ver, bekle. Odaklanma ve zihinsel netlik sağlar.",
    breath_desc_sakinletici: "Uzun verişle parasempatik sistemi aktive eder. Stres ve kaygıyı azaltır.",

    // Ses Dalgaları
    nav_sound:         "Ses",
    sound_title:       "Ses Dalgaları",
    sound_subtitle:    "Frekans Akord",
    sound_intro:       "Kuş sesleri eşliğinde frekanslarla hizalanın. Her ses dalgası bedeninizde ve enerji alanınızda farklı bir titreşim yaratır.",
    sound_tap_to_play: "dokunarak çal",
    sound_playing:     "çalıyor",
    sound_stop:        "durdur",
    sound_effects:     "Etkileri",
    sound_btn_next:    "Sonraki Adıma Geç →",

    // Çakra
    chakra_subtitle:   "Reiki · Günün Çakrası",
    chakra_name_suf:   "Çakrası",
    chakra_stay:       "Bugün bu merkezde huzurla kal.",
    btn_therapy:       "✦ 22 Çakra Terapi →",
    btn_reminders:     "gün hatırlatıcıları →",

    // Terapi
    reiki_label:       "Reiki",
    therapy_title:     "22 Çakra Yükselişi",
    core_badge:        "temel",
    selected_label:    "seçilen",
    btn_start_therapy: "Terapiye başla",
    reiki_chakra_label:"Reiki · Çakra Terapisi",
    chakra_suf:        "Çakrası",
    intro_place_hand:  (name) => `Bir elini ${name.toLowerCase()} bölgende hisset.`,
    intro_close_eyes:  "Gözlerini yum.",
    close_eyes_hint:   "Dilersen şimdi gözlerini yavaşça kapayabilirsin.",
    close_eyes_chakra: {
      "Kök":            "Gözlerini kapat. Ayaklarının altındaki toprağı hisset. Güvende olduğunu hatırla.",
      "Sakral":         "Gözlerini kapat. Duygularının serbest akışını hisset. Hatırlamasan da kalbinle bırak.",
      "Solar Pleksus":  "Gözlerini kapat. Karnındaki sıcaklığı hisset. İçindeki gücü hatırla.",
      "Kalp":           "Gözlerini kapat. Göğsündeki genişlemeyi hisset. Sevgiyi hatırla, hep oradaydı.",
      "Boğaz":          "Gözlerini kapat. Söyleyemediğin şeyleri düşün. Onları kalbinle hisset, bırakılmayı bekliyorlar.",
      "Üçüncü Göz":    "Gözlerini kapat. Alnının ortasına odaklan. İç sesin ne diyorsa onu dinle.",
      "Taç":            "Gözlerini kapat. En yüksek niyetlerini hatırlamaya çalış. Hatırlamasan da kalbinle hisset.",
      "Ruh Yıldızı":    "Gözlerini kapat. Tekrar eden kalıplarını düşün. Hangisini bırakmaya hazırsın?",
      "Yıldız Kapısı":  "Gözlerini kapat. Bedeninin ötesindeki ışığı hissetmeye çalış.",
      "Güneş Çakrası":  "Gözlerini kapat. İçindeki kararlılığı ve cesareti hatırla. O güç hep seninleydi.",
      "Ay Çakrası":     "Gözlerini kapat. İçindeki yumuşaklığı ve sezgiyi hisset. Ona güven.",
      "Mesih Çakrası":  "Gözlerini kapat. Koşulsuz sevildiğini hatırla. Bunu hak etmek için bir şey yapmana gerek yok.",
      "Yıldız İletişim":"Gözlerini kapat. Yalnız olmadığını hisset. Evren seninle konuşuyor, dinle.",
      "İlahi Plan":     "Gözlerini kapat. Kontrolü bırak. Hayatın akışına güvenmeyi dene.",
      "Monadik Bağlantı":"Gözlerini kapat. Ruhunun nereden geldiğini hatırlamaya çalış. Hatırlamasan da hisset.",
      "Yükseliş":       "Gözlerini kapat. Bedenindeki hafifliği fark et. Yükselmeye izin ver.",
      "Evrensel Işık":  "Gözlerini kapat. Zaten bildiğin ama unuttuğun şeyleri hatırlamaya çalış.",
      "İlahi Niyet":    "Gözlerini kapat. Ruhunun görevini hatırlamaya çalış. Hatırlamasan da kalbinle hisset.",
      "Kozmik Enerji":  "Gözlerini kapat. Sınırlarının ötesini hisset. Sen düşündüğünden büyüksün.",
      "Varlık":         "Gözlerini kapat. Düşünmeyi bırak. Sadece var ol. Bu yeter.",
      "İlahi Yapı":     "Gözlerini kapat. Her şeyin bir düzeni olduğunu hatırla. Sen de o düzenin parçasısın.",
      "Kaynak":         "Gözlerini kapat. Kaynağa dön. Orası senin evin. Hatırla.",
    },
    connected_label:   "● bağlantı kuruldu",
    connected_voice:   () => "Connected",
    sure_title:        "Biraz daha kal...",
    sure_body:         "Bu an sana ait.\nKendine bu güzelliği armağan et.",
    btn_exit:          "çık",
    btn_continue2:     "ileri →",
    pct_loaded:        (n) => `${n}% hazırlanıyor`,
    progress_p1:       "Elinin sıcaklığını hissediyorsun...",
    progress_p2:       (name) => `${name} ışığı nazikçe yayılıyor...`,
    progress_p3:       "Enerji akıyor, bırak gelsin...",
    progress_p4:       "Neredeyse hazır. Hisset.",
    progress_p5:       (name) => `${name} çakran dolup taşıyor. 💫`,
    chakra_facts: {
      "Kök": [
        "Kök çakra, bedenin en düşük titreşimli enerji merkezidir. 396 Hz frekansıyla rezonansa girer ve korku kalıplarını çözmeye yardımcı olur.",
        "Sanskrit adı 'Muladhara'dır — 'kök destek' anlamına gelir. Böbrek üstü bezleriyle bağlantılıdır ve adrenalin üretimini etkiler.",
        "Toprak elementiyle ilişkilidir. Dengeli olduğunda güvenlik, istikrar ve maddi bereket hissi verir. Dengesizlikte kaygı ve güvensizlik ortaya çıkar."
      ],
      "Sakral": [
        "Sakral çakra, yaratıcılık ve duygusal akışın merkezidir. Su elementiyle ilişkilidir — tıpkı su gibi esnek ve akışkan olmayı öğretir.",
        "Sanskrit adı 'Svadhisthana' — 'benliğin yeri' demektir. Üreme organları ve böbreklerle doğrudan bağlantılıdır.",
        "417 Hz frekansıyla çalışır. Dengeli olduğunda zevk alabilme, ilişkilerde sağlıklı bağ kurma ve duygusal esneklik sağlar."
      ],
      "Solar Pleksus": [
        "Solar Pleksus, kişisel gücün ve iradenin merkezidir. Ateş elementiyle ilişkilidir — içsel ateşini yakar ve özgüvenini güçlendirir.",
        "Sanskrit adı 'Manipura' — 'mücevher şehri' anlamına gelir. Pankreas ve sindirim sistemiyle bağlantılıdır.",
        "528 Hz frekansıyla rezonansa girer. DNA onarımıyla ilişkilendirilen bu frekans, dönüşüm ve mucize frekansı olarak bilinir."
      ],
      "Kalp": [
        "Kalp çakra, alt ve üst çakralar arasında köprü görevi görür. Hava elementiyle ilişkilidir — sevgiyi her yöne yayar.",
        "Sanskrit adı 'Anahata' — 'vurulmamış ses' demektir. Timus beziyle bağlantılıdır ve bağışıklık sistemini etkiler.",
        "639 Hz frekansıyla çalışır. Bu frekans ilişkileri iyileştirir, bağlantı ve uyumu güçlendirir."
      ],
      "Boğaz": [
        "Boğaz çakra, ifadenin ve hakikatin merkezidir. Ses elementiyle ilişkilidir — sesin sadece fiziksel değil, enerjetik bir titreşimdir.",
        "Sanskrit adı 'Vishuddha' — 'arındırma' demektir. Tiroid beziyle bağlantılıdır ve metabolizmayı etkiler.",
        "741 Hz frekansıyla çalışır. Bu frekans sezgisel uyanış ve ifade özgürlüğü sağlar."
      ],
      "Üçüncü Göz": [
        "Üçüncü Göz, sezgi ve durugörünün merkezidir. Işık elementiyle ilişkilidir — iç görüşü ve farkındalığı açar.",
        "Sanskrit adı 'Ajna' — 'komut' veya 'algılama' demektir. Epifiz (pineal) beziyle bağlantılıdır ve melatonin üretimini etkiler.",
        "852 Hz frekansıyla çalışır. Spiritüel düzene dönüşü destekler ve iç sesi güçlendirir."
      ],
      "Taç": [
        "Taç çakra, ilahi bağlantının ve kozmik bilincin merkezidir. Evren elementiyle ilişkilidir — saf farkındalığın kapısıdır.",
        "Sanskrit adı 'Sahasrara' — 'bin yapraklı lotus' demektir. Hipofiz beziyle bağlantılıdır ve tüm hormonal sistemi yönetir.",
        "963 Hz frekansıyla çalışır. 'Tanrı frekansı' olarak bilinir ve birlik bilincini aktive eder."
      ],
      "Ruh Yıldızı": [
        "8. çakra olan Ruh Yıldızı, başın yaklaşık 15 cm üzerinde bulunur. Karmik kayıtların ve ruh sözleşmelerinin tutulduğu yerdir.",
        "Bu çakra aktive olduğunda geçmiş yaşam anılarına ve ruhsal derslere erişim açılır.",
        "Ruh Yıldızı, bireysel benlikten evrensel benliğe geçişin kapısıdır. Burada ego çözülmeye başlar."
      ],
      "Yıldız Kapısı": [
        "9. çakra, ışık bedenle bağlantının kurulduğu merkezdir. Fiziksel bedenin ötesindeki enerji alanını aktive eder.",
        "Merkaba — ışık beden geometrisi — bu çakra üzerinden şekillenir. Astral seyahat bu merkezle ilişkilidir.",
        "Yıldız Kapısı açıldığında kişi, boyutlar arası farkındalık geliştirir ve ruhsal rehberlerle bağlantı güçlenir."
      ],
      "Güneş Çakrası": [
        "10. çakra, ilahi eril enerjinin bütünleştiği merkezdir. Güneşin yaratıcı, koruyucu ve yönlendirici gücünü temsil eder.",
        "Bu çakra dengeli olduğunda liderlik, kararlılık ve koruyucu güç sağlıklı biçimde ifade edilir.",
        "Eril enerji sadece erkeklere ait değildir — her insanda bulunan eylem, mantık ve yapı gücüdür."
      ],
      "Ay Çakrası": [
        "11. çakra, ilahi dişil enerjinin bütünleştiği merkezdir. Ayın alıcı, sezgisel ve besleyici gücünü temsil eder.",
        "Bu çakra dengeli olduğunda empati, sezgi ve şefkat doğal biçimde akar.",
        "Dişil enerji sadece kadınlara ait değildir — her insanda bulunan alıcılık, sezgi ve yaratma gücüdür."
      ],
      "Mesih Çakrası": [
        "12. çakra, koşulsuz sevginin ve birlik bilincinin merkezidir. Tüm ayrılık yanılsamasının çözüldüğü noktadır.",
        "Bu çakra, İsa bilinci veya Budda bilinci olarak da bilinir — dini değil, evrensel bir uyanış durumudur.",
        "Aktive olduğunda kişi, tüm varlıklara karşı derin bir şefkat ve birlik duygusu yaşar."
      ],
      "Yıldız İletişim": [
        "13. çakra, galaktik varlıklarla ve yüksek boyutsal rehberlerle iletişimin kurulduğu merkezdir.",
        "Bu çakra üzerinden kozmik bilgi aktarımı gerçekleşir. Channeling ve telepati bu merkezle ilişkilidir.",
        "Aktive olduğunda evrensel bilgeliğe erişim açılır ve kişi kozmik ailesini hissetmeye başlar."
      ],
      "İlahi Plan": [
        "14. çakra, evrensel teslimiyetin ve ilahi planla uyumun merkezidir. Bireysel iradenin evrensel iradeyle birleştiği noktadır.",
        "Bu çakra aktive olduğunda 'bırakma' sanatı öğrenilir — kontrol değil, güven ön plana çıkar.",
        "İlahi plan çakrası, hayatın akışına teslim olma ve her deneyimde anlam bulma kapasitesini güçlendirir."
      ],
      "Monadik Bağlantı": [
        "15. çakra, ruhun en yüksek kaynağı olan Monad ile bağlantının kurulduğu merkezdir.",
        "Monad, binlerce enkarnasyonun deneyimlerini barındıran 'üst ruh'tur. Bu çakra o bilgeliğe erişim sağlar.",
        "Aktive olduğunda kişi, tek bir yaşamın ötesinde bir varoluş perspektifi kazanır."
      ],
      "Yükseliş": [
        "16. çakra, yükselişin — fiziksel yoğunluktan ışık frekansına geçişin — başladığı merkezdir.",
        "Yükseliş, bedenin terk edilmesi değil, bilincin genişlemesiyle birlikte bedenin de dönüşmesidir.",
        "Bu çakra aktive olduğunda hücresel hafıza temizlenir ve beden daha yüksek frekanslara uyum sağlamaya başlar."
      ],
      "Evrensel Işık": [
        "17. çakra, evrensel bilginin — Akashik kayıtların — erişildiği merkezdir.",
        "Akashik kayıtlar, tüm ruhların tüm deneyimlerinin tutulduğu evrensel hafızadır.",
        "Bu çakra aktive olduğunda kişi, evrenin işleyiş yasalarını sezgisel olarak kavramaya başlar."
      ],
      "İlahi Niyet": [
        "18. çakra, ruhun bu yaşamdaki en yüksek amacının — ilahi niyetinin — tezahür ettiği merkezdir.",
        "Her ruh, enkarne olmadan önce belirli dersler ve görevler seçer. Bu çakra o sözleşmeyi hatırlatır.",
        "Aktive olduğunda kişi, yaşam amacını netleştirir ve her eylemi bu amaçla hizalar."
      ],
      "Kozmik Enerji": [
        "19. çakra, galaktik genişlemenin ve kozmik enerjiyle bütünleşmenin merkezidir.",
        "Bu seviyede birey, Dünya bilincinin ötesine geçer ve galaktik bir perspektif kazanır.",
        "Kozmik enerji çakrası, evrendeki tüm enerji ağlarıyla uyumlanmayı sağlar."
      ],
      "Varlık": [
        "20. çakra, saf varoluşun — 'Ben'im' halinin ötesindeki 'Var olan'ın — deneyimlendiği merkezdir.",
        "Bu seviyede düşünce, duygu ve kimlik çözülür; geriye yalnızca saf farkındalık kalır.",
        "Varlık çakrası, tüm etiketlerin ve tanımların ötesinde, özün deneyimlenmesini sağlar."
      ],
      "İlahi Yapı": [
        "21. çakra, evrensel yasaların — karma, rezonans, titreşim, çekim — bütünleştiği merkezdir.",
        "Bu seviyede kişi, evrenin matematiksel ve geometrik düzenini sezgisel olarak kavrar.",
        "İlahi yapı çakrası, kutsal geometri ve evrensel düzenle tam uyum halinde olmayı sağlar."
      ],
      "Kaynak": [
        "22. çakra, tanrısal kaynakla tam birleşmenin gerçekleştiği en yüksek merkezdir. Platin ışık elementiyle ilişkilidir.",
        "Bu seviyede bireysel bilinç, evrensel bilinçle tamamen birleşir. Ayrılık yanılsaması sona erer.",
        "Kaynak çakrası, tüm çakra sisteminin taçlandığı ve döngünün tamamlandığı nihai noktadır."
      ],
    },
    done_title:        "Tamamlandı.",
    done_body:         (name) => `${name} çakran şimdi canlı ve aktif.\nBu güzel enerjiyi gün boyu içinde taşı.`,
    other_chakra:      "diğer çakra",
    main_screen:       "ana ekrana dön",

    // Hatırlatıcılar
    day_label:         "Bugün",
    reminders_title:   "Bugün bunları kendin için yaptın mı?",
    all_done_msg:      "Bugün kendine güzelce dokundun. 🌿",
    btn_reminders_next:"Devam Et →",
    terapi_duration:   "60 saniyede bağlantı",
    btn_done_next:     "Tamamlandı → Sonraki Adım",
    step_label:        (cur, total) => `${cur}/${total} adım`,

    // Akşam
    evening_label:     "Akşam Kapanışı",
    evening_subtitle:  "Bugünü geride bırak.\nKendine dön.",
    evening_ritual:    "3 adımlık akşam ritüeli",
    evening_step1:     "Bırak",
    evening_step1_desc:"Bugün seni yoran her şeyi zihninden bırak.",
    evening_step2:     "Şükret",
    evening_step2_desc:"İyi gelen 3 şeyi hatırla ve kalbine teşekkür et.",
    evening_step3:     "Teslim ol",
    evening_step3_desc:"Kontrolü bırak, huzura teslim ol. Nefesinle kal.",
    evening_quote:     "Bugün bitti.\nSen varsın, bu yeter.",
    learned_q:         "Bugün sana ne öğretti?",
    gratitude_q:       "Bugün neye şükrediyorsun?",
    btn_see_week:      "Haftama bak →",

    // Harita
    weekly_label:      "Haftalık",
    inner_map:         "İçsel Harita",
    day_pct:           "Gün",
    stat_chakra:       "En Aktif Çakra",
    stat_breath:       "Nefes Sayısı",
    stat_word:         "Niyet Kelimesi",
    stat_mindful:      "Bilinçli An",
    orchestra_label:   "Orkestra Modu",
    orchestra_text:    (n) => `Bugün ${n} kişi seninle nefes aldı.`,
    ai_report_label:   "Haftalık Sakin Rapor",
    free_used:         "Bu haftaki ücretsiz raporunu kullandın",
    free_used_body:    "Her hafta derin bir içsel rapor almak için",
    premium_name:      "Sakin Premium",
    premium_suffix:    "'a geçebilirsin.",
    premium_label:     "Premium",
    premium_feat1:     "✦ Haftalık sınırsız AI rapor",
    premium_feat2:     "✦ Derin astroloji & numeroloji analizi",
    premium_feat3:     "✦ Kişisel büyüme takibi",
    btn_go_premium:    "Premium'a geç →",
    report_invite:     "Niyetlerin, şükranların ve öğrendiklerin\nAI ile haftalık içsel rapora dönüşsün.",
    btn_gen_report:    "✦ Raporumu oluştur",
    generating:        "Rapor hazırlanıyor...",
    copy_label:        "kopyala",
    copied_label:      "✓ kopyalandı",
    share_label:       "paylaş",
    share_title:       "Haftalık İçsel Raporum",
    refresh_label:     "yenile",
    btn_new_day:       "yeni güne başla",

    // AI Consent
    ai_consent_title:  "Yapay Zeka Destekli Özellik",
    ai_consent_body:   "Bu özellik, yazdığın metni kişiselleştirilmiş yanıt üretmek için yapay zeka hizmetine (Meta Llama / Groq) gönderir. Gönderilen metin anonimdir ve kimliğine bağlanmaz.",
    ai_consent_data:   "Gönderilen: yazdığın metin. Gönderilmeyen: adın, konumun, cihaz bilgin.",
    ai_consent_accept: "Kabul Et",
    ai_consent_decline:"Vazgeç",
    ai_offline:        "Bu özellik internet bağlantısı gerektirir. Lütfen bağlantını kontrol et.",

    // Rehber
    guide_sup:         "✦ içsel rehber ✦",
    guide_title:       "Şifa Arayışı",
    guide_sub:         "☽ bedeninin mesajını dinle ☽",
    mirror_title:      "İçsel Ayna",
    mirror_icon:       "☽",
    mirror_desc:       "bedeninin mesajını nazikçe dinle",
    mirror_ph:         "örn: baş ağrısı, yorgunluk, uyuyamıyorum...",
    feeling_ph:        "Nasıl hissediyorsun? Nerede ve ne zaman başladı?",
    btn_search:        "✦ anlam ara",
    btn_new_search:    "✦ yeni arama",
    reading:           "Senin için bakıyorum...",
    analysis_suf:      "· analiz",

    // Fiyatlandırma
    pricing_title:     "Fiyatlandırma",
    pricing_sub:       "SAKIN · ŞEFFAF FİYATLANDIRMA",
    paid_app_badge:    "TEK ÖDEME",
    paid_app_plan:     "Sakin — Tüm Özellikler",
    paid_app_price:    "$9.99",
    paid_app_price_sub:"Bir kez öde, ömür boyu seninle. Abonelik yok.",
    paid_app_features: ["Sabah niyeti ve motivasyon kelimeleri","7 farklı nefes egzersizi tekniği","10 solfeggio frekansı (Ses Dalgaları)","22 Çakra Terapisi — derin enerji çalışması","İçsel Ayna — AI destekli kişisel analiz","Haftalık AI içsel rapor","Gün içi hatırlatıcılar (10+)","Akşam kapanış ritüeli","Haftalık iç harita ve istatistikler","Numeroloji & astroloji detayları","Reiki rehberi ve semptom haritası","Süresiz erişim — güncelleme dahil"],
    pricing_footer:    "Güvenli ödeme altyapısı ile satın alınır. Sorularınız için:",
    lemon_checkout_url:"https://sakin.lemonsqueezy.com/checkout/buy/0fbd6f22-0ad0-4078-93b7-3f873912e1e2",

    // Hizmet Şartları
    terms_title:       "Hizmet Şartları",
    terms_updated:     "SON GÜNCELLEME: MART 2026",
    terms_s1:          "1. KABUL",
    terms_s1p:         'Sakin uygulamasını ("Uygulama") kullanarak bu Hizmet Şartlarını ("Şartlar") kabul etmiş sayılırsınız. Bu Şartları kabul etmiyorsanız Uygulamayı kullanmayınız.',
    terms_s2:          "2. HİZMET TANIMI",
    terms_s2p:         "Sakin; günlük farkındalık rutinleri, nefes egzersizleri, çakra rehberi, kişisel gelişim programları ve spiritüel wellness içerikleri sunan bir mobil web uygulamasıdır. Uygulama herhangi bir tıbbi, psikolojik veya terapötik hizmet sağlamaz.",
    terms_s3:          "3. KULLANIM KOŞULLARI",
    terms_s3p:         "Uygulamayı kullanırken aşağıdakileri kabul edersiniz:",
    terms_s3l:         ["Uygulama yalnızca kişisel, ticari olmayan amaçlarla kullanılabilir","Uygulama içeriği kopyalanamaz, dağıtılamaz veya tersine mühendislik uygulanamaz","Sistemi kötüye kullanacak, zarar verecek veya aşırı yükleyecek eylemler yasaktır","Yasal olmayan amaçlarla kullanım kesinlikle yasaktır"],
    terms_s4:          "4. ÜCRETLI UYGULAMA",
    terms_s4p:         "Sakin, App Store üzerinden tek seferlik ödemeyle satın alınan ücretli bir uygulamadır. Satın alma sonrası tüm özellikler sınırsız olarak kullanılabilir. Uygulama içi ek satın alma bulunmamaktadır. İade talepleri Apple'ın iade politikası kapsamında değerlendirilir.",
    terms_s5:          "5. FİKRİ MÜLKİYET",
    terms_s5p:         "Uygulama içeriğindeki tüm metin, tasarım, grafik, animasyon ve yazılım Sakin'e aittir ve telif hakkı ile fikri mülkiyet yasalarıyla korunmaktadır. Kullanıcıya yalnızca sınırlı, devredilemez, kişisel kullanım lisansı tanınmaktadır.",
    terms_s6:          "6. SORUMLULUK REDDİ",
    terms_s6p:         "Sakin bir wellness uygulamasıdır; tıbbi tavsiye, tanı veya tedavi sunmaz. Uygulama içerikleri yalnızca bilgilendirme ve kişisel farkındalık amacıyla sunulmaktadır. Herhangi bir sağlık sorununda mutlaka bir uzman hekime danışınız.",
    terms_s7:          "7. HİZMET DEĞİŞİKLİKLERİ",
    terms_s7p:         "Sakin, önceden bildirim yapmaksızın hizmetin içeriğini, özelliklerini veya fiyatlandırmasını değiştirme hakkını saklı tutar. Önemli değişiklikler uygulama içinde duyurulacaktır.",
    terms_s8:          "8. UYGULANACAK HUKUK",
    terms_s8p:         "Bu Şartlar Türkiye Cumhuriyeti hukuku kapsamında yorumlanır ve uygulanır. Anlaşmazlıklarda Türkiye mahkemeleri yetkilidir.",
    terms_s9:          "9. İLETİŞİM",
    terms_s9p:         "Hizmet Şartlarına ilişkin sorularınız için:",

    // Gizlilik
    privacy_title:     "Gizlilik Politikası",
    privacy_updated:   "SON GÜNCELLEME: MART 2026",
    privacy_s1:        "1. GENEL BAKIŞ",
    privacy_s1p:       "Sakin uygulaması, kullanıcıların kişisel gelişimini ve günlük farkındalık pratiklerini desteklemeyi amaçlamaktadır. Gizliliğinizi ciddiye alıyoruz.",
    privacy_s2:        "2. TOPLANAN VERİLER",
    privacy_s2p:       "Aşağıdaki veriler yalnızca cihazınızda yerel olarak saklanır, hiçbir sunucuya iletilmez:",
    privacy_s2l:       ["Günlük niyet metni (o gün için yazdığınız hedef/niyet)","Seçilen motivasyon kelimeleri (sabah seçilen 3 kelime)","Akşam kapanış notları ve şükür metinleri","Nefes egzersizi sayısı ve tamamlanma durumları","Hatırlatıcı tamamlanma kayıtları","Doğum tarihi ve saati (astroloji özellikleri için, cihazda kalır)","Haftalık istatistikler (çakra, kelime ve nefes verileri)"],
    privacy_s3:        "3. TOPLAMADIĞIMIZ VERİLER",
    privacy_s3p:       "Uygulama şu verileri kesinlikle toplamaz:",
    privacy_s3l:       ["Kişisel kimlik bilgileri (ad, soyad, e-posta, telefon)","Konum bilgisi","Sağlık veya tıbbi veriler","Biyometrik veriler","Kamera veya mikrofon erişimi"],
    privacy_s4:        "4. AI RAPOR ÖZELLİĞİ",
    privacy_s4p:       "Haftalık AI raporu oluşturulurken, yalnızca o hafta için anonim ve özetlenmiş veriler (çakra seçimleri, kelimeler, nefes sayısı) Anthropic API'ye iletilir. Bu veriler kişisel kimliğinizle ilişkilendirilmez ve Anthropic'in gizlilik politikası kapsamındadır.",
    privacy_s5:        "5. BİLDİRİMLER",
    privacy_s5p:       "Günlük hatırlatıcı bildirimleri için izin verirseniz, bildirimler yalnızca cihazınızda yerel olarak tetiklenir. Bildirim içerikleri sunucuya gönderilmez. İzninizi iOS/Android Ayarlar > Sakin menüsünden istediğiniz zaman iptal edebilirsiniz.",
    privacy_s6:        "6. ÜÇÜNCÜ TARAF HİZMETLER",
    privacy_s6p:       "Uygulama şu anda herhangi bir üçüncü taraf reklam ağı, analitik servisi veya sosyal medya entegrasyonu içermemektedir. Yalnızca AI rapor özelliği için Anthropic API kullanılmaktadır.",
    privacy_s7:        "7. VERİ GÜVENLİĞİ",
    privacy_s7p:       "Tüm kişisel verileriniz cihazınızda yerel olarak saklanır. Uygulamayı cihazınızdan kaldırdığınızda tüm yerel veriler otomatik olarak silinir.",
    privacy_s8:        "8. ÇOCUKLARIN GİZLİLİĞİ",
    privacy_s8p:       "Uygulama 4 yaş ve üzeri kullanıcılara yöneliktir. 13 yaşın altındaki çocuklardan bilerek herhangi bir veri toplanmamaktadır.",
    privacy_s9:        "9. POLİTİKA DEĞİŞİKLİKLERİ",
    privacy_s9p:       "Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler uygulama güncellemesi notlarında belirtilecektir.",
    privacy_s10:       "10. İLETİŞİM",
    privacy_s10p:      "Gizlilik politikasına ilişkin sorularınız için:",
    privacy_app_name:  "Uygulama Adı: Sakin",

    // İade
    refund_title:      "İade Politikası",
    refund_updated:    "SON GÜNCELLEME: MART 2026",
    refund_s1:         "1. GENEL KURAL",
    refund_s1p:        "Sakin'de sunulan premium içerikler dijital ürün niteliğindedir. Satın alma işleminin tamamlanmasıyla birlikte dijital içeriğe erişim hemen sağlandığından, genel kural olarak iade kabul edilmemektedir.",
    refund_s1p2:       "Ancak müşteri memnuniyetini ön planda tutuyoruz. Aşağıdaki koşullar çerçevesinde iade talebinizi değerlendiririz.",
    refund_s2:         "2. İADE KABULEDİLEN DURUMLAR",
    refund_s2l:        [["Teknik arıza","Satın aldığınız özelliğe hiç erişemediyseniz ve destek ekibimiz sorunu 48 saat içinde çözemediyse"],["Çift ödeme","Aynı ürün için hatalı şekilde iki kez ödeme yapıldıysa"],["İlk 48 saat","Satın alma tarihinden itibaren 48 saat içinde, içeriğe hiç erişilmemişse iade değerlendirilebilir"]],
    refund_s3:         "3. İADE KABULEDİLMEYEN DURUMLAR",
    refund_s3l:        ["İçeriğe erişilmiş veya kullanılmış olması","Satın almadan 48 saat geçmiş olması",'"Beğenmedim" veya "beklentimi karşılamadı" gerekçesi (ücretsiz deneme imkânı sunulmaktadır)',"Hesap askıya alınma veya Hizmet Şartlarının ihlali durumu"],
    refund_s4:         "4. ABONELİK İPTALİ",
    refund_s4p:        "Aylık veya yıllık abonelik (Sınırsız Raporlama) için: mevcut dönem sona erene kadar erişiminiz devam eder. İptal işlemi bir sonraki ödeme döneminden önce gerçekleştirilmelidir. Kısmi dönem için iade yapılmamaktadır.",
    refund_s5:         "5. İADE SÜRECİ",
    refund_s5p:        "İade talebinde bulunmak için aşağıdaki bilgilerle bize ulaşın:",
    refund_s5l:        ["Satın alma tarihi ve işlem numarası","Satın alınan ürün adı","İade gerekçesi"],
    refund_s5p2:       "E-posta:",
    refund_s5p3:       "Talebiniz 5 iş günü içinde yanıtlanacaktır. Onaylanan iadeler, ödeme yönteminize bağlı olarak 5–10 iş günü içinde yansıtılır.",
    refund_s6:         "6. YASAL HAKLAR",
    refund_s6p:        "Bu politika, Türkiye Mesafeli Sözleşmeler Yönetmeliği ve 6502 Sayılı Tüketicinin Korunması Hakkında Kanun kapsamındaki yasal haklarınızı etkilememektedir.",
    refund_s7:         "7. İLETİŞİM",
    refund_s7p:        "İade ve ödeme sorularınız için:",

    // Zodiac signs
    zodiac_Oglakar: "Oğlak", zodiac_Kova: "Kova", zodiac_Balik: "Balık",
    zodiac_Koc: "Koç", zodiac_Boga: "Boğa", zodiac_Ikizler: "İkizler",
    zodiac_Yengec: "Yengeç", zodiac_Aslan: "Aslan", zodiac_Basak: "Başak",
    zodiac_Terazi: "Terazi", zodiac_Akrep: "Akrep", zodiac_Yay: "Yay",

    // Morning words
    morning_words: ["huzur","akış","cesaret","sabır","berraklık","sevgi","güç","denge","özgürlük","neşe","şükür","güven"],

    // Kullanım Kılavuzu
    guide_help_title: "Kullanım Kılavuzu",
    guide_help_sub: "SAKİN · TERİMLER SÖZLÜĞÜ",
    guide_close: "kapat",
    guide_cat_numerology: "Numeroloji",
    guide_cat_astrology: "Astroloji",
    guide_cat_chakra: "Çakralar",
    guide_cat_biorhythm: "Biyoritm",
    guide_cat_reiki: "Reiki & Terapi",
    guide_cat_app: "Uygulama Kavramları",

    // Mandala Harita
    mandala_title: "İçsel Yolculuk",
    mandala_sub: "BUGÜNÜN HARİTASI",
    mandala_streak: "gün serisi",
    mandala_streak_best: "en iyi seri",
    mandala_badge_3: "3 Gün",
    mandala_badge_7: "1 Hafta",
    mandala_badge_21: "21 Gün",
    mandala_badge_40: "40 Gün",
    mandala_complete: "Bugün güzeldi, tebrikler. 🌿",
    mandala_step_birth: "Doğum Profili",
    mandala_step_morning: "Sabah Niyeti",
    mandala_step_breath: "Nefes",
    mandala_step_chakra: "Çakra",
    mandala_step_day: "Gün Görevleri",
    mandala_step_evening: "Akşam Kapanışı",
    mandala_step_map: "Haftalık Harita",
    mandala_locked: "Önce önceki adımı tamamla",
    mandala_start: "başla →",
  },

  en: {
    // Top nav
    nav_about:    "WHAT IS SAKIN?",
    nav_pricing:  "PRICING",
    nav_terms:    "TERMS OF SERVICE",
    nav_privacy:  "PRIVACY",
    nav_refund:   "REFUND POLICY",

    // Bottom nav
    nav_morning:  "Morning",
    nav_breath:   "Breath",
    nav_chakra:   "Chakra",
    nav_day:      "Day",
    nav_evening:  "Evening",
    nav_map:      "Map",
    nav_guide:    "Guide",

    // Giris
    tagline:      "Always remember yourself",
    intro_text1:  "This app teaches you nothing.",
    intro_text2:  "It only reminds.",
    btn_ready:    "I'M READY",

    // Sabah
    intention_q:        "What is today's intention?",
    intention_ph:       "Write an intention for today...",
    choose_words:       "CHOOSE 3 WORDS",
    birth_profile:      "BIRTH PROFILE",
    birth_sign:         "Sign",
    birth_life_path:    "Life Path",
    birth_personal_yr:  "Personal Year",
    bio_label:          "BIORHYTHM — THIS WEEK",
    bio_physical:       "Physical",
    bio_emotional:      "Emotional",
    bio_mental:         "Mental",
    birth_time_label:   "birth time",
    change_date:        "change date",
    birth_desc:         "Get a personalized energy reading\nwith your birth date.",
    birth_date_label:   "BIRTH DATE",
    birth_time_input:   "BIRTH TIME",
    optional:           "(optional)",
    cancel:             "cancel",
    save:               "Save",
    btn_continue:       "CONTINUE",

    // Nefes
    breath_title:  "BREATH",
    youre_here:    "You are here.",
    breath_count:  (n) => `${n} breaths`,
    back:          "← back",
    btn_start:     "START",
    btn_next:      "continue →",
    breath_inhale: "inhale",
    breath_hold:   "hold",
    breath_exhale: "exhale",
    breath_rest:   "rest",
    breath_voice_inhale: "Inhale",
    breath_voice_hold:   "Hold",
    breath_voice_exhale: "Exhale",
    breath_voice_rest:   "Rest",
    breath_choose: "CHOOSE MODE",
    breath_calming:"DAILY CALM",
    breath_change: "← change mode",
    breath_mode_standart:    "Standard",
    breath_mode_diyafram:    "Diaphragm",
    breath_mode_akciger:     "Lung",
    breath_mode_478:         "4-7-8",
    breath_mode_kutu:        "Box",
    breath_mode_sakinletici: "Calming",
    breath_desc_standart:    "Basic breathing rhythm. Focus on inhale and exhale, slow the mind.",
    breath_desc_diyafram:    "Breathe by expanding your belly, not your chest. Brings deep relaxation.",
    breath_desc_akciger:     "Fill your lungs to full capacity. Chest expands, energy increases.",
    breath_desc_478:         "Inhale 4s, hold 7s, exhale 8s. Calms the nervous system, prepares for sleep.",
    breath_desc_kutu:        "Equal timing: inhale, hold, exhale, hold. Builds focus and mental clarity.",
    breath_desc_sakinletici: "Long exhale activates parasympathetic system. Reduces stress and anxiety.",

    // Sound Waves
    nav_sound:         "Sound",
    sound_title:       "Sound Waves",
    sound_subtitle:    "Frequency Tuning",
    sound_intro:       "Align with frequencies accompanied by bird sounds. Each sound wave creates a different vibration in your body and energy field.",
    sound_tap_to_play: "tap to play",
    sound_playing:     "playing",
    sound_stop:        "stop",
    sound_effects:     "Effects",
    sound_btn_next:    "Continue to Next Step →",

    // Çakra
    chakra_subtitle:   "REIKI · TODAY'S CHAKRA",
    chakra_name_suf:   "CHAKRA",
    chakra_stay:       "Stay in this center today.",
    btn_therapy:       "✦ 22 Chakra Therapy →",
    btn_reminders:     "daily reminders →",

    // Terapi
    reiki_label:       "REIKI",
    therapy_title:     "22 Chakra Ascension",
    core_badge:        "CORE",
    selected_label:    "SELECTED",
    btn_start_therapy: "START THERAPY",
    reiki_chakra_label:"REIKI · CHAKRA THERAPY",
    chakra_suf:        "Chakra",
    intro_place_hand:  (name) => `Place your hand on your ${name.toLowerCase()} area.`,
    intro_close_eyes:  "Close your eyes.",
    close_eyes_hint:   "You can close your eyes now if you wish.",
    close_eyes_chakra: {
      "Root":            "Close your eyes. Feel the ground beneath your feet. Remember — you are safe.",
      "Sacral":          "Close your eyes. Let your emotions flow. Even if you can't name them, feel them with your heart.",
      "Solar Plexus":    "Close your eyes. Feel the warmth in your core. Remember your power.",
      "Heart":           "Close your eyes. Feel the expansion in your chest. Remember love — it was always there.",
      "Throat":          "Close your eyes. Think of what you haven't been able to say. Feel it with your heart — it's waiting to be released.",
      "Third Eye":       "Close your eyes. Focus on the center of your forehead. Listen to whatever your inner voice says.",
      "Crown":           "Close your eyes. Try to remember your highest intentions. Even if you can't, feel them with your heart.",
      "Soul Star":       "Close your eyes. Think about your repeating patterns. Which one are you ready to release?",
      "Stargate":        "Close your eyes. Try to feel the light beyond your body.",
      "Solar Chakra":    "Close your eyes. Remember the determination and courage within you. That power was always yours.",
      "Lunar Chakra":    "Close your eyes. Feel the softness and intuition within you. Trust it.",
      "Christ Chakra":   "Close your eyes. Remember that you are loved unconditionally. You don't need to earn it.",
      "Star Comm":       "Close your eyes. Feel that you are not alone. The universe is speaking to you — listen.",
      "Divine Plan":     "Close your eyes. Let go of control. Try trusting the flow of life.",
      "Monadic Link":    "Close your eyes. Try to remember where your soul came from. Even if you can't, feel it.",
      "Ascension":       "Close your eyes. Notice the lightness in your body. Allow yourself to rise.",
      "Universal Light": "Close your eyes. Try to remember the things you already know but have forgotten.",
      "Divine Intent":   "Close your eyes. Try to remember your soul's purpose. Even if you can't, feel it with your heart.",
      "Cosmic Energy":   "Close your eyes. Feel beyond your limits. You are bigger than you think.",
      "Being":           "Close your eyes. Stop thinking. Just exist. That is enough.",
      "Divine Structure":"Close your eyes. Remember that everything has an order. You are part of that order.",
      "Source":          "Close your eyes. Return to the source. That is your home. Remember.",
    },
    connected_label:   "● CONNECTION ESTABLISHED",
    connected_voice:   () => "Connected",
    sure_title:        "Are you sure?",
    sure_body:         "This moment is a gift to yourself.\nStay a little longer.",
    btn_exit:          "exit",
    btn_continue2:     "continue →",
    pct_loaded:        (n) => `${n}% LOADED`,
    progress_p1:       "You feel your hand...",
    progress_p2:       (name) => `${name} light is spreading...`,
    progress_p3:       "Energy is flowing, let it come...",
    progress_p4:       "Almost full. Feel it.",
    progress_p5:       (name) => `Your ${name} chakra is filling. 💫`,
    chakra_facts: {
      "Root": [
        "The Root chakra resonates at 396 Hz and helps dissolve fear patterns. It is connected to the adrenal glands and adrenaline production.",
        "Its Sanskrit name 'Muladhara' means 'root support'. It is associated with the Earth element and governs our sense of safety and stability.",
        "When balanced, it provides security, stability and material abundance. When imbalanced, anxiety and insecurity arise."
      ],
      "Sacral": [
        "The Sacral chakra is the center of creativity and emotional flow. Associated with the Water element — it teaches us to be flexible and fluid like water.",
        "Its Sanskrit name 'Svadhisthana' means 'dwelling place of the self'. It is directly connected to the reproductive organs and kidneys.",
        "It works at 417 Hz. When balanced, it enables healthy pleasure, relationships and emotional resilience."
      ],
      "Solar Plexus": [
        "The Solar Plexus is the center of personal power and will. Associated with the Fire element — it ignites your inner fire and strengthens confidence.",
        "Its Sanskrit name 'Manipura' means 'city of jewels'. It is connected to the pancreas and digestive system.",
        "It resonates at 528 Hz — known as the transformation and miracle frequency, associated with DNA repair."
      ],
      "Heart": [
        "The Heart chakra serves as a bridge between lower and upper chakras. Associated with the Air element — it radiates love in every direction.",
        "Its Sanskrit name 'Anahata' means 'unstruck sound'. It is connected to the thymus gland and affects the immune system.",
        "It works at 639 Hz. This frequency heals relationships and strengthens connection and harmony."
      ],
      "Throat": [
        "The Throat chakra is the center of expression and truth. Associated with the Sound element — your voice is not just physical but an energetic vibration.",
        "Its Sanskrit name 'Vishuddha' means 'purification'. It is connected to the thyroid gland and affects metabolism.",
        "It works at 741 Hz. This frequency enables intuitive awakening and freedom of expression."
      ],
      "Third Eye": [
        "The Third Eye is the center of intuition and clairvoyance. Associated with the Light element — it opens inner vision and awareness.",
        "Its Sanskrit name 'Ajna' means 'command' or 'perception'. It is connected to the pineal gland and affects melatonin production.",
        "It works at 852 Hz. It supports return to spiritual order and strengthens the inner voice."
      ],
      "Crown": [
        "The Crown chakra is the center of divine connection and cosmic consciousness. Associated with the Universe element — it is the gateway to pure awareness.",
        "Its Sanskrit name 'Sahasrara' means 'thousand-petaled lotus'. It is connected to the pituitary gland and governs the entire hormonal system.",
        "It works at 963 Hz. Known as the 'God frequency', it activates unity consciousness."
      ],
      "Soul Star": [
        "The 8th chakra, Soul Star, is located about 15 cm above the head. It is where karmic records and soul contracts are held.",
        "When this chakra is activated, access to past life memories and spiritual lessons opens up.",
        "The Soul Star is the gateway from individual self to universal self. Here, the ego begins to dissolve."
      ],
      "Stargate": [
        "The 9th chakra is the center where connection with the light body is established. It activates the energy field beyond the physical body.",
        "Merkaba — light body geometry — is shaped through this chakra. Astral travel is associated with this center.",
        "When the Stargate opens, interdimensional awareness develops and connection with spiritual guides strengthens."
      ],
      "Solar Chakra": [
        "The 10th chakra is the center where divine masculine energy integrates. It represents the Sun's creative, protective and guiding power.",
        "When balanced, leadership, determination and protective power are expressed in healthy ways.",
        "Masculine energy belongs to everyone — it is the power of action, logic and structure within every person."
      ],
      "Lunar Chakra": [
        "The 11th chakra is the center where divine feminine energy integrates. It represents the Moon's receptive, intuitive and nurturing power.",
        "When balanced, empathy, intuition and compassion flow naturally.",
        "Feminine energy belongs to everyone — it is the power of receptivity, intuition and creation within every person."
      ],
      "Christ Chakra": [
        "The 12th chakra is the center of unconditional love and unity consciousness. It is the point where all illusion of separation dissolves.",
        "This chakra is also known as Christ consciousness or Buddha consciousness — not religious, but a universal state of awakening.",
        "When activated, one experiences a deep compassion and sense of unity towards all beings."
      ],
      "Star Comm": [
        "The 13th chakra is the center where communication with galactic beings and higher dimensional guides is established.",
        "Cosmic knowledge transfer occurs through this chakra. Channeling and telepathy are associated with this center.",
        "When activated, access to universal wisdom opens and one begins to sense their cosmic family."
      ],
      "Divine Plan": [
        "The 14th chakra is the center of universal surrender and alignment with the divine plan.",
        "When this chakra is activated, the art of 'letting go' is learned — trust, not control, takes priority.",
        "The Divine Plan chakra strengthens the capacity to surrender to life's flow and find meaning in every experience."
      ],
      "Monadic Link": [
        "The 15th chakra is the center where connection with the Monad — the soul's highest source — is established.",
        "The Monad is the 'oversoul' that holds the experiences of thousands of incarnations. This chakra provides access to that wisdom.",
        "When activated, one gains a perspective of existence beyond a single lifetime."
      ],
      "Ascension": [
        "The 16th chakra is the center where ascension — the transition from physical density to light frequency — begins.",
        "Ascension is not leaving the body, but transformation of the body along with expansion of consciousness.",
        "When activated, cellular memory is cleared and the body begins to adapt to higher frequencies."
      ],
      "Universal Light": [
        "The 17th chakra is the center where universal knowledge — the Akashic records — is accessed.",
        "The Akashic records are the universal memory holding all experiences of all souls.",
        "When activated, one begins to intuitively grasp the operating laws of the universe."
      ],
      "Divine Intent": [
        "The 18th chakra is the center where the soul's highest purpose — divine intent — manifests.",
        "Every soul chooses certain lessons and missions before incarnating. This chakra reminds us of that contract.",
        "When activated, one clarifies their life purpose and aligns every action with this purpose."
      ],
      "Cosmic Energy": [
        "The 19th chakra is the center of galactic expansion and integration with cosmic energy.",
        "At this level, the individual transcends Earth consciousness and gains a galactic perspective.",
        "The Cosmic Energy chakra enables attunement with all energy networks in the universe."
      ],
      "Being": [
        "The 20th chakra is the center where pure existence — 'the one that exists' beyond 'I am' — is experienced.",
        "At this level, thought, emotion and identity dissolve; only pure awareness remains.",
        "The Being chakra enables the experience of essence beyond all labels and definitions."
      ],
      "Divine Structure": [
        "The 21st chakra is the center where universal laws — karma, resonance, vibration, attraction — integrate.",
        "At this level, one intuitively grasps the mathematical and geometric order of the universe.",
        "The Divine Structure chakra enables complete harmony with sacred geometry and universal order."
      ],
      "Source": [
        "The 22nd chakra is the highest center where complete union with the divine source occurs. Associated with Platinum Light.",
        "At this level, individual consciousness completely merges with universal consciousness. The illusion of separation ends.",
        "The Source chakra is the ultimate point where the entire chakra system is crowned and the cycle is completed."
      ],
    },
    done_title:        "Complete.",
    done_body:         (name) => `Your ${name} chakra is active.\nCarry this energy throughout the day.`,
    other_chakra:      "other chakra",
    main_screen:       "main screen",

    // Hatırlatıcılar
    day_label:         "TODAY",
    reminders_title:   "Did you do these today?",
    all_done_msg:      "Today you connected with yourself.",
    btn_reminders_next:"Continue →",
    terapi_duration:   "60-second connection",
    btn_done_next:     "Done → Next Step",
    step_label:        (cur, total) => `${cur}/${total} steps`,

    // Akşam
    evening_label:     "Evening Close",
    evening_subtitle:  "Leave today behind.\nReturn to yourself.",
    evening_ritual:    "3-step evening ritual",
    evening_step1:     "Let go",
    evening_step1_desc:"Release everything that weighed on you today.",
    evening_step2:     "Be grateful",
    evening_step2_desc:"Remember 3 things that felt good and thank your heart.",
    evening_step3:     "Surrender",
    evening_step3_desc:"Release control, surrender to peace. Stay with your breath.",
    evening_quote:     "Today is done.\nYou are here, that is enough.",
    learned_q:         "What did today teach you?",
    gratitude_q:       "What are you grateful for?",
    btn_see_week:      "See my week →",

    // Harita
    weekly_label:      "WEEKLY",
    inner_map:         "Inner Map",
    day_pct:           "DAY",
    stat_chakra:       "Most Active Chakra",
    stat_breath:       "Breath Count",
    stat_word:         "Intention Word",
    stat_mindful:      "Mindful Moment",
    orchestra_label:   "ORCHESTRA MODE",
    orchestra_text:    (n) => `Today ${n} people breathed with you.`,
    ai_report_label:   "WEEKLY AI REPORT",
    free_used:         "You've used your free report",
    free_used_body:    "To receive a deep inner report every week",
    premium_name:      "Sakin Premium",
    premium_suffix:    ", go premium.",
    premium_label:     "PREMIUM",
    premium_feat1:     "✦ Unlimited weekly AI reports",
    premium_feat2:     "✦ Deep astrology & numerology analysis",
    premium_feat3:     "✦ Personal growth tracking",
    btn_go_premium:    "Go Premium →",
    report_invite:     "Let your intentions, gratitudes and learnings\nbecome a weekly AI report.",
    btn_gen_report:    "✦ Generate Report",
    generating:        "GENERATING REPORT...",
    copy_label:        "COPY",
    copied_label:      "✓ COPIED",
    share_label:       "SHARE",
    share_title:       "My Weekly Inner Report",
    refresh_label:     "REFRESH",
    btn_new_day:       "start a new day",

    // AI Consent
    ai_consent_title:  "AI-Powered Feature",
    ai_consent_body:   "This feature sends your text to an AI service (Meta Llama / Groq) to generate a personalized response. Your text is processed anonymously and is not linked to your identity.",
    ai_consent_data:   "Sent: your text. Not sent: your name, location, device info.",
    ai_consent_accept: "Accept",
    ai_consent_decline:"Cancel",
    ai_offline:        "This feature requires an internet connection. Please check your connection.",

    // Rehber
    guide_sup:         "✦ MYSTICAL GUIDE ✦",
    guide_title:       "Healing Search",
    guide_sub:         "☽ read your body's message ☽",
    mirror_title:      "Inner Mirror",
    mirror_icon:       "☽",
    mirror_desc:       "read your body's message",
    mirror_ph:         "e.g. headache, fatigue, can't sleep...",
    feeling_ph:        "How do you feel? Where and when did it start?",
    btn_search:        "✦ SEARCH MEANING",
    btn_new_search:    "✦ NEW SEARCH",
    reading:           "READING IN PROGRESS...",
    analysis_suf:      "· ANALYSIS",

    // Fiyatlandırma
    pricing_title:     "Pricing",
    pricing_sub:       "SAKIN · TRANSPARENT PRICING",
    paid_app_badge:    "ONE-TIME",
    paid_app_plan:     "Sakin — All Features",
    paid_app_price:    "$9.99",
    paid_app_price_sub:"Pay once, yours forever. No subscription.",
    paid_app_features: ["Morning intention and motivation words","7 different breathing techniques","10 solfeggio frequencies (Sound Waves)","22 Chakra Therapy — deep energy work","Inner Mirror — AI-powered personal analysis","Weekly AI inner report","Daily reminders (10+)","Evening closing ritual","Weekly inner map and statistics","Numerology & astrology details","Reiki guide and symptom map","Lifetime access — updates included"],
    pricing_footer:    "Purchased securely via our payment provider. For questions:",
    lemon_checkout_url:"https://sakin.lemonsqueezy.com/checkout/buy/0fbd6f22-0ad0-4078-93b7-3f873912e1e2",

    // Terms of Service
    terms_title:       "Terms of Service",
    terms_updated:     "LAST UPDATED: MARCH 2026",
    terms_s1:          "1. ACCEPTANCE",
    terms_s1p:         'By using the Sakin application ("App"), you agree to these Terms of Service ("Terms"). If you do not accept these Terms, do not use the App.',
    terms_s2:          "2. SERVICE DESCRIPTION",
    terms_s2p:         "Sakin is a mobile web application offering daily mindfulness routines, breathing exercises, chakra guidance, personal development programs and spiritual wellness content. The App does not provide any medical, psychological or therapeutic service.",
    terms_s3:          "3. TERMS OF USE",
    terms_s3p:         "By using the App, you agree to the following:",
    terms_s3l:         ["The App may only be used for personal, non-commercial purposes","App content may not be copied, distributed or reverse engineered","Actions that abuse, harm or overload the system are prohibited","Use for illegal purposes is strictly prohibited"],
    terms_s4:          "4. PAID APPLICATION",
    terms_s4p:         "Sakin is a paid application purchased as a one-time payment through the App Store. After purchase, all features are available without limits. There are no additional in-app purchases. Refund requests are handled under Apple's refund policy.",
    terms_s5:          "5. INTELLECTUAL PROPERTY",
    terms_s5p:         "All text, design, graphics, animations and software in the App belong to Sakin and are protected by copyright and intellectual property laws. Users are granted only a limited, non-transferable personal use license.",
    terms_s6:          "6. DISCLAIMER",
    terms_s6p:         "Sakin is a wellness application; it does not provide medical advice, diagnosis or treatment. App content is provided solely for informational and personal awareness purposes. Always consult a qualified physician for any health concerns.",
    terms_s7:          "7. SERVICE CHANGES",
    terms_s7p:         "Sakin reserves the right to change the content, features or pricing of the service without prior notice. Important changes will be announced within the app.",
    terms_s8:          "8. GOVERNING LAW",
    terms_s8p:         "These Terms are interpreted and applied under the laws of the Republic of Turkey. Turkish courts have jurisdiction in case of disputes.",
    terms_s9:          "9. CONTACT",
    terms_s9p:         "For questions about the Terms of Service:",

    // Privacy
    privacy_title:     "Privacy Policy",
    privacy_updated:   "LAST UPDATED: MARCH 2026",
    privacy_s1:        "1. OVERVIEW",
    privacy_s1p:       "The Sakin application aims to support users' personal development and daily mindfulness practices. We take your privacy seriously.",
    privacy_s2:        "2. DATA COLLECTED",
    privacy_s2p:       "The following data is stored only locally on your device and is not transmitted to any server:",
    privacy_s2l:       ["Daily intention text (the goal/intention you wrote for that day)","Selected motivation words (3 words chosen in the morning)","Evening closing notes and gratitude texts","Breathing exercise count and completion status","Reminder completion records","Date and time of birth (for astrology features, stays on device)","Weekly statistics (chakra, word and breath data)"],
    privacy_s3:        "3. DATA WE DO NOT COLLECT",
    privacy_s3p:       "The app strictly does not collect:",
    privacy_s3l:       ["Personal identity information (name, surname, email, phone)","Location data","Health or medical data","Biometric data","Camera or microphone access"],
    privacy_s4:        "4. AI REPORT FEATURE",
    privacy_s4p:       "When generating a weekly AI report, only anonymous and summarized data for that week (chakra selections, words, breath count) is sent to the Anthropic API. This data is not linked to your personal identity and is covered by Anthropic's privacy policy.",
    privacy_s5:        "5. NOTIFICATIONS",
    privacy_s5p:       "If you grant permission for daily reminder notifications, notifications are triggered only locally on your device. Notification content is not sent to any server. You can revoke permission at any time via iOS/Android Settings > Sakin.",
    privacy_s6:        "6. THIRD-PARTY SERVICES",
    privacy_s6p:       "The app currently does not include any third-party ad networks, analytics services or social media integrations. Only the Anthropic API is used for the AI report feature.",
    privacy_s7:        "7. DATA SECURITY",
    privacy_s7p:       "All your personal data is stored locally on your device. When you remove the app from your device, all local data is automatically deleted.",
    privacy_s8:        "8. CHILDREN'S PRIVACY",
    privacy_s8p:       "The app is intended for users aged 4 and above. We do not knowingly collect any data from children under 13.",
    privacy_s9:        "9. POLICY CHANGES",
    privacy_s9p:       "This privacy policy may be updated from time to time. Important changes will be noted in app update release notes.",
    privacy_s10:       "10. CONTACT",
    privacy_s10p:      "For questions about this privacy policy:",
    privacy_app_name:  "App Name: Sakin",

    // Refund
    refund_title:      "Refund Policy",
    refund_updated:    "LAST UPDATED: MARCH 2026",
    refund_s1:         "1. GENERAL RULE",
    refund_s1p:        "Premium content offered in Sakin is digital in nature. Since access to digital content is granted immediately upon purchase, refunds are generally not accepted.",
    refund_s1p2:       "However, we prioritize customer satisfaction. We will review your refund request within the conditions below.",
    refund_s2:         "2. REFUND CONDITIONS",
    refund_s2l:        [["Technical failure","If you could not access the purchased feature at all and our support team could not resolve the issue within 48 hours"],["Double payment","If you were charged twice for the same product in error"],["First 48 hours","If requested within 48 hours of purchase and the content was never accessed, a refund may be considered"]],
    refund_s3:         "3. NON-REFUNDABLE CASES",
    refund_s3l:        ["Content has been accessed or used","More than 48 hours have passed since purchase",'"Did not like it" or "did not meet expectations" (a free trial is available)',"Account suspension or violation of Terms of Service"],
    refund_s4:         "4. SUBSCRIPTION CANCELLATION",
    refund_s4p:        "For monthly or annual subscriptions (Unlimited Reports): your access continues until the current period ends. Cancellation must be made before the next billing period. No refund is issued for partial periods.",
    refund_s5:         "5. REFUND PROCESS",
    refund_s5p:        "To submit a refund request, contact us with the following information:",
    refund_s5l:        ["Purchase date and transaction number","Name of the purchased product","Reason for refund"],
    refund_s5p2:       "Email:",
    refund_s5p3:       "Your request will be answered within 5 business days. Approved refunds are processed within 5–10 business days depending on your payment method.",
    refund_s6:         "6. LEGAL RIGHTS",
    refund_s6p:        "This policy does not affect your legal rights under Turkish Distance Selling Regulations and Law No. 6502 on Consumer Protection.",
    refund_s7:         "7. CONTACT",
    refund_s7p:        "For refund and payment questions:",

    // Zodiac signs
    zodiac_Oglakar: "Capricorn", zodiac_Kova: "Aquarius", zodiac_Balik: "Pisces",
    zodiac_Koc: "Aries", zodiac_Boga: "Taurus", zodiac_Ikizler: "Gemini",
    zodiac_Yengec: "Cancer", zodiac_Aslan: "Leo", zodiac_Basak: "Virgo",
    zodiac_Terazi: "Libra", zodiac_Akrep: "Scorpio", zodiac_Yay: "Sagittarius",

    // Morning words
    morning_words: ["peace","flow","courage","patience","clarity","love","strength","balance","freedom","joy","gratitude","trust"],

    // Usage Guide
    guide_help_title: "Usage Guide",
    guide_help_sub: "SAKIN · GLOSSARY OF TERMS",
    guide_close: "close",
    guide_cat_numerology: "Numerology",
    guide_cat_astrology: "Astrology",
    guide_cat_chakra: "Chakras",
    guide_cat_biorhythm: "Biorhythm",
    guide_cat_reiki: "Reiki & Therapy",
    guide_cat_app: "App Concepts",

    // Mandala Map
    mandala_title: "Inner Journey",
    mandala_sub: "TODAY'S MAP",
    mandala_streak: "day streak",
    mandala_streak_best: "best streak",
    mandala_badge_3: "3 Days",
    mandala_badge_7: "1 Week",
    mandala_badge_21: "21 Days",
    mandala_badge_40: "40 Days",
    mandala_complete: "Today is complete!",
    mandala_step_birth: "Birth Profile",
    mandala_step_morning: "Morning Intention",
    mandala_step_breath: "Breath",
    mandala_step_chakra: "Chakra",
    mandala_step_day: "Daily Tasks",
    mandala_step_evening: "Evening Close",
    mandala_step_map: "Weekly Map",
    mandala_locked: "Complete previous step",
    mandala_start: "start →",
  },
};

export function makeTrans(lang) {
  const d = TRANS[lang] || TRANS.tr;
  return (key, ...args) => {
    const val = d[key];
    if (typeof val === "function") return val(...args);
    return val ?? key;
  };
}
