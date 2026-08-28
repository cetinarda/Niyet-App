export const pt = {
  // ─── Tab bar ──────────────────────────────────────────────────────────────────
  tabs: {
    today: 'Hoje',
    animals: 'Pedras',
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
        title: 'Pedra',
        short: 'PEDRA',
        subtitle: 'Ouça a pedra de hoje',
      },
      quote: {
        title: 'Rumi',
        short: 'RUMI',
        subtitle: 'Das tradições de sabedoria',
      },
    },
    tapHint: 'agite · toque',
    nextDeck: 'Próximo baralho →',
    completed: 'Concluído ✦',
    doneTitle: 'Orientação diária\nconcluída',
    doneSub: 'Amanhã começa uma nova jornada',
    detailBtn: ': orientação profunda →',
  },

  // ─── Animals hub (stones) ────────────────────────────────────────────────────
  animalsHub: {
    eyebrow: 'SAKIN · PEDRA',
    panels: {
      library: 'Pedras',
      finder: 'Encontrar',
      guidance: 'Orientação',
    },
  },

  // ─── Animal library (stone library) ───────────────────────────────────────────
  animalLibrary: {
    back: '← Voltar',
    familyTag: 'SAKIN · PEDRA',
    subtitle: '{count} pedras curativas e cristais',
    searchPlaceholder: 'Pesquisar por nome, propriedade ou elemento...',
    noResults: 'Nenhum resultado encontrado.',
  },

  // ─── Animal detail (stone detail) ─────────────────────────────────────────────
  animalDetail: {
    back: '← Voltar',
    familyTag: 'SAKIN · PEDRA',
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
    headerTitle: 'Encontre sua pedra',
    intro: {
      title: 'Descubra sua pedra',
      desc: 'Encontre os cristais alinhados com você pelo seu signo ou elemento.',
      note: 'Cada pedra carrega sua própria vibração. Escolha aquela que te chama, deixe sua intuição fazer o resto.',
      birthStoneTitle: 'Sua pedra natal',
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
      zodiacLabel: 'Pedras de {name}',
      elementLabel: 'Pedras de {name}',
      birthLabel: 'Pedra do seu mês de nascimento',
      empty: 'Nenhuma pedra encontrada para esta seleção.',
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
      'Seu animal totem nasce com você e permanece por toda a vida. O nagual é um guia\ntemporário que te acompanha durante um período específico. Ele chega em momentos de prova,\ntransformação ou crise. Cumprida a sua missão, cede o lugar a\noutro guia.',
    weekTag: 'ESTA SEMANA · UNIVERSAL',
    thisWeek: 'NESTE PERÍODO',
    daysLeft: 'faltam {n} dias',
    personalTag: 'MEU GUIA PESSOAL',
    guidance: 'ORIENTAÇÃO',
    locked: {
      title: 'Meu guia pessoal',
      text: 'Para determinar um animal guia temporário personalizado com base no seu mapa natal,\ncomplete o seu perfil.\n\nVocê pode adicionar sua data de nascimento e seu elemento em Perfil → Mapa pessoal.',
    },
  },

  // ─── Archive screen ───────────────────────────────────────────────────────────
  archive: {
    title: 'Arquivo',
    readingsCount: '{n} leituras',
    spiritualMap: 'Mapa espiritual',
    reportLabels: {
      guide: 'Guia',
      stone: 'Pedra',
      animal: 'Pedra',
      nagual: 'Pedra',
    },
    filters: {
      all: 'Todos',
      quote: 'Mensagem',
      stone: 'Pedra',
      animal: 'Pedra',
      nagual: 'Pedra',
    },
    empty: {
      title: 'Ainda não há leituras.',
      subtitle: 'Abra sua carta na tela inicial.',
    },
  },

  // ─── Profile screen ───────────────────────────────────────────────────────────
  profile: {
    // Onboarding
    onboarding: {
      title: 'Bem-vindo ao Sakin Hayvan',
      subtitle: 'Orientação diária da antiga tradição da Anatólia',
      step1Question: 'Qual é o seu nome, viajante?',
      step1Placeholder: 'Digite seu nome...',
      step2Question: 'De qual elemento você se sente mais próximo?',
      step3Question: 'Para o seu mapa pessoal',
      step3Hint: 'Numerologia, Human Design e análise de elementos.\nMais dados = leitura mais forte.',
      fullNamePlaceholder: 'Nome e sobrenome...',
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
      skipBtn: 'Agora não, pular',
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
      freeCta: 'Torne-se Mestre para uma análise aprofundada',
      upgradeBtn: 'Tornar-se Mestre ✦',
      cancelBtn: 'Cancelar',
      remindersLabel: 'Lembrete diário',
      remindersSub: 'Receba seu guia toda manhã às 08:00',
      cloudBackup: 'Dados salvos na nuvem',
      signOutBtn: 'Sair',
      licenseTitle: 'Chave de licença',
      licensePlaceholder: 'XXXX-XXXX-XXXX',
      licenseApply: 'Aplicar',
      licenseSuccess: 'Premium ativado! Bem-vindo à família Sakin.',
      licenseAlready: 'O Premium já está ativo nesta conta.',
      licenseInvalid: 'Chave inválida ou já utilizada.',
      licenseNetwork: 'Erro de conexão. Tente novamente.',
      licenseSignInRequired: 'Faça login na sua conta primeiro para aplicar uma chave.',
      deleteLabel: 'Excluir conta',
      deleteSub: 'Exclui sua conta e todos os dados permanentemente.',
      deleteBtn: 'Excluir',
      deleteConfirmTitle: 'Excluir sua conta?',
      deleteConfirmMessage: 'Todas as leituras, o arquivo, o perfil e as estatísticas serão apagados permanentemente. Isso não pode ser desfeito.',
      deleteConfirm: 'Sim, excluir',
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
      hdTypeSelectHint: 'Selecione seu tipo:',
      hdDisclaimer:
        '⚠ O cálculo é uma estimativa, um HD preciso exige hora de nascimento e efemérides.\nSe você conhece seu tipo, selecione-o acima.',
      sunGates: 'Portões solares',
      consciousSun: 'Sol consciente',
      designSun: 'Sol de design',
      gatesNote: 'Tipo estimado · Adicione sua hora de nascimento e selecione ✎ para um resultado preciso',
      notSelf: 'Tema do Não-Eu',
      weeklyReading: 'Orientação semanal',
      weeklyThisWeek: 'Leitura personalizada para esta semana',
      weeklyMeta: 'Orientação semanal · Semana {week}',
      personalYear: 'Ano pessoal: {year}',
      unlock: {
        title: 'Abra seu mapa pessoal',
        desc: 'Insira seu nome completo e sua data de nascimento.\nNumerologia, Human Design e análise semanal.',
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
        saveBtn: 'Criar meu mapa ✦',
        cancelBtn: 'Cancelar',
      },
    },
    // Animal Guidance section
    animalGuidance: {
      birthStoneTitle: 'Suas Pedras de Nascimento',
      sectionTitle: 'O que é orientação animal?',
      totemTitle: '⊕ Animal totem',
      totemText:
        'Cada pessoa carrega em sua natureza o espírito de um animal. Esse animal totem representa você; sua energia, suas forças e o caminho que você percorre trazem as suas marcas. O totem nunca muda: nasce com você e cresce com você.',
      nagualTitle: '◎ Nagual: Guia temporário',
      nagualText:
        'O nagual é um guia temporário que vem até você por um período específico. Ele é chamado em momentos de prova, transformação ou crise. Cumprida a sua missão, cede o lugar a outro guia. O animal sorteado na sua leitura diária carrega a voz do nagual de hoje.',
      finderTitle: 'Encontre seu guia animal',
      finderDescPremium: 'Por perguntas ou pela sua data e hora de nascimento',
      finderDescFree: 'Recurso de Mestre ✦',
    },
    // Spiritual Map
    spiritualMap: {
      title: 'Mapa espiritual',
      topGuide: 'Poeta guia mais frequente',
      topStone: 'Sua pedra protetora',
      topAnimal: 'Seu animal totem',
      topNagual: 'Seu guia nagual',
      companionCount: 'acompanhou você {n} vezes',
      stoneCount: 'apareceu {n} vezes · {chakra}',
      nagualCount: 'invocado {n} vezes · {aspect}',
      emptyHint: 'Abra sua primeira carta e seu mapa espiritual começará a tomar forma.',
    },
    // Sakin Family
    sakinFamily: {
      title: 'Família Sakin',
      intro: 'Um ecossistema. Uma assinatura. Muitas portas.',
      masterDesc: 'Base central: acesso a todos os apps',
      apps: {
        animalGuidance: 'Orientação animal',
        stoneGuidance: 'Orientação de cristais',
        plantGuidance: 'Sabedoria das plantas',
        myths: 'Mitos e imagens',
        humanDesign: 'Human Design',
        numerology: 'Numerologia',
      },
      appDescs: {
        animalGuidance: 'Este app',
        stoneGuidance: 'A linguagem dos cristais',
        plantGuidance: 'Sabedoria herbal',
        myths: 'Arquétipos e símbolos',
        humanDesign: 'Conheça seu design',
        numerology: 'O você por trás dos números',
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
        b004: { title: 'Terço', desc: '33 pedras vistas' },
        b005: { title: 'Amigo da verdade', desc: '100 leituras' },
        b006: { title: 'Viajante da luz', desc: '365 leituras' },
      },
    },
    // Premium teaser
    premium: {
      hdTeaser: 'Leia sua estratégia, sua autoridade e seu tema do Não-Eu em detalhe',
      weeklyTeaser: 'Descubra em que ponto você está do seu ciclo de 52 semanas',
      upgradeCta: 'Tornar-se Mestre →',
    },
    // Dev
    dev: {
      enablePremium: '⚙ DEV · Ativar Premium',
      disablePremium: '⚙ DEV · Desativar Premium',
    },
    // Notification rationale (App Store 4.5.4 / Play Console)
    notif: {
      rationaleTitle: 'Lembrete diário',
      rationaleMessage: 'Quer que o Sakin Hayvan envie um lembrete silencioso toda manhã às 08:00 para você tirar a carta do dia? As notificações nunca são usadas para publicidade ou marketing.',
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
    passwordPlaceholder: 'Senha',
    signinBtn: 'Entrar',
    signupBtn: 'Criar conta',
    toSignup: 'Não tem conta? Crie uma',
    toSignin: 'Já tem conta? Entre',
    offlineBtn: 'Continuar sem conta',
    offlineHint: 'Seus dados ficam apenas neste dispositivo',
    errorNotConfigured: 'Servidor não configurado. Continue offline por enquanto.',
    errorInvalidInput: 'É necessário um e-mail válido e uma senha de pelo menos 6 caracteres.',
    errorGeneric: 'Algo deu errado.',
    errorNotConfiguredShort: 'Servidor não configurado.',
    errorAppleFailed: 'Não foi possível concluir o login com a Apple.',
    errorAppleError: 'Falha no login com a Apple.',
    infoEmailSent: 'E-mail de confirmação enviado. Verifique sua caixa de entrada.',
    errInvalidLogin: 'E-mail ou senha incorretos.',
    errAlreadyRegistered: 'Este e-mail já está registrado.',
    errNotConfirmed: 'Confirme seu e-mail primeiro.',
    errNetwork: 'Sem conexão com a internet.',
  },

  // ─── Paywall screen ───────────────────────────────────────────────────────────
  paywall: {
    eyebrow: 'FAMÍLIA SAKIN',
    mikroTitle: 'Guia animal ✦',
    premiumTitle: 'Sakin Premium',
    mikroSub: 'Aprofunde-se na orientação animal',
    premiumSub: 'Uma conta. Todos os apps Sakin.',
    mikroPlan: 'Micro',
    premiumPlan: 'Premium',
    mikroCadence: 'mês · só Animal',
    premiumCadence: 'mês · todos os apps',
    mostPopular: 'MAIS POPULAR',
    iosPrice: 'Os preços são exibidos pela App Store.',
    androidPrice: 'Os preços são exibidos pela Play Store.',
    ctaBtn: 'Tornar-se Mestre ✦',
    restoreBtn: 'Restaurar assinatura',
    legal: 'O pagamento será cobrado da sua conta da App Store ao confirmar a compra. A assinatura é renovada automaticamente, a menos que seja cancelada pelo menos 24 horas antes do fim do período atual. Você pode gerenciar e cancelar assinaturas nas configurações da sua conta da App Store.',
    errorPurchase: 'Não foi possível concluir a compra.',
    errorPurchaseTitle: 'Erro',
    infoRestore: 'O serviço de restauração de assinatura chegará em breve.',
    infoRestoreTitle: 'Informação',
    infoRestoreNone: 'Nenhuma assinatura ativa foi encontrada para esta conta.',
    linkTerms: 'Termos de uso',
    linkPrivacy: 'Política de privacidade',
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
      short: 'O animal espiritual que nasce com você e permanece por toda a vida.',
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
      short: 'O resumo numerológico da sua data de nascimento, mostra sua energia central.',
    },
    numeroloji: {
      term: 'Numerologia',
      short: 'A arte de ler os significados espirituais por trás dos números.',
    },
    ifade: {
      term: 'Número de expressão',
      short: 'Derivado das letras do seu nome, seus talentos naturais e seu potencial.',
    },
    ruhIstegi: {
      term: 'Número do desejo da alma',
      short: 'Das vogais do seu nome, sua motivação interior.',
    },
    kisilik: {
      term: 'Número de personalidade',
      short: 'Das consoantes do seu nome, o rosto que você mostra ao mundo.',
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
      short: 'Um guia que enxerga profundamente sistemas e pessoas. Estratégia: Esperar o convite.',
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
      short: 'A emoção que sinaliza que você está fora do seu verdadeiro caminho.',
    },
    unsur: {
      term: 'Elemento',
      short: 'As quatro qualidades fundamentais da natureza: Fogo, Água, Terra, Ar.',
    },
    arketip: {
      term: 'Arquétipo',
      short: 'Uma figura simbólica universal compartilhada por toda a humanidade.',
    },
    golge: {
      term: 'Sombra',
      short: 'As partes de nós mesmos que rejeitamos ou reprimimos em nossa consciência.',
    },
    kisiselYil: {
      term: 'Ano pessoal',
      short: 'O tema próprio do seu ano numerológico, em que passo do ciclo de 9 anos você está.',
    },
    rehber: {
      term: 'Animal espiritual',
      short: 'O animal totem que reflete sua personalidade e sua energia.',
    },
  },
} as const;
