export const es = {
  // ─── Tab bar ──────────────────────────────────────────────────────────────────
  tabs: {
    today: 'Hoy',
    animals: 'Plantas',
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
        title: 'Planta',
        short: 'PLANTA',
        subtitle: 'Escucha la planta de hoy',
      },
      quote: {
        title: 'Rumi',
        short: 'RUMI',
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

  // ─── Animals hub (stones) ────────────────────────────────────────────────────
  animalsHub: {
    eyebrow: 'SAKIN · PLANTA',
    panels: {
      library: 'Plantas',
      finder: 'Buscar',
      guidance: 'Guía',
    },
  },

  // ─── Animal library (stone library) ───────────────────────────────────────────
  animalLibrary: {
    back: '← Atrás',
    familyTag: 'SAKIN · PLANTA',
    subtitle: '{count} plantas curativas y hierbas',
    searchPlaceholder: 'Buscar por nombre, propiedad o elemento...',
    noResults: 'No se encontraron resultados.',
  },

  // ─── Animal detail (stone detail) ─────────────────────────────────────────────
  animalDetail: {
    back: '← Atrás',
    familyTag: 'SAKIN · PLANTA',
    sections: {
      properties: 'Propiedades',
      todayMessage: 'Lo que te dice hoy',
      affirmation: 'AFIRMACIÓN',
      origin: 'Origen',
      myth: 'Mito y leyenda',
      chakra: 'Chakra',
      plant: 'Planta acompañante',
      howToUse: 'Cómo usarla',
    },
    rarityLabels: {
      common: 'Común',
      uncommon: 'Poco común',
      rare: 'Raro',
    },
    footer: 'FAMILIA SAKIN ✦',
  },

  // ─── Animal finder (stone finder) ─────────────────────────────────────────────
  animalFinder: {
    headerTitle: 'Encuentra tu planta',
    intro: {
      title: 'Descubre tu planta',
      desc: 'Encuentra las plantas que se alinean contigo según tu signo zodiacal o tu elemento.',
      note: 'Cada planta tiene su propia vibración. Elige la que te llama: tu intuición hará el resto.',
      birthStoneTitle: 'Tu planta natal',
      zodiacLabel: 'Por signo',
      elementLabel: 'Por elemento',
      elementHint: 'Cada planta vibra con un elemento natural; el tuyo proviene de tu signo: fuego: Aries·Leo·Sagitario · tierra: Tauro·Virgo·Capricornio · aire: Géminis·Libra·Acuario · agua: Cáncer·Escorpio·Piscis.',
    },
    elements: {
      fire: 'Fuego',
      earth: 'Tierra',
      air: 'Aire',
      water: 'Agua',
    },
    result: {
      zodiacLabel: 'Plantas de {name}',
      elementLabel: 'Plantas de {name}',
      birthLabel: 'Planta de tu mes de nacimiento',
      empty: 'No se encontraron plantas para esta selección.',
      rediscoverBtn: 'Elegir de nuevo ✦',
      closeBtn: 'Cerrar ✦',
    },
  },

  // ─── Nagual screen ────────────────────────────────────────────────────────────
  nagual: {
    back: '← Atrás',
    familyTag: 'SAKIN · NAGUAL',
    introTitle: 'Nagual: Guía temporal',
    introText:
      'Tu animal tótem nace contigo y permanece toda la vida. El nagual es un guía\ntemporal que te acompaña durante una etapa concreta. Llega en momentos de prueba,\ntransformación o crisis. Una vez cumplida su misión, cede su lugar a\notro guía.',
    weekTag: 'ESTA SEMANA · UNIVERSAL',
    thisWeek: 'EN ESTA ETAPA',
    daysLeft: 'quedan {n} días',
    personalTag: 'MI GUÍA PERSONAL',
    guidance: 'GUÍA',
    locked: {
      title: 'Mi guía personal',
      text: 'Para determinar un animal guía temporal personalizado según tu carta natal,\ncompleta tu perfil.\n\nPuedes añadir tu fecha de nacimiento y tu elemento en Perfil → Mapa personal.',
    },
  },

  // ─── Archive screen ───────────────────────────────────────────────────────────
  archive: {
    title: 'Archivo',
    readingsCount: '{n} lecturas',
    spiritualMap: 'Mapa espiritual',
    reportLabels: {
      guide: 'Guía',
      stone: 'Planta',
      animal: 'Planta',
      nagual: 'Planta',
    },
    filters: {
      all: 'Todos',
      quote: 'Mensaje',
      stone: 'Planta',
      animal: 'Planta',
      nagual: 'Planta',
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
      step1Question: '¿Cómo te llamas, viajero?',
      step1Placeholder: 'Escribe tu nombre...',
      step2Question: '¿A qué elemento te sientes más cercano?',
      step3Question: 'Para tu mapa personal',
      step3Hint: 'Numerología, Human Design y análisis de elementos.\nMás datos = lectura más fuerte.',
      fullNamePlaceholder: 'Nombre y apellido...',
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
      streak: 'Racha de días',
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
      freeCta: 'Hazte Maestro para un análisis profundo',
      upgradeBtn: 'Hazte Maestro ✦',
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
      licenseInvalid: 'Clave inválida o ya utilizada.',
      licenseNetwork: 'Error de conexión. Inténtalo de nuevo.',
      licenseSignInRequired: 'Inicia sesión en tu cuenta primero para aplicar una clave.',
      deleteLabel: 'Eliminar cuenta',
      deleteSub: 'Elimina tu cuenta y todos tus datos de forma permanente.',
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
        cityPlaceholder: 'Estambul, Madrid, Buenos Aires...',
        saveBtn: 'Crear mi mapa ✦',
        cancelBtn: 'Cancelar',
      },
    },
    // Animal Guidance section
    animalGuidance: {
      birthStoneTitle: 'Tus Plantas de Nacimiento',
      sectionTitle: '¿Qué es la guía animal?',
      totemTitle: '⊕ Animal tótem',
      totemText:
        'Cada persona lleva en su naturaleza el espíritu de un animal. Este animal tótem te representa; tu energía, tus fortalezas y el camino que recorres llevan sus huellas. El tótem nunca cambia: nace contigo y crece contigo.',
      nagualTitle: '◎ Nagual: Guía temporal',
      nagualText:
        'El nagual es un guía temporal que llega a ti durante una etapa concreta. Se le invoca en momentos de prueba, transformación o crisis. Una vez cumplida su misión, cede su lugar a otro guía. El animal que aparece en tu lectura diaria lleva la voz del nagual de hoy.',
      finderTitle: 'Encuentra tu guía animal',
      finderDescPremium: 'Mediante preguntas o tu fecha y hora de nacimiento',
      finderDescFree: 'Función de Maestro ✦',
    },
    // Spiritual Map
    spiritualMap: {
      title: 'Mapa espiritual',
      topGuide: 'Poeta guía más frecuente',
      topStone: 'Tu planta protectora',
      topAnimal: 'Tu animal tótem',
      topNagual: 'Tu guía nagual',
      companionCount: 'te ha acompañado {n} veces',
      stoneCount: 'apareció {n} veces · {chakra}',
      nagualCount: 'invocado {n} veces · {aspect}',
      emptyHint: 'Abre tu primera carta y tu mapa espiritual comenzará a tomar forma.',
    },
    // Sakin Family
    sakinFamily: {
      title: 'Familia Sakin',
      intro: 'Un ecosistema. Una suscripción. Muchas puertas.',
      masterDesc: 'Base central: acceso a todas las apps',
      apps: {
        animalGuidance: 'Guía animal',
        stoneGuidance: 'Guía de plantas',
        plantGuidance: 'Sabiduría vegetal',
        myths: 'Mitos e imágenes',
        humanDesign: 'Human Design',
        numerology: 'Numerología',
      },
      appDescs: {
        animalGuidance: 'Esta app',
        stoneGuidance: 'El lenguaje de las plantas',
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
        b002: { title: 'Derviche de fuego', desc: 'Racha de 21 días' },
        b003: { title: 'Viajero del Mesnevi', desc: '30 lecturas' },
        b004: { title: 'Rosario', desc: '33 plantas vistas' },
        b005: { title: 'Amigo de la verdad', desc: '100 lecturas' },
        b006: { title: 'Viajero de la luz', desc: '365 lecturas' },
      },
    },
    // Premium teaser
    premium: {
      hdTeaser: 'Lee tu estrategia, tu autoridad y tu tema del No-Yo en detalle',
      weeklyTeaser: 'Descubre en qué punto estás de tu ciclo de 52 semanas',
      upgradeCta: 'Hazte Maestro →',
    },
    // Dev
    dev: {
      enablePremium: '⚙ DEV · Activar Premium',
      disablePremium: '⚙ DEV · Desactivar Premium',
    },
    // Notification rationale (App Store 4.5.4 / Play Console)
    notif: {
      rationaleTitle: 'Recordatorio diario',
      rationaleMessage: '¿Quieres que Sakin Hayvan te envíe un recordatorio silencioso cada mañana a las 08:00 para sacar tu carta del día? Las notificaciones nunca se usan con fines publicitarios ni de marketing.',
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
    searchPlaceholder: 'Buscar por nombre, símbolo o elemento...',
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
    offlineHint: 'Tus datos permanecen solo en este dispositivo',
    errorNotConfigured: 'Servidor no configurado. Continúa sin conexión por ahora.',
    errorInvalidInput: 'Se requiere un correo válido y una contraseña de al menos 6 caracteres.',
    errorGeneric: 'Algo salió mal.',
    errorNotConfiguredShort: 'Servidor no configurado.',
    errorAppleFailed: 'No se pudo completar el inicio de sesión con Apple.',
    errorAppleError: 'Error al iniciar sesión con Apple.',
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
    premiumSub: 'Una cuenta. Todas las apps Sakin.',
    mikroPlan: 'Micro',
    premiumPlan: 'Premium',
    mikroCadence: 'mes · solo Animal',
    premiumCadence: 'mes · todas las apps',
    mostPopular: 'MÁS POPULAR',
    iosPrice: 'Los precios se muestran a través de la App Store.',
    androidPrice: 'Los precios se muestran a través de la Play Store.',
    ctaBtn: 'Hazte Maestro ✦',
    restoreBtn: 'Restaurar suscripción',
    legal: 'El pago se cargará a tu cuenta de App Store al confirmar la compra. La suscripción se renueva automáticamente a menos que se cancele al menos 24 horas antes del final del período actual. Puedes gestionar y cancelar las suscripciones en los ajustes de tu cuenta de App Store.',
    errorPurchase: 'No se pudo completar la compra.',
    errorPurchaseTitle: 'Error',
    infoRestore: 'El servicio para restaurar suscripciones llegará pronto.',
    infoRestoreTitle: 'Información',
    infoRestoreNone: 'No se encontró ninguna suscripción activa para esta cuenta.',
    linkTerms: 'Condiciones de uso',
    linkPrivacy: 'Política de privacidad',
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
      short: 'Un guía temporal que te acompaña durante una etapa concreta.',
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
      short: 'De las consonantes de tu nombre: la cara que muestras al mundo.',
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
      short: 'Un guía que ve profundamente los sistemas y las personas. Estrategia: Esperar la invitación.',
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
      short: 'La emoción que señala que estás fuera de tu verdadero camino.',
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
      short: 'El tema propio de tu año numerológico: en qué paso del ciclo de 9 años te encuentras.',
    },
    rehber: {
      term: 'Animal espiritual',
      short: 'El animal tótem que refleja tu personalidad y tu energía.',
    },
  },
} as const;
