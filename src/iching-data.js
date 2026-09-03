// I CHING (64 heksagram, 7 dil): Bugün ekranındaki "Bir ogut al" kirmizi
// butonu icin. Kaynak: apps/mitler/src/data/iching*.json (Mitler embed'inin
// kendi I Ching veri seti), bu dosyaya BIRLESTIRILEREK kopyalandi (id/name/
// essence/advice, dil basina ayri dosya yerine tek obje). Host BAGIMSIZ
// calisir, Mitler embed'ine veya build'ine bagli degil. Mitler'de veri
// degisirse burasi elle senkron edilmeli (otomatik degil, kucuk ve durgun
// bir icerik seti oldugu icin bilincli tercih).
export const ICHING = [
{
"id": "ic_01",
"number": 1,
"emoji": "☰☰",
"name": {
"tr": "Qián: Yaratıcı",
"en": "Qián: The Creative",
"de": "Qián: Das Schöpferische",
"es": "Qián: Lo Creativo",
"fr": "Qián: Le Créateur",
"ja": "乾 (Qián) 、 創造",
"pt": "Qián: O Criativo"
},
"essence": {
"tr": "Saf yaratıcı enerji. Tanrının erkek yüzü. Hareketin başlangıcı.",
"en": "Pure creative energy. The masculine face of God. The beginning of motion.",
"de": "Reine schöpferische Energie. Das männliche Antlitz Gottes. Der Beginn der Bewegung.",
"es": "Energía creativa pura. El rostro masculino de Dios. El comienzo del movimiento.",
"fr": "Énergie créatrice pure. Le visage masculin de Dieu. Le début du mouvement.",
"ja": "純粋な創造のエネルギー。神の男性的な相。動きの始まり。",
"pt": "Energia criativa pura. A face masculina de Deus. O início do movimento."
},
"advice": {
"tr": "Cesaretle başla. Güçlü zaman: yaratım için.",
"en": "Begin with courage. Strong time: for creation.",
"de": "Beginne mit Mut. Starke Zeit: zum Erschaffen.",
"es": "Comienza con valor. Tiempo fuerte: para crear.",
"fr": "Commence avec courage. Temps fort: pour la création.",
"ja": "勇気をもって始めよう。力強い時 、 創造のために。",
"pt": "Comece com coragem. Tempo forte: para criar."
}
},
{
"id": "ic_02",
"number": 2,
"emoji": "☷☷",
"name": {
"tr": "Kūn: Alıcı",
"en": "Kūn: The Receptive",
"de": "Kūn: Das Empfangende",
"es": "Kūn: Lo Receptivo",
"fr": "Kūn: Le Réceptif",
"ja": "坤 (Kūn) 、 受容",
"pt": "Kūn: O Receptivo"
},
"essence": {
"tr": "Saf alıcı, besleyici, teslim olan dişil prensip.",
"en": "The pure receiving, nurturing, surrendering feminine principle.",
"de": "Das reine empfangende, nährende, sich hingebende weibliche Prinzip.",
"es": "El principio femenino puro que recibe, nutre y se entrega.",
"fr": "Le pur principe féminin qui reçoit, nourrit et s'abandonne.",
"ja": "純粋に受け入れ、育み、明け渡す女性原理。",
"pt": "O princípio feminino puro que recebe, nutre e se entrega."
},
"advice": {
"tr": "Şimdi yapma: al. Teslim olmak güçtür.",
"en": "Don't act now: receive. To surrender is strength.",
"de": "Handle jetzt nicht: empfange. Sich hinzugeben ist Stärke.",
"es": "No actúes ahora: recibe. Entregarse es fortaleza.",
"fr": "N'agis pas maintenant: reçois. S'abandonner est une force.",
"ja": "今は動かず 、 受け取ろう。明け渡すことは力。",
"pt": "Não aja agora: receba. Entregar-se é força."
}
},
{
"id": "ic_03",
"number": 3,
"emoji": "☵☳",
"name": {
"tr": "Zhūn: Başlangıç Zorlukları",
"en": "Zhūn: Difficulty at the Beginning",
"de": "Zhūn: Anfangsschwierigkeit",
"es": "Zhūn: La Dificultad Inicial",
"fr": "Zhūn: La Difficulté Initiale",
"ja": "屯 (Zhūn) 、 産みの苦しみ",
"pt": "Zhūn: A Dificuldade Inicial"
},
"essence": {
"tr": "Yeni doğmuş bir şey: büyümek için sabır gerek.",
"en": "Something newly born: patience needed to grow.",
"de": "Etwas neu Geborenes: Geduld ist nötig, um zu wachsen.",
"es": "Algo recién nacido: se necesita paciencia para crecer.",
"fr": "Quelque chose de nouveau-né: la patience est nécessaire pour grandir.",
"ja": "生まれたばかりのもの 、 育つには忍耐が要る。",
"pt": "Algo recém-nascido: é preciso paciência para crescer."
},
"advice": {
"tr": "Tek başına başarma: yardım iste.",
"en": "Don't succeed alone: ask for help.",
"de": "Schaffe es nicht allein: bitte um Hilfe.",
"es": "No triunfes solo: pide ayuda.",
"fr": "Ne réussis pas seul: demande de l'aide.",
"ja": "ひとりで成し遂げようとせず 、 助けを求めよう。",
"pt": "Não vença sozinho: peça ajuda."
}
},
{
"id": "ic_04",
"number": 4,
"emoji": "☶☵",
"name": {
"tr": "Méng: Gençlik Aptallığı",
"en": "Méng: Youthful Folly",
"de": "Méng: Jugendtorheit",
"es": "Méng: La Necedad Juvenil",
"fr": "Méng: La Folie Juvénile",
"ja": "蒙 (Méng) 、 若さの愚かさ",
"pt": "Méng: A Insensatez Juvenil"
},
"essence": {
"tr": "Genç bilgisizlik: bilge tarafından eğitilmeyi bekleyen.",
"en": "Young ignorance: waiting to be educated by the wise.",
"de": "Junge Unwissenheit: wartet darauf, von den Weisen unterrichtet zu werden.",
"es": "Ignorancia juvenil: esperando ser educada por los sabios.",
"fr": "Ignorance juvénile: attendant d'être instruite par les sages.",
"ja": "若い無知 、 賢者に教えられるのを待っている。",
"pt": "Ignorância jovem: esperando ser educada pelos sábios."
},
"advice": {
"tr": "Bilmediğini kabul et: bu öğrenmenin başı.",
"en": "Accept what you don't know: that is the beginning of learning.",
"de": "Nimm an, was du nicht weißt, das ist der Beginn des Lernens.",
"es": "Acepta lo que no sabes, ese es el comienzo del aprendizaje.",
"fr": "Accepte ce que tu ne sais pas, c'est le début de l'apprentissage.",
"ja": "知らないことを認めよう 、 それが学びの始まり。",
"pt": "Aceite o que não sabe, esse é o começo do aprendizado."
}
},
{
"id": "ic_05",
"number": 5,
"emoji": "☵☰",
"name": {
"tr": "Xū: Bekleme",
"en": "Xū: Waiting",
"de": "Xū: Das Warten",
"es": "Xū: La Espera",
"fr": "Xū: L'Attente",
"ja": "需 (Xū) 、 待つこと",
"pt": "Xū: A Espera"
},
"essence": {
"tr": "Sabırlı bekleme: doğru anı bilmek.",
"en": "Patient waiting: knowing the right moment.",
"de": "Geduldiges Warten: den rechten Augenblick kennen.",
"es": "Espera paciente: conocer el momento adecuado.",
"fr": "Attente patiente: connaître le bon moment.",
"ja": "忍耐強く待つこと 、 正しい瞬間を知ること。",
"pt": "Espera paciente: conhecer o momento certo."
},
"advice": {
"tr": "Acele etme. Doğru zaman gelecek.",
"en": "Don't hurry. The right time will come.",
"de": "Hab keine Eile. Die rechte Zeit wird kommen.",
"es": "No te apresures. El momento adecuado llegará.",
"fr": "Ne te presse pas. Le bon moment viendra.",
"ja": "急がないこと。正しい時は来る。",
"pt": "Não tenha pressa. O momento certo virá."
}
},
{
"id": "ic_06",
"number": 6,
"emoji": "☰☵",
"name": {
"tr": "Sòng: Çatışma",
"en": "Sòng: Conflict",
"de": "Sòng: Der Streit",
"es": "Sòng: El Conflicto",
"fr": "Sòng: Le Conflit",
"ja": "訟 (Sòng) 、 争い",
"pt": "Sòng: O Conflito"
},
"essence": {
"tr": "Bir çatışma var: yarısı haklı olsa da geri çekilmek bilgelik.",
"en": "There is a conflict: even if half right, withdrawal is wisdom.",
"de": "Es gibt einen Konflikt: selbst wenn man halb recht hat, ist Rückzug Weisheit.",
"es": "Hay un conflicto: aunque tengas algo de razón, la retirada es sabiduría.",
"fr": "Il y a un conflit, même si l'on a à moitié raison, le retrait est sagesse.",
"ja": "争いがある 、 半ば正しくとも、退くのが知恵。",
"pt": "Há um conflito: mesmo com alguma razão, recuar é sabedoria."
},
"advice": {
"tr": "Tartışmadan kaçın bugün. Geri çekil.",
"en": "Avoid argument today. Withdraw.",
"de": "Meide heute den Streit. Ziehe dich zurück.",
"es": "Evita la discusión hoy. Retírate.",
"fr": "Évite la dispute aujourd'hui. Retire-toi.",
"ja": "今日は口論を避けよう。退くこと。",
"pt": "Evite a discussão hoje. Recue."
}
},
{
"id": "ic_07",
"number": 7,
"emoji": "☷☵",
"name": {
"tr": "Shī: Ordu",
"en": "Shī: The Army",
"de": "Shī: Das Heer",
"es": "Shī: El Ejército",
"fr": "Shī: L'Armée",
"ja": "師 (Shī) 、 軍",
"pt": "Shī: O Exército"
},
"essence": {
"tr": "Topluluğun disiplinli organizasyonu.",
"en": "Disciplined organisation of the community.",
"de": "Disziplinierte Organisation der Gemeinschaft.",
"es": "Organización disciplinada de la comunidad.",
"fr": "Organisation disciplinée de la communauté.",
"ja": "共同体の規律ある組織化。",
"pt": "Organização disciplinada da comunidade."
},
"advice": {
"tr": "Bir grup içinde rolünü netleştir.",
"en": "Clarify your role inside a group.",
"de": "Kläre deine Rolle innerhalb einer Gruppe.",
"es": "Aclara tu rol dentro de un grupo.",
"fr": "Clarifie ton rôle au sein d'un groupe.",
"ja": "集団の中での自分の役割を明らかにしよう。",
"pt": "Esclareça seu papel dentro de um grupo."
}
},
{
"id": "ic_08",
"number": 8,
"emoji": "☵☷",
"name": {
"tr": "Bǐ: Birlik",
"en": "Bǐ: Holding Together",
"de": "Bǐ: Das Zusammenhalten",
"es": "Bǐ: La Solidaridad",
"fr": "Bǐ: La Solidarité",
"ja": "比 (Bǐ) 、 親しみ",
"pt": "Bǐ: A Solidariedade"
},
"essence": {
"tr": "Sahici birleşmenin zamanı: köklerin buluşması.",
"en": "Time of genuine union: meeting of roots.",
"de": "Zeit echter Vereinigung: Begegnung der Wurzeln.",
"es": "Tiempo de unión genuina: encuentro de raíces.",
"fr": "Temps d'union véritable: rencontre des racines.",
"ja": "真の結びつきの時 、 根の出会い。",
"pt": "Tempo de união genuína: encontro de raízes."
},
"advice": {
"tr": "Bir bağa derinleş: birleşmek değil derinleşmek.",
"en": "Deepen a bond: not uniting but deepening.",
"de": "Vertiefe eine Verbindung: nicht vereinen, sondern vertiefen.",
"es": "Profundiza un vínculo: no unir sino profundizar.",
"fr": "Approfondis un lien: non pas unir mais approfondir.",
"ja": "絆を深めよう 、 結ぶのではなく深める。",
"pt": "Aprofunde um vínculo: não unir, mas aprofundar."
}
},
{
"id": "ic_09",
"number": 9,
"emoji": "☴☰",
"name": {
"tr": "Xiǎo Xù: Küçük Tutuş",
"en": "Xiǎo Xù: The Taming Power of the Small",
"de": "Xiǎo Xù: Die zähmende Kraft des Kleinen",
"es": "Xiǎo Xù: La Fuerza Domesticadora de lo Pequeño",
"fr": "Xiǎo Xù: Le Pouvoir d'Apprivoisement du Petit",
"ja": "小畜 (Xiǎo Xù) 、 小さきものの蓄えの力",
"pt": "Xiǎo Xù: A Força Domadora do Pequeno"
},
"essence": {
"tr": "Küçük adımlarla biriktirmek.",
"en": "Accumulating with small steps.",
"de": "Mit kleinen Schritten ansammeln.",
"es": "Acumular con pequeños pasos.",
"fr": "Accumuler à petits pas.",
"ja": "小さな一歩で蓄えること。",
"pt": "Acumular com pequenos passos."
},
"advice": {
"tr": "Sabır: küçük etki büyük sonuç doğurur.",
"en": "Patience: small effect leads to great result.",
"de": "Geduld: kleine Wirkung führt zu großem Ergebnis.",
"es": "Paciencia: un efecto pequeño lleva a un gran resultado.",
"fr": "Patience: un petit effet mène à un grand résultat.",
"ja": "忍耐を 、 小さな効果が大きな結果につながる。",
"pt": "Paciência: um pequeno efeito leva a um grande resultado."
}
},
{
"id": "ic_10",
"number": 10,
"emoji": "☰☱",
"name": {
"tr": "Lǚ: Adım",
"en": "Lǚ: Treading",
"de": "Lǚ: Das Auftreten",
"es": "Lǚ: El Porte",
"fr": "Lǚ: La Marche",
"ja": "履 (Lǚ) 、 踏み行く",
"pt": "Lǚ: O Porte"
},
"essence": {
"tr": "Tehlikeli alanda dikkatli yürümek.",
"en": "Walking carefully in a dangerous area.",
"de": "Vorsichtiges Gehen in gefährlichem Gebiet.",
"es": "Caminar con cuidado en una zona peligrosa.",
"fr": "Marcher prudemment dans une zone dangereuse.",
"ja": "危険な場所を慎重に歩むこと。",
"pt": "Caminhar com cuidado numa área perigosa."
},
"advice": {
"tr": "Dikkatlı ol: bir yanlış adımdan zarar gelebilir.",
"en": "Be careful: one wrong step can cause harm.",
"de": "Sei vorsichtig: ein falscher Schritt kann Schaden anrichten.",
"es": "Ten cuidado: un paso en falso puede causar daño.",
"fr": "Sois prudent: un faux pas peut causer du tort.",
"ja": "気をつけよう 、 一歩の誤りが害を招く。",
"pt": "Tenha cuidado: um passo em falso pode causar dano."
}
},
{
"id": "ic_11",
"number": 11,
"emoji": "☷☰",
"name": {
"tr": "Tài: Barış",
"en": "Tài: Peace",
"de": "Tài: Der Friede",
"es": "Tài: La Paz",
"fr": "Tài: La Paix",
"ja": "泰 (Tài) 、 平和",
"pt": "Tài: A Paz"
},
"essence": {
"tr": "Gök ve yer hizalandı: uyum hâli.",
"en": "Heaven and earth are aligned, state of harmony.",
"de": "Himmel und Erde sind ausgerichtet, Zustand der Harmonie.",
"es": "El cielo y la tierra están alineados, estado de armonía.",
"fr": "Le ciel et la terre sont alignés, état d'harmonie.",
"ja": "天と地が整う 、 調和の状態。",
"pt": "Céu e terra estão alinhados, estado de harmonia."
},
"advice": {
"tr": "Bu uyumu hak et. Bilinçle yaşa.",
"en": "Earn this harmony. Live consciously.",
"de": "Verdiene diese Harmonie. Lebe bewusst.",
"es": "Gánate esta armonía. Vive con conciencia.",
"fr": "Mérite cette harmonie. Vis consciemment.",
"ja": "この調和を得よう。意識して生きよう。",
"pt": "Conquiste essa harmonia. Viva com consciência."
}
},
{
"id": "ic_12",
"number": 12,
"emoji": "☰☷",
"name": {
"tr": "Pǐ: Durgunluk",
"en": "Pǐ: Standstill",
"de": "Pǐ: Der Stillstand",
"es": "Pǐ: El Estancamiento",
"fr": "Pǐ: La Stagnation",
"ja": "否 (Pǐ) 、 停滞",
"pt": "Pǐ: A Estagnação"
},
"essence": {
"tr": "Kanallar tıkalı: şimdi geri çekilme zamanı.",
"en": "Channels closed: now is the time to withdraw.",
"de": "Die Kanäle sind geschlossen: jetzt ist die Zeit, sich zurückzuziehen.",
"es": "Los canales cerrados: ahora es momento de retirarse.",
"fr": "Les canaux fermés: c'est maintenant le moment de se retirer.",
"ja": "通路が閉じている 、 今は退く時。",
"pt": "Os canais fechados: agora é hora de recuar."
},
"advice": {
"tr": "Zorlama. Akış kapalı.",
"en": "Don't push. Flow is closed.",
"de": "Dränge nicht. Der Fluss ist geschlossen.",
"es": "No fuerces. El flujo está cerrado.",
"fr": "Ne force pas. Le flux est fermé.",
"ja": "押さないこと。流れは閉じている。",
"pt": "Não force. O fluxo está fechado."
}
},
{
"id": "ic_13",
"number": 13,
"emoji": "☰☲",
"name": {
"tr": "Tóng Rén: Topluluk",
"en": "Tóng Rén: Fellowship",
"de": "Tóng Rén: Gemeinschaft mit Menschen",
"es": "Tóng Rén: Comunidad con los Hombres",
"fr": "Tóng Rén: La Communauté avec les Hommes",
"ja": "同人 (Tóng Rén) 、 仲間",
"pt": "Tóng Rén: A Comunhão com os Homens"
},
"essence": {
"tr": "Ortak amaçla bir araya gelmek.",
"en": "Coming together for common purpose.",
"de": "Zusammenkommen für ein gemeinsames Ziel.",
"es": "Reunirse por un propósito común.",
"fr": "Se rassembler pour un but commun.",
"ja": "共通の目的のために集うこと。",
"pt": "Reunir-se por um propósito comum."
},
"advice": {
"tr": "Bir topluluğa katıl: anlam orada.",
"en": "Join a community: meaning is there.",
"de": "Schließe dich einer Gemeinschaft an, dort ist Sinn.",
"es": "Únete a una comunidad: ahí está el sentido.",
"fr": "Rejoins une communauté: le sens est là.",
"ja": "共同体に加わろう 、 そこに意味がある。",
"pt": "Junte-se a uma comunidade: o sentido está ali."
}
},
{
"id": "ic_14",
"number": 14,
"emoji": "☲☰",
"name": {
"tr": "Dà Yǒu: Büyük Sahiplik",
"en": "Dà Yǒu: Possession in Great Measure",
"de": "Dà Yǒu: Der Besitz von Großem",
"es": "Dà Yǒu: La Posesión de lo Grande",
"fr": "Dà Yǒu: La Grande Possession",
"ja": "大有 (Dà Yǒu) 、 大いなる所有",
"pt": "Dà Yǒu: A Posse de Grandes Coisas"
},
"essence": {
"tr": "Çok şeye sahip olmak: alçakgönüllülükle taşı.",
"en": "To have much: carry with humility.",
"de": "Viel zu besitzen: trage es mit Demut.",
"es": "Tener mucho: llévalo con humildad.",
"fr": "Avoir beaucoup: porte-le avec humilité.",
"ja": "多くを持つこと 、 謙虚に担おう。",
"pt": "Ter muito: carregue com humildade."
},
"advice": {
"tr": "Bolluk var: kibirlenme.",
"en": "There is abundance: don't be arrogant.",
"de": "Es gibt Fülle: sei nicht überheblich.",
"es": "Hay abundancia: no seas arrogante.",
"fr": "Il y a de l'abondance: ne sois pas arrogant.",
"ja": "豊かさがある 、 傲慢になるな。",
"pt": "Há abundância: não seja arrogante."
}
},
{
"id": "ic_15",
"number": 15,
"emoji": "☷☶",
"name": {
"tr": "Qiān: Tevazu",
"en": "Qiān: Modesty",
"de": "Qiān: Die Bescheidenheit",
"es": "Qiān: La Modestia",
"fr": "Qiān: La Modestie",
"ja": "謙 (Qiān) 、 謙虚",
"pt": "Qiān: A Modéstia"
},
"essence": {
"tr": "Dağı yerin altında tutan tevazu.",
"en": "The humility that holds the mountain beneath the earth.",
"de": "Die Demut, die den Berg unter der Erde hält.",
"es": "La humildad que sostiene la montaña bajo la tierra.",
"fr": "L'humilité qui tient la montagne sous la terre.",
"ja": "地の下に山を保つ謙虚さ。",
"pt": "A humildade que sustenta a montanha sob a terra."
},
"advice": {
"tr": "Bugün tevazu en büyük güç, kullan.",
"en": "Today humility is the greatest power, use it.",
"de": "Heute ist Demut die größte Kraft, nutze sie.",
"es": "Hoy la humildad es el mayor poder, úsala.",
"fr": "Aujourd'hui, l'humilité est le plus grand pouvoir, utilise-la.",
"ja": "今日は謙虚さが最大の力 、 それを用いよう。",
"pt": "Hoje a humildade é o maior poder, use-a."
}
},
{
"id": "ic_16",
"number": 16,
"emoji": "☳☷",
"name": {
"tr": "Yù: Coşku",
"en": "Yù: Enthusiasm",
"de": "Yù: Die Begeisterung",
"es": "Yù: El Entusiasmo",
"fr": "Yù: L'Enthousiasme",
"ja": "豫 (Yù) 、 熱意",
"pt": "Yù: O Entusiasmo"
},
"essence": {
"tr": "Yer üstünden yükselen ilahi enerji.",
"en": "Divine energy rising from above the earth.",
"de": "Göttliche Energie, die über der Erde aufsteigt.",
"es": "Energía divina que se alza sobre la tierra.",
"fr": "Énergie divine s'élevant au-dessus de la terre.",
"ja": "地の上に立ち上る神聖なエネルギー。",
"pt": "Energia divina que se ergue acima da terra."
},
"advice": {
"tr": "Bugün müziğe yer ver. Coşku iyileştirici.",
"en": "Make room for music today. Enthusiasm is healing.",
"de": "Mache heute Platz für Musik. Begeisterung ist heilend.",
"es": "Hoy haz espacio para la música. El entusiasmo sana.",
"fr": "Aujourd'hui, fais de la place pour la musique. L'enthousiasme guérit.",
"ja": "今日は音楽のために場所を空けよう。熱意は癒し。",
"pt": "Hoje abra espaço para a música. O entusiasmo cura."
}
},
{
"id": "ic_17",
"number": 17,
"emoji": "☱☳",
"name": {
"tr": "Suí: Takip",
"en": "Suí: Following",
"de": "Suí: Die Nachfolge",
"es": "Suí: El Seguimiento",
"fr": "Suí: La Suite",
"ja": "随 (Suí) 、 従うこと",
"pt": "Suí: O Seguir"
},
"essence": {
"tr": "Doğru olanı takip etmek: bilinçli teslim.",
"en": "Following the right: conscious surrender.",
"de": "Dem Rechten folgen: bewusste Hingabe.",
"es": "Seguir lo correcto: entrega consciente.",
"fr": "Suivre ce qui est juste, abandon conscient.",
"ja": "正しきに従うこと 、 意識的な明け渡し。",
"pt": "Seguir o que é certo, entrega consciente."
},
"advice": {
"tr": "Bugün direnme: iyi yöne uy.",
"en": "Today don't resist: follow the good direction.",
"de": "Widerstehe heute nicht: folge der guten Richtung.",
"es": "Hoy no te resistas: sigue la buena dirección.",
"fr": "Aujourd'hui, ne résiste pas, suis la bonne direction.",
"ja": "今日は抗わず 、 良い方向に従おう。",
"pt": "Hoje não resista: siga a boa direção."
}
},
{
"id": "ic_18",
"number": 18,
"emoji": "☶☴",
"name": {
"tr": "Gǔ: Çürümeyi Onarma",
"en": "Gǔ: Work on the Decayed",
"de": "Gǔ: Die Arbeit am Verdorbenen",
"es": "Gǔ: El Trabajo en lo Echado a Perder",
"fr": "Gǔ: Le Travail sur ce qui est Corrompu",
"ja": "蠱 (Gǔ) 、 腐敗したものへの取り組み",
"pt": "Gǔ: O Trabalho no que Foi Estragado"
},
"essence": {
"tr": "Bozulan bir şeyi onarmak: kuşaktan kuşağa miras kalmış sorun.",
"en": "Repairing something broken: a problem inherited generation to generation.",
"de": "Etwas Zerbrochenes reparieren: ein von Generation zu Generation vererbtes Problem.",
"es": "Reparar algo roto: un problema heredado de generación en generación.",
"fr": "Réparer quelque chose de brisé, un problème hérité de génération en génération.",
"ja": "壊れたものを修復すること 、 代々受け継がれた問題。",
"pt": "Reparar algo quebrado: um problema herdado de geração em geração."
},
"advice": {
"tr": "Aile içi/eski bir konuyu onar, düzelt.",
"en": "Repair an old / family matter, fix it.",
"de": "Repariere eine alte / familiäre Angelegenheit, bringe sie in Ordnung.",
"es": "Repara un asunto antiguo / familiar, arréglalo.",
"fr": "Répare une affaire ancienne / familiale, arrange-la.",
"ja": "古い／家族の問題を修復しよう 、 直す。",
"pt": "Repare uma questão antiga / familiar, conserte-a."
}
},
{
"id": "ic_19",
"number": 19,
"emoji": "☷☱",
"name": {
"tr": "Lín: Yaklaşım",
"en": "Lín: Approach",
"de": "Lín: Die Annäherung",
"es": "Lín: El Acercamiento",
"fr": "Lín: L'Approche",
"ja": "臨 (Lín) 、 接近",
"pt": "Lín: A Aproximação"
},
"essence": {
"tr": "Büyüme zamanı yaklaşıyor: fırsat penceresi.",
"en": "The time of growth approaches, window of opportunity.",
"de": "Die Zeit des Wachstums naht, ein Fenster der Gelegenheit.",
"es": "El tiempo de crecimiento se acerca, ventana de oportunidad.",
"fr": "Le temps de la croissance approche, fenêtre d'opportunité.",
"ja": "成長の時が近づく 、 好機の窓。",
"pt": "O tempo de crescimento se aproxima, janela de oportunidade."
},
"advice": {
"tr": "Bugün hareket et: fırsat şu an.",
"en": "Move today: the opportunity is now.",
"de": "Handle heute: die Gelegenheit ist jetzt.",
"es": "Muévete hoy: la oportunidad es ahora.",
"fr": "Agis aujourd'hui: l'opportunité est maintenant.",
"ja": "今日動こう 、 好機は今。",
"pt": "Mova-se hoje: a oportunidade é agora."
}
},
{
"id": "ic_20",
"number": 20,
"emoji": "☴☷",
"name": {
"tr": "Guān: Tefekkür",
"en": "Guān: Contemplation",
"de": "Guān: Die Betrachtung",
"es": "Guān: La Contemplación",
"fr": "Guān: La Contemplation",
"ja": "観 (Guān) 、 観照",
"pt": "Guān: A Contemplação"
},
"essence": {
"tr": "Yüksekten gözlemek: bütünü görmek.",
"en": "To look from above: to see the whole.",
"de": "Von oben blicken: das Ganze sehen.",
"es": "Mirar desde lo alto: ver el todo.",
"fr": "Regarder d'en haut: voir l'ensemble.",
"ja": "高みから見ること 、 全体を見ること。",
"pt": "Olhar do alto: ver o todo."
},
"advice": {
"tr": "Bugün eylem yerine gözlem. Anlamak için adım at.",
"en": "Today observe instead of action. Step to understand.",
"de": "Beobachte heute statt zu handeln. Tritt zurück, um zu verstehen.",
"es": "Hoy observa en lugar de actuar. Da un paso atrás para comprender.",
"fr": "Aujourd'hui, observe au lieu d'agir. Recule pour comprendre.",
"ja": "今日は行動より観察を。理解するために一歩退こう。",
"pt": "Hoje observe em vez de agir. Dê um passo atrás para compreender."
}
},
{
"id": "ic_21",
"number": 21,
"emoji": "☲☳",
"name": {
"tr": "Shì Hé: Çiğneyerek Geçmek",
"en": "Shì Hé: Biting Through",
"de": "Shì Hé: Das Durchbeißen",
"es": "Shì Hé: La Mordedura Tajante",
"fr": "Shì Hé: Mordre au Travers",
"ja": "噬嗑 (Shì Hé) 、 噛み砕く",
"pt": "Shì Hé: A Mordida Decisiva"
},
"essence": {
"tr": "Engeli kararlı bir hamle ile çiğneyip geçmek.",
"en": "Biting through the obstacle with a decisive move.",
"de": "Sich mit einem entschlossenen Zug durch das Hindernis beißen.",
"es": "Morder a través del obstáculo con un movimiento decisivo.",
"fr": "Mordre au travers de l'obstacle par un geste décisif.",
"ja": "決然たる一手で障害を噛み砕く。",
"pt": "Morder através do obstáculo com um movimento decisivo."
},
"advice": {
"tr": "Bugün ertelediğin bir karara kararlı 'evet' veya 'hayır'.",
"en": "Today say a decisive 'yes' or 'no' to a postponed decision.",
"de": "Sage heute ein entschlossenes 'Ja' oder 'Nein' zu einer aufgeschobenen Entscheidung.",
"es": "Hoy di un 'sí' o un 'no' decisivo a una decisión aplazada.",
"fr": "Aujourd'hui, dis un 'oui' ou un 'non' décisif à une décision repoussée.",
"ja": "今日は先送りした決断に決然と『はい』か『いいえ』を言おう。",
"pt": "Hoje diga um 'sim' ou 'não' decisivo a uma decisão adiada."
}
},
{
"id": "ic_22",
"number": 22,
"emoji": "☶☲",
"name": {
"tr": "Bì: Zarafet",
"en": "Bì: Grace",
"de": "Bì: Die Anmut",
"es": "Bì: La Gracia",
"fr": "Bì: La Grâce",
"ja": "賁 (Bì) 、 優美",
"pt": "Bì: A Graça"
},
"essence": {
"tr": "Form ve güzellik: ama özün üstüne kurulmalı.",
"en": "Form and beauty: but built upon essence.",
"de": "Form und Schönheit: aber auf dem Wesen errichtet.",
"es": "Forma y belleza: pero construidas sobre la esencia.",
"fr": "Forme et beauté: mais bâties sur l'essence.",
"ja": "形と美 、 だが本質の上に築かれる。",
"pt": "Forma e beleza: mas construídas sobre a essência."
},
"advice": {
"tr": "Bugün bir şeye estetik ekle, ama özden vazgeçmeden.",
"en": "Today add aesthetic to something, but without giving up essence.",
"de": "Verleihe heute etwas Ästhetik: aber ohne das Wesen aufzugeben.",
"es": "Hoy añade estética a algo, pero sin renunciar a la esencia.",
"fr": "Aujourd'hui, ajoute de l'esthétique à quelque chose: mais sans renoncer à l'essence.",
"ja": "今日は何かに美を加えよう 、 だが本質を手放さずに。",
"pt": "Hoje acrescente estética a algo, mas sem abrir mão da essência."
}
},
{
"id": "ic_23",
"number": 23,
"emoji": "☶☷",
"name": {
"tr": "Bō: Çözülme",
"en": "Bō: Splitting Apart",
"de": "Bō: Die Zersplitterung",
"es": "Bō: La Desintegración",
"fr": "Bō: L'Éclatement",
"ja": "剝 (Bō) 、 剥落",
"pt": "Bō: A Desintegração"
},
"essence": {
"tr": "Eski yapı çözülüyor: direnmek yerine kabul.",
"en": "The old structure dissolving: accept rather than resist.",
"de": "Die alte Struktur löst sich auf, annehmen statt widerstehen.",
"es": "La vieja estructura se disuelve, acepta en vez de resistir.",
"fr": "L'ancienne structure se dissout: accepte plutôt que résister.",
"ja": "古い構造が解体される 、 抗わず受け入れる。",
"pt": "A velha estrutura se dissolve, aceite em vez de resistir."
},
"advice": {
"tr": "Bugün dağılan bir alanı kabul et. Yenisi gelecek.",
"en": "Today accept a dissolving area. The new will come.",
"de": "Nimm heute einen sich auflösenden Bereich an. Das Neue wird kommen.",
"es": "Hoy acepta un área que se disuelve. Lo nuevo llegará.",
"fr": "Aujourd'hui, accepte un domaine qui se dissout. Le nouveau viendra.",
"ja": "今日は解体されゆく領域を受け入れよう。新しいものが来る。",
"pt": "Hoje aceite uma área que se dissolve. O novo virá."
}
},
{
"id": "ic_24",
"number": 24,
"emoji": "☷☳",
"name": {
"tr": "Fù: Geri Dönüş",
"en": "Fù: Return",
"de": "Fù: Die Wiederkehr",
"es": "Fù: El Retorno",
"fr": "Fù: Le Retour",
"ja": "復 (Fù) 、 回帰",
"pt": "Fù: O Retorno"
},
"essence": {
"tr": "Karanlığın dipinde ışık doğar: geri dönüş.",
"en": "At the depth of darkness light is born, return.",
"de": "In der Tiefe der Dunkelheit wird das Licht geboren, Wiederkehr.",
"es": "En lo profundo de la oscuridad nace la luz, el retorno.",
"fr": "Au plus profond de l'obscurité naît la lumière: le retour.",
"ja": "闇の深みで光が生まれる 、 回帰。",
"pt": "No fundo da escuridão nasce a luz, o retorno."
},
"advice": {
"tr": "Bugün 'yeniden başlama' anı: hatadan ders al, başla.",
"en": "Today is the moment of 'starting again': take a lesson from a mistake, begin.",
"de": "Heute ist der Moment des 'Neubeginns': lerne aus einem Fehler, beginne.",
"es": "Hoy es el momento de 'empezar de nuevo': saca una lección de un error, comienza.",
"fr": "Aujourd'hui est le moment de 'recommencer': tire une leçon d'une erreur, commence.",
"ja": "今日は『やり直し』の瞬間 、 過ちから学び、始めよう。",
"pt": "Hoje é o momento de 'recomeçar': tire uma lição de um erro, comece."
}
},
{
"id": "ic_25",
"number": 25,
"emoji": "☰☳",
"name": {
"tr": "Wú Wàng: Masumiyet",
"en": "Wú Wàng: Innocence",
"de": "Wú Wàng: Die Unschuld",
"es": "Wú Wàng: La Inocencia",
"fr": "Wú Wàng: L'Innocence",
"ja": "无妄 (Wú Wàng) 、 無垢",
"pt": "Wú Wàng: A Inocência"
},
"essence": {
"tr": "Doğal, içten, hesapsız hareket.",
"en": "Natural, sincere, uncalculated action.",
"de": "Natürliches, aufrichtiges, unberechnetes Handeln.",
"es": "Acción natural, sincera, sin cálculo.",
"fr": "Action naturelle, sincère, sans calcul.",
"ja": "自然で誠実な、計算のない行い。",
"pt": "Ação natural, sincera, sem cálculo."
},
"advice": {
"tr": "Bugün hesap yapmadan içinden geleni yap.",
"en": "Today act without calculation, from what is inside.",
"de": "Handle heute ohne Berechnung, aus dem heraus, was innen ist.",
"es": "Hoy actúa sin cálculo, desde lo que hay dentro.",
"fr": "Aujourd'hui, agis sans calcul, depuis ce qui est à l'intérieur.",
"ja": "今日は計算せず、内にあるものから行動しよう。",
"pt": "Hoje aja sem cálculo, a partir do que há dentro."
}
},
{
"id": "ic_26",
"number": 26,
"emoji": "☶☰",
"name": {
"tr": "Dà Xù: Büyük Tutuş",
"en": "Dà Xù: The Taming Power of the Great",
"de": "Dà Xù: Die zähmende Kraft des Großen",
"es": "Dà Xù: La Fuerza Domesticadora de lo Grande",
"fr": "Dà Xù: Le Pouvoir d'Apprivoisement du Grand",
"ja": "大畜 (Dà Xù) 、 大いなるものの蓄えの力",
"pt": "Dà Xù: A Força Domadora do Grande"
},
"essence": {
"tr": "Büyük gücü disiplinle biriktirmek.",
"en": "Accumulating great power through discipline.",
"de": "Große Kraft durch Disziplin ansammeln.",
"es": "Acumular gran poder mediante la disciplina.",
"fr": "Accumuler une grande puissance par la discipline.",
"ja": "規律を通じて大いなる力を蓄えること。",
"pt": "Acumular grande poder por meio da disciplina."
},
"advice": {
"tr": "Bugün enerjini sakla: büyük şey için.",
"en": "Today save your energy: for a big thing.",
"de": "Spare heute deine Energie: für eine große Sache.",
"es": "Hoy guarda tu energía: para algo grande.",
"fr": "Aujourd'hui, économise ton énergie, pour une grande chose.",
"ja": "今日はエネルギーを蓄えよう 、 大きなことのために。",
"pt": "Hoje guarde sua energia: para algo grande."
}
},
{
"id": "ic_27",
"number": 27,
"emoji": "☶☳",
"name": {
"tr": "Yí: Beslenme",
"en": "Yí: Nourishment",
"de": "Yí: Die Ernährung",
"es": "Yí: La Nutrición",
"fr": "Yí: La Nourriture",
"ja": "頤 (Yí) 、 養い",
"pt": "Yí: A Nutrição"
},
"essence": {
"tr": "Bedenini, zihnini, ruhunu nasıl besliyorsun?",
"en": "How are you nourishing your body, mind and spirit?",
"de": "Wie nährst du deinen Körper, deinen Geist und deine Seele?",
"es": "¿Cómo estás nutriendo tu cuerpo, tu mente y tu espíritu?",
"fr": "Comment nourris-tu ton corps, ton esprit et ton âme ?",
"ja": "あなたは体・心・魂をどう養っているか？",
"pt": "Como você está nutrindo seu corpo, sua mente e seu espírito?"
},
"advice": {
"tr": "Bugün ne tükettiğini bilinçle gözden geçir, yiyecek, içerik, ilişki.",
"en": "Today consciously review what you consume, food, content, relationship.",
"de": "Prüfe heute bewusst, was du aufnimmst, Nahrung, Inhalte, Beziehung.",
"es": "Hoy revisa conscientemente lo que consumes, comida, contenido, relación.",
"fr": "Aujourd'hui, examine consciemment ce que tu consommes, nourriture, contenu, relation.",
"ja": "今日は取り入れるものを意識して見直そう 、 食べ物、情報、関係。",
"pt": "Hoje revise conscientemente o que consome, comida, conteúdo, relação."
}
},
{
"id": "ic_28",
"number": 28,
"emoji": "☱☴",
"name": {
"tr": "Dà Guò: Büyük Aşırılık",
"en": "Dà Guò: Preponderance of the Great",
"de": "Dà Guò: Das Übergewicht des Großen",
"es": "Dà Guò: La Preponderancia de lo Grande",
"fr": "Dà Guò: La Prépondérance du Grand",
"ja": "大過 (Dà Guò) 、 大いなるものの過剰",
"pt": "Dà Guò: A Preponderância do Grande"
},
"essence": {
"tr": "Yük taşıma kapasitesini aşıyor: çabuk eylem gerek.",
"en": "The load is exceeding capacity, quick action needed.",
"de": "Die Last übersteigt die Tragfähigkeit, rasches Handeln ist nötig.",
"es": "La carga supera la capacidad, se necesita acción rápida.",
"fr": "La charge dépasse la capacité, il faut agir vite.",
"ja": "荷が許容量を超えている 、 速やかな行動が必要。",
"pt": "A carga ultrapassa a capacidade, é preciso agir rápido."
},
"advice": {
"tr": "Bugün taşıdığın yüklerden 1'ini bırak: anında.",
"en": "Today drop 1 of the burdens you carry, immediately.",
"de": "Lege heute eine der Lasten, die du trägst, ab, sofort.",
"es": "Hoy suelta 1 de las cargas que llevas, de inmediato.",
"fr": "Aujourd'hui, dépose 1 des fardeaux que tu portes, immédiatement.",
"ja": "今日は担う重荷を一つ降ろそう 、 ただちに。",
"pt": "Hoje largue 1 dos fardos que você carrega, imediatamente."
}
},
{
"id": "ic_29",
"number": 29,
"emoji": "☵☵",
"name": {
"tr": "Kǎn: Uçurum (Su)",
"en": "Kǎn: Abyss (Water)",
"de": "Kǎn: Der Abgrund (Wasser)",
"es": "Kǎn: El Abismo (Agua)",
"fr": "Kǎn: L'Abîme (Eau)",
"ja": "坎 (Kǎn) 、 深淵（水）",
"pt": "Kǎn: O Abismo (Água)"
},
"essence": {
"tr": "Sürekli zorluk: ama akmaya devam.",
"en": "Continuous difficulty: but keep flowing.",
"de": "Anhaltende Schwierigkeit: aber fließe weiter.",
"es": "Dificultad continua: pero sigue fluyendo.",
"fr": "Difficulté continue: mais continue de couler.",
"ja": "絶え間ない困難 、 だが流れ続けよ。",
"pt": "Dificuldade contínua: mas continue a fluir."
},
"advice": {
"tr": "Bugün zorluğun 'sürekli'liğini kabul et. Akmaya devam.",
"en": "Today accept the 'continuity' of difficulty. Keep flowing.",
"de": "Nimm heute die 'Beständigkeit' der Schwierigkeit an. Fließe weiter.",
"es": "Hoy acepta la 'continuidad' de la dificultad. Sigue fluyendo.",
"fr": "Aujourd'hui, accepte la 'continuité' de la difficulté. Continue de couler.",
"ja": "今日は困難の『継続』を受け入れよう。流れ続けよ。",
"pt": "Hoje aceite a 'continuidade' da dificuldade. Continue a fluir."
}
},
{
"id": "ic_30",
"number": 30,
"emoji": "☲☲",
"name": {
"tr": "Lí: Bağlanma (Ateş)",
"en": "Lí: Clinging (Fire)",
"de": "Lí: Das Haftende (Feuer)",
"es": "Lí: Lo Adherente (Fuego)",
"fr": "Lí: Ce qui s'Attache (Feu)",
"ja": "離 (Lí) 、 付着（火）",
"pt": "Lí: O Aderente (Fogo)"
},
"essence": {
"tr": "Çift ışık: açıklık ve bağlanma.",
"en": "Double light: openness and bonding.",
"de": "Doppeltes Licht: Offenheit und Verbindung.",
"es": "Doble luz: apertura y vínculo.",
"fr": "Double lumière: ouverture et lien.",
"ja": "二重の光 、 開かれと結びつき。",
"pt": "Luz dupla: abertura e vínculo."
},
"advice": {
"tr": "Bugün bir şeye bağlan: açıkça, korkmadan.",
"en": "Today bond to something: openly, without fear.",
"de": "Verbinde dich heute mit etwas, offen, ohne Angst.",
"es": "Hoy vincúlate a algo: abiertamente, sin miedo.",
"fr": "Aujourd'hui, attache-toi à quelque chose, ouvertement, sans peur.",
"ja": "今日は何かに結びつこう 、 開かれて、恐れずに。",
"pt": "Hoje vincule-se a algo: abertamente, sem medo."
}
},
{
"id": "ic_31",
"number": 31,
"emoji": "☱☶",
"name": {
"tr": "Xián: Etki",
"en": "Xián: Influence",
"de": "Xián: Die Einwirkung",
"es": "Xián: La Influencia",
"fr": "Xián: L'Influence",
"ja": "咸 (Xián) 、 感応",
"pt": "Xián: A Influência"
},
"essence": {
"tr": "İki şey birbirini çeker: ortak bir alan açılır.",
"en": "Two things attract each other, a common area opens.",
"de": "Zwei Dinge ziehen einander an, ein gemeinsamer Bereich öffnet sich.",
"es": "Dos cosas se atraen: se abre un área común.",
"fr": "Deux choses s'attirent: un domaine commun s'ouvre.",
"ja": "二つのものが引き合う 、 共通の領域が開く。",
"pt": "Duas coisas se atraem: abre-se uma área comum."
},
"advice": {
"tr": "Bugün çekim hissettiğin bir şeye yönel, sebep aramadan.",
"en": "Today turn toward something you feel pulled to, without seeking reason.",
"de": "Wende dich heute etwas zu, zu dem du dich hingezogen fühlst, ohne nach Gründen zu suchen.",
"es": "Hoy gírate hacia algo que te atrae, sin buscar razón.",
"fr": "Aujourd'hui, tourne-toi vers quelque chose qui t'attire: sans chercher de raison.",
"ja": "今日は惹かれるものへ向かおう 、 理由を求めずに。",
"pt": "Hoje volte-se para algo que o atrai, sem procurar razão."
}
},
{
"id": "ic_32",
"number": 32,
"emoji": "☳☴",
"name": {
"tr": "Héng: Süreklilik",
"en": "Héng: Duration",
"de": "Héng: Die Dauer",
"es": "Héng: La Duración",
"fr": "Héng: La Durée",
"ja": "恒 (Héng) 、 持続",
"pt": "Héng: A Duração"
},
"essence": {
"tr": "Uzun süreçte sebat etmek: yıldırım ve rüzgar gibi sürekli.",
"en": "Perseverance in long process: continuous like thunder and wind.",
"de": "Beharrlichkeit in einem langen Prozess, beständig wie Donner und Wind.",
"es": "Perseverancia en un proceso largo, continua como el trueno y el viento.",
"fr": "Persévérance dans un long processus, continue comme le tonnerre et le vent.",
"ja": "長い過程での粘り強さ 、 雷と風のように絶え間ない。",
"pt": "Perseverança num longo processo: contínua como o trovão e o vento."
},
"advice": {
"tr": "Bugün sürekliliği koru: küçük günlük ritüellerle.",
"en": "Today preserve continuity: through small daily rituals.",
"de": "Bewahre heute Beständigkeit: durch kleine tägliche Rituale.",
"es": "Hoy preserva la continuidad: mediante pequeños rituales diarios.",
"fr": "Aujourd'hui, préserve la continuité, par de petits rituels quotidiens.",
"ja": "今日は継続を保とう 、 小さな日々の儀式によって。",
"pt": "Hoje preserve a continuidade: por meio de pequenos rituais diários."
}
},
{
"id": "ic_33",
"number": 33,
"emoji": "☰☶",
"name": {
"tr": "Dùn: Geri Çekiliş",
"en": "Dùn: Retreat",
"de": "Dùn: Der Rückzug",
"es": "Dùn: La Retirada",
"fr": "Dùn: La Retraite",
"ja": "遯 (Dùn) 、 退避",
"pt": "Dùn: O Recuo"
},
"essence": {
"tr": "Onurlu bir geri çekiliş: savaş değil korunma.",
"en": "An honourable retreat: not war but protection.",
"de": "Ein ehrenhafter Rückzug: kein Krieg, sondern Schutz.",
"es": "Una retirada honorable: no guerra sino protección.",
"fr": "Une retraite honorable: non pas la guerre mais la protection.",
"ja": "名誉ある退避 、 戦いではなく守り。",
"pt": "Um recuo honroso: não guerra, mas proteção."
},
"advice": {
"tr": "Bugün bir alandan stratejik geri çekil, yenilgi değil.",
"en": "Today strategically withdraw from an area, not defeat.",
"de": "Ziehe dich heute strategisch aus einem Bereich zurück, keine Niederlage.",
"es": "Hoy retírate estratégicamente de un área, no es derrota.",
"fr": "Aujourd'hui, retire-toi stratégiquement d'un domaine: pas une défaite.",
"ja": "今日はある領域から戦略的に退こう 、 敗北ではない。",
"pt": "Hoje recue estrategicamente de uma área, não é derrota."
}
},
{
"id": "ic_34",
"number": 34,
"emoji": "☳☰",
"name": {
"tr": "Dà Zhuàng: Büyük Güç",
"en": "Dà Zhuàng: Great Power",
"de": "Dà Zhuàng: Des Großen Macht",
"es": "Dà Zhuàng: El Gran Poder",
"fr": "Dà Zhuàng: La Grande Puissance",
"ja": "大壮 (Dà Zhuàng) 、 大いなる力",
"pt": "Dà Zhuàng: O Grande Poder"
},
"essence": {
"tr": "Çok güçlüsün: gücü bilinçle taşı.",
"en": "You are very strong: carry the power consciously.",
"de": "Du bist sehr stark: trage die Kraft bewusst.",
"es": "Eres muy fuerte: lleva el poder con conciencia.",
"fr": "Tu es très fort: porte la puissance consciemment.",
"ja": "あなたは非常に強い 、 その力を意識して担え。",
"pt": "Você é muito forte: carregue o poder com consciência."
},
"advice": {
"tr": "Bugün gücünü dikkatle kullan: kötü bir hareket büyük zarar.",
"en": "Today use your power carefully, a wrong move causes big harm.",
"de": "Setze heute deine Kraft vorsichtig ein, ein falscher Zug richtet großen Schaden an.",
"es": "Hoy usa tu poder con cuidado, un movimiento erróneo causa gran daño.",
"fr": "Aujourd'hui, use de ta puissance avec soin, un geste erroné cause un grand tort.",
"ja": "今日は力を慎重に使おう 、 一手の誤りが大きな害を招く。",
"pt": "Hoje use seu poder com cuidado, um movimento errado causa grande dano."
}
},
{
"id": "ic_35",
"number": 35,
"emoji": "☲☷",
"name": {
"tr": "Jìn: İlerleme",
"en": "Jìn: Progress",
"de": "Jìn: Der Fortschritt",
"es": "Jìn: El Progreso",
"fr": "Jìn: Le Progrès",
"ja": "晋 (Jìn) 、 前進",
"pt": "Jìn: O Progresso"
},
"essence": {
"tr": "Güneş yükselir: ilerleme zamanı.",
"en": "The sun rises: time for progress.",
"de": "Die Sonne geht auf: Zeit für Fortschritt.",
"es": "El sol se alza: tiempo de progreso.",
"fr": "Le soleil se lève: temps du progrès.",
"ja": "太陽が昇る 、 前進の時。",
"pt": "O sol se ergue: tempo de progresso."
},
"advice": {
"tr": "Bugün bir alanda görünür ol, ilerle.",
"en": "Today be visible in some area, advance.",
"de": "Sei heute in irgendeinem Bereich sichtbar, schreite voran.",
"es": "Hoy hazte visible en alguna área, avanza.",
"fr": "Aujourd'hui, sois visible dans un domaine, avance.",
"ja": "今日はある領域で姿を見せよう 、 進め。",
"pt": "Hoje torne-se visível em alguma área, avance."
}
},
{
"id": "ic_36",
"number": 36,
"emoji": "☷☲",
"name": {
"tr": "Míng Yí: Karanlığın Yaralı Işığı",
"en": "Míng Yí: Darkening of the Light",
"de": "Míng Yí: Die Verfinsterung des Lichts",
"es": "Míng Yí: El Oscurecimiento de la Luz",
"fr": "Míng Yí: L'Obscurcissement de la Lumière",
"ja": "明夷 (Míng Yí) 、 光の暗まり",
"pt": "Míng Yí: O Obscurecimento da Luz"
},
"essence": {
"tr": "Işık karanlık altında: iç ışığı koru, dışarıya saklan.",
"en": "Light under darkness: guard the inner light, hide outwardly.",
"de": "Licht unter Dunkelheit: hüte das innere Licht, verbirg dich nach außen.",
"es": "Luz bajo la oscuridad: guarda la luz interior, ocúltate por fuera.",
"fr": "Lumière sous l'obscurité: garde la lumière intérieure, dissimule-toi au-dehors.",
"ja": "闇の下の光 、 内なる光を守り、外には隠す。",
"pt": "Luz sob a escuridão: guarde a luz interior, oculte-se por fora."
},
"advice": {
"tr": "Bugün iç ışığını dışarıdan koru, herkesle paylaşma.",
"en": "Today protect your inner light, don't share with everyone.",
"de": "Schütze heute dein inneres Licht, teile es nicht mit jedem.",
"es": "Hoy protege tu luz interior, no la compartas con todos.",
"fr": "Aujourd'hui, protège ta lumière intérieure, ne la partage pas avec tout le monde.",
"ja": "今日は内なる光を守ろう 、 誰彼かまわず分かち合わない。",
"pt": "Hoje proteja sua luz interior, não a compartilhe com todos."
}
},
{
"id": "ic_37",
"number": 37,
"emoji": "☴☲",
"name": {
"tr": "Jiā Rén: Aile",
"en": "Jiā Rén: The Family",
"de": "Jiā Rén: Die Sippe",
"es": "Jiā Rén: La Familia",
"fr": "Jiā Rén: La Famille",
"ja": "家人 (Jiā Rén) 、 家族",
"pt": "Jiā Rén: A Família"
},
"essence": {
"tr": "Aile düzenine dikkat: herkesin rolü açık.",
"en": "Pay attention to family order, everyone's role clear.",
"de": "Achte auf die Ordnung der Familie, die Rolle jedes Einzelnen klar.",
"es": "Presta atención al orden de la familia, el rol de cada uno claro.",
"fr": "Prête attention à l'ordre de la famille: le rôle de chacun clair.",
"ja": "家族の秩序に目を向けよ 、 各自の役割を明確に。",
"pt": "Preste atenção à ordem da família, o papel de cada um claro."
},
"advice": {
"tr": "Bugün ev/aile düzenini gözden geçir, bir küçük şey düzelt.",
"en": "Today review home / family order, fix one small thing.",
"de": "Prüfe heute die Ordnung von Haus / Familie, bringe eine kleine Sache in Ordnung.",
"es": "Hoy revisa el orden del hogar / familia, arregla una pequeña cosa.",
"fr": "Aujourd'hui, revois l'ordre du foyer / de la famille, arrange une petite chose.",
"ja": "今日は家／家族の秩序を見直そう 、 小さなことを一つ直す。",
"pt": "Hoje revise a ordem do lar / família, conserte uma pequena coisa."
}
},
{
"id": "ic_38",
"number": 38,
"emoji": "☲☱",
"name": {
"tr": "Kuí: Yabancılaşma",
"en": "Kuí: Estrangement",
"de": "Kuí: Der Gegensatz",
"es": "Kuí: El Antagonismo",
"fr": "Kuí: L'Opposition",
"ja": "睽 (Kuí) 、 反目",
"pt": "Kuí: A Oposição"
},
"essence": {
"tr": "İki taraf birbirinden uzaklaşmış: küçük adımla bağ kur.",
"en": "Two sides moved apart: small steps to build bond.",
"de": "Zwei Seiten haben sich entfernt, kleine Schritte, um die Verbindung zu bauen.",
"es": "Dos lados se han alejado, pequeños pasos para construir el vínculo.",
"fr": "Deux côtés se sont éloignés, de petits pas pour bâtir le lien.",
"ja": "二つの側が離れた 、 絆を築く小さな一歩。",
"pt": "Dois lados se afastaram: pequenos passos para construir o vínculo."
},
"advice": {
"tr": "Bugün uzaklaşmış birine küçük bir mesaj, köprü kur.",
"en": "Today send a small message to someone distant, build a bridge.",
"de": "Sende heute jemandem Fernen eine kleine Nachricht, baue eine Brücke.",
"es": "Hoy envía un pequeño mensaje a alguien distante, tiende un puente.",
"fr": "Aujourd'hui, envoie un petit message à quelqu'un de lointain: bâtis un pont.",
"ja": "今日は遠ざかった誰かに小さなメッセージを送ろう 、 橋を架けよう。",
"pt": "Hoje envie uma pequena mensagem a alguém distante, construa uma ponte."
}
},
{
"id": "ic_39",
"number": 39,
"emoji": "☵☶",
"name": {
"tr": "Jiǎn: Engel",
"en": "Jiǎn: Obstruction",
"de": "Jiǎn: Das Hemmnis",
"es": "Jiǎn: El Impedimento",
"fr": "Jiǎn: L'Obstacle",
"ja": "蹇 (Jiǎn) 、 障害",
"pt": "Jiǎn: O Obstáculo"
},
"essence": {
"tr": "Yolda büyük engel: geri dönmek ve yardım istemek bilgelik.",
"en": "Big obstacle on the way, turning back and asking for help is wisdom.",
"de": "Großes Hindernis auf dem Weg, Umkehr und um Hilfe bitten ist Weisheit.",
"es": "Gran obstáculo en el camino, dar la vuelta y pedir ayuda es sabiduría.",
"fr": "Grand obstacle sur le chemin, faire demi-tour et demander de l'aide est sagesse.",
"ja": "道に大きな障害 、 引き返して助けを求めるのが知恵。",
"pt": "Grande obstáculo no caminho: voltar atrás e pedir ajuda é sabedoria."
},
"advice": {
"tr": "Bugün takılı kaldığın bir alanda yardım iste.",
"en": "Today ask for help in an area where you are stuck.",
"de": "Bitte heute in einem Bereich, in dem du feststeckst, um Hilfe.",
"es": "Hoy pide ayuda en un área en la que estás atascado.",
"fr": "Aujourd'hui, demande de l'aide dans un domaine où tu es bloqué.",
"ja": "今日は行き詰まった領域で助けを求めよう。",
"pt": "Hoje peça ajuda numa área em que você está travado."
}
},
{
"id": "ic_40",
"number": 40,
"emoji": "☳☵",
"name": {
"tr": "Xiè: Çözülme",
"en": "Xiè: Deliverance",
"de": "Xiè: Die Befreiung",
"es": "Xiè: La Liberación",
"fr": "Xiè: La Libération",
"ja": "解 (Xiè) 、 解放",
"pt": "Xiè: A Libertação"
},
"essence": {
"tr": "Bir gerilim çözülüyor: fırtınadan sonra.",
"en": "A tension releases: after the storm.",
"de": "Eine Spannung löst sich: nach dem Sturm.",
"es": "Una tensión se libera: después de la tormenta.",
"fr": "Une tension se relâche: après la tempête.",
"ja": "一つの緊張がほどける 、 嵐のあとに。",
"pt": "Uma tensão se libera: depois da tempestade."
},
"advice": {
"tr": "Bugün geçmiş bir gerilimi resmi olarak bırak.",
"en": "Today officially release a past tension.",
"de": "Löse heute offiziell eine vergangene Spannung.",
"es": "Hoy libera oficialmente una tensión del pasado.",
"fr": "Aujourd'hui, relâche officiellement une tension passée.",
"ja": "今日は過去の緊張を正式に手放そう。",
"pt": "Hoje libere oficialmente uma tensão do passado."
}
},
{
"id": "ic_41",
"number": 41,
"emoji": "☶☱",
"name": {
"tr": "Sǔn: Azalma",
"en": "Sǔn: Decrease",
"de": "Sǔn: Die Minderung",
"es": "Sǔn: La Merma",
"fr": "Sǔn: La Diminution",
"ja": "損 (Sǔn) 、 減少",
"pt": "Sǔn: A Diminuição"
},
"essence": {
"tr": "Az ile yetinmek: öze yaklaşmak.",
"en": "Settling for less: approaching essence.",
"de": "Sich mit weniger begnügen: dem Wesen näher kommen.",
"es": "Conformarse con menos: acercarse a la esencia.",
"fr": "Se contenter de moins: s'approcher de l'essence.",
"ja": "少なきに甘んじる 、 本質に近づく。",
"pt": "Contentar-se com menos: aproximar-se da essência."
},
"advice": {
"tr": "Bugün gereksiz bir şeyi bırak, yer aç.",
"en": "Today let go of an unnecessary thing, open space.",
"de": "Lass heute eine unnötige Sache los, schaffe Raum.",
"es": "Hoy suelta algo innecesario: abre espacio.",
"fr": "Aujourd'hui, lâche une chose inutile, fais de la place.",
"ja": "今日は不要なものを手放そう 、 場所を空ける。",
"pt": "Hoje solte algo desnecessário: abra espaço."
}
},
{
"id": "ic_42",
"number": 42,
"emoji": "☴☳",
"name": {
"tr": "Yì: Artma",
"en": "Yì: Increase",
"de": "Yì: Die Mehrung",
"es": "Yì: El Aumento",
"fr": "Yì: L'Augmentation",
"ja": "益 (Yì) 、 増加",
"pt": "Yì: O Aumento"
},
"essence": {
"tr": "Bolluk akıyor: paylaşmak çoğaltır.",
"en": "Abundance is flowing: sharing multiplies.",
"de": "Fülle fließt: Teilen vervielfacht.",
"es": "La abundancia fluye: compartir multiplica.",
"fr": "L'abondance coule: partager multiplie.",
"ja": "豊かさが流れる 、 分かち合いは増やす。",
"pt": "A abundância flui: compartilhar multiplica."
},
"advice": {
"tr": "Bugün bir başkasına bir şey ver, bolluk paylaşıldığında büyür.",
"en": "Today give something to someone, abundance grows when shared.",
"de": "Gib heute jemandem etwas: Fülle wächst, wenn sie geteilt wird.",
"es": "Hoy da algo a alguien, la abundancia crece al compartirse.",
"fr": "Aujourd'hui, donne quelque chose à quelqu'un: l'abondance grandit quand on la partage.",
"ja": "今日は誰かに何かを与えよう 、 豊かさは分かち合うと育つ。",
"pt": "Hoje dê algo a alguém, a abundância cresce quando compartilhada."
}
},
{
"id": "ic_43",
"number": 43,
"emoji": "☱☰",
"name": {
"tr": "Guài: Atılım",
"en": "Guài: Breakthrough",
"de": "Guài: Der Durchbruch",
"es": "Guài: El Desbordamiento",
"fr": "Guài: La Percée",
"ja": "夬 (Guài) 、 突破",
"pt": "Guài: O Rompimento"
},
"essence": {
"tr": "Şimdi karar zamanı: kesin tavır.",
"en": "Now is the time of decision, clear stance.",
"de": "Jetzt ist die Zeit der Entscheidung, klare Haltung.",
"es": "Ahora es el tiempo de la decisión, postura clara.",
"fr": "C'est maintenant le temps de la décision, position claire.",
"ja": "今は決断の時 、 明確な姿勢。",
"pt": "Agora é o tempo da decisão, postura clara."
},
"advice": {
"tr": "Bugün uzun süredir bekleyen bir karara 'evet' veya 'hayır' de.",
"en": "Today say 'yes' or 'no' to a long-pending decision.",
"de": "Sage heute 'Ja' oder 'Nein' zu einer lange anstehenden Entscheidung.",
"es": "Hoy di 'sí' o 'no' a una decisión largamente pendiente.",
"fr": "Aujourd'hui, dis 'oui' ou 'non' à une décision longtemps en suspens.",
"ja": "今日は長く保留した決断に『はい』か『いいえ』を言おう。",
"pt": "Hoje diga 'sim' ou 'não' a uma decisão há muito pendente."
}
},
{
"id": "ic_44",
"number": 44,
"emoji": "☰☴",
"name": {
"tr": "Gòu: Karşılaşma",
"en": "Gòu: Coming to Meet",
"de": "Gòu: Das Entgegenkommen",
"es": "Gòu: El Ir al Encuentro",
"fr": "Gòu: Venir à la Rencontre",
"ja": "姤 (Gòu) 、 出会いに来ること",
"pt": "Gòu: O Ir ao Encontro"
},
"essence": {
"tr": "Bir karşılaşma: hem fırsat hem ayartı.",
"en": "An encounter: both opportunity and temptation.",
"de": "Eine Begegnung: Gelegenheit und Versuchung zugleich.",
"es": "Un encuentro: oportunidad y tentación a la vez.",
"fr": "Une rencontre: à la fois opportunité et tentation.",
"ja": "一つの出会い 、 好機であり誘惑でもある。",
"pt": "Um encontro: oportunidade e tentação ao mesmo tempo."
},
"advice": {
"tr": "Bugün karşına çıkan birine dikkatle bak, değer mi, ayartı mı?",
"en": "Today look carefully at someone who appears before you, worth it or temptation?",
"de": "Betrachte heute genau jemanden, der vor dir erscheint, lohnenswert oder Versuchung?",
"es": "Hoy mira con cuidado a alguien que aparece ante ti, ¿vale la pena o es tentación?",
"fr": "Aujourd'hui, regarde attentivement quelqu'un qui apparaît devant toi, en vaut-il la peine, ou est-ce une tentation ?",
"ja": "今日は目の前に現れた誰かをよく見よう 、 価値あるものか、誘惑か？",
"pt": "Hoje observe com cuidado alguém que aparece diante de você, vale a pena ou é tentação?"
}
},
{
"id": "ic_45",
"number": 45,
"emoji": "☱☷",
"name": {
"tr": "Cuì: Toplanma",
"en": "Cuì: Gathering Together",
"de": "Cuì: Die Sammlung",
"es": "Cuì: La Reunión",
"fr": "Cuì: Le Rassemblement",
"ja": "萃 (Cuì) 、 集まること",
"pt": "Cuì: A Reunião"
},
"essence": {
"tr": "Bir topluluk bir araya geliyor, ortak amaç için.",
"en": "A community comes together: for common purpose.",
"de": "Eine Gemeinschaft kommt zusammen: für ein gemeinsames Ziel.",
"es": "Una comunidad se reúne: por un propósito común.",
"fr": "Une communauté se rassemble: pour un but commun.",
"ja": "共同体が集う 、 共通の目的のために。",
"pt": "Uma comunidade se reúne: por um propósito comum."
},
"advice": {
"tr": "Bugün bir topluluğa katıl: küçük olabilir.",
"en": "Today join a community: small is fine.",
"de": "Schließe dich heute einer Gemeinschaft an, klein ist in Ordnung.",
"es": "Hoy únete a una comunidad, pequeña está bien.",
"fr": "Aujourd'hui, rejoins une communauté, petite suffit.",
"ja": "今日は共同体に加わろう 、 小さくてもよい。",
"pt": "Hoje junte-se a uma comunidade, pequena já basta."
}
},
{
"id": "ic_46",
"number": 46,
"emoji": "☷☴",
"name": {
"tr": "Shēng: Yükselme",
"en": "Shēng: Pushing Upward",
"de": "Shēng: Das Empordringen",
"es": "Shēng: La Subida",
"fr": "Shēng: La Poussée vers le Haut",
"ja": "升 (Shēng) 、 上昇",
"pt": "Shēng: A Ascensão"
},
"essence": {
"tr": "Tohumdan ağaç olma: yavaş ve kararlı yükseliş.",
"en": "From seed to tree: slow and steady rise.",
"de": "Vom Samen zum Baum: langsamer und stetiger Aufstieg.",
"es": "De la semilla al árbol, ascenso lento y constante.",
"fr": "De la graine à l'arbre: ascension lente et régulière.",
"ja": "種から木へ 、 ゆっくり着実な上昇。",
"pt": "Da semente à árvore: ascensão lenta e constante."
},
"advice": {
"tr": "Bugün uzun vadeli bir hedefe küçük adım at.",
"en": "Today take a small step toward a long-term goal.",
"de": "Mache heute einen kleinen Schritt auf ein langfristiges Ziel zu.",
"es": "Hoy da un pequeño paso hacia una meta a largo plazo.",
"fr": "Aujourd'hui, fais un petit pas vers un objectif à long terme.",
"ja": "今日は長期の目標へ小さな一歩を踏み出そう。",
"pt": "Hoje dê um pequeno passo rumo a uma meta de longo prazo."
}
},
{
"id": "ic_47",
"number": 47,
"emoji": "☱☵",
"name": {
"tr": "Kùn: Tükeniş",
"en": "Kùn: Oppression",
"de": "Kùn: Die Bedrängnis",
"es": "Kùn: La Desazón",
"fr": "Kùn: L'Accablement",
"ja": "困 (Kùn) 、 困窮",
"pt": "Kùn: A Opressão"
},
"essence": {
"tr": "Dışsal kaynaklar tükenmiş: iç güce dönmek gerek.",
"en": "External resources exhausted: need to return to inner power.",
"de": "Äußere Ressourcen erschöpft: Rückkehr zur inneren Kraft nötig.",
"es": "Recursos externos agotados: hay que volver al poder interior.",
"fr": "Ressources extérieures épuisées: il faut revenir au pouvoir intérieur.",
"ja": "外的な資源が尽きた 、 内なる力へ戻る必要がある。",
"pt": "Recursos externos esgotados: é preciso voltar ao poder interior."
},
"advice": {
"tr": "Bugün dışarıdan beklemeyi bırak. İçeriden ne var?",
"en": "Today stop waiting from outside. What is inside?",
"de": "Hör heute auf, von außen zu erwarten. Was ist innen?",
"es": "Hoy deja de esperar de fuera. ¿Qué hay dentro?",
"fr": "Aujourd'hui, cesse d'attendre de l'extérieur. Qu'y a-t-il à l'intérieur ?",
"ja": "今日は外から期待するのをやめよう。内には何があるか？",
"pt": "Hoje pare de esperar de fora. O que há dentro?"
}
},
{
"id": "ic_48",
"number": 48,
"emoji": "☵☴",
"name": {
"tr": "Jǐng: Kuyu",
"en": "Jǐng: The Well",
"de": "Jǐng: Der Brunnen",
"es": "Jǐng: El Pozo",
"fr": "Jǐng: Le Puits",
"ja": "井 (Jǐng) 、 井戸",
"pt": "Jǐng: O Poço"
},
"essence": {
"tr": "Kuyu: herkes için. Sürekli verir, eskiden günümüze.",
"en": "The well: for everyone. Continually gives, from the old to today.",
"de": "Der Brunnen: für alle. Gibt fortwährend, vom Alten bis heute.",
"es": "El pozo: para todos. Da continuamente, desde lo antiguo hasta hoy.",
"fr": "Le puits: pour tous. Il donne sans cesse, de l'ancien jusqu'à aujourd'hui.",
"ja": "井戸 、 万人のため。古より今日まで、絶えず与え続ける。",
"pt": "O poço: para todos. Dá continuamente, do antigo até hoje."
},
"advice": {
"tr": "Bugün senin 'kuyun'a (yetenek, alan) düzenli su ver.",
"en": "Today water your 'well' (talent, area) regularly.",
"de": "Bewässere heute deinen 'Brunnen' (Talent, Bereich) regelmäßig.",
"es": "Hoy riega tu 'pozo' (talento, área) con regularidad.",
"fr": "Aujourd'hui, arrose ton 'puits' (talent, domaine) régulièrement.",
"ja": "今日はあなたの『井戸』（才能・領域）に定期的に水をやろう。",
"pt": "Hoje regue seu 'poço' (talento, área) com regularidade."
}
},
{
"id": "ic_49",
"number": 49,
"emoji": "☱☲",
"name": {
"tr": "Gé: Devrim",
"en": "Gé: Revolution",
"de": "Gé: Die Umwälzung",
"es": "Gé: La Revolución",
"fr": "Gé: La Révolution",
"ja": "革 (Gé) 、 革命",
"pt": "Gé: A Revolução"
},
"essence": {
"tr": "Eski hâl artık geçerli değil, devrim zamanı.",
"en": "The old state is no longer valid, revolution time.",
"de": "Der alte Zustand gilt nicht mehr, Zeit der Umwälzung.",
"es": "El viejo estado ya no es válido, tiempo de revolución.",
"fr": "L'ancien état n'est plus valable: temps de révolution.",
"ja": "古い状態はもはや通用しない 、 革命の時。",
"pt": "O velho estado não vale mais, tempo de revolução."
},
"advice": {
"tr": "Bugün eski bir kalıbı bilinçle bırak. Yenisi gelecek.",
"en": "Today consciously let go of an old pattern. The new will come.",
"de": "Lass heute bewusst ein altes Muster los. Das Neue wird kommen.",
"es": "Hoy suelta conscientemente un patrón viejo. Lo nuevo llegará.",
"fr": "Aujourd'hui, lâche consciemment un ancien schéma. Le nouveau viendra.",
"ja": "今日は意識して古いパターンを手放そう。新しいものが来る。",
"pt": "Hoje solte conscientemente um padrão antigo. O novo virá."
}
},
{
"id": "ic_50",
"number": 50,
"emoji": "☲☴",
"name": {
"tr": "Dǐng: Üç Ayaklı Kazan",
"en": "Dǐng: The Cauldron",
"de": "Dǐng: Der Tiegel",
"es": "Dǐng: El Caldero",
"fr": "Dǐng: Le Chaudron",
"ja": "鼎 (Dǐng) 、 鼎（かなえ）",
"pt": "Dǐng: O Caldeirão"
},
"essence": {
"tr": "Kazanda her şey dönüşür: yeni form doğar.",
"en": "Everything is transformed in the cauldron, new form is born.",
"de": "Alles wird im Tiegel verwandelt, eine neue Form wird geboren.",
"es": "Todo se transforma en el caldero, nace una nueva forma.",
"fr": "Tout se transforme dans le chaudron, une forme nouvelle naît.",
"ja": "すべては鼎の中で変容する 、 新しい形が生まれる。",
"pt": "Tudo se transforma no caldeirão, nasce uma nova forma."
},
"advice": {
"tr": "Bugün bir şey 'pişiyor' içinde: ona zaman ver.",
"en": "Today something is 'cooking' inside you: give it time.",
"de": "Heute 'kocht' etwas in dir: gib ihm Zeit.",
"es": "Hoy algo se 'cocina' dentro de ti: dale tiempo.",
"fr": "Aujourd'hui, quelque chose 'mijote' en toi: donne-lui du temps.",
"ja": "今日はあなたの内で何かが『煮え立っている』 、 時を与えよう。",
"pt": "Hoje algo 'cozinha' dentro de você: dê-lhe tempo."
}
},
{
"id": "ic_51",
"number": 51,
"emoji": "☳☳",
"name": {
"tr": "Zhèn: Yıldırım Şoku",
"en": "Zhèn: The Arousing (Thunder)",
"de": "Zhèn: Das Erregende (Donner)",
"es": "Zhèn: Lo Suscitativo (Trueno)",
"fr": "Zhèn: L'Éveilleur (Tonnerre)",
"ja": "震 (Zhèn) 、 震わすもの（雷）",
"pt": "Zhèn: O Incitar (Trovão)"
},
"essence": {
"tr": "Beklenmedik sarsıntı: uyanmak için.",
"en": "Unexpected shake: for awakening.",
"de": "Unerwartete Erschütterung: zum Erwachen.",
"es": "Sacudida inesperada: para despertar.",
"fr": "Ébranlement inattendu: pour l'éveil.",
"ja": "思いがけぬ揺さぶり 、 目覚めのために。",
"pt": "Abalo inesperado: para despertar."
},
"advice": {
"tr": "Bugün bir 'sarsıntı' geldiyse: uyanma çağrısıdır.",
"en": "Today if a 'shake' came: it is the call to awaken.",
"de": "Wenn heute eine 'Erschütterung' kam: sie ist der Ruf zu erwachen.",
"es": "Hoy si llegó una 'sacudida': es la llamada a despertar.",
"fr": "Aujourd'hui, si un 'ébranlement' est venu: c'est l'appel à l'éveil.",
"ja": "今日『揺さぶり』が来たなら 、 それは目覚めへの呼びかけ。",
"pt": "Hoje se veio um 'abalo': é o chamado para despertar."
}
},
{
"id": "ic_52",
"number": 52,
"emoji": "☶☶",
"name": {
"tr": "Gěn: Hareketsizlik (Dağ)",
"en": "Gěn: Keeping Still (Mountain)",
"de": "Gěn: Das Stillehalten (Berg)",
"es": "Gěn: El Aquietamiento (Montaña)",
"fr": "Gěn: L'Immobilisation (Montagne)",
"ja": "艮 (Gěn) 、 静止を保つこと（山）",
"pt": "Gěn: O Aquietamento (Montanha)"
},
"essence": {
"tr": "Tam hareketsizlik: meditasyonun en derini.",
"en": "Total stillness: the deepest meditation.",
"de": "Völlige Stille: die tiefste Meditation.",
"es": "Quietud total: la meditación más profunda.",
"fr": "Immobilité totale: la méditation la plus profonde.",
"ja": "完全な静止 、 最も深い瞑想。",
"pt": "Quietude total: a meditação mais profunda."
},
"advice": {
"tr": "Bugün 10 dakika hareketsiz otur. Düşünce de hareketsiz.",
"en": "Today sit motionless for 10 minutes. Thought too still.",
"de": "Sitze heute 10 Minuten regungslos. Auch der Gedanke ganz still.",
"es": "Hoy siéntate inmóvil 10 minutos. El pensamiento también quieto.",
"fr": "Aujourd'hui, assieds-toi immobile 10 minutes. La pensée aussi immobile.",
"ja": "今日は10分間、微動だにせず座ろう。思考もまた静かに。",
"pt": "Hoje sente-se imóvel por 10 minutos. O pensamento também quieto."
}
},
{
"id": "ic_53",
"number": 53,
"emoji": "☴☶",
"name": {
"tr": "Jiàn: Kademeli İlerleme",
"en": "Jiàn: Gradual Development",
"de": "Jiàn: Die allmähliche Entwicklung",
"es": "Jiàn: El Desarrollo Gradual",
"fr": "Jiàn: Le Développement Graduel",
"ja": "漸 (Jiàn) 、 漸進的な発展",
"pt": "Jiàn: O Desenvolvimento Gradual"
},
"essence": {
"tr": "Yavaş ama sürekli: ağaç gibi büyümek.",
"en": "Slow but steady: to grow like a tree.",
"de": "Langsam, aber stetig, wie ein Baum wachsen.",
"es": "Lento pero constante: crecer como un árbol.",
"fr": "Lent mais régulier: grandir comme un arbre.",
"ja": "ゆっくりだが着実に 、 木のように育つ。",
"pt": "Lento mas constante: crescer como uma árvore."
},
"advice": {
"tr": "Bugün sabır pratiği. Hızlandırma.",
"en": "Today practice patience. Don't speed up.",
"de": "Übe dich heute in Geduld. Beschleunige nicht.",
"es": "Hoy practica la paciencia. No aceleres.",
"fr": "Aujourd'hui, exerce la patience. N'accélère pas.",
"ja": "今日は忍耐を実践しよう。急がないこと。",
"pt": "Hoje pratique a paciência. Não acelere."
}
},
{
"id": "ic_54",
"number": 54,
"emoji": "☳☱",
"name": {
"tr": "Guī Mèi: Genç Kız Evlilik",
"en": "Guī Mèi: The Marrying Maiden",
"de": "Guī Mèi: Das heiratende Mädchen",
"es": "Guī Mèi: La Muchacha que se Casa",
"fr": "Guī Mèi: La Jeune Fille qui se Marie",
"ja": "帰妹 (Guī Mèi) 、 嫁ぐ娘",
"pt": "Guī Mèi: A Moça que se Casa"
},
"essence": {
"tr": "Bir bağ yanlış zamanda veya yanlış kişiyle, dikkatle bak.",
"en": "A bond at the wrong time or with the wrong person, look carefully.",
"de": "Eine Verbindung zur falschen Zeit oder mit der falschen Person, schau genau hin.",
"es": "Un vínculo en el momento equivocado o con la persona equivocada, mira con cuidado.",
"fr": "Un lien au mauvais moment ou avec la mauvaise personne, regarde attentivement.",
"ja": "間違った時、あるいは間違った相手との結びつき 、 よく見よ。",
"pt": "Um vínculo na hora errada ou com a pessoa errada, olhe com cuidado."
},
"advice": {
"tr": "Bugün bir bağı sorgula: gerçekten doğru mu?",
"en": "Today question a bond: really right?",
"de": "Hinterfrage heute eine Verbindung: wirklich richtig?",
"es": "Hoy cuestiona un vínculo: ¿realmente correcto?",
"fr": "Aujourd'hui, questionne un lien, vraiment juste ?",
"ja": "今日はある結びつきを問おう 、 本当に正しいか？",
"pt": "Hoje questione um vínculo: realmente certo?"
}
},
{
"id": "ic_55",
"number": 55,
"emoji": "☳☲",
"name": {
"tr": "Fēng: Bolluk",
"en": "Fēng: Abundance",
"de": "Fēng: Die Fülle",
"es": "Fēng: La Abundancia",
"fr": "Fēng: L'Abondance",
"ja": "豊 (Fēng) 、 豊かさ",
"pt": "Fēng: A Abundância"
},
"essence": {
"tr": "Bolluğun zirvesi: ama geçici.",
"en": "The peak of abundance: but temporary.",
"de": "Der Höhepunkt der Fülle: aber vorübergehend.",
"es": "La cima de la abundancia, pero temporal.",
"fr": "L'apogée de l'abondance: mais temporaire.",
"ja": "豊かさの頂点 、 だが一時的。",
"pt": "O auge da abundância: mas temporário."
},
"advice": {
"tr": "Bugün zirve anının tadını çıkar, bilinçli.",
"en": "Today enjoy the moment of peak, consciously.",
"de": "Genieße heute den Höhepunkt: bewusst.",
"es": "Hoy disfruta el momento de la cima, conscientemente.",
"fr": "Aujourd'hui, savoure le moment d'apogée: consciemment.",
"ja": "今日は頂点の瞬間を味わおう 、 意識して。",
"pt": "Hoje aproveite o momento do auge, conscientemente."
}
},
{
"id": "ic_56",
"number": 56,
"emoji": "☲☶",
"name": {
"tr": "Lǚ: Gezgin",
"en": "Lǚ: The Wanderer",
"de": "Lǚ: Der Wanderer",
"es": "Lǚ: El Andariego",
"fr": "Lǚ: Le Voyageur",
"ja": "旅 (Lǚ) 、 旅人",
"pt": "Lǚ: O Andarilho"
},
"essence": {
"tr": "Gezgin gibi yaşamak: hiçbir yere bağlı kalmadan.",
"en": "Living like a traveller: staying bound to no place.",
"de": "Wie ein Reisender leben: an keinen Ort gebunden bleiben.",
"es": "Vivir como un viajero: sin quedar atado a ningún lugar.",
"fr": "Vivre comme un voyageur: sans rester attaché à aucun lieu.",
"ja": "旅人のように生きる 、 どの場所にも縛られずに。",
"pt": "Viver como um viajante: sem ficar preso a lugar nenhum."
},
"advice": {
"tr": "Bugün bir yerde 'misafir' gibi davran: esneklik.",
"en": "Today behave like a 'guest' somewhere: flexibility.",
"de": "Verhalte dich heute irgendwo wie ein 'Gast': Flexibilität.",
"es": "Hoy compórtate como un 'huésped' en algún lugar: flexibilidad.",
"fr": "Aujourd'hui, comporte-toi comme un 'invité' quelque part: souplesse.",
"ja": "今日はどこかで『客人』のように振る舞おう 、 柔軟さ。",
"pt": "Hoje comporte-se como um 'hóspede' em algum lugar: flexibilidade."
}
},
{
"id": "ic_57",
"number": 57,
"emoji": "☴☴",
"name": {
"tr": "Xùn: Yumuşak Etki (Rüzgâr)",
"en": "Xùn: The Gentle (Wind)",
"de": "Xùn: Das Sanfte (Wind)",
"es": "Xùn: Lo Suave (Viento)",
"fr": "Xùn: Le Doux (Vent)",
"ja": "巽 (Xùn) 、 柔順なもの（風）",
"pt": "Xùn: O Suave (Vento)"
},
"essence": {
"tr": "Rüzgar gibi nazik ama sürekli, büyük dağı bile aşındırır.",
"en": "Like the wind, gentle but continuous, even a great mountain wears down.",
"de": "Wie der Wind, sanft, aber beständig, selbst ein großer Berg wird abgetragen.",
"es": "Como el viento, suave pero continuo, hasta una gran montaña se desgasta.",
"fr": "Comme le vent, doux mais continu, même une grande montagne s'use.",
"ja": "風のように、柔らかいが絶え間ない 、 大きな山さえ削られる。",
"pt": "Como o vento, suave mas contínuo, até uma grande montanha se desgasta."
},
"advice": {
"tr": "Bugün yumuşak ama sürekli ol, sertlik gerekmez.",
"en": "Today be gentle but continuous, no hardness needed.",
"de": "Sei heute sanft, aber beständig, keine Härte nötig.",
"es": "Hoy sé suave pero continuo, no hace falta dureza.",
"fr": "Aujourd'hui, sois doux mais continu, pas besoin de dureté.",
"ja": "今日は柔らかく、しかし絶え間なくあろう 、 硬さは要らない。",
"pt": "Hoje seja suave mas contínuo, não é preciso dureza."
}
},
{
"id": "ic_58",
"number": 58,
"emoji": "☱☱",
"name": {
"tr": "Duì: Sevinç (Göl)",
"en": "Duì: Joyous (Lake)",
"de": "Duì: Das Heitere (See)",
"es": "Duì: Lo Sereno (Lago)",
"fr": "Duì: Le Joyeux (Lac)",
"ja": "兌 (Duì) 、 喜び（沢）",
"pt": "Duì: O Sereno (Lago)"
},
"essence": {
"tr": "Çift göl: sevinç paylaşıldığında çoğalır.",
"en": "Double lake: joy multiplies when shared.",
"de": "Doppelter See: Freude vervielfacht sich, wenn sie geteilt wird.",
"es": "Doble lago: la alegría se multiplica al compartirse.",
"fr": "Double lac: la joie se multiplie quand on la partage.",
"ja": "二重の沢 、 喜びは分かち合うと増える。",
"pt": "Lago duplo: a alegria se multiplica quando compartilhada."
},
"advice": {
"tr": "Bugün bir sevinci paylaş: bir kişiyle.",
"en": "Today share a joy: with one person.",
"de": "Teile heute eine Freude: mit einer Person.",
"es": "Hoy comparte una alegría: con una persona.",
"fr": "Aujourd'hui, partage une joie, avec une personne.",
"ja": "今日は喜びを分かち合おう 、 一人と。",
"pt": "Hoje compartilhe uma alegria: com uma pessoa."
}
},
{
"id": "ic_59",
"number": 59,
"emoji": "☴☵",
"name": {
"tr": "Huàn: Dağılma",
"en": "Huàn: Dispersion",
"de": "Huàn: Die Auflösung",
"es": "Huàn: La Disolución",
"fr": "Huàn: La Dissolution",
"ja": "渙 (Huàn) 、 散解",
"pt": "Huàn: A Dissolução"
},
"essence": {
"tr": "Sertlik eridi: yeniden akış başlıyor.",
"en": "Hardness melted: flow begins again.",
"de": "Härte geschmolzen: der Fluss beginnt wieder.",
"es": "La dureza derretida: el flujo vuelve a empezar.",
"fr": "La dureté fondue: le flux recommence.",
"ja": "硬さが溶ける 、 流れがふたたび始まる。",
"pt": "A dureza derretida: o fluxo começa de novo."
},
"advice": {
"tr": "Bugün bir 'sertliği' yumuşat: kendine ya da başkasına.",
"en": "Today soften a 'hardness': toward yourself or another.",
"de": "Mildere heute eine 'Härte': dir selbst oder einem anderen gegenüber.",
"es": "Hoy suaviza una 'dureza': hacia ti mismo o hacia otro.",
"fr": "Aujourd'hui, adoucis une 'dureté': envers toi-même ou un autre.",
"ja": "今日は一つの『硬さ』を和らげよう 、 自分自身か、他者に対して。",
"pt": "Hoje suavize uma 'dureza': em relação a si mesmo ou a outro."
}
},
{
"id": "ic_60",
"number": 60,
"emoji": "☵☱",
"name": {
"tr": "Jié: Sınırlama",
"en": "Jié: Limitation",
"de": "Jié: Die Beschränkung",
"es": "Jié: La Restricción",
"fr": "Jié: La Limitation",
"ja": "節 (Jié) 、 制限",
"pt": "Jié: A Restrição"
},
"essence": {
"tr": "Sınırlar olmadan akış olamaz: düzenli sınırlama.",
"en": "Without boundaries there is no flow, regular limitation.",
"de": "Ohne Grenzen gibt es keinen Fluss, geregelte Beschränkung.",
"es": "Sin límites no hay flujo, restricción regular.",
"fr": "Sans limites, il n'y a pas de flux, limitation régulière.",
"ja": "境界なくして流れはない 、 規則正しい制限。",
"pt": "Sem limites não há fluxo, restrição regular."
},
"advice": {
"tr": "Bugün bir alanda net sınır koy, yeme, harcama, zaman.",
"en": "Today set a clear boundary in an area, eating, spending, time.",
"de": "Setze heute in einem Bereich eine klare Grenze, Essen, Ausgaben, Zeit.",
"es": "Hoy pon un límite claro en un área, comer, gastar, tiempo.",
"fr": "Aujourd'hui, fixe une limite claire dans un domaine, manger, dépenser, temps.",
"ja": "今日はある領域に明確な境界を設けよう 、 食、支出、時間。",
"pt": "Hoje estabeleça um limite claro numa área, comer, gastar, tempo."
}
},
{
"id": "ic_61",
"number": 61,
"emoji": "☴☱",
"name": {
"tr": "Zhōng Fú: İçsel Doğruluk",
"en": "Zhōng Fú: Inner Truth",
"de": "Zhōng Fú: Innere Wahrheit",
"es": "Zhōng Fú: La Verdad Interior",
"fr": "Zhōng Fú: La Vérité Intérieure",
"ja": "中孚 (Zhōng Fú) 、 内なる真実",
"pt": "Zhōng Fú: A Verdade Interior"
},
"essence": {
"tr": "İçsel doğruluk: söz ve eylemin hizalanması.",
"en": "Inner truth: alignment of word and action.",
"de": "Innere Wahrheit: Übereinstimmung von Wort und Tat.",
"es": "Verdad interior: alineación de palabra y acción.",
"fr": "Vérité intérieure: alignement de la parole et de l'acte.",
"ja": "内なる真実 、 言葉と行いの一致。",
"pt": "Verdade interior: alinhamento de palavra e ação."
},
"advice": {
"tr": "Bugün söylediğin bir sözü gerçekten yap. Hizala.",
"en": "Today actually do something you said. Align.",
"de": "Tue heute tatsächlich etwas, das du gesagt hast. Bring es in Einklang.",
"es": "Hoy haz de verdad algo que dijiste. Alinéate.",
"fr": "Aujourd'hui, fais vraiment quelque chose que tu as dit. Aligne-toi.",
"ja": "今日は言ったことを実際に行おう。一致させよ。",
"pt": "Hoje faça de fato algo que você disse. Alinhe-se."
}
},
{
"id": "ic_62",
"number": 62,
"emoji": "☳☶",
"name": {
"tr": "Xiǎo Guò: Küçük Aşırılık",
"en": "Xiǎo Guò: Preponderance of the Small",
"de": "Xiǎo Guò: Das Übergewicht des Kleinen",
"es": "Xiǎo Guò: La Preponderancia de lo Pequeño",
"fr": "Xiǎo Guò: La Prépondérance du Petit",
"ja": "小過 (Xiǎo Guò) 、 小さきものの過剰",
"pt": "Xiǎo Guò: A Preponderância do Pequeno"
},
"essence": {
"tr": "Şu an büyüklük zamanı değil, küçük detaylara dikkat.",
"en": "Not the time for grandeur, attention to small details.",
"de": "Nicht die Zeit für Großes, Aufmerksamkeit für kleine Details.",
"es": "No es tiempo de grandeza, atención a los pequeños detalles.",
"fr": "Ce n'est pas le temps de la grandeur, attention aux petits détails.",
"ja": "壮大さの時ではない 、 小さな細部への注意。",
"pt": "Não é hora de grandeza, atenção aos pequenos detalhes."
},
"advice": {
"tr": "Bugün küçük bir detayı düzelt, büyük plan değil.",
"en": "Today fix a small detail, not a big plan.",
"de": "Bring heute ein kleines Detail in Ordnung, keinen großen Plan.",
"es": "Hoy arregla un pequeño detalle, no un gran plan.",
"fr": "Aujourd'hui, arrange un petit détail, pas un grand plan.",
"ja": "今日は小さな細部を直そう 、 大きな計画ではなく。",
"pt": "Hoje conserte um pequeno detalhe, não um grande plano."
}
},
{
"id": "ic_63",
"number": 63,
"emoji": "☵☲",
"name": {
"tr": "Jì Jì: Tamamlandı",
"en": "Jì Jì: After Completion",
"de": "Jì Jì: Nach der Vollendung",
"es": "Jì Jì: Después de la Consumación",
"fr": "Jì Jì: Après l'Achèvement",
"ja": "既済 (Jì Jì) 、 完成のあと",
"pt": "Jì Jì: Depois da Consumação"
},
"essence": {
"tr": "Bir döngü tamam: ama yeni dönüşüme hazırlanmak gerek.",
"en": "A cycle is complete: but prepare for new transformation.",
"de": "Ein Kreislauf ist vollendet: aber bereite dich auf neue Verwandlung vor.",
"es": "Un ciclo está completo: pero prepárate para una nueva transformación.",
"fr": "Un cycle est achevé: mais prépare-toi à une nouvelle transformation.",
"ja": "一つの循環が完成した 、 だが新たな変容に備えよ。",
"pt": "Um ciclo está completo: mas prepare-se para uma nova transformação."
},
"advice": {
"tr": "Bugün bir tamamlamayı kutla: ama uyuyup kalma.",
"en": "Today celebrate a completion: but don't fall asleep.",
"de": "Feiere heute eine Vollendung: aber schlafe nicht ein.",
"es": "Hoy celebra una culminación: pero no te duermas.",
"fr": "Aujourd'hui, célèbre un achèvement, mais ne t'endors pas.",
"ja": "今日は一つの完成を祝おう 、 だが眠り込むな。",
"pt": "Hoje celebre uma conclusão: mas não adormeça."
}
},
{
"id": "ic_64",
"number": 64,
"emoji": "☲☵",
"name": {
"tr": "Wèi Jì: Henüz Tamamlanmadı",
"en": "Wèi Jì: Before Completion",
"de": "Wèi Jì: Vor der Vollendung",
"es": "Wèi Jì: Antes de la Consumación",
"fr": "Wèi Jì: Avant l'Achèvement",
"ja": "未済 (Wèi Jì) 、 完成の前",
"pt": "Wèi Jì: Antes da Consumação"
},
"essence": {
"tr": "Tamama az kaldı: ama henüz değil. Dikkat ve sabır.",
"en": "Almost complete: but not yet. Caution and patience.",
"de": "Fast vollendet: aber noch nicht. Vorsicht und Geduld.",
"es": "Casi completo: pero todavía no. Cautela y paciencia.",
"fr": "Presque achevé: mais pas encore. Prudence et patience.",
"ja": "ほぼ完成 、 だがまだ。慎重さと忍耐を。",
"pt": "Quase completo: mas ainda não. Cautela e paciência."
},
"advice": {
"tr": "Bugün bir konuyu sonuna kadar götür, yarım bırakma.",
"en": "Today take a matter to the end, don't leave half done.",
"de": "Bring heute eine Sache zu Ende, lass sie nicht halb getan.",
"es": "Hoy lleva un asunto hasta el final, no lo dejes a medias.",
"fr": "Aujourd'hui, mène une affaire jusqu'au bout: ne la laisse pas à moitié faite.",
"ja": "今日は一つの事を最後までやり遂げよう 、 中途で放り出すな。",
"pt": "Hoje leve um assunto até o fim, não o deixe pela metade."
}
}
];
