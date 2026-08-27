export const fr = {
  // ─── Tab bar ──────────────────────────────────────────────────────────────────
  tabs: {
    today: "Aujourd'hui",
    animals: 'Pierres',
    archive: 'Archives',
    profile: 'Profil',
  },

  // ─── Home screen ──────────────────────────────────────────────────────────────
  home: {
    greeting: {
      night: 'Oiseau de nuit',
      morning: 'Bonjour',
      afternoon: 'Bon après-midi',
      evening: 'Bonsoir',
    },
    defaultUser: 'Voyageur',
    decks: {
      animal: {
        title: 'Pierre',
        short: 'PIERRE',
        subtitle: "Écoute la pierre du jour",
      },
      quote: {
        title: 'Rûmî',
        short: 'RÛMÎ',
        subtitle: 'Une réponse de Rûmî',
      },
    },
    tapHint: 'secoue · touche',
    nextDeck: 'Jeu suivant →',
    completed: 'Terminé ✦',
    doneTitle: 'Guidance du jour\nterminée',
    doneSub: 'Un nouveau voyage commence demain',
    detailBtn: ' : guidance approfondie →',
  },

  // ─── Animals hub (stones) ────────────────────────────────────────────────────
  animalsHub: {
    eyebrow: 'SAKIN · PIERRE',
    panels: {
      library: 'Pierres',
      finder: 'Trouver',
      guidance: 'Guidance',
    },
  },

  // ─── Animal library (stone library) ───────────────────────────────────────────
  animalLibrary: {
    back: '← Retour',
    familyTag: 'SAKIN · PIERRE',
    subtitle: '{count} pierres de guérison et cristaux',
    searchPlaceholder: 'Rechercher par nom, propriété ou élément...',
    noResults: 'Aucun résultat trouvé.',
  },

  // ─── Animal detail (stone detail) ─────────────────────────────────────────────
  animalDetail: {
    back: '← Retour',
    familyTag: 'SAKIN · PIERRE',
    sections: {
      properties: 'Propriétés',
      todayMessage: "Ce qu'elle te dit aujourd'hui",
      affirmation: 'AFFIRMATION',
      origin: 'Origine',
      myth: 'Mythe & légende',
      chakra: 'Chakra',
      plant: 'Plante compagne',
      howToUse: 'Comment l\'utiliser',
    },
    rarityLabels: {
      common: 'Courant',
      uncommon: 'Peu courant',
      rare: 'Rare',
    },
    footer: 'FAMILLE SAKIN ✦',
  },

  // ─── Animal finder (stone finder) ─────────────────────────────────────────────
  animalFinder: {
    headerTitle: 'Trouve ta pierre',
    intro: {
      title: 'Découvre ta pierre',
      desc: 'Trouve les cristaux alignés avec toi selon ton signe ou ton élément.',
      note: 'Chaque pierre porte sa propre vibration. Choisis celle qui t\'appelle — ton intuition fera le reste.',
      birthStoneTitle: 'Ta pierre de naissance',
      zodiacLabel: 'Par signe',
      elementLabel: 'Par élément',
      elementHint: "Chaque cristal vibre avec un élément naturel ; le tien vient de ton signe — feu : Bélier·Lion·Sagittaire · terre : Taureau·Vierge·Capricorne · air : Gémeaux·Balance·Verseau · eau : Cancer·Scorpion·Poissons.",
    },
    elements: {
      fire: 'Feu',
      earth: 'Terre',
      air: 'Air',
      water: 'Eau',
    },
    result: {
      zodiacLabel: 'Pierres de {name}',
      elementLabel: 'Pierres de {name}',
      birthLabel: 'Pierre de ton mois de naissance',
      empty: 'Aucune pierre trouvée pour cette sélection.',
      rediscoverBtn: 'Choisir à nouveau ✦',
      closeBtn: 'Fermer ✦',
    },
  },

  // ─── Nagual screen ────────────────────────────────────────────────────────────
  nagual: {
    back: '← Retour',
    familyTag: 'SAKIN · NAGUAL',
    introTitle: 'Nagual — Guide temporaire',
    introText:
      "Ton animal totem naît avec toi et reste toute la vie. Le nagual est un guide\ntemporaire qui t'accompagne durant une période précise. Il arrive lors des épreuves,\ndes transformations ou des crises. Une fois sa mission accomplie, il cède sa place\nà un autre guide.",
    weekTag: 'CETTE SEMAINE · UNIVERSEL',
    thisWeek: 'EN CETTE PÉRIODE',
    daysLeft: 'il reste {n} jours',
    personalTag: 'MON GUIDE PERSONNEL',
    guidance: 'GUIDANCE',
    locked: {
      title: 'Mon guide personnel',
      text: "Pour déterminer un animal guide temporaire personnalisé selon ton thème de naissance,\ncomplète ton profil.\n\nTu peux ajouter ta date de naissance et ton élément dans Profil → Carte personnelle.",
    },
  },

  // ─── Archive screen ───────────────────────────────────────────────────────────
  archive: {
    title: 'Archives',
    readingsCount: '{n} tirages',
    spiritualMap: 'Carte spirituelle',
    reportLabels: {
      guide: 'Guide',
      stone: 'Pierre',
      animal: 'Pierre',
      nagual: 'Pierre',
    },
    filters: {
      all: 'Tous',
      quote: 'Message',
      stone: 'Pierre',
      animal: 'Pierre',
      nagual: 'Pierre',
    },
    empty: {
      title: 'Aucun tirage pour le moment.',
      subtitle: "Ouvre ta carte depuis l'écran d'accueil.",
    },
  },

  // ─── Profile screen ───────────────────────────────────────────────────────────
  profile: {
    // Onboarding
    onboarding: {
      title: 'Bienvenue sur Sakin Hayvan',
      subtitle: "Guidance quotidienne issue de l'ancienne tradition anatolienne",
      step1Question: 'Quel est ton nom, voyageur ?',
      step1Placeholder: 'Saisis ton nom...',
      step2Question: 'De quel élément te sens-tu le plus proche ?',
      step3Question: 'Pour ta carte personnelle',
      step3Hint: 'Numérologie, Human Design et analyse des éléments.\nPlus de données = lecture plus puissante.',
      fullNamePlaceholder: 'Nom et prénom...',
      birthDateLabel: 'Date de naissance',
      dayPlaceholder: 'Jour',
      monthPlaceholder: 'Mois',
      yearPlaceholder: 'Année',
      birthHourLabel: 'Heure de naissance',
      hourOptional: '(facultatif · pour le HD)',
      hourPlaceholder: 'Heure',
      minutePlaceholder: 'Min',
      birthCityLabel: 'Ville de naissance',
      cityOptional: '(facultatif)',
      cityPlaceholder: 'Istanbul, Paris...',
      continueBtn: 'Continuer →',
      startBtn: 'Commencer le voyage ✦',
      skipBtn: 'Pas maintenant, passer',
    },
    // Stats
    stats: {
      totalReadings: 'Total des tirages',
      streak: 'Série de jours',
      level: 'Niveau',
    },
    // Level
    levelProgress: 'Progression de niveau',
    readingsProgress: '{current} / {next} tirages',
    // Account
    account: {
      title: 'Compte',
      premiumLabel: 'Maître ✦',
      freeLabel: 'Voyageur gratuit',
      premiumRenewal: 'Renouvellement : {date}',
      premiumLifetime: 'À vie',
      freeCta: 'Devenez Maître pour une analyse approfondie',
      upgradeBtn: 'Devenir Maître ✦',
      cancelBtn: 'Annuler',
      remindersLabel: 'Rappel quotidien',
      remindersSub: 'Reçois ton guide chaque matin à 08h00',
      cloudBackup: 'Données sauvegardées dans le cloud',
      signOutBtn: 'Se déconnecter',
      licenseTitle: 'Clé de licence',
      licensePlaceholder: 'XXXX-XXXX-XXXX',
      licenseApply: 'Appliquer',
      licenseSuccess: 'Premium activé ! Bienvenue dans la famille Sakin.',
      licenseAlready: 'Le Premium est déjà actif sur ce compte.',
      licenseInvalid: 'Clé invalide ou déjà utilisée.',
      licenseNetwork: 'Erreur de connexion. Réessaie.',
      licenseSignInRequired: 'Connecte-toi d\'abord à ton compte pour appliquer une clé.',
      deleteLabel: 'Supprimer le compte',
      deleteSub: 'Supprime ton compte et toutes tes données de façon permanente.',
      deleteBtn: 'Supprimer',
      deleteConfirmTitle: 'Supprimer ton compte ?',
      deleteConfirmMessage: 'Tous les tirages, les archives, le profil et les statistiques seront définitivement effacés. Cette action est irréversible.',
      deleteConfirm: 'Oui, supprimer',
      deleteCancel: 'Annuler',
    },
    // Personal Map
    personalMap: {
      title: 'Carte personnelle',
      editBtn: '✎ Modifier',
      lifePath: 'Chemin de vie',
      expression: 'Expression',
      soulUrge: "Élan de l'âme",
      personality: 'Personnalité',
      humanDesign: 'Human Design',
      strategy: 'Stratégie',
      estimated: '(estimé)',
      hdTypeSelectHint: 'Sélectionne ton type :',
      hdDisclaimer:
        "⚠ Le calcul est une estimation — un HD précis nécessite l'heure de naissance et des éphémérides.\nSi tu connais ton type, sélectionne-le ci-dessus.",
      sunGates: 'Portes solaires',
      consciousSun: 'Soleil conscient',
      designSun: 'Soleil de design',
      gatesNote: "Type estimé · Ajoute ton heure de naissance et sélectionne ✎ pour un résultat précis",
      notSelf: 'Thème du Non-Soi',
      weeklyReading: 'Guidance hebdomadaire',
      weeklyThisWeek: 'Lecture personnalisée pour cette semaine',
      weeklyMeta: 'Guidance hebdomadaire · Semaine {week}',
      personalYear: 'Année personnelle : {year}',
      unlock: {
        title: 'Ouvre ta carte personnelle',
        desc: 'Saisis ton nom complet et ta date de naissance.\nNumérologie, Human Design et analyse hebdomadaire.',
      },
      birthForm: {
        title: 'Données du thème de naissance',
        hint: "L'heure et la ville sont nécessaires aux calculs du Human Design.",
        fullNamePlaceholder: 'Nom complet (pour la numérologie)',
        dateLabel: 'Date de naissance',
        dayPlaceholder: 'Jour',
        monthPlaceholder: 'Mois',
        yearPlaceholder: 'Année',
        hourLabel: 'Heure de naissance',
        hourOptional: '(important pour le HD)',
        hourPlaceholder: 'Heure (0-23)',
        minutePlaceholder: 'Minute',
        cityLabel: 'Ville de naissance',
        cityOptional: '(pour le fuseau horaire)',
        cityPlaceholder: 'Istanbul, Paris, Montréal...',
        saveBtn: 'Créer ma carte ✦',
        cancelBtn: 'Annuler',
      },
    },
    // Animal Guidance section
    animalGuidance: {
      birthStoneTitle: 'Tes Pierres de Naissance',
      sectionTitle: "Qu'est-ce que la guidance animale ?",
      totemTitle: '⊕ Animal totem',
      totemText:
        "Chaque personne porte en sa nature l'esprit d'un animal. Cet animal totem te représente ; ton énergie, tes forces et le chemin que tu parcours portent ses traces. Le totem ne change jamais — il naît avec toi et grandit avec toi.",
      nagualTitle: '◎ Nagual — Guide temporaire',
      nagualText:
        "Le nagual est un guide temporaire qui vient à toi pour une période précise. On l'appelle lors des épreuves, des transformations ou des crises. Une fois sa mission accomplie, il cède sa place à un autre guide. L'animal tiré dans ta lecture quotidienne porte la voix du nagual du jour.",
      finderTitle: 'Trouve ton guide animal',
      finderDescPremium: 'Par des questions ou par ta date et ton heure de naissance',
      finderDescFree: 'Fonction Maître ✦',
    },
    // Spiritual Map
    spiritualMap: {
      title: 'Carte spirituelle',
      topGuide: 'Poète guide le plus fréquent',
      topStone: 'Ta pierre protectrice',
      topAnimal: 'Ton animal totem',
      topNagual: 'Ton guide nagual',
      companionCount: "t'a accompagné {n} fois",
      stoneCount: 'apparue {n} fois · {chakra}',
      nagualCount: 'invoqué {n} fois · {aspect}',
      emptyHint: 'Ouvre ta première carte et ta carte spirituelle commencera à prendre forme.',
    },
    // Sakin Family
    sakinFamily: {
      title: 'Famille Sakin',
      intro: 'Un écosystème. Un abonnement. De nombreuses portes.',
      masterDesc: 'Base centrale — accès à toutes les applis',
      apps: {
        animalGuidance: 'Guidance animale',
        stoneGuidance: 'Guidance des cristaux',
        plantGuidance: 'Sagesse des plantes',
        myths: 'Mythes et images',
        humanDesign: 'Human Design',
        numerology: 'Numérologie',
      },
      appDescs: {
        animalGuidance: 'Cette appli',
        stoneGuidance: 'Le langage des cristaux',
        plantGuidance: 'Sagesse des herbes',
        myths: 'Archétypes et symboles',
        humanDesign: 'Connais ton design',
        numerology: 'Le toi derrière les nombres',
      },
      active: 'ACTIF',
      comingSoon: 'BIENTÔT',
    },
    // Badges
    badges: {
      title: 'Badges',
      list: {
        b001: { title: 'Premiers pas', desc: '7 premières lectures' },
        b002: { title: 'Derviche du feu', desc: 'Série de 21 jours' },
        b003: { title: 'Voyageur du Mesnevi', desc: '30 lectures' },
        b004: { title: 'Chapelet', desc: '33 pierres vues' },
        b005: { title: 'Ami de la vérité', desc: '100 lectures' },
        b006: { title: 'Voyageur de lumière', desc: '365 lectures' },
      },
    },
    // Premium teaser
    premium: {
      hdTeaser: 'Lis ta stratégie, ton autorité et ton thème du Non-Soi en détail',
      weeklyTeaser: 'Découvre où tu en es dans ton cycle de 52 semaines',
      upgradeCta: 'Devenir Maître →',
    },
    // Dev
    dev: {
      enablePremium: '⚙ DEV · Activer Premium',
      disablePremium: '⚙ DEV · Désactiver Premium',
    },
    // Notification rationale (App Store 4.5.4 / Play Console)
    notif: {
      rationaleTitle: 'Rappel quotidien',
      rationaleMessage: "Souhaites-tu que Sakin Hayvan t'envoie un rappel discret chaque matin à 08h00 pour tirer ta carte du jour ? Les notifications ne sont jamais utilisées à des fins publicitaires ou marketing.",
      rationaleConfirm: 'Autoriser',
      rationaleCancel: 'Pas maintenant',
    },
    // Language
    language: {
      title: 'Langue',
      note: "L'interface et le contenu s'affichent dans la langue choisie.",
    },
    elementNotSet: 'Aucun élément sélectionné',
  },

  // ─── Myths screen ─────────────────────────────────────────────────────────────
  myths: {
    back: '← Retour',
    familyTag: 'SAKIN · MYTHE',
    subtitle: "Forces symboliques que l'âme rencontre · {count} mythes",
    searchPlaceholder: 'Rechercher par nom, symbole ou élément...',
    noResults: 'Aucun résultat trouvé.',
    filterAll: 'Tous',
    msgSection: 'MESSAGE',
    guidanceSection: 'GUIDANCE',
  },

  // ─── Auth screen ──────────────────────────────────────────────────────────────
  auth: {
    subtitle: "Guidance quotidienne issue de l'ancienne\ntradition anatolienne",
    orLabel: 'ou',
    emailPlaceholder: 'E-mail',
    passwordPlaceholder: 'Mot de passe',
    signinBtn: 'Se connecter',
    signupBtn: 'Créer un compte',
    toSignup: 'Pas de compte ? Créez-en un',
    toSignin: 'Déjà un compte ? Connectez-vous',
    offlineBtn: 'Continuer sans compte',
    offlineHint: 'Tes données restent uniquement sur cet appareil',
    errorNotConfigured: 'Serveur non configuré. Continue hors ligne pour le moment.',
    errorInvalidInput: 'Un e-mail valide et un mot de passe d\'au moins 6 caractères sont requis.',
    errorGeneric: "Une erreur s'est produite.",
    errorNotConfiguredShort: 'Serveur non configuré.',
    errorAppleFailed: "La connexion Apple n'a pas pu aboutir.",
    errorAppleError: 'Échec de la connexion Apple.',
    infoEmailSent: 'E-mail de confirmation envoyé. Vérifie ta boîte de réception.',
    errInvalidLogin: 'E-mail ou mot de passe incorrect.',
    errAlreadyRegistered: 'Cet e-mail est déjà enregistré.',
    errNotConfirmed: 'Confirme d\'abord ton e-mail.',
    errNetwork: 'Pas de connexion internet.',
  },

  // ─── Paywall screen ───────────────────────────────────────────────────────────
  paywall: {
    eyebrow: 'FAMILLE SAKIN',
    mikroTitle: 'Guide animal ✦',
    premiumTitle: 'Sakin Premium',
    mikroSub: 'Approfondis la guidance animale',
    premiumSub: 'Un compte. Toutes les applis Sakin.',
    mikroPlan: 'Micro',
    premiumPlan: 'Premium',
    mikroCadence: 'mois · Animal seul',
    premiumCadence: 'mois · toutes les applis',
    mostPopular: 'LE PLUS POPULAIRE',
    iosPrice: "Les prix sont affichés via l'App Store.",
    androidPrice: 'Les prix sont affichés via le Play Store.',
    ctaBtn: 'Devenir Maître ✦',
    restoreBtn: "Restaurer l'abonnement",
    legal: "Le paiement sera prélevé sur votre compte App Store à la confirmation de l'achat. L'abonnement se renouvelle automatiquement sauf s'il est annulé au moins 24 heures avant la fin de la période en cours. Vous pouvez gérer et annuler vos abonnements dans les réglages de votre compte App Store.",
    errorPurchase: "L'achat n'a pas pu aboutir.",
    errorPurchaseTitle: 'Erreur',
    infoRestore: "Le service de restauration d'abonnement arrive bientôt.",
    infoRestoreTitle: 'Information',
    infoRestoreNone: 'Aucun abonnement actif trouvé pour ce compte.',
    linkTerms: "Conditions d'utilisation",
    linkPrivacy: 'Politique de confidentialité',
  },

  // ─── Elements ─────────────────────────────────────────────────────────────────
  elements: {
    fire: 'feu',
    water: 'eau',
    earth: 'terre',
    air: 'air',
  },

  // ─── Glossary terms ───────────────────────────────────────────────────────────
  glossary: {
    totem: {
      term: 'Animal totem',
      short: "L'animal spirituel qui naît avec toi et reste toute la vie.",
    },
    nagual: {
      term: 'Nagual',
      short: "Un guide temporaire qui t'accompagne durant une période précise.",
    },
    mit: {
      term: 'Mythe',
      short: "Une force symbolique que l'âme rencontre — Ombre, Seuil, Éclair...",
    },
    hayatYolu: {
      term: 'Nombre du chemin de vie',
      short: 'Le résumé numérologique de ta date de naissance — révèle ton énergie centrale.',
    },
    numeroloji: {
      term: 'Numérologie',
      short: "L'art de lire les significations spirituelles derrière les nombres.",
    },
    ifade: {
      term: "Nombre d'expression",
      short: 'Issu des lettres de ton nom — tes talents naturels et ton potentiel.',
    },
    ruhIstegi: {
      term: "Nombre de l'élan de l'âme",
      short: 'Issu des voyelles de ton nom — ta motivation intérieure.',
    },
    kisilik: {
      term: 'Nombre de personnalité',
      short: 'Issu des consonnes de ton nom — le visage que tu montres au monde.',
    },
    humanDesign: {
      term: 'Human Design',
      short: "Un système alliant astrologie, Yi King, chakras et Kabbale.",
    },
    jeneratör: {
      term: 'Générateur',
      short: "La source de l'énergie vitale. Stratégie : Répondre.",
    },
    manifestingJeneratör: {
      term: 'Générateur manifesteur',
      short: 'Un Générateur multidimensionnel et rapide. Stratégie : Répondre puis agir.',
    },
    projektör: {
      term: 'Projecteur',
      short: "Un guide qui perçoit en profondeur les systèmes et les personnes. Stratégie : Attendre l'invitation.",
    },
    manifestor: {
      term: 'Manifesteur',
      short: 'Initiateur indépendant. Stratégie : Informer.',
    },
    reflektör: {
      term: 'Réflecteur',
      short: 'Le miroir de la société. Stratégie : Attendre 28 jours.',
    },
    notSelf: {
      term: 'Thème du Non-Soi',
      short: "L'émotion qui signale que tu n'es pas sur ta vraie voie.",
    },
    unsur: {
      term: 'Élément',
      short: 'Les quatre qualités fondamentales de la nature : Feu, Eau, Terre, Air.',
    },
    arketip: {
      term: 'Archétype',
      short: "Une figure symbolique universelle partagée par toute l'humanité.",
    },
    golge: {
      term: 'Ombre',
      short: 'Les parts de nous-mêmes que nous rejetons ou refoulons dans notre conscience.',
    },
    kisiselYil: {
      term: 'Année personnelle',
      short: 'Le thème propre à ton année numérologique — à quelle étape du cycle de 9 ans tu te trouves.',
    },
    rehber: {
      term: 'Animal spirituel',
      short: 'L\'animal totem qui reflète ta personnalité et ton énergie.',
    },
  },
} as const;
