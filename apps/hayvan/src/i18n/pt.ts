export const pt = {
  // ─── Tab bar ──────────────────────────────────────────────────────────────────
  tabs: {
    today: 'Hoje',
    animals: 'Animais',
    archive: 'Arquivo',
    profile: 'Perfil',
  },

  // ─── Home screen ──────────────────────────────────────────────────────────────
  home: {
    greeting: {
      night: 'Notívago',
      morning: 'Bom dia',
      afternoon: 'Boa tarde',
      evening: 'Boa noite',
    },
    defaultUser: 'Viajante',
    decks: {
      animal: {
        title: 'Animal',
        short: 'ANIMAL',
        subtitle: 'Ouça o seu companheiro de alma',
      },
      quote: {
        title: 'Palavras',
        short: 'PALAVRA',
        subtitle: 'Da sabedoria da Anatólia',
      },
    },
    tapHint: 'agite · toque',
    nextDeck: 'Próximo baralho →',
    completed: 'Concluído ✦',
    doneTitle: 'Orientação diária\nconcluída',
    doneSub: 'Amanhã começa uma nova jornada',
    detailBtn: ': orientação profunda →',
  },

  // ─── Animals hub ─────────────────────────────────────────────────────────────
  animalsHub: {
    eyebrow: 'SAKIN · ANIMAL',
    panels: {
      library: 'Animais',
      finder: 'Encontrar',
      guidance: 'Orientação',
    },
  },

  // ─── Animal library ───────────────────────────────────────────────────────────
  animalLibrary: {
    back: '← Voltar',
    familyTag: 'SAKIN · ANIMAL',
    subtitle: 'Da Anatólia para o mundo · {count} guias animais',
    searchPlaceholder: 'Pesquise por nome, símbolo ou elemento...',
    noResults: 'Nenhum resultado encontrado.',
  },

  // ─── Animal detail ────────────────────────────────────────────────────────────
  animalDetail: {
    back: '← Voltar',
    familyTag: 'SAKIN · ANIMAL',
    sections: {
      anatolian: 'Na Anatólia',
      todayMessage: 'O que ele lhe diz hoje',
      guidance: 'ORIENTAÇÃO',
      jung: 'Nas palavras de Jung',
      dream: 'Vê-lo em sonhos',
      traditions: 'Nas tradições',
      myths: 'Lendas',
      shadow: 'Lado sombra',
      whenAppears: 'Quando aparece',
      thisPractice: 'Prática desta semana',
      relatedMyth: 'Mito relacionado',
    },
    missingLore:
      'A orientação mais profunda deste animal será ampliada em breve.\nPor ora, ele carrega a voz da Anatólia e a leitura de hoje.',
    resonanceHint: 'Força simbólica que ressoa com este animal →',
    footer: 'FAMÍLIA SAKIN ✦',
  },

  // ─── Animal finder ────────────────────────────────────────────────────────────
  animalFinder: {
    headerTitle: 'Encontre o seu guia animal',
    intro: {
      title: 'Descubra o seu animal espiritual',
      desc: 'Há dois caminhos para encontrar o animal totem alinhado com a sua alma.',
      note: 'Sakin segura um espelho — reflete o que já está dentro de você e sussurra o que é possível.\nSó você pode despertá-lo no seu coração, senti-lo e torná-lo seu.',
      quizBtn: {
        title: 'Descubra com perguntas',
        desc: '7 perguntas, de acordo com o seu caráter',
      },
      birthBtn: {
        title: 'Encontre pelos dados de nascimento',
        desc: 'Totem natal por data e hora',
      },
    },
    birth: {
      title: 'Insira os seus dados de nascimento',
      desc: 'A estação, o ano e a hora do seu nascimento moldam o seu animal totem.',
      dateLabel: 'Data de nascimento',
      dayPlaceholder: 'Dia',
      monthPlaceholder: 'Mês',
      yearPlaceholder: 'Ano',
      cityLabel: 'Cidade de nascimento',
      cityOptional: '(opcional)',
      cityPlaceholder: 'ex. Istambul, Lisboa, São Paulo...',
      cityHint: 'A energia do seu local de nascimento acrescenta profundidade à leitura.',
      hourLabel: 'Hora de nascimento',
      hourOptional: '(opcional)',
      hourPlaceholder: 'Hora (0–23)',
      hourHint: 'Se não souber a hora, deixe em branco — ainda assim será encontrada uma forte correspondência.',
      submitBtn: 'Encontrar o meu guia ✦',
    },
    result: {
      label: 'O seu guia animal',
      rediscoverBtn: 'Redescobrir ✦',
      closeBtn: 'Fechar ✦',
    },
    quiz: {
      questions: [
        {
          q: 'Qual ambiente na natureza o chama?',
          options: [
            'Montanhas e céu aberto',
            'Floresta e terra solitária',
            'Rios, mares, águas profundas',
            'Chamas quentes e fogo',
          ],
        },
        {
          q: 'Como você reage ao enfrentar uma situação difícil?',
          options: [
            'Pare, observe, trace uma estratégia',
            'Aja rapidamente',
            'Reúna os que estão à sua volta',
            'Recolha-se e busque força interior',
          ],
        },
        {
          q: 'Qual palavra o descreve melhor?',
          options: ['Livre', 'Forte', 'Sábio', 'Amoroso'],
        },
        {
          q: 'Que papel você assume em um grupo?',
          options: [
            'Pioneiro e desbravador',
            'Mediador e equilibrador',
            'Criativo e inspirador',
            'Observador e analista',
          ],
        },
        {
          q: 'Qual é a sua maior força?',
          options: [
            'Meus instintos e minha intuição',
            'Minha paciência e minha resistência',
            'Minha inteligência e minha adaptabilidade',
            'Minha coragem e minha paixão',
          ],
        },
        {
          q: 'O que lhe faz sentir liberdade na vida?',
          options: [
            'Tomar decisões independentes',
            'Estar seguro com os que amo',
            'Mudar e transformar-me',
            'Encontrar a verdade e aprofundar',
          ],
        },
        {
          q: 'Qual energia você sente mais forte agora?',
          options: [
            'Movimento e velocidade',
            'Silêncio e observação',
            'Abundância e comunidade',
            'Poder e transformação',
          ],
        },
      ],
    },
  },

  // ─── Nagual screen ────────────────────────────────────────────────────────────
  nagual: {
    back: '← Voltar',
    familyTag: 'SAKIN · NAGUAL',
    introTitle: 'Nagual — Guia periódico',
    introText:
      'O seu animal totem nasce com você e permanece por toda a vida. O nagual é um guia temporário\nque o acompanha durante um período específico. Ele chega em momentos de provação,\ntransformação ou crise. Cumprido o seu propósito, cede o lugar\na outro guia.',
    weekTag: 'ESTA SEMANA · UNIVERSAL',
    thisWeek: 'NESTE PERÍODO',
    daysLeft: 'Faltam {n} dias',
    personalTag: 'O MEU GUIA PESSOAL',
    guidance: 'ORIENTAÇÃO',
    locked: {
      title: 'O meu guia pessoal',
      text: 'Para determinar um animal guia periódico personalizado com base no seu mapa natal,\ncomplete o seu perfil.\n\nVocê pode adicionar a sua data de nascimento e o seu elemento em Perfil → Mapa pessoal.',
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
      animal: 'Animal',
      nagual: 'Nagual',
    },
    filters: {
      all: 'Todos',
      quote: 'Mensagem',
      stone: 'Pedra',
      animal: 'Animal',
      nagual: 'Nagual',
    },
    empty: {
      title: 'Ainda não há leituras.',
      subtitle: 'Abra a sua carta na tela inicial.',
    },
  },

  // ─── Profile screen ───────────────────────────────────────────────────────────
  profile: {
    // Onboarding
    onboarding: {
      title: 'Bem-vindo ao Sakin Hayvan',
      subtitle: 'Orientação diária da antiga tradição da Anatólia',
      step1Question: 'Qual é o seu nome, viajante?',
      step1Placeholder: 'Digite o seu nome...',
      step2Question: 'De qual elemento você se sente mais próximo?',
      step3Question: 'Para o seu mapa pessoal',
      step3Hint: 'Numerologia, Human Design e análise de elementos.\nMais dados = leitura mais forte.',
      fullNamePlaceholder: 'Nome completo...',
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
      startBtn: 'Iniciar a jornada ✦',
      skipBtn: 'Agora não, pular',
    },
    // Stats
    stats: {
      totalReadings: 'Total de leituras',
      streak: 'Dias seguidos',
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
      remindersSub: 'Receba o seu guia todas as manhãs às 08:00',
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
      deleteSub: 'Exclui permanentemente a sua conta e todos os dados.',
      deleteBtn: 'Excluir',
      deleteConfirmTitle: 'Excluir a sua conta?',
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
      hdTypeSelectHint: 'Selecione o seu tipo:',
      hdDisclaimer:
        '⚠ O cálculo é uma estimativa — um HD preciso requer hora de nascimento e efemérides.\nSe você conhece o seu tipo, selecione-o acima.',
      sunGates: 'Portões solares',
      consciousSun: 'Sol consciente',
      designSun: 'Sol do design',
      gatesNote: 'Tipo estimado · Adicione a sua hora de nascimento e selecione ✎ para um resultado preciso',
      notSelf: 'Tema do Não-Eu',
      weeklyReading: 'Orientação semanal',
      weeklyThisWeek: 'Leitura personalizada para esta semana',
      weeklyMeta: 'Orientação semanal · Semana {week}',
      personalYear: 'Ano pessoal: {year}',
      unlock: {
        title: 'Abra o seu mapa pessoal',
        desc: 'Insira o seu nome completo e a sua data de nascimento.\nNumerologia, Human Design e análise semanal.',
      },
      birthForm: {
        title: 'Dados do mapa natal',
        hint: 'A hora e a cidade são necessárias para os cálculos de Human Design.',
        fullNamePlaceholder: 'Nome completo (para numerologia)',
        dateLabel: 'Data de nascimento',
        dayPlaceholder: 'Dia',
        monthPlaceholder: 'Mês',
        yearPlaceholder: 'Ano',
        hourLabel: 'Hora de nascimento',
        hourOptional: '(importante para HD)',
        hourPlaceholder: 'Hora (0–23)',
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
      birthAnimalTitle: 'Seu Animal de Nascimento',
      sectionTitle: 'O que é a orientação animal?',
      totemTitle: '⊕ Animal totem',
      totemText:
        'Toda pessoa carrega o espírito de um animal em sua natureza. Esse animal totem representa você; a sua energia, os seus pontos fortes e o caminho que você percorre carregam os seus rastros. O totem nunca muda — nasce com você e cresce com você.',
      nagualTitle: '◎ Nagual — Guia periódico',
      nagualText:
        'O nagual é um guia temporário que vem até você por um período específico. Ele é chamado em momentos de provação, transformação ou crise. Cumprido o seu propósito, cede o lugar a outro guia. O animal sorteado na sua leitura diária carrega a voz do nagual de hoje.',
      finderTitle: 'Encontre o seu guia animal',
      finderDescPremium: 'Por perguntas ou pela sua data e hora de nascimento',
      finderDescFree: 'Recurso de Mestre ✦',
    },
    // Spiritual Map
    spiritualMap: {
      title: 'Mapa espiritual',
      topGuide: 'Poeta guia principal',
      topStone: 'A sua pedra guardiã',
      topAnimal: 'O seu animal totem',
      topNagual: 'O seu guia nagual',
      companionCount: 'acompanhou você {n} vezes',
      stoneCount: 'apareceu {n} vezes · {chakra}',
      nagualCount: 'foi invocado {n} vezes · {aspect}',
      emptyHint: 'Abra a sua primeira carta e o seu mapa espiritual começará a tomar forma.',
    },
    // Sakin Family
    sakinFamily: {
      title: 'Família Sakin',
      intro: 'Um ecossistema. Uma assinatura. Muitas portas.',
      masterDesc: 'Central — acesso a todos os apps',
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
        humanDesign: 'Conheça o seu design',
        numerology: 'O você por trás dos números',
      },
      active: 'ATIVO',
      comingSoon: 'EM BREVE',
    },
    // Badges
    badges: {
      title: 'Distintivos',
      subtitle: 'Mesmo que abra várias vezes no mesmo dia, conta só 1 por dia — 7/30/100/365 significa esse número de dias DIFERENTES.',
      list: {
        b001: { title: 'Primeiros passos', desc: 'Primeiros 7 dias' },
        b002: { title: 'Dervixe do fogo', desc: '21 dias seguidos' },
        b003: { title: 'Viajante do Mesnevi', desc: '30 dias' },
        b004: { title: 'Rosário', desc: '33 pedras vistas' },
        b005: { title: 'Amigo da verdade', desc: '100 dias' },
        b006: { title: 'Viajante da luz', desc: '365 dias' },
      },
    },
    // Premium teaser
    premium: {
      hdTeaser: 'Leia em detalhe a sua estratégia, autoridade e tema do Não-Eu',
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
      rationaleMessage: 'Você quer que o Sakin Hayvan envie um lembrete suave todas as manhãs às 08:00 para você tirar a sua carta diária? As notificações nunca são usadas para publicidade ou marketing.',
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
    searchPlaceholder: 'Pesquise por nome, símbolo ou elemento...',
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
    offlineHint: 'Os seus dados ficam apenas neste dispositivo',
    errorNotConfigured: 'Servidor não configurado. Continue offline por ora.',
    errorInvalidInput: 'É necessário um e-mail válido e uma senha de pelo menos 6 caracteres.',
    errorGeneric: 'Algo deu errado.',
    errorNotConfiguredShort: 'Servidor não configurado.',
    errorAppleFailed: 'Não foi possível concluir o login com a Apple.',
    errorAppleError: 'O login com a Apple falhou.',
    infoEmailSent: 'E-mail de confirmação enviado. Verifique a sua caixa de entrada.',
    errInvalidLogin: 'E-mail ou senha incorretos.',
    errAlreadyRegistered: 'Este e-mail já está cadastrado.',
    errNotConfirmed: 'Confirme o seu e-mail primeiro.',
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
    legal: 'O pagamento será cobrado na sua conta da App Store ao confirmar a compra. A assinatura é renovada automaticamente, a menos que seja cancelada pelo menos 24 horas antes do fim do período atual. Você pode gerenciar e cancelar assinaturas nas configurações da sua conta da App Store.',
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
      short: 'Um guia temporário que o acompanha durante um período específico.',
    },
    mit: {
      term: 'Mito',
      short: 'Uma força simbólica que a alma encontra — Sombra, Limiar, Relâmpago...',
    },
    hayatYolu: {
      term: 'Número do caminho de vida',
      short: 'O resumo numerológico da sua data de nascimento — mostra a sua energia central.',
    },
    numeroloji: {
      term: 'Numerologia',
      short: 'A arte de ler os significados espirituais por trás dos números.',
    },
    ifade: {
      term: 'Número da expressão',
      short: 'Derivado das letras do seu nome — os seus talentos naturais e o seu potencial.',
    },
    ruhIstegi: {
      term: 'Número do desejo da alma',
      short: 'Das vogais do seu nome — a sua motivação interior.',
    },
    kisilik: {
      term: 'Número da personalidade',
      short: 'Das consoantes do seu nome — o rosto que você mostra ao mundo.',
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
      short: 'Um guia que vê profundamente os sistemas e as pessoas. Estratégia: Esperar o convite.',
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
      short: 'O tema específico do seu ano numerológico — em qual passo do ciclo de 9 anos você está.',
    },
    rehber: {
      term: 'Animal espiritual',
      short: 'O animal totem que reflete a sua personalidade e a sua energia.',
    },
  },
} as const;
