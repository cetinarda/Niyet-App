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
    'Patience energy is high. Don\'t rush: the timing is perfect.',
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

const THEMES: Record<number, string> = {
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

const WEEKLY_MESSAGES_DE: Record<number, string[]> = {
  1: [
    'Vertraue diese Woche deinem Gespür für Führung. Die richtige Zeit, ein neues Projekt zu beginnen.',
    'Geh eigenständige Schritte. Du bestimmst deinen Weg selbst.',
    'Die Energie des Mutes ist hoch. Beginne diese Woche, was du aufgeschoben hast.',
    'Teile deine eigenen Ideen. Dein Vorangehen inspiriert.',
  ],
  2: [
    'Schenke deinen Beziehungen diese Woche Aufmerksamkeit. Zuhören stärkt dich.',
    'Hör auf deine Intuition. Dein Inneres zeigt dir den Weg.',
    'Geh deinen Weg in Zusammenarbeit und Einklang. Gemeinsam bist du stark.',
    'Die Energie der Geduld ist hoch. Keine Eile, das Timing ist genau richtig.',
  ],
  3: [
    'Bring diese Woche deine Kreativität zum Ausdruck. Eine wunderbare Zeit für künstlerische Projekte.',
    'Teile deine Freude. Du verbreitest Licht um dich herum.',
    'Deine Energie für neue Ideen und Projekte ist stark.',
    'Erhebe deine Stimme. Deine Worte haben diese Woche besondere Kraft.',
  ],
  4: [
    'Konzentriere dich diese Woche auf Ordnung. Zeit, deine Pläne umzusetzen.',
    'Geh mit Geduld und Entschlossenheit voran. Du legst ein festes Fundament.',
    'Mach praktische Schritte. Jeder kleine Schritt führt zum großen Ziel.',
    'Die Energie der Disziplin ist hoch. Deine Routinen tragen dich.',
  ],
  5: [
    'Sei diese Woche offen für neue Erfahrungen. Wandel steht vor deiner Tür.',
    'Die Energie von Abenteuer und Neugier ist hoch. Hab keine Angst, Neues zu entdecken.',
    'Durchbrich die Routine. Probier einen anderen Weg.',
    'Spüre deine Freiheit. Zeit, deine Grenzen zu erweitern.',
  ],
  6: [
    'Nimm dir diese Woche Zeit für die Menschen, die du liebst. Die Energie der Liebe ist hoch.',
    'Geh mit Fürsorge und Mitgefühl voran. Für andere da zu sein stärkt dich.',
    'Zuhause und Familie stehen im Mittelpunkt. Schaffe einen geschützten Raum.',
    'Wenn du Harmonie und Gleichgewicht suchst, vertraue der Antwort, die aus deinem Inneren kommt.',
  ],
  7: [
    'Wende dich diese Woche nach innen. Die Energie von Stille und Meditation ist hoch.',
    'Stell tiefe Fragen. Die Antworten liegen in dir verborgen.',
    'Eine wunderbare Woche zum Forschen und Lernen.',
    'Das Alleinsein ist fruchtbar. Eine ideale Zeit für spirituelle Arbeit.',
  ],
  8: [
    'Vertraue diese Woche deiner Kraft. Richte den Blick auf große Ziele.',
    'Du suchst das Gleichgewicht zwischen Materiellem und Spirituellem. Beides ist wichtig.',
    'Die Energie der Führung ist hoch. Die richtige Zeit, Entscheidungen zu treffen.',
    'Die Energie der Wandlung ist aktiv. Lass alte Muster los.',
  ],
  9: [
    'Diese Woche trägt die Energie des Abschließens. Zeit, Unerledigtes zu vollenden.',
    'Die Energie von Barmherzigkeit und Vergebung ist hoch. Loslassen macht frei.',
    'Schau aus einem universellen Blickwinkel. Du siehst das große Ganze.',
    'Zeit des Dienens und Beitragens. Was du gibst, kommt vielfach zurück.',
  ],
  11: [
    'Deine Intuition ist diese Woche scharf. Achte auf Momente der Inspiration.',
    'Spirituelle Botschaften erreichen dich. Versuche, sie in der Stille zu hören.',
    'Deine erhellende Energie inspiriert andere.',
    'Ein Ruf nach höherem Bewusstsein ist da. Schaffe Raum für deine spirituelle Praxis.',
  ],
  22: [
    'Werde diese Woche für große Visionen aktiv.',
    'Zeit, deine Träume greifbar zu machen. Mach praktische Schritte.',
    'Die Energie des Aufbauens ist stark. Jeder Schritt hat Bestand.',
    'Führung und Vision vereint. Du stößt große Veränderungen an.',
  ],
};

const WEEKLY_MESSAGES_ES: Record<number, string[]> = {
  1: [
    'Esta semana confía en tu instinto de liderazgo. Es el momento de empezar un proyecto nuevo.',
    'Da pasos por tu cuenta. Eres tú quien marca tu camino.',
    'La energía del valor está alta. Empieza esta semana lo que has ido posponiendo.',
    'Comparte tus ideas propias. Tu forma de abrir camino inspira.',
  ],
  2: [
    'Esta semana cuida tus relaciones. Escuchar te fortalece.',
    'Escucha tu intuición. Tu interior te está mostrando el camino.',
    'Avanza en cooperación y armonía. En compañía eres más fuerte.',
    'La energía de la paciencia está alta. No te apresures, el momento es perfecto.',
  ],
  3: [
    'Esta semana expresa tu creatividad. Un momento perfecto para proyectos artísticos.',
    'Comparte tu alegría. Esparces luz a tu alrededor.',
    'Tu energía para nuevas ideas y proyectos es fuerte.',
    'Alza la voz. Tus palabras tienen especial fuerza esta semana.',
  ],
  4: [
    'Esta semana céntrate en el orden. Es hora de llevar tus planes a la práctica.',
    'Avanza con paciencia y determinación. Estás poniendo cimientos sólidos.',
    'Da pasos prácticos. Cada pequeño paso te acerca a la gran meta.',
    'La energía de la disciplina está alta. Tus rutinas te sostienen.',
  ],
  5: [
    'Esta semana ábrete a nuevas experiencias. El cambio llama a tu puerta.',
    'La energía de la aventura y la curiosidad está alta. No temas explorar.',
    'Rompe la rutina. Prueba un camino distinto.',
    'Siente tu libertad. Es hora de ampliar tus límites.',
  ],
  6: [
    'Esta semana dedica tiempo a tus seres queridos. La energía del amor está alta.',
    'Avanza con cuidado y compasión. Servir a otros te fortalece.',
    'El hogar y la familia son tu centro. Crea un espacio seguro.',
    'Si buscas armonía y equilibrio, confía en la respuesta que nace de tu interior.',
  ],
  7: [
    'Esta semana vuelve hacia dentro. La energía del silencio y la meditación está alta.',
    'Hazte preguntas profundas. Las respuestas están escondidas dentro de ti.',
    'Una semana perfecta para investigar y aprender.',
    'La soledad es fértil. Momento ideal para el trabajo espiritual.',
  ],
  8: [
    'Esta semana confía en tu fuerza. Céntrate en las grandes metas.',
    'Buscas equilibrio entre lo material y lo espiritual. Ambos importan.',
    'La energía del liderazgo está alta. Es el momento de tomar decisiones.',
    'La energía de la transformación está activa. Suelta los viejos patrones.',
  ],
  9: [
    'Esta semana hay energía de cierre. Es hora de terminar lo que quedó pendiente.',
    'La energía de la misericordia y el perdón está alta. Soltar libera.',
    'Mira desde una perspectiva universal. Ves el panorama completo.',
    'Tiempo de servir y aportar. Lo que das vuelve multiplicado.',
  ],
  11: [
    'Esta semana tu intuición está afilada. Presta atención a los momentos de inspiración.',
    'Llegan mensajes espirituales. Intenta escucharlos en el silencio.',
    'Tu energía luminosa inspira a los demás.',
    'Hay una llamada a una conciencia más elevada. Abre espacio a tu práctica espiritual.',
  ],
  22: [
    'Esta semana ponte en marcha por tus grandes visiones.',
    'Es hora de dar forma concreta a tus sueños. Da pasos prácticos.',
    'La energía de construir es fuerte. Cada paso perdura.',
    'Liderazgo y visión unidos. Estás iniciando grandes cambios.',
  ],
};

const WEEKLY_MESSAGES_PT: Record<number, string[]> = {
  1: [
    'Esta semana confia no teu instinto de liderança. É o momento certo para começar um novo projeto.',
    'Dá passos por conta própria. És tu quem traça o teu caminho.',
    'A energia da coragem está alta. Começa esta semana aquilo que tens adiado.',
    'Partilha as tuas ideias originais. A tua forma de abrir caminho inspira.',
  ],
  2: [
    'Esta semana cuida das tuas relações. Escutar fortalece-te.',
    'Ouve a tua intuição. O teu interior está a mostrar-te o caminho.',
    'Avança em cooperação e harmonia. Em conjunto és mais forte.',
    'A energia da paciência está alta. Não te apresses, o momento é perfeito.',
  ],
  3: [
    'Esta semana expressa a tua criatividade. Um momento perfeito para projetos artísticos.',
    'Partilha a tua alegria. Espalhas luz à tua volta.',
    'A tua energia para novas ideias e projetos é forte.',
    'Levanta a voz. As tuas palavras têm uma força especial esta semana.',
  ],
  4: [
    'Esta semana foca-te na ordem. É hora de pôr os teus planos em prática.',
    'Avança com paciência e determinação. Estás a lançar alicerces sólidos.',
    'Dá passos práticos. Cada pequeno passo leva-te ao grande objetivo.',
    'A energia da disciplina está alta. As tuas rotinas apoiam-te.',
  ],
  5: [
    'Esta semana abre-te a novas experiências. A mudança está à tua porta.',
    'A energia da aventura e da curiosidade está alta. Não tenhas medo de explorar.',
    'Quebra a rotina. Experimenta um caminho diferente.',
    'Sente a tua liberdade. É hora de alargar os teus limites.',
  ],
  6: [
    'Esta semana dedica tempo a quem amas. A energia do amor está alta.',
    'Avança com cuidado e compaixão. Servir os outros fortalece-te.',
    'A casa e a família são o teu foco. Cria um espaço seguro.',
    'Se procuras harmonia e equilíbrio, confia na resposta que vem de dentro de ti.',
  ],
  7: [
    'Esta semana volta-te para dentro. A energia do silêncio e da meditação está alta.',
    'Faz perguntas profundas. As respostas estão escondidas dentro de ti.',
    'Uma semana perfeita para pesquisar e aprender.',
    'A solidão é fértil. Momento ideal para o trabalho espiritual.',
  ],
  8: [
    'Esta semana confia na tua força. Foca-te nos grandes objetivos.',
    'Procuras o equilíbrio entre o material e o espiritual. Ambos importam.',
    'A energia da liderança está alta. É o momento certo para tomar decisões.',
    'A energia da transformação está ativa. Larga os velhos padrões.',
  ],
  9: [
    'Esta semana há energia de conclusão. É hora de fechar o que ficou por terminar.',
    'A energia da misericórdia e do perdão está alta. Deixar ir liberta.',
    'Olha a partir de uma perspetiva universal. Vês o quadro completo.',
    'Tempo de servir e contribuir. O que dás regressa multiplicado.',
  ],
  11: [
    'Esta semana a tua intuição está apurada. Presta atenção aos momentos de inspiração.',
    'Estão a chegar mensagens espirituais. Tenta ouvi-las no silêncio.',
    'A tua energia luminosa inspira os outros.',
    'Há um chamamento para uma consciência mais elevada. Abre espaço para a tua prática espiritual.',
  ],
  22: [
    'Esta semana põe-te em movimento pelas tuas grandes visões.',
    'É hora de dar forma concreta aos teus sonhos. Dá passos práticos.',
    'A energia de construir é forte. Cada passo é duradouro.',
    'Liderança e visão juntas. Estás a dar início a grandes mudanças.',
  ],
};

const WEEKLY_MESSAGES_FR: Record<number, string[]> = {
  1: [
    "Cette semaine, fais confiance à ton sens du leadership. C'est le bon moment pour lancer un nouveau projet.",
    "Fais des pas en toute indépendance. Tu traces toi-même ton chemin.",
    "L'énergie du courage est forte. Commence cette semaine ce que tu as remis à plus tard.",
    "Partage tes idées originales. Ta façon d'ouvrir la voie inspire.",
  ],
  2: [
    "Cette semaine, prends soin de tes relations. Écouter te renforce.",
    "Écoute ton intuition. Ton être intérieur te montre le chemin.",
    "Avance dans la coopération et l'harmonie. À plusieurs, ta force grandit.",
    "L'énergie de la patience est forte. Ne te presse pas, le moment est parfait.",
  ],
  3: [
    "Cette semaine, exprime ta créativité. Un moment parfait pour des projets artistiques.",
    "Partage ta joie. Tu répands de la lumière autour de toi.",
    "Ton énergie pour les nouvelles idées et les nouveaux projets est forte.",
    "Fais entendre ta voix. Tes mots sont particulièrement puissants cette semaine.",
  ],
  4: [
    "Cette semaine, concentre-toi sur l'ordre. C'est le moment de concrétiser tes plans.",
    "Avance avec patience et détermination. Tu poses des bases solides.",
    "Fais des pas concrets. Chaque petit pas mène au grand objectif.",
    "L'énergie de la discipline est forte. Tes routines te soutiennent.",
  ],
  5: [
    "Cette semaine, ouvre-toi à de nouvelles expériences. Le changement frappe à ta porte.",
    "L'énergie de l'aventure et de la curiosité est forte. N'aie pas peur d'explorer.",
    "Brise la routine. Essaie un autre chemin.",
    "Ressens ta liberté. C'est le moment d'élargir tes limites.",
  ],
  6: [
    "Cette semaine, consacre du temps à ceux que tu aimes. L'énergie de l'amour est forte.",
    "Avance avec attention et compassion. Prendre soin des autres te renforce.",
    "La maison et la famille sont au centre. Crée un espace sûr.",
    "Si tu cherches l'harmonie et l'équilibre, fais confiance à la réponse qui vient de l'intérieur.",
  ],
  7: [
    "Cette semaine, tourne-toi vers l'intérieur. L'énergie du silence et de la méditation est forte.",
    "Pose-toi des questions profondes. Les réponses sont cachées en toi.",
    "Une semaine parfaite pour chercher et apprendre.",
    "La solitude est féconde. Moment idéal pour le travail spirituel.",
  ],
  8: [
    "Cette semaine, fais confiance à ta force. Concentre-toi sur les grands objectifs.",
    "Tu cherches l'équilibre entre le matériel et le spirituel. Les deux comptent.",
    "L'énergie du leadership est forte. C'est le bon moment pour prendre des décisions.",
    "L'énergie de transformation est active. Laisse partir les vieux schémas.",
  ],
  9: [
    "Cette semaine porte une énergie d'achèvement. C'est le moment de clore ce qui est resté inachevé.",
    "L'énergie de la miséricorde et du pardon est forte. Lâcher prise libère.",
    "Regarde avec un point de vue universel. Tu vois la situation dans son ensemble.",
    "Temps du service et de la contribution. Ce que tu donnes te revient au centuple.",
  ],
  11: [
    "Cette semaine, ton intuition est aiguisée. Reste à l'écoute des moments d'inspiration.",
    "Des messages spirituels arrivent. Essaie de les entendre dans le silence.",
    "Ton énergie lumineuse inspire les autres.",
    "Un appel vers une conscience plus haute se fait sentir. Fais de la place à ta pratique spirituelle.",
  ],
  22: [
    "Cette semaine, passe à l'action pour tes grandes visions.",
    "C'est le moment de concrétiser tes rêves. Fais des pas concrets.",
    "L'énergie de construction est forte. Chaque pas est durable.",
    "Leadership et vision réunis. Tu amorces de grands changements.",
  ],
};

const WEEKLY_MESSAGES_JA: Record<number, string[]> = {
  1: [
    '今週はリーダーとしての直感を信じて。新しいことを始めるのにふさわしい時です。',
    '自分の足で一歩を踏み出して。あなたの道を決めるのはあなた自身です。',
    '勇気のエネルギーが高まっています。先延ばしにしてきたことを今週始めてみて。',
    'あなたらしいアイデアを分かち合って。先頭に立つ姿が周りに力を与えます。',
  ],
  2: [
    '今週は人とのつながりを大切に。耳を傾けることがあなたを強くします。',
    '直感に耳を傾けて。内なる声が道を示してくれます。',
    '協力と調和の中で進みましょう。誰かと共にいるとき、あなたは強くなります。',
    '忍耐のエネルギーが高まっています。焦らないで、タイミングは完璧です。',
  ],
  3: [
    '今週は創造性を表現して。芸術的な取り組みにぴったりの時です。',
    '喜びを分かち合って。あなたは周りに光を届けています。',
    '新しいアイデアや取り組みへのエネルギーが力強く流れています。',
    '声を上げてみて。今週はあなたの言葉に特別な力が宿ります。',
  ],
  4: [
    '今週は整えることに意識を向けて。計画を形にする時です。',
    '忍耐と決意をもって進みましょう。あなたは確かな土台を築いています。',
    '実践的な一歩を踏み出して。小さな一歩の積み重ねが大きな目標へと導きます。',
    '規律のエネルギーが高まっています。日々の習慣があなたを支えています。',
  ],
  5: [
    '今週は新しい経験に心を開いて。変化はすぐそこまで来ています。',
    '冒険と好奇心のエネルギーが高まっています。探求することを恐れないで。',
    'いつもの流れを崩してみて。違う道を試してみましょう。',
    '自由を感じて。自分の枠を広げる時です。',
  ],
  6: [
    '今週は大切な人との時間をつくって。愛のエネルギーが高まっています。',
    '思いやりと慈しみをもって進みましょう。人に尽くすことがあなたを強くします。',
    '家と家族が今週の中心です。安心できる場所をつくりましょう。',
    '調和とバランスを求めているなら、内側から湧いてくる答えを信じて。',
  ],
  7: [
    '今週は内側に目を向けて。静けさと瞑想のエネルギーが高まっています。',
    '深い問いを投げかけて。答えはあなたの内に隠れています。',
    '探求と学びにぴったりの一週間です。',
    'ひとりの時間が実りをもたらします。心の探求に理想的な時です。',
  ],
  8: [
    '今週は自分の力を信じて。大きな目標に意識を向けましょう。',
    '物質と精神のバランスを求めています。どちらも大切です。',
    'リーダーシップのエネルギーが高まっています。決断を下すのにふさわしい時です。',
    '変容のエネルギーが動いています。古いパターンを手放して。',
  ],
  9: [
    '今週は完結のエネルギーがあります。やり残したことを終わらせる時です。',
    '慈悲と許しのエネルギーが高まっています。手放すことが心を自由にします。',
    '広い視野から眺めてみて。あなたには全体像が見えています。',
    '与え、貢献する時です。差し出したものは何倍にもなって返ってきます。',
  ],
  11: [
    '今週は直感が冴えています。ひらめきの瞬間に気づいて。',
    '心へのメッセージが届いています。静けさの中で耳を澄ませてみて。',
    'あなたの照らすエネルギーが、周りの人に力を与えています。',
    'より高い意識への呼びかけがあります。心の実践のための余白をつくって。',
  ],
  22: [
    '今週は大きなビジョンに向けて動き出して。',
    '夢を形にする時です。実践的な一歩を踏み出しましょう。',
    '築き上げるエネルギーが力強く流れています。一歩一歩が確かに残ります。',
    'リーダーシップとビジョンがひとつに。あなたは大きな変化を始めています。',
  ],
};

const THEMES_DE: Record<number, string> = {
  1: 'Anfang und Führung', 2: 'Gleichgewicht und Zusammenarbeit', 3: 'Kreativität und Ausdruck',
  4: 'Struktur und Disziplin', 5: 'Freiheit und Wandel', 6: 'Liebe und Verantwortung',
  7: 'Innenwelt und Tiefe', 8: 'Kraft und Wandlung', 9: 'Vollendung und Barmherzigkeit',
  11: 'Intuition und Erleuchtung', 22: 'Großes Werk und Vision',
};

const THEMES_ES: Record<number, string> = {
  1: 'Comienzo y liderazgo', 2: 'Equilibrio y cooperación', 3: 'Creatividad y expresión',
  4: 'Estructura y disciplina', 5: 'Libertad y cambio', 6: 'Amor y responsabilidad',
  7: 'Mundo interior y profundidad', 8: 'Poder y transformación', 9: 'Culminación y misericordia',
  11: 'Intuición e iluminación', 22: 'Gran obra y visión',
};

const THEMES_PT: Record<number, string> = {
  1: 'Início e liderança', 2: 'Equilíbrio e cooperação', 3: 'Criatividade e expressão',
  4: 'Estrutura e disciplina', 5: 'Liberdade e mudança', 6: 'Amor e responsabilidade',
  7: 'Mundo interior e profundidade', 8: 'Poder e transformação', 9: 'Conclusão e misericórdia',
  11: 'Intuição e iluminação', 22: 'Grande obra e visão',
};

const THEMES_FR: Record<number, string> = {
  1: 'Commencement et leadership', 2: 'Équilibre et coopération', 3: 'Créativité et expression',
  4: 'Structure et discipline', 5: 'Liberté et changement', 6: 'Amour et responsabilité',
  7: 'Monde intérieur et profondeur', 8: 'Puissance et transformation', 9: 'Achèvement et miséricorde',
  11: 'Intuition et éveil', 22: 'Grande œuvre et vision',
};

const THEMES_JA: Record<number, string> = {
  1: '始まりとリーダーシップ', 2: 'バランスと協力', 3: '創造性と表現',
  4: '構造と規律', 5: '自由と変化', 6: '愛と責任',
  7: '内なる世界と深み', 8: '力と変容', 9: '完結と慈悲',
  11: '直感と目覚め', 22: '大いなる構築とビジョン',
};

const WEEKLY_MESSAGES_BY_LANG: Record<string, Record<number, string[]>> = {
  tr: WEEKLY_MESSAGES,
  en: WEEKLY_MESSAGES_EN,
  de: WEEKLY_MESSAGES_DE,
  es: WEEKLY_MESSAGES_ES,
  pt: WEEKLY_MESSAGES_PT,
  fr: WEEKLY_MESSAGES_FR,
  ja: WEEKLY_MESSAGES_JA,
};

const THEMES_BY_LANG: Record<string, Record<number, string>> = {
  tr: THEMES,
  en: THEMES_EN,
  de: THEMES_DE,
  es: THEMES_ES,
  pt: THEMES_PT,
  fr: THEMES_FR,
  ja: THEMES_JA,
};

export interface WeeklyReading {
  theme: string;
  message: string;
  personalYear: number;
  weekNumber: number;
}

// Her dil kendi metnini alır; bilinmeyen dil ya da eksik anahtar İngilizceye düşer.
export function getWeeklyReading(nums: NumerologyProfile, lang: string = 'tr'): WeeklyReading {
  const week = getWeekNumber();
  const personalYear = getPersonalYear(nums.lifePath);
  const base = String(lang || 'tr').slice(0, 2).toLowerCase();
  const msgDict = WEEKLY_MESSAGES_BY_LANG[base] || WEEKLY_MESSAGES_EN;
  const themeDict = THEMES_BY_LANG[base] || THEMES_EN;
  const messages = msgDict[nums.lifePath] || WEEKLY_MESSAGES_EN[nums.lifePath] || msgDict[9];
  const message = messages[week % messages.length];

  return {
    theme: themeDict[nums.lifePath] || THEMES_EN[nums.lifePath] || themeDict[9],
    message,
    personalYear,
    weekNumber: week,
  };
}
