export const pt = {
  common: {
    share: 'Partilhar',
  },

  // ─── Tab bar ──────────────────────────────────────────────────────────────────
  tabs: {
    today: 'Hoje',
    animals: 'Plantas',
    archive: 'Arquivo',
    profile: 'Perfil',
  },

  // ─── Home screen ──────────────────────────────────────────────────────────────
  home: {
    greeting: {
      night: 'Coruja noturna',
      morning: 'Bom dia',
      afternoon: 'Boa tarde',
      evening: 'Boa noite',
    },
    defaultUser: 'Viajante',
    decks: {
      animal: {
        title: 'Planta',
        short: 'PLANTA',
        subtitle: 'Ouve a planta de hoje',
      },
      quote: {
        title: 'Rumi',
        short: 'RUMI',
        subtitle: 'Das tradições de sabedoria',
      },
    },
    tapHint: 'agita · toca',
    nextDeck: 'Próximo baralho →',
    completed: 'Concluído ✦',
    doneTitle: 'Orientação diária\nconcluída',
    doneSub: 'Amanhã começa uma nova jornada',
    detailBtn: ': orientação profunda →',
  },

  // ─── Animals hub (stones) ────────────────────────────────────────────────────
  animalsHub: {
    eyebrow: 'SAKIN · PLANTA',
    panels: {
      library: 'Plantas',
      finder: 'Encontrar',
      guidance: 'Orientação',
    },
  },

  // ─── Animal library (stone library) ───────────────────────────────────────────
  animalLibrary: {
    back: '← Voltar',
    familyTag: 'SAKIN · PLANTA',
    subtitle: '{count} plantas curativas e ervas',
    searchPlaceholder: 'Pesquisar por nome, propriedade ou elemento...',
    noResults: 'Nenhum resultado encontrado.',
  },

  // ─── Animal detail (stone detail) ─────────────────────────────────────────────
  animalDetail: {
    back: '← Voltar',
    familyTag: 'SAKIN · PLANTA',
    sections: {
      properties: 'Propriedades',
      todayMessage: 'O que ela te diz hoje',
      affirmation: 'AFIRMAÇÃO',
      origin: 'Origem',
      myth: 'Mito e Lenda',
      chakra: 'Chakra',
      plant: 'Planta companheira',
      howToUse: 'Como usar',
    },
    rarityLabels: {
      common: 'Comum',
      uncommon: 'Incomum',
      rare: 'Raro',
    },
    footer: 'FAMÍLIA SAKIN ✦',
  },

  // ─── Animal finder (stone finder) ─────────────────────────────────────────────
  animalFinder: {
    headerTitle: 'Encontra a tua planta',
    intro: {
      title: 'Descobre a tua planta',
      desc: 'Encontra as plantas alinhadas contigo pelo teu signo ou elemento.',
      note: 'Cada planta carrega a sua própria vibração. Escolhe aquela que te chama, deixa a tua intuição fazer o resto.',
      birthStoneTitle: 'A tua planta natal',
      zodiacLabel: 'Por signo',
      elementLabel: 'Por elemento',
    },
    elements: {
      fire: 'Fogo',
      earth: 'Terra',
      air: 'Ar',
      water: 'Água',
    },
    result: {
      zodiacLabel: 'Plantas de {name}',
      elementLabel: 'Plantas de {name}',
      birthLabel: 'Planta do teu mês de nascimento',
      empty: 'Nenhuma planta encontrada para esta seleção.',
      rediscoverBtn: 'Escolher novamente ✦',
      closeBtn: 'Fechar ✦',
    },
  },

  // ─── Nagual screen ────────────────────────────────────────────────────────────
  nagual: {
    back: '← Voltar',
    familyTag: 'SAKIN · NAGUAL',
    introTitle: 'Nagual: Guia temporário',
    introText:
      'O teu animal totem nasce contigo e permanece para toda a vida. O nagual é um guia\ntemporário que te acompanha durante um período específico. Chega em momentos de prova,\ntransformação ou crise. Cumprida a sua missão, cede o lugar a\noutro guia.',
    weekTag: 'ESTA SEMANA · UNIVERSAL',
    thisWeek: 'NESTE PERÍODO',
    daysLeft: 'faltam {n} dias',
    personalTag: 'MEU GUIA PESSOAL',
    guidance: 'ORIENTAÇÃO',
    locked: {
      title: 'O meu guia pessoal',
      text: 'Para determinar um animal guia temporário personalizado com base no teu mapa natal,\ncompleta o teu perfil.\n\nPodes adicionar a tua data de nascimento e o teu elemento em Perfil → Mapa pessoal.',
    },
  },

  // ─── Archive screen ───────────────────────────────────────────────────────────
  archive: {
    title: 'Arquivo',
    readingsCount: '{n} leituras',
    spiritualMap: 'Mapa espiritual',
    reportLabels: {
      guide: 'Guia',
      stone: 'Planta',
      animal: 'Planta',
      nagual: 'Planta',
    },
    filters: {
      all: 'Todos',
      quote: 'Mensagem',
      stone: 'Planta',
      animal: 'Planta',
      nagual: 'Planta',
    },
    empty: {
      title: 'Ainda não há leituras.',
      subtitle: 'Abre a tua carta no ecrã inicial.',
    },
  },

  // ─── Profile screen ───────────────────────────────────────────────────────────
  profile: {
    // Onboarding
    onboarding: {
      title: "Bem-vindo ao Sakin Plantas",
      subtitle: 'Orientação diária da antiga tradição da Anatólia',
      step1Question: 'Como te chamas, viajante?',
      step1Placeholder: 'Escreve o teu nome...',
      step2Question: 'De que elemento te sentes mais próximo?',
      step3Question: 'Para o teu mapa pessoal',
      step3Hint: 'Numerologia, Human Design e análise de elementos.\nMais dados = leitura mais forte.',
      fullNamePlaceholder: 'Nome e apelido...',
      birthDateLabel: 'Data de nascimento',
      dayPlaceholder: 'Dia',
      monthPlaceholder: 'Mês',
      yearPlaceholder: 'Ano',
      birthHourLabel: 'Hora de nascimento',
      hourOptional: '(opcional · para HD)',
      hourPlaceholder: 'Hora',
      minutePlaceholder: 'Min',
      birthCityLabel: 'Cidade de nascimento',
      cityOptional: '(opcional)',
      cityPlaceholder: 'Istambul, Lisboa...',
      continueBtn: 'Continuar →',
      startBtn: 'Começar a jornada ✦',
      skipBtn: 'Agora não, saltar',
    },
    // Stats
    stats: {
      totalReadings: 'Total de leituras',
      streak: 'Sequência de dias',
      level: 'Nível',
    },
    // Level
    levelProgress: 'Progresso de nível',
    readingsProgress: '{current} / {next} leituras',
    // Account
    account: {
      title: 'Conta',
      premiumLabel: 'Mestre ✦',
      freeLabel: 'Viajante gratuito',
      premiumRenewal: 'Renovação: {date}',
      premiumLifetime: 'Vitalício',
      freeCta: 'Torna-te Mestre para uma análise aprofundada',
      upgradeBtn: 'Tornar-se Mestre ✦',
      cancelBtn: 'Cancelar',
      remindersLabel: 'Lembrete diário',
      remindersSub: 'Recebe o teu guia todas as manhãs às 08:00',
      cloudBackup: 'Dados guardados na nuvem',
      signOutBtn: 'Sair',
      licenseTitle: 'Chave de licença',
      licensePlaceholder: 'XXXX-XXXX-XXXX',
      licenseApply: 'Aplicar',
      licenseSuccess: 'Premium ativado! Bem-vindo à família Sakin.',
      licenseAlready: 'O Premium já está ativo nesta conta.',
      licenseInvalid: 'Chave inválida ou já utilizada.',
      licenseNetwork: 'Erro de ligação. Tenta novamente.',
      licenseSignInRequired: 'Inicia sessão na tua conta primeiro para aplicar uma chave.',
      deleteLabel: 'Eliminar conta',
      deleteSub: 'Elimina a tua conta e todos os dados permanentemente.',
      deleteBtn: 'Eliminar',
      deleteConfirmTitle: 'Eliminar a tua conta?',
      deleteConfirmMessage: 'Todas as leituras, o arquivo, o perfil e as estatísticas serão apagados permanentemente. Isto não pode ser desfeito.',
      deleteConfirm: 'Sim, eliminar',
      deleteCancel: 'Cancelar',
    },
    // Personal Map
    personalMap: {
      title: 'Mapa pessoal',
      editBtn: '✎ Editar',
      lifePath: 'Caminho de vida',
      expression: 'Expressão',
      soulUrge: 'Desejo da alma',
      personality: 'Personalidade',
      humanDesign: 'Human Design',
      strategy: 'Estratégia',
      estimated: '(estimado)',
      hdTypeSelectHint: 'Seleciona o teu tipo:',
      hdDisclaimer:
        '⚠ O cálculo é uma estimativa, um HD preciso exige hora de nascimento e efemérides.\nSe conheces o teu tipo, seleciona-o acima.',
      sunGates: 'Portões solares',
      consciousSun: 'Sol consciente',
      designSun: 'Sol de design',
      gatesNote: 'Tipo estimado · Adiciona a tua hora de nascimento e seleciona ✎ para um resultado preciso',
      notSelf: 'Tema do Não-Eu',
      weeklyReading: 'Orientação semanal',
      weeklyThisWeek: 'Leitura personalizada para esta semana',
      weeklyMeta: 'Orientação semanal · Semana {week}',
      personalYear: 'Ano pessoal: {year}',
      unlock: {
        title: 'Abre o teu mapa pessoal',
        desc: 'Introduz o teu nome completo e a tua data de nascimento.\nNumerologia, Human Design e análise semanal.',
      },
      birthForm: {
        title: 'Dados do mapa natal',
        hint: 'A hora e a cidade são necessárias para os cálculos do Human Design.',
        fullNamePlaceholder: 'Nome completo (para numerologia)',
        dateLabel: 'Data de nascimento',
        dayPlaceholder: 'Dia',
        monthPlaceholder: 'Mês',
        yearPlaceholder: 'Ano',
        hourLabel: 'Hora de nascimento',
        hourOptional: '(importante para HD)',
        hourPlaceholder: 'Hora (0-23)',
        minutePlaceholder: 'Minuto',
        cityLabel: 'Cidade de nascimento',
        cityOptional: '(para o fuso horário)',
        cityPlaceholder: 'Istambul, Lisboa, São Paulo...',
        saveBtn: 'Criar o meu mapa ✦',
        cancelBtn: 'Cancelar',
      },
    },
    // Animal Guidance section
    animalGuidance: {
      birthStoneTitle: 'As tuas Plantas de Nascimento',
      sectionTitle: 'O que é orientação animal?',
      totemTitle: '⊕ Animal totem',
      totemText:
        'Cada pessoa carrega na sua natureza o espírito de um animal. Esse animal totem representa-te; a tua energia, as tuas forças e o caminho que percorres trazem as suas marcas. O totem nunca muda: nasce contigo e cresce contigo.',
      nagualTitle: '◎ Nagual: Guia temporário',
      nagualText:
        'O nagual é um guia temporário que vem até ti por um período específico. É chamado em momentos de prova, transformação ou crise. Cumprida a sua missão, cede o lugar a outro guia. O animal sorteado na tua leitura diária carrega a voz do nagual de hoje.',
      finderTitle: 'Encontra o teu guia animal',
      finderDescPremium: 'Por perguntas ou pela tua data e hora de nascimento',
      finderDescFree: 'Recurso de Mestre ✦',
    },
    // Spiritual Map
    spiritualMap: {
      title: 'Mapa espiritual',
      topGuide: 'Poeta guia mais frequente',
      topStone: 'A tua planta protetora',
      topAnimal: 'O teu animal totem',
      topNagual: 'O teu guia nagual',
      companionCount: 'acompanhou-te {n} vezes',
      stoneCount: 'apareceu {n} vezes · {chakra}',
      nagualCount: 'invocado {n} vezes · {aspect}',
      emptyHint: 'Abre a tua primeira carta e o teu mapa espiritual começará a ganhar forma.',
    },
    // Sakin Family
    sakinFamily: {
      title: 'Família Sakin',
      intro: 'Um ecossistema. Uma subscrição. Muitas portas.',
      masterDesc: 'Base central: acesso a todas as apps',
      apps: {
        animalGuidance: 'Orientação animal',
        stoneGuidance: 'Orientação de plantas',
        plantGuidance: 'Sabedoria das plantas',
        myths: 'Mitos e imagens',
        humanDesign: 'Human Design',
        numerology: 'Numerologia',
      },
      appDescs: {
        animalGuidance: 'Esta app',
        stoneGuidance: 'A linguagem das plantas',
        plantGuidance: 'Sabedoria herbal',
        myths: 'Arquétipos e símbolos',
        humanDesign: 'Conhece o teu design',
        numerology: 'O teu eu por trás dos números',
      },
      active: 'ATIVO',
      comingSoon: 'EM BREVE',
    },
    // Badges
    badges: {
      title: 'Distintivos',
      list: {
        b001: { title: 'Primeiros passos', desc: 'Primeiras 7 leituras' },
        b002: { title: 'Derviche do fogo', desc: 'Sequência de 21 dias' },
        b003: { title: 'Viajante do Mesnevi', desc: '30 leituras' },
        b004: { title: 'Terço', desc: '33 plantas vistas' },
        b005: { title: 'Amigo da verdade', desc: '100 leituras' },
        b006: { title: 'Viajante da luz', desc: '365 leituras' },
      },
    },
    // Premium teaser
    premium: {
      hdTeaser: "Lê em detalhe a tua estratégia, a tua autoridade e o teu tema do Não-Eu",
      weeklyTeaser: "Descobre em que ponto estás do teu ciclo de 52 semanas",
      upgradeCta: "Torna-te Mestre →",
    },
    // Dev
    dev: {
      enablePremium: '⚙ DEV · Ativar Premium',
      disablePremium: '⚙ DEV · Desativar Premium',
    },
    // Notification rationale (App Store 4.5.4 / Play Console)
    notif: {
      rationaleTitle: 'Lembrete diário',
      rationaleMessage: "Queres que o Sakin Plantas te envie um lembrete silencioso todas as manhãs às 08:00 para tirares a carta do dia? As notificações nunca são usadas para publicidade ou marketing.",
      rationaleConfirm: 'Permitir',
      rationaleCancel: 'Agora não',
    },
    // Language
    language: {
      title: 'Idioma',
      note: 'A interface e o conteúdo são exibidos no idioma escolhido.',
    },
    elementNotSet: 'Nenhum elemento selecionado',
  },

  // ─── Myths screen ─────────────────────────────────────────────────────────────
  myths: {
    back: '← Voltar',
    familyTag: 'SAKIN · MITO',
    subtitle: 'Forças simbólicas que a alma encontra · {count} mitos',
    searchPlaceholder: 'Pesquisar por nome, símbolo ou elemento...',
    noResults: 'Nenhum resultado encontrado.',
    filterAll: 'Todos',
    msgSection: 'MENSAGEM',
    guidanceSection: 'ORIENTAÇÃO',
  },

  // ─── Auth screen ──────────────────────────────────────────────────────────────
  auth: {
    subtitle: 'Orientação diária da antiga\ntradição da Anatólia',
    orLabel: 'ou',
    emailPlaceholder: 'E-mail',
    passwordPlaceholder: 'Palavra-passe',
    signinBtn: 'Entrar',
    signupBtn: 'Criar conta',
    toSignup: 'Não tens conta? Cria uma',
    toSignin: 'Já tens conta? Entra',
    offlineBtn: 'Continuar sem conta',
    offlineHint: 'Os teus dados ficam apenas neste dispositivo',
    errorNotConfigured: 'Servidor não configurado. Continua offline por agora.',
    errorInvalidInput: 'É necessário um e-mail válido e uma palavra-passe com pelo menos 6 caracteres.',
    errorGeneric: 'Algo correu mal.',
    errorNotConfiguredShort: 'Servidor não configurado.',
    errorAppleFailed: 'Não foi possível concluir o início de sessão com a Apple.',
    errorAppleError: 'Falha no início de sessão com a Apple.',
    infoEmailSent: 'E-mail de confirmação enviado. Verifica a tua caixa de entrada.',
    errInvalidLogin: 'E-mail ou palavra-passe incorretos.',
    errAlreadyRegistered: 'Este e-mail já está registado.',
    errNotConfirmed: 'Confirma primeiro o teu e-mail.',
    errNetwork: 'Sem ligação à internet.',
  },

  // ─── Paywall screen ───────────────────────────────────────────────────────────
  paywall: {
    eyebrow: 'FAMÍLIA SAKIN',
    mikroTitle: "Guia das plantas ✦",
    premiumTitle: 'Sakin Premium',
    mikroSub: "Aprofunda a orientação das plantas",
    premiumSub: "Uma conta. Todas as apps Sakin.",
    mikroPlan: 'Micro',
    premiumPlan: 'Premium',
    mikroCadence: "mês · só Plantas",
    premiumCadence: "ano",
    mostPopular: 'MAIS POPULAR',
    iosPrice: "Os preços são apresentados pela App Store.",
    androidPrice: "Os preços são apresentados pela Play Store.",
    ctaBtn: "Torna-te Mestre ✦",
    restoreBtn: "Restaurar subscrição",
    legal: "O pagamento é cobrado na tua conta da App Store quando confirmares a compra. A subscrição renova-se automaticamente, a menos que seja cancelada pelo menos 24 horas antes do fim do período atual. Podes gerir e cancelar as subscrições nas definições da tua conta da App Store.",
    errorPurchase: 'Não foi possível concluir a compra.',
    errorPurchaseTitle: 'Erro',
    infoRestore: "O restauro da subscrição estará disponível em breve.",
    infoRestoreTitle: 'Informação',
    infoRestoreNone: "Não foi encontrada nenhuma subscrição ativa nesta conta.",
    linkTerms: "Termos de utilização",
    linkPrivacy: 'Política de privacidade',
    features: {
      f1Title: "A tua planta natal",
      f1Desc: "A planta do teu mês de nascimento e as do teu signo e elemento",
      f2Title: "Orientação semanal",
      f2Desc: "Onde estás no teu ciclo de 52 semanas e o teu ano pessoal",
      f3Title: "Páginas das plantas",
      f3Desc: "Propriedades, origem, mitos, chakra e como usar cada planta",
      f4Title: "Mapa pessoal",
      f4Desc: "O teu caminho de vida e os números-chave do teu nome",
      f5Title: "Arquivo",
      f5Desc: "As tuas leituras anteriores, todas num só lugar",
    },
  },

  // ─── Elements ─────────────────────────────────────────────────────────────────
  elements: {
    fire: 'fogo',
    water: 'água',
    earth: 'terra',
    air: 'ar',
  },

  // ─── Glossary terms ───────────────────────────────────────────────────────────
  glossary: {
    totem: {
      term: 'Animal totem',
      short: 'O animal espiritual que nasce contigo e permanece para toda a vida.',
    },
    nagual: {
      term: 'Nagual',
      short: 'Um guia temporário que te acompanha durante um período específico.',
    },
    mit: {
      term: 'Mito',
      short: 'Uma força simbólica que a alma encontra, Sombra, Limiar, Relâmpago...',
    },
    hayatYolu: {
      term: 'Número do caminho de vida',
      short: 'O resumo numerológico da tua data de nascimento, mostra a tua energia central.',
    },
    numeroloji: {
      term: 'Numerologia',
      short: 'A arte de ler os significados espirituais por trás dos números.',
    },
    ifade: {
      term: 'Número de expressão',
      short: 'Derivado das letras do teu nome, os teus talentos naturais e o teu potencial.',
    },
    ruhIstegi: {
      term: 'Número do desejo da alma',
      short: 'Das vogais do teu nome, a tua motivação interior.',
    },
    kisilik: {
      term: 'Número de personalidade',
      short: 'Das consoantes do teu nome, o rosto que mostras ao mundo.',
    },
    humanDesign: {
      term: 'Human Design',
      short: 'Um sistema que combina astrologia, I Ching, chakras e Cabala.',
    },
    jeneratör: {
      term: 'Gerador',
      short: 'A fonte da energia vital. Estratégia: Responder.',
    },
    manifestingJeneratör: {
      term: 'Gerador manifestante',
      short: 'Um Gerador multidimensional e rápido. Estratégia: Responder e depois agir.',
    },
    projektör: {
      term: 'Projetor',
      short: 'Um guia que vê profundamente sistemas e pessoas. Estratégia: Esperar o convite.',
    },
    manifestor: {
      term: 'Manifestador',
      short: 'Iniciador independente. Estratégia: Informar.',
    },
    reflektör: {
      term: 'Refletor',
      short: 'O espelho da sociedade. Estratégia: Esperar 28 dias.',
    },
    notSelf: {
      term: 'Tema do Não-Eu',
      short: 'A emoção que sinaliza que estás fora do teu verdadeiro caminho.',
    },
    unsur: {
      term: 'Elemento',
      short: 'As quatro qualidades fundamentais da natureza: Fogo, Água, Terra, Ar.',
    },
    arketip: {
      term: 'Arquétipo',
      short: 'Uma figura simbólica universal partilhada por toda a humanidade.',
    },
    golge: {
      term: 'Sombra',
      short: 'As partes de nós mesmos que rejeitamos ou reprimimos na nossa consciência.',
    },
    kisiselYil: {
      term: 'Ano pessoal',
      short: 'O tema próprio do teu ano numerológico, em que passo do ciclo de 9 anos estás.',
    },
    rehber: {
      term: 'Animal espiritual',
      short: 'O animal totem que reflete a tua personalidade e a tua energia.',
    },
  },
} as const;
