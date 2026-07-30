export const de = {
  // ─── Tab bar ──────────────────────────────────────────────────────────────────
  tabs: {
    today: 'Heute',
    animals: 'Pflanzen',
    archive: 'Archiv',
    profile: 'Profil',
  },

  // ─── Home screen ──────────────────────────────────────────────────────────────
  home: {
    greeting: {
      night: 'Nachtschwärmer',
      morning: 'Guten Morgen',
      afternoon: 'Guten Tag',
      evening: 'Guten Abend',
    },
    defaultUser: 'Reisende(r)',
    decks: {
      animal: {
        title: 'Pflanze',
        short: 'PFLANZE',
        subtitle: 'Höre auf die Pflanze des Tages',
      },
      quote: {
        title: 'Rumi',
        short: 'RUMI',
        subtitle: 'Eine Antwort von Rumi',
      },
    },
    tapHint: 'schütteln · tippen',
    nextDeck: 'Nächstes Deck →',
    completed: 'Abgeschlossen ✦',
    doneTitle: 'Tägliche Führung\nabgeschlossen',
    doneSub: 'Morgen beginnt eine neue Reise',
    detailBtn: ' – tiefe Führung →',
  },

  // ─── Animals hub (stones) ────────────────────────────────────────────────────
  animalsHub: {
    eyebrow: 'SAKIN · PFLANZE',
    panels: {
      library: 'Pflanzen',
      finder: 'Finden',
      guidance: 'Führung',
    },
  },

  // ─── Animal library (stone library) ───────────────────────────────────────────
  animalLibrary: {
    back: '← Zurück',
    familyTag: 'SAKIN · PFLANZE',
    subtitle: '{count} Heilpflanzen und Kräuter',
    searchPlaceholder: 'Nach Name, Eigenschaft oder Element suchen...',
    noResults: 'Keine Ergebnisse gefunden.',
  },

  // ─── Animal detail (stone detail) ─────────────────────────────────────────────
  animalDetail: {
    back: '← Zurück',
    familyTag: 'SAKIN · PFLANZE',
    sections: {
      properties: 'Eigenschaften',
      todayMessage: 'Was er dir heute sagt',
      affirmation: 'AFFIRMATION',
      origin: 'Herkunft',
      myth: 'Mythos & Legende',
      chakra: 'Chakra',
      plant: 'Begleitpflanze',
      howToUse: 'Anwendung',
    },
    rarityLabels: {
      common: 'Häufig',
      uncommon: 'Selten',
      rare: 'Sehr selten',
    },
    footer: 'SAKIN FAMILIE ✦',
  },

  // ─── Animal finder (stone finder) ─────────────────────────────────────────────
  animalFinder: {
    headerTitle: 'Finde deine Pflanze',
    intro: {
      title: 'Entdecke deine Pflanze',
      desc: 'Finde die Pflanzen, die zu dir passen – nach deinem Sternzeichen oder Element.',
      note: 'Jede Pflanze trägt ihre eigene Schwingung. Wähle die, die dich ruft – den Rest sagt dir deine Intuition.',
      birthStoneTitle: 'Deine Geburtspflanze',
      zodiacLabel: 'Nach Sternzeichen',
      elementLabel: 'Nach Element',
      elementHint: 'Jede Pflanze schwingt mit einem Naturelement; deins ergibt sich aus deinem Zeichen – Feuer: Widder·Löwe·Schütze · Erde: Stier·Jungfrau·Steinbock · Luft: Zwillinge·Waage·Wassermann · Wasser: Krebs·Skorpion·Fische.',
    },
    elements: {
      fire: 'Feuer',
      earth: 'Erde',
      air: 'Luft',
      water: 'Wasser',
    },
    result: {
      zodiacLabel: 'Pflanzen von {name}',
      elementLabel: 'Pflanzen von {name}',
      birthLabel: 'Pflanze deines Geburtsmonats',
      empty: 'Für diese Auswahl wurden keine Pflanzen gefunden.',
      rediscoverBtn: 'Erneut wählen ✦',
      closeBtn: 'Schließen ✦',
    },
  },

  // ─── Nagual screen ────────────────────────────────────────────────────────────
  nagual: {
    back: '← Zurück',
    familyTag: 'SAKIN · NAGUAL',
    introTitle: 'Nagual — Zeitweiliger Begleiter',
    introText:
      'Dein Totemtier wird mit dir geboren und bleibt ein Leben lang. Der Nagual ist ein\nzeitweiliger Begleiter, der dich in einer bestimmten Phase begleitet. Er erscheint in\nZeiten der Prüfung, der Wandlung oder der Krise. Hat er seine Aufgabe erfüllt, überlässt\ner seinen Platz einem anderen Begleiter.',
    weekTag: 'DIESE WOCHE · UNIVERSELL',
    thisWeek: 'IN DIESER PHASE',
    daysLeft: 'noch {n} Tage',
    personalTag: 'MEIN PERSÖNLICHER BEGLEITER',
    guidance: 'FÜHRUNG',
    locked: {
      title: 'Mein persönlicher Begleiter',
      text: 'Um anhand deines Geburtshoroskops ein persönliches, zeitweiliges Begleittier zu bestimmen,\nvervollständige bitte dein Profil.\n\nDu kannst dein Geburtsdatum und Element unter Profil → Persönliche Karte hinzufügen.',
    },
  },

  // ─── Archive screen ───────────────────────────────────────────────────────────
  archive: {
    title: 'Archiv',
    readingsCount: '{n} Lesungen',
    spiritualMap: 'Spirituelle Karte',
    reportLabels: {
      guide: 'Begleiter',
      stone: 'Pflanze',
      animal: 'Pflanze',
      nagual: 'Pflanze',
    },
    filters: {
      all: 'Alle',
      quote: 'Botschaft',
      stone: 'Pflanze',
      animal: 'Pflanze',
      nagual: 'Pflanze',
    },
    empty: {
      title: 'Noch keine Lesungen.',
      subtitle: 'Öffne deine Karte auf dem Startbildschirm.',
    },
  },

  // ─── Profile screen ───────────────────────────────────────────────────────────
  profile: {
    // Onboarding
    onboarding: {
      title: 'Willkommen bei Sakin Hayvan',
      subtitle: 'Tägliche Führung aus der alten anatolischen Tradition',
      step1Question: 'Wie heißt du, Reisende(r)?',
      step1Placeholder: 'Gib deinen Namen ein...',
      step2Question: 'Welchem Element fühlst du dich am nächsten?',
      step3Question: 'Für deine persönliche Karte',
      step3Hint: 'Numerologie, Human Design und Elementanalyse.\nMehr Daten = stärkere Deutung.',
      fullNamePlaceholder: 'Vor- und Nachname...',
      birthDateLabel: 'Geburtsdatum',
      dayPlaceholder: 'Tag',
      monthPlaceholder: 'Monat',
      yearPlaceholder: 'Jahr',
      birthHourLabel: 'Geburtszeit',
      hourOptional: '(optional · für HD)',
      hourPlaceholder: 'Std.',
      minutePlaceholder: 'Min.',
      birthCityLabel: 'Geburtsstadt',
      cityOptional: '(optional)',
      cityPlaceholder: 'Istanbul, Berlin...',
      continueBtn: 'Weiter →',
      startBtn: 'Die Reise beginnen ✦',
      skipBtn: 'Jetzt nicht, überspringen',
    },
    // Stats
    stats: {
      totalReadings: 'Gesamte Lesungen',
      streak: 'Tagesserie',
      level: 'Stufe',
    },
    // Level
    levelProgress: 'Stufenfortschritt',
    readingsProgress: '{current} / {next} Lesungen',
    // Account
    account: {
      title: 'Konto',
      premiumLabel: 'Meister ✦',
      freeLabel: 'Kostenfreie(r) Reisende(r)',
      premiumRenewal: 'Verlängerung: {date}',
      premiumLifetime: 'Lebenslang',
      freeCta: 'Werde Meister für tiefgehende Analysen',
      upgradeBtn: 'Meister werden ✦',
      cancelBtn: 'Abbrechen',
      remindersLabel: 'Tägliche Erinnerung',
      remindersSub: 'Erhalte jeden Morgen um 08:00 Uhr deinen Begleiter',
      cloudBackup: 'Daten werden in der Cloud gesichert',
      signOutBtn: 'Abmelden',
      licenseTitle: 'Lizenzschlüssel',
      licensePlaceholder: 'XXXX-XXXX-XXXX',
      licenseApply: 'Anwenden',
      licenseSuccess: 'Premium aktiviert! Willkommen in der Sakin-Familie.',
      licenseAlready: 'Premium ist auf diesem Konto bereits aktiv.',
      licenseInvalid: 'Ungültiger oder bereits verwendeter Schlüssel.',
      licenseNetwork: 'Verbindungsfehler. Bitte erneut versuchen.',
      licenseSignInRequired: 'Melde dich zuerst an, um einen Schlüssel anzuwenden.',
      deleteLabel: 'Konto löschen',
      deleteSub: 'Lösche dein Konto und alle Daten endgültig.',
      deleteBtn: 'Löschen',
      deleteConfirmTitle: 'Konto wirklich löschen?',
      deleteConfirmMessage: 'Alle Lesungen, das Archiv, das Profil und die Statistiken werden endgültig gelöscht. Dies kann nicht rückgängig gemacht werden.',
      deleteConfirm: 'Ja, löschen',
      deleteCancel: 'Abbrechen',
    },
    // Personal Map
    personalMap: {
      title: 'Persönliche Karte',
      editBtn: '✎ Bearbeiten',
      lifePath: 'Lebensweg',
      expression: 'Ausdruck',
      soulUrge: 'Seelendrang',
      personality: 'Persönlichkeit',
      humanDesign: 'Human Design',
      strategy: 'Strategie',
      estimated: '(geschätzt)',
      hdTypeSelectHint: 'Wähle deinen Typ:',
      hdDisclaimer:
        '⚠ Die Berechnung ist eine Schätzung — genaues HD erfordert Geburtszeit und Ephemeriden.\nWenn du deinen Typ kennst, wähle ihn oben aus.',
      sunGates: 'Sonnentore',
      consciousSun: 'Bewusste Sonne',
      designSun: 'Design-Sonne',
      gatesNote: 'Typ geschätzt · Füge deine Geburtszeit hinzu und wähle ✎ für ein genaues Ergebnis',
      notSelf: 'Nicht-Selbst-Thema',
      weeklyReading: 'Wöchentliche Führung',
      weeklyThisWeek: 'Persönliche Deutung für diese Woche',
      weeklyMeta: 'Wöchentliche Führung · Woche {week}',
      personalYear: 'Persönliches Jahr: {year}',
      unlock: {
        title: 'Öffne deine persönliche Karte',
        desc: 'Gib deinen vollständigen Namen und dein Geburtsdatum ein.\nNumerologie, Human Design und wöchentliche Analyse.',
      },
      birthForm: {
        title: 'Geburtshoroskop-Angaben',
        hint: 'Zeit und Stadt sind für die Human-Design-Berechnung erforderlich.',
        fullNamePlaceholder: 'Vor- und Nachname (für Numerologie)',
        dateLabel: 'Geburtsdatum',
        dayPlaceholder: 'Tag',
        monthPlaceholder: 'Monat',
        yearPlaceholder: 'Jahr',
        hourLabel: 'Geburtszeit',
        hourOptional: '(wichtig für HD)',
        hourPlaceholder: 'Stunde (0–23)',
        minutePlaceholder: 'Minute',
        cityLabel: 'Geburtsstadt',
        cityOptional: '(für die Zeitzone)',
        cityPlaceholder: 'Istanbul, Berlin, Wien...',
        saveBtn: 'Meine Karte erstellen ✦',
        cancelBtn: 'Abbrechen',
      },
    },
    // Animal Guidance section
    animalGuidance: {
      birthStoneTitle: 'Deine Geburtspflanzen',
      sectionTitle: 'Was ist Tierführung?',
      totemTitle: '⊕ Totemtier',
      totemText:
        'Jeder Mensch trägt in seinem Wesen den Geist eines Tieres. Dieses Totemtier steht für dich; deine Energie, deine Stärken und der Weg, den du gehst, tragen seine Spuren. Das Totem ändert sich nie — es wird mit dir geboren und wächst mit dir.',
      nagualTitle: '◎ Nagual — Zeitweiliger Begleiter',
      nagualText:
        'Der Nagual ist ein zeitweiliger Begleiter, der für eine bestimmte Phase zu dir kommt. Er wird in Zeiten der Prüfung, der Wandlung oder der Krise gerufen. Hat er seine Aufgabe erfüllt, überlässt er seinen Platz einem anderen Begleiter. Das Tier deiner täglichen Lesung trägt die Stimme des heutigen Naguals.',
      finderTitle: 'Finde deinen Tierführer',
      finderDescPremium: 'Über Fragen oder dein Geburtsdatum und deine Geburtszeit',
      finderDescFree: 'Meister-Funktion ✦',
    },
    // Spiritual Map
    spiritualMap: {
      title: 'Spirituelle Karte',
      topGuide: 'Häufigster Führer-Dichter',
      topStone: 'Deine Schutzpflanze',
      topAnimal: 'Dein Totemtier',
      topNagual: 'Dein Nagual-Begleiter',
      companionCount: 'hat dich {n}-mal begleitet',
      stoneCount: 'erschien {n}-mal · {chakra}',
      nagualCount: '{n}-mal gerufen · {aspect}',
      emptyHint: 'Öffne deine erste Karte, und deine spirituelle Karte beginnt Gestalt anzunehmen.',
    },
    // Sakin Family
    sakinFamily: {
      title: 'Sakin Familie',
      intro: 'Ein Ökosystem. Ein Abonnement. Viele Türen.',
      masterDesc: 'Zentrale — Zugang zu allen Apps',
      apps: {
        animalGuidance: 'Tierführung',
        stoneGuidance: 'Pflanzenführung',
        plantGuidance: 'Pflanzenweisheit',
        myths: 'Mythen & Bilder',
        humanDesign: 'Human Design',
        numerology: 'Numerologie',
      },
      appDescs: {
        animalGuidance: 'Diese App',
        stoneGuidance: 'Die Sprache der Pflanzen',
        plantGuidance: 'Kräuterweisheit',
        myths: 'Archetypen und Symbole',
        humanDesign: 'Erkenne dein Design',
        numerology: 'Das Ich hinter den Zahlen',
      },
      active: 'AKTIV',
      comingSoon: 'BALD',
    },
    // Badges
    badges: {
      title: 'Abzeichen',
      list: {
        b001: { title: 'Erste Schritte', desc: 'Erste 7 Lesungen' },
        b002: { title: 'Feuer-Derwisch', desc: '21-Tage-Serie' },
        b003: { title: 'Mesnevi-Reisende(r)', desc: '30 Lesungen' },
        b004: { title: 'Gebetskette', desc: '33 Pflanzen gesehen' },
        b005: { title: 'Freund der Wahrheit', desc: '100 Lesungen' },
        b006: { title: 'Lichtreisende(r)', desc: '365 Lesungen' },
      },
    },
    // Premium teaser
    premium: {
      hdTeaser: 'Lies deine Strategie, Autorität und dein Nicht-Selbst-Thema im Detail',
      weeklyTeaser: 'Erfahre, wo du in deinem 52-Wochen-Zyklus stehst',
      upgradeCta: 'Meister werden →',
    },
    // Dev
    dev: {
      enablePremium: '⚙ DEV · Premium aktivieren',
      disablePremium: '⚙ DEV · Premium deaktivieren',
    },
    // Notification rationale (App Store 4.5.4 / Play Console)
    notif: {
      rationaleTitle: 'Tägliche Erinnerung',
      rationaleMessage: 'Soll Sakin Hayvan dir jeden Morgen um 08:00 Uhr eine stille Erinnerung senden, damit du deine Tageskarte ziehst? Benachrichtigungen werden niemals für Werbung oder Marketing verwendet.',
      rationaleConfirm: 'Erlauben',
      rationaleCancel: 'Jetzt nicht',
    },
    // Language
    language: {
      title: 'Sprache',
      note: 'Oberfläche und Inhalte werden in der gewählten Sprache angezeigt.',
    },
    elementNotSet: 'Kein Element gewählt',
  },

  // ─── Myths screen ─────────────────────────────────────────────────────────────
  myths: {
    back: '← Zurück',
    familyTag: 'SAKIN · MYTHOS',
    subtitle: 'Symbolische Kräfte, denen die Seele begegnet · {count} Mythen',
    searchPlaceholder: 'Nach Name, Symbol oder Element suchen...',
    noResults: 'Keine Ergebnisse gefunden.',
    filterAll: 'Alle',
    msgSection: 'BOTSCHAFT',
    guidanceSection: 'FÜHRUNG',
  },

  // ─── Auth screen ──────────────────────────────────────────────────────────────
  auth: {
    subtitle: 'Tägliche Führung aus der alten\nanatolischen Tradition',
    orLabel: 'oder',
    emailPlaceholder: 'E-Mail',
    passwordPlaceholder: 'Passwort',
    signinBtn: 'Anmelden',
    signupBtn: 'Konto erstellen',
    toSignup: 'Kein Konto? Erstelle eines',
    toSignin: 'Schon ein Konto? Anmelden',
    offlineBtn: 'Ohne Konto fortfahren',
    offlineHint: 'Deine Daten bleiben nur auf diesem Gerät',
    errorNotConfigured: 'Server nicht konfiguriert. Fahre vorerst offline fort.',
    errorInvalidInput: 'Gültige E-Mail und ein Passwort mit mindestens 6 Zeichen erforderlich.',
    errorGeneric: 'Etwas ist schiefgelaufen.',
    errorNotConfiguredShort: 'Server nicht konfiguriert.',
    errorAppleFailed: 'Apple-Anmeldung konnte nicht abgeschlossen werden.',
    errorAppleError: 'Apple-Anmeldung fehlgeschlagen.',
    infoEmailSent: 'Bestätigungs-E-Mail gesendet. Prüfe dein Postfach.',
    errInvalidLogin: 'E-Mail oder Passwort falsch.',
    errAlreadyRegistered: 'Diese E-Mail ist bereits registriert.',
    errNotConfirmed: 'Bitte bestätige zuerst deine E-Mail.',
    errNetwork: 'Keine Internetverbindung.',
  },

  // ─── Paywall screen ───────────────────────────────────────────────────────────
  paywall: {
    eyebrow: 'SAKIN FAMILIE',
    mikroTitle: 'Tierführer ✦',
    premiumTitle: 'Sakin Premium',
    mikroSub: 'Tauche tiefer in die Tierführung ein',
    premiumSub: 'Ein Konto. Alle Sakin-Apps.',
    mikroPlan: 'Mikro',
    premiumPlan: 'Premium',
    mikroCadence: 'Mon. · nur Tier',
    premiumCadence: 'Mon. · alle Apps',
    mostPopular: 'AM BELIEBTESTEN',
    iosPrice: 'Preise werden über den App Store angezeigt.',
    androidPrice: 'Preise werden über den Play Store angezeigt.',
    ctaBtn: 'Meister werden ✦',
    restoreBtn: 'Abo wiederherstellen',
    legal: 'Der Betrag wird bei Bestätigung des Kaufs deinem App-Store-Konto belastet. Das Abonnement verlängert sich automatisch, sofern es nicht mindestens 24 Stunden vor Ablauf des aktuellen Zeitraums gekündigt wird. Du kannst Abonnements in den Einstellungen deines App-Store-Kontos verwalten und kündigen.',
    errorPurchase: 'Kauf konnte nicht abgeschlossen werden.',
    errorPurchaseTitle: 'Fehler',
    infoRestore: 'Der Wiederherstellungsdienst für Abos kommt bald.',
    infoRestoreTitle: 'Info',
    infoRestoreNone: 'Für dieses Konto wurde kein aktives Abonnement gefunden.',
    linkTerms: 'Nutzungsbedingungen',
    linkPrivacy: 'Datenschutzrichtlinie',
  },

  // ─── Elements ─────────────────────────────────────────────────────────────────
  elements: {
    fire: 'Feuer',
    water: 'Wasser',
    earth: 'Erde',
    air: 'Luft',
  },

  // ─── Glossary terms ───────────────────────────────────────────────────────────
  glossary: {
    totem: {
      term: 'Totemtier',
      short: 'Das mit dir geborene Geisttier, das ein Leben lang bleibt.',
    },
    nagual: {
      term: 'Nagual',
      short: 'Ein zeitweiliger Begleiter, der dich in einer bestimmten Phase begleitet.',
    },
    mit: {
      term: 'Mythos',
      short: 'Eine symbolische Kraft, der die Seele begegnet — Schatten, Schwelle, Blitz...',
    },
    hayatYolu: {
      term: 'Lebensweg-Zahl',
      short: 'Die numerologische Zusammenfassung deines Geburtsdatums — zeigt deine Kernenergie.',
    },
    numeroloji: {
      term: 'Numerologie',
      short: 'Die Kunst, die spirituellen Bedeutungen hinter den Zahlen zu lesen.',
    },
    ifade: {
      term: 'Ausdrucks-Zahl',
      short: 'Aus den Buchstaben deines Namens — deine natürlichen Talente und dein Potenzial.',
    },
    ruhIstegi: {
      term: 'Seelendrang-Zahl',
      short: 'Aus den Vokalen deines Namens — deine innere Motivation.',
    },
    kisilik: {
      term: 'Persönlichkeits-Zahl',
      short: 'Aus den Konsonanten deines Namens — das Gesicht, das du der Welt zeigst.',
    },
    humanDesign: {
      term: 'Human Design',
      short: 'Ein System, das Astrologie, I Ging, Chakren und Kabbala vereint.',
    },
    jeneratör: {
      term: 'Generator',
      short: 'Die Quelle der Lebensenergie. Strategie: Reagieren.',
    },
    manifestingJeneratör: {
      term: 'Manifestierender Generator',
      short: 'Ein vieldimensionaler, schneller Generator. Strategie: Reagieren, dann handeln.',
    },
    projektör: {
      term: 'Projektor',
      short: 'Ein Führer, der tief in Systeme und Menschen blickt. Strategie: Auf Einladung warten.',
    },
    manifestor: {
      term: 'Manifestor',
      short: 'Unabhängiger Initiator. Strategie: Informieren.',
    },
    reflektör: {
      term: 'Reflektor',
      short: 'Der Spiegel der Gesellschaft. Strategie: 28 Tage warten.',
    },
    notSelf: {
      term: 'Nicht-Selbst-Thema',
      short: 'Das Gefühl, das signalisiert, dass du nicht auf deinem wahren Weg bist.',
    },
    unsur: {
      term: 'Element',
      short: 'Die vier Grundeigenschaften der Natur: Feuer, Wasser, Erde, Luft.',
    },
    arketip: {
      term: 'Archetyp',
      short: 'Eine universelle symbolische Gestalt, die die ganze Menschheit teilt.',
    },
    golge: {
      term: 'Schatten',
      short: 'Die Anteile unserer selbst, die wir in unserem Bewusstsein ablehnen oder unterdrücken.',
    },
    kisiselYil: {
      term: 'Persönliches Jahr',
      short: 'Das Thema deines numerologischen Jahres — in welchem Schritt des 9-Jahres-Zyklus du dich befindest.',
    },
    rehber: {
      term: 'Geisttier',
      short: 'Das Totemtier, das deine Persönlichkeit und Energie widerspiegelt.',
    },
  },
} as const;
