export const es = {
  common: {
    share: 'Compartir',
  },

  // ─── Tab bar ──────────────────────────────────────────────────────────────────
  tabs: {
    today: 'Hoy',
    animals: 'Animales',
    archive: 'Archivo',
    profile: 'Perfil',
  },

  // ─── Home screen ──────────────────────────────────────────────────────────────
  home: {
    greeting: {
      night: 'Noctámbulo',
      morning: 'Buenos días',
      afternoon: 'Buenas tardes',
      evening: 'Buenas noches',
    },
    defaultUser: 'Viajero',
    decks: {
      animal: {
        title: 'Animal',
        short: 'ANIMAL',
        subtitle: 'Escucha a tu compañero del alma',
      },
      quote: {
        title: 'Palabras',
        short: 'PALABRA',
        subtitle: 'De las tradiciones de sabiduría',
      },
    },
    tapHint: 'agita · toca',
    nextDeck: 'Siguiente mazo →',
    completed: 'Completado ✦',
    doneTitle: 'Guía diaria\ncompletada',
    doneSub: 'Mañana comienza un nuevo viaje',
    detailBtn: ': guía profunda →',
  },

  // ─── Animals hub ─────────────────────────────────────────────────────────────
  animalsHub: {
    eyebrow: 'SAKIN · ANIMAL',
    panels: {
      library: 'Animales',
      finder: 'Buscar',
      guidance: 'Guía',
    },
  },

  // ─── Animal library ───────────────────────────────────────────────────────────
  animalLibrary: {
    back: '← Atrás',
    familyTag: 'SAKIN · ANIMAL',
    subtitle: 'De Anatolia al mundo · {count} guías animales',
    searchPlaceholder: 'Busca por nombre, símbolo o elemento...',
    noResults: 'No se encontraron resultados.',
  },

  // ─── Animal detail ────────────────────────────────────────────────────────────
  animalDetail: {
    back: '← Atrás',
    familyTag: 'SAKIN · ANIMAL',
    sections: {
      anatolian: 'En Anatolia',
      world: 'En el Mundo',
      todayMessage: 'Lo que te dice hoy',
      guidance: 'GUÍA',
      jung: 'En palabras de Jung',
      dream: 'Verlo en sueños',
      traditions: 'En las tradiciones',
      myths: 'Leyendas',
      shadow: 'Lado de la sombra',
      whenAppears: 'Cuándo aparece',
      thisPractice: 'Práctica de esta semana',
      relatedMyth: 'Mito relacionado',
    },
    missingLore:
      'La guía más profunda de este animal se ampliará pronto.\nPor ahora lleva la voz de Anatolia y la lectura de hoy.',
    resonanceHint: 'Fuerza simbólica que resuena con este animal →',
    footer: 'FAMILIA SAKIN ✦',
  },

  // ─── Animal finder ────────────────────────────────────────────────────────────
  animalFinder: {
    headerTitle: 'Encuentra tu guía animal',
    intro: {
      title: 'Descubre tu animal espiritual',
      desc: 'Hay dos caminos para encontrar el animal tótem alineado con tu alma.',
      note: 'Sakin sostiene un espejo: refleja lo que ya está dentro de ti y susurra lo que es posible.\nSolo tú puedes despertarlo en tu corazón, sentirlo y hacerlo tuyo.',
      quizBtn: {
        title: 'Descubre con preguntas',
        desc: '7 preguntas, acordes a tu carácter',
      },
      birthBtn: {
        title: 'Encuentra por datos de nacimiento',
        desc: 'Tótem natal según fecha y hora',
      },
    },
    birth: {
      title: 'Introduce tus datos de nacimiento',
      desc: 'La estación, el año y la hora de tu nacimiento dan forma a tu animal tótem.',
      dateLabel: 'Fecha de nacimiento',
      dayPlaceholder: 'Día',
      monthPlaceholder: 'Mes',
      yearPlaceholder: 'Año',
      cityLabel: 'Ciudad de nacimiento',
      cityOptional: '(opcional)',
      cityPlaceholder: 'p. ej. Estambul, Madrid, México...',
      cityHint: 'La energía de tu lugar de nacimiento añade profundidad a la lectura.',
      hourLabel: 'Hora de nacimiento',
      hourOptional: '(opcional)',
      hourPlaceholder: 'Hora (0-23)',
      hourHint: 'Si no sabes la hora, déjalo en blanco: aun así se encontrará una fuerte coincidencia.',
      submitBtn: 'Encontrar mi guía ✦',
    },
    result: {
      label: 'Tu guía animal',
      rediscoverBtn: 'Redescubrir ✦',
      closeBtn: 'Cerrar ✦',
    },
    quiz: {
      hint: 'Si más de uno te llama, elígelos todos.',
      continueBtn: 'Continuar',
      questions: [
        {
          q: '¿Qué entorno de la naturaleza te llama?',
          options: [
            'Montañas y cielo abierto',
            'Bosque y tierra solitaria',
            'Ríos, mares, aguas profundas',
            'Llamas cálidas y fuego',
          ],
        },
        {
          q: '¿Cómo reaccionas al enfrentar una situación difícil?',
          options: [
            'Detente, observa, traza una estrategia',
            'Actúa con rapidez',
            'Reúne a quienes te rodean',
            'Retírate y busca fuerza interior',
          ],
        },
        {
          q: '¿Qué palabra te describe mejor?',
          options: ['Libre', 'Fuerte', 'Sabio', 'Amoroso'],
        },
        {
          q: '¿Qué papel asumes en un grupo?',
          options: [
            'Pionero y abridor de caminos',
            'Mediador y equilibrador',
            'Creativo e inspirador',
            'Observador y analista',
          ],
        },
        {
          q: '¿Cuál es tu mayor fortaleza?',
          options: [
            'Mis instintos y mi intuición',
            'Mi paciencia y mi resistencia',
            'Mi inteligencia y mi adaptabilidad',
            'Mi valentía y mi pasión',
          ],
        },
        {
          q: '¿Qué te hace sentir libertad en la vida?',
          options: [
            'Tomar decisiones independientes',
            'Estar a salvo con mis seres queridos',
            'Cambiar y transformarme',
            'Encontrar la verdad y profundizar',
          ],
        },
        {
          q: '¿Qué energía sientes más fuerte ahora mismo?',
          options: [
            'Movimiento y velocidad',
            'Silencio y observación',
            'Abundancia y comunidad',
            'Poder y transformación',
          ],
        },
      ],
    },
  },

  // ─── Nagual screen ────────────────────────────────────────────────────────────
  nagual: {
    back: '← Atrás',
    familyTag: 'SAKIN · NAGUAL',
    introTitle: 'Nagual: Guía periódico',
    introText:
      'Tu animal tótem nace contigo y permanece toda la vida. El nagual es un guía temporal\nque te acompaña durante un período específico. Llega en momentos de prueba,\ntransformación o crisis. Una vez cumplido su propósito, cede su lugar\na otro guía.',
    weekTag: 'ESTA SEMANA · UNIVERSAL',
    thisWeek: 'EN ESTE PERÍODO',
    daysLeft: 'Quedan {n} días',
    personalTag: 'MI GUÍA PERSONAL',
    guidance: 'GUÍA',
    locked: {
      title: 'Mi guía personal',
      text: 'Para determinar un animal guía periódico personalizado según tu carta natal,\ncompleta tu perfil.\n\nPuedes añadir tu fecha de nacimiento y tu elemento en Perfil → Mapa personal.',
    },
  },

  // ─── Archive screen ───────────────────────────────────────────────────────────
  archive: {
    title: 'Archivo',
    readingsCount: '{n} lecturas',
    spiritualMap: 'Mapa espiritual',
    reportLabels: {
      guide: 'Guía',
      stone: 'Piedra',
      animal: 'Animal',
      nagual: 'Nagual',
    },
    filters: {
      all: 'Todos',
      quote: 'Mensaje',
      stone: 'Piedra',
      animal: 'Animal',
      nagual: 'Nagual',
    },
    empty: {
      title: 'Aún no hay lecturas.',
      subtitle: 'Abre tu carta desde la pantalla de inicio.',
    },
  },

  // ─── Profile screen ───────────────────────────────────────────────────────────
  profile: {
    // Onboarding
    onboarding: {
      title: 'Bienvenido a Sakin Hayvan',
      subtitle: 'Guía diaria de la antigua tradición de Anatolia',
      step1Question: '¿Cuál es tu nombre, viajero?',
      step1Placeholder: 'Escribe tu nombre...',
      step2Question: '¿Con qué elemento te sientes más cercano?',
      step3Question: 'Para tu mapa personal',
      step3Hint: 'Numerología, Human Design y análisis de elementos.\nMás datos = lectura más potente.',
      fullNamePlaceholder: 'Nombre completo...',
      birthDateLabel: 'Fecha de nacimiento',
      dayPlaceholder: 'Día',
      monthPlaceholder: 'Mes',
      yearPlaceholder: 'Año',
      birthHourLabel: 'Hora de nacimiento',
      hourOptional: '(opcional · para HD)',
      hourPlaceholder: 'Hora',
      minutePlaceholder: 'Min',
      birthCityLabel: 'Ciudad de nacimiento',
      cityOptional: '(opcional)',
      cityPlaceholder: 'Estambul, Madrid...',
      continueBtn: 'Continuar →',
      startBtn: 'Comenzar el viaje ✦',
      skipBtn: 'Ahora no, omitir',
    },
    // Stats
    stats: {
      totalReadings: 'Lecturas totales',
      streak: 'Días seguidos',
      level: 'Nivel',
    },
    // Level
    levelProgress: 'Progreso de nivel',
    readingsProgress: '{current} / {next} lecturas',
    // Account
    account: {
      title: 'Cuenta',
      premiumLabel: 'Maestro ✦',
      freeLabel: 'Viajero gratuito',
      premiumRenewal: 'Renovación: {date}',
      premiumLifetime: 'De por vida',
      freeCta: 'Conviértete en Maestro para un análisis profundo',
      upgradeBtn: 'Hacerse Maestro ✦',
      cancelBtn: 'Cancelar',
      remindersLabel: 'Recordatorio diario',
      remindersSub: 'Recibe tu guía cada mañana a las 08:00',
      cloudBackup: 'Datos respaldados en la nube',
      signOutBtn: 'Cerrar sesión',
      licenseTitle: 'Clave de licencia',
      licensePlaceholder: 'XXXX-XXXX-XXXX',
      licenseApply: 'Aplicar',
      licenseSuccess: '¡Premium activado! Bienvenido a la familia Sakin.',
      licenseAlready: 'Premium ya está activo en esta cuenta.',
      licenseInvalid: 'Clave no válida o ya utilizada.',
      licenseNetwork: 'Error de conexión. Inténtalo de nuevo.',
      licenseSignInRequired: 'Inicia sesión en tu cuenta primero para aplicar una clave.',
      deleteLabel: 'Eliminar cuenta',
      deleteSub: 'Elimina permanentemente tu cuenta y todos los datos.',
      deleteBtn: 'Eliminar',
      deleteConfirmTitle: '¿Eliminar tu cuenta?',
      deleteConfirmMessage: 'Todas las lecturas, el archivo, el perfil y las estadísticas se borrarán permanentemente. Esto no se puede deshacer.',
      deleteConfirm: 'Sí, eliminar',
      deleteCancel: 'Cancelar',
    },
    // Personal Map
    personalMap: {
      title: 'Mapa personal',
      editBtn: '✎ Editar',
      lifePath: 'Camino de vida',
      expression: 'Expresión',
      soulUrge: 'Anhelo del alma',
      personality: 'Personalidad',
      humanDesign: 'Human Design',
      strategy: 'Estrategia',
      estimated: '(estimado)',
      hdTypeSelectHint: 'Selecciona tu tipo:',
      hdDisclaimer:
        '⚠ El cálculo es una estimación: un HD preciso requiere hora de nacimiento y efemérides.\nSi conoces tu tipo, selecciónalo arriba.',
      sunGates: 'Puertas solares',
      consciousSun: 'Sol consciente',
      designSun: 'Sol de diseño',
      gatesNote: 'Tipo estimado · Añade tu hora de nacimiento y selecciona ✎ para un resultado preciso',
      notSelf: 'Tema del No-Yo',
      weeklyReading: 'Guía semanal',
      weeklyThisWeek: 'Lectura personalizada para esta semana',
      weeklyMeta: 'Guía semanal · Semana {week}',
      personalYear: 'Año personal: {year}',
      unlock: {
        title: 'Abre tu mapa personal',
        desc: 'Introduce tu nombre completo y tu fecha de nacimiento.\nNumerología, Human Design y análisis semanal.',
      },
      birthForm: {
        title: 'Datos de la carta natal',
        hint: 'La hora y la ciudad son necesarias para los cálculos de Human Design.',
        fullNamePlaceholder: 'Nombre completo (para numerología)',
        dateLabel: 'Fecha de nacimiento',
        dayPlaceholder: 'Día',
        monthPlaceholder: 'Mes',
        yearPlaceholder: 'Año',
        hourLabel: 'Hora de nacimiento',
        hourOptional: '(importante para HD)',
        hourPlaceholder: 'Hora (0-23)',
        minutePlaceholder: 'Minuto',
        cityLabel: 'Ciudad de nacimiento',
        cityOptional: '(para la zona horaria)',
        cityPlaceholder: 'Estambul, Madrid, México...',
        saveBtn: 'Crear mi mapa ✦',
        cancelBtn: 'Cancelar',
      },
    },
    // Animal Guidance section
    animalGuidance: {
      birthAnimalTitle: 'Tu Animal de Nacimiento',
      sectionTitle: '¿Qué es la guía animal?',
      totemTitle: '⊕ Animal tótem',
      totemText:
        'Cada persona lleva el espíritu de un animal en su naturaleza. Este animal tótem te representa; tu energía, tus fortalezas y el camino que recorres llevan sus huellas. El tótem nunca cambia: nace contigo y crece contigo.',
      nagualTitle: '◎ Nagual: Guía periódico',
      nagualText:
        'El nagual es un guía temporal que viene a ti durante un período específico. Se le llama en momentos de prueba, transformación o crisis. Una vez cumplido su propósito, cede su lugar a otro guía. El animal extraído en tu lectura diaria lleva la voz del nagual de hoy.',
      finderTitle: 'Encuentra tu guía animal',
      finderDescPremium: 'Mediante preguntas o tu fecha y hora de nacimiento',
      finderDescFree: 'Función de Maestro ✦',
    },
    // Spiritual Map
    spiritualMap: {
      title: 'Mapa espiritual',
      topGuide: 'Poeta guía principal',
      topStone: 'Tu piedra guardiana',
      topAnimal: 'Tu animal tótem',
      topNagual: 'Tu guía nagual',
      companionCount: 'te acompañó {n} veces',
      stoneCount: 'apareció {n} veces · {chakra}',
      nagualCount: 'fue invocado {n} veces · {aspect}',
      emptyHint: 'Abre tu primera carta y tu mapa espiritual comenzará a tomar forma.',
    },
    // Sakin Family
    sakinFamily: {
      title: 'Familia Sakin',
      intro: 'Un ecosistema. Una suscripción. Muchas puertas.',
      masterDesc: 'Centro principal: acceso a todas las apps',
      apps: {
        animalGuidance: 'Guía animal',
        stoneGuidance: 'Guía de cristales',
        plantGuidance: 'Sabiduría vegetal',
        myths: 'Mitos e imágenes',
        humanDesign: 'Human Design',
        numerology: 'Numerología',
      },
      appDescs: {
        animalGuidance: 'Esta app',
        stoneGuidance: 'El lenguaje de los cristales',
        plantGuidance: 'Sabiduría herbal',
        myths: 'Arquetipos y símbolos',
        humanDesign: 'Conoce tu diseño',
        numerology: 'El tú detrás de los números',
      },
      active: 'ACTIVO',
      comingSoon: 'PRÓXIMAMENTE',
    },
    // Badges
    badges: {
      title: 'Insignias',
      list: {
        b001: { title: 'Primeros pasos', desc: 'Primeras 7 lecturas' },
        b002: { title: 'Derviche del fuego', desc: '21 días seguidos' },
        b003: { title: 'Viajero del Mesnevi', desc: '30 lecturas' },
        b004: { title: 'Rosario', desc: '33 piedras vistas' },
        b005: { title: 'Amigo de la verdad', desc: '100 lecturas' },
        b006: { title: 'Viajero de la luz', desc: '365 lecturas' },
      },
    },
    // Premium teaser
    premium: {
      hdTeaser: 'Lee en detalle tu estrategia, autoridad y tema del No-Yo',
      weeklyTeaser: 'Descubre en qué punto estás de tu ciclo de 52 semanas',
      upgradeCta: 'Hacerse Maestro →',
    },
    // Dev
    dev: {
      enablePremium: '⚙ DEV · Activar Premium',
      disablePremium: '⚙ DEV · Desactivar Premium',
    },
    // Notification rationale (App Store 4.5.4 / Play Console)
    notif: {
      rationaleTitle: 'Recordatorio diario',
      rationaleMessage: '¿Quieres que Sakin Hayvan te envíe un recordatorio suave cada mañana a las 08:00 para que saques tu carta diaria? Las notificaciones nunca se usan con fines publicitarios ni de marketing.',
      rationaleConfirm: 'Permitir',
      rationaleCancel: 'Ahora no',
    },
    // Language
    language: {
      title: 'Idioma',
      note: 'La interfaz y el contenido se muestran en el idioma elegido.',
    },
    elementNotSet: 'Ningún elemento seleccionado',
  },

  // ─── Myths screen ─────────────────────────────────────────────────────────────
  myths: {
    back: '← Atrás',
    familyTag: 'SAKIN · MITO',
    subtitle: 'Fuerzas simbólicas que el alma encuentra · {count} mitos',
    searchPlaceholder: 'Busca por nombre, símbolo o elemento...',
    noResults: 'No se encontraron resultados.',
    filterAll: 'Todos',
    msgSection: 'MENSAJE',
    guidanceSection: 'GUÍA',
  },

  // ─── Auth screen ──────────────────────────────────────────────────────────────
  auth: {
    subtitle: 'Guía diaria de la antigua\ntradición de Anatolia',
    orLabel: 'o',
    emailPlaceholder: 'Correo electrónico',
    passwordPlaceholder: 'Contraseña',
    signinBtn: 'Iniciar sesión',
    signupBtn: 'Crear cuenta',
    toSignup: '¿No tienes cuenta? Crea una',
    toSignin: '¿Ya tienes cuenta? Inicia sesión',
    offlineBtn: 'Continuar sin cuenta',
    offlineHint: 'Tus datos solo se quedan en este dispositivo',
    errorNotConfigured: 'Servidor no configurado. Continúa sin conexión por ahora.',
    errorInvalidInput: 'Se requiere un correo válido y una contraseña de al menos 6 caracteres.',
    errorGeneric: 'Algo salió mal.',
    errorNotConfiguredShort: 'Servidor no configurado.',
    errorAppleFailed: 'No se pudo completar el inicio de sesión con Apple.',
    errorAppleError: 'El inicio de sesión con Apple falló.',
    infoEmailSent: 'Correo de confirmación enviado. Revisa tu bandeja de entrada.',
    errInvalidLogin: 'Correo o contraseña incorrectos.',
    errAlreadyRegistered: 'Este correo ya está registrado.',
    errNotConfirmed: 'Confirma tu correo primero.',
    errNetwork: 'Sin conexión a internet.',
  },

  // ─── Paywall screen ───────────────────────────────────────────────────────────
  paywall: {
    eyebrow: 'FAMILIA SAKIN',
    mikroTitle: 'Guía animal ✦',
    premiumTitle: 'Sakin Premium',
    mikroSub: 'Profundiza en la guía animal',
    premiumSub: 'Una cuenta. Todas las apps de Sakin.',
    mikroPlan: 'Micro',
    premiumPlan: 'Premium',
    mikroCadence: 'mes · solo Animal',
    premiumCadence: 'mes · todas las apps',
    mostPopular: 'MÁS POPULAR',
    iosPrice: 'Los precios se muestran a través del App Store.',
    androidPrice: 'Los precios se muestran a través de Play Store.',
    ctaBtn: 'Hacerse Maestro ✦',
    restoreBtn: 'Restaurar suscripción',
    legal: 'El pago se cargará a tu cuenta del App Store al confirmar la compra. La suscripción se renueva automáticamente a menos que se cancele al menos 24 horas antes del final del período actual. Puedes gestionar y cancelar las suscripciones en los ajustes de tu cuenta del App Store.',
    errorPurchase: 'No se pudo completar la compra.',
    errorPurchaseTitle: 'Error',
    infoRestore: 'El servicio para restaurar suscripciones llegará pronto.',
    infoRestoreTitle: 'Información',
    infoRestoreNone: 'No se encontró ninguna suscripción activa para esta cuenta.',
    linkTerms: 'Términos de uso',
    linkPrivacy: 'Política de privacidad',
    features: {
      f1Title: "Tu animal de nacimiento",
      f1Desc: "Encuentra tu animal guía con tus datos de nacimiento o unas pocas preguntas",
      f2Title: "Guía semanal",
      f2Desc: "Dónde estás en tu ciclo de 52 semanas y tu año personal",
      f3Title: "Páginas completas de animales",
      f3Desc: "Mitología, Jung, tradiciones, sombra y significado en los sueños",
      f4Title: "Mapa personal",
      f4Desc: "Tu camino de vida y los números clave de tu nombre",
      f5Title: "Archivo",
      f5Desc: "Tus lecturas pasadas, todas en un mismo lugar",
    },
  },

  // ─── Elements ─────────────────────────────────────────────────────────────────
  elements: {
    fire: 'fuego',
    water: 'agua',
    earth: 'tierra',
    air: 'aire',
  },

  // ─── Glossary terms ───────────────────────────────────────────────────────────
  glossary: {
    totem: {
      term: 'Animal tótem',
      short: 'El animal espiritual que nace contigo y permanece toda la vida.',
    },
    nagual: {
      term: 'Nagual',
      short: 'Un guía temporal que te acompaña durante un período específico.',
    },
    mit: {
      term: 'Mito',
      short: 'Una fuerza simbólica que el alma encuentra: Sombra, Umbral, Relámpago...',
    },
    hayatYolu: {
      term: 'Número del camino de vida',
      short: 'El resumen numerológico de tu fecha de nacimiento: muestra tu energía central.',
    },
    numeroloji: {
      term: 'Numerología',
      short: 'El arte de leer los significados espirituales detrás de los números.',
    },
    ifade: {
      term: 'Número de expresión',
      short: 'Derivado de las letras de tu nombre: tus talentos naturales y tu potencial.',
    },
    ruhIstegi: {
      term: 'Número del anhelo del alma',
      short: 'De las vocales de tu nombre: tu motivación interior.',
    },
    kisilik: {
      term: 'Número de personalidad',
      short: 'De las consonantes de tu nombre: el rostro que muestras al mundo.',
    },
    humanDesign: {
      term: 'Human Design',
      short: 'Un sistema que combina astrología, I Ching, chakras y Cábala.',
    },
    jeneratör: {
      term: 'Generador',
      short: 'La fuente de la energía vital. Estrategia: Responder.',
    },
    manifestingJeneratör: {
      term: 'Generador manifestante',
      short: 'Un Generador multidimensional y rápido. Estrategia: Responder y luego actuar.',
    },
    projektör: {
      term: 'Proyector',
      short: 'Un guía que ve en profundidad los sistemas y a las personas. Estrategia: Esperar la invitación.',
    },
    manifestor: {
      term: 'Manifestador',
      short: 'Iniciador independiente. Estrategia: Informar.',
    },
    reflektör: {
      term: 'Reflector',
      short: 'El espejo de la sociedad. Estrategia: Esperar 28 días.',
    },
    notSelf: {
      term: 'Tema del No-Yo',
      short: 'La emoción que indica que estás fuera de tu verdadero camino.',
    },
    unsur: {
      term: 'Elemento',
      short: 'Las cuatro cualidades fundamentales de la naturaleza: Fuego, Agua, Tierra, Aire.',
    },
    arketip: {
      term: 'Arquetipo',
      short: 'Una figura simbólica universal compartida por toda la humanidad.',
    },
    golge: {
      term: 'Sombra',
      short: 'Las partes de nosotros mismos que rechazamos o reprimimos en nuestra conciencia.',
    },
    kisiselYil: {
      term: 'Año personal',
      short: 'El tema específico de tu año numerológico: en qué paso del ciclo de 9 años te encuentras.',
    },
    rehber: {
      term: 'Animal espiritual',
      short: 'El animal tótem que refleja tu personalidad y tu energía.',
    },
  },
} as const;
