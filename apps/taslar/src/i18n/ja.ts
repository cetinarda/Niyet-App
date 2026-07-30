export const ja = {
  // ─── Tab bar ──────────────────────────────────────────────────────────────────
  tabs: {
    today: '今日',
    animals: '石',
    archive: 'アーカイブ',
    profile: 'プロフィール',
  },

  // ─── Home screen ──────────────────────────────────────────────────────────────
  home: {
    greeting: {
      night: '夜更かしさん',
      morning: 'おはようございます',
      afternoon: 'こんにちは',
      evening: 'こんばんは',
    },
    defaultUser: '旅人',
    decks: {
      animal: {
        title: '石',
        short: '石',
        subtitle: '今日の石に耳を澄ませて',
      },
      quote: {
        title: 'ルーミー',
        short: 'ルーミー',
        subtitle: 'ルーミーからの答え',
      },
    },
    tapHint: '振る · タップ',
    nextDeck: '次のデッキ →',
    completed: '完了 ✦',
    doneTitle: '今日の導きが\n完了しました',
    doneSub: '明日、新しい旅が始まります',
    detailBtn: 'の深い導き →',
  },

  // ─── Animals hub (stones) ────────────────────────────────────────────────────
  animalsHub: {
    eyebrow: 'SAKIN · 石',
    panels: {
      library: '石',
      finder: '探す',
      guidance: '導き',
    },
  },

  // ─── Animal library (stone library) ───────────────────────────────────────────
  animalLibrary: {
    back: '← 戻る',
    familyTag: 'SAKIN · 石',
    subtitle: '{count}種類の癒しの石とクリスタル',
    searchPlaceholder: '名前・性質・元素で検索...',
    noResults: '結果が見つかりませんでした。',
  },

  // ─── Animal detail (stone detail) ─────────────────────────────────────────────
  animalDetail: {
    back: '← 戻る',
    familyTag: 'SAKIN · 石',
    sections: {
      properties: '性質',
      todayMessage: '今日あなたへのメッセージ',
      affirmation: 'アファメーション',
      origin: '産地',
      myth: '神話と伝説',
      chakra: 'チャクラ',
      plant: '寄り添う植物',
      howToUse: '使い方',
    },
    rarityLabels: {
      common: '一般的',
      uncommon: 'やや希少',
      rare: '希少',
    },
    footer: 'SAKIN ファミリー ✦',
  },

  // ─── Animal finder (stone finder) ─────────────────────────────────────────────
  animalFinder: {
    headerTitle: 'あなたの石を見つける',
    intro: {
      title: 'あなたの石を発見しよう',
      desc: '星座や元素から、あなたと響き合うクリスタルを見つけましょう。',
      note: 'どの石にも固有の波動があります。呼びかけてくる石を選んでください——あとは直感が導いてくれます。',
      birthStoneTitle: 'あなたの誕生石',
      zodiacLabel: '星座で選ぶ',
      elementLabel: '元素で選ぶ',
      elementHint: 'どのクリスタルも自然の元素と共鳴します。あなたの元素は星座から決まります——火: 牡羊·獅子·射手 · 地: 牡牛·乙女·山羊 · 風: 双子·天秤·水瓶 · 水: 蟹·蠍·魚。',
    },
    elements: {
      fire: '火',
      earth: '地',
      air: '風',
      water: '水',
    },
    result: {
      zodiacLabel: '{name}の石',
      elementLabel: '{name}の石',
      birthLabel: '誕生月の石',
      empty: 'この選択に合う石は見つかりませんでした。',
      rediscoverBtn: 'もう一度選ぶ ✦',
      closeBtn: '閉じる ✦',
    },
  },

  // ─── Nagual screen ────────────────────────────────────────────────────────────
  nagual: {
    back: '← 戻る',
    familyTag: 'SAKIN · ナワル',
    introTitle: 'ナワル — 期間の導き手',
    introText:
      'トーテムの動物はあなたとともに生まれ、生涯寄り添います。一方ナワルは、特定の\n時期にあなたに寄り添う一時的な導き手です。試練や変容、危機のときに\n現れます。その役目を果たすと、別の導き手にその場を\n譲ります。',
    weekTag: '今週 · 普遍',
    thisWeek: 'この時期',
    daysLeft: '残り{n}日',
    personalTag: '私の専属の導き手',
    guidance: '導き',
    locked: {
      title: '私の専属の導き手',
      text: '出生図にもとづいてあなただけの期間の導きの動物を定めるには、\nプロフィールを完成させてください。\n\n生年月日と元素は「プロフィール → パーソナルマップ」から追加できます。',
    },
  },

  // ─── Archive screen ───────────────────────────────────────────────────────────
  archive: {
    title: 'アーカイブ',
    readingsCount: '{n}件のリーディング',
    spiritualMap: 'スピリチュアルマップ',
    reportLabels: {
      guide: '導き手',
      stone: '石',
      animal: '石',
      nagual: '石',
    },
    filters: {
      all: 'すべて',
      quote: 'メッセージ',
      stone: '石',
      animal: '石',
      nagual: '石',
    },
    empty: {
      title: 'まだリーディングがありません。',
      subtitle: 'ホーム画面からカードを開いてください。',
    },
  },

  // ─── Profile screen ───────────────────────────────────────────────────────────
  profile: {
    // Onboarding
    onboarding: {
      title: 'Sakin Hayvan へようこそ',
      subtitle: '古代アナトリアの伝統による日々の導き',
      step1Question: 'あなたの名前は、旅人さん？',
      step1Placeholder: '名前を入力...',
      step2Question: 'どの元素に最も近さを感じますか？',
      step3Question: 'パーソナルマップのために',
      step3Hint: '数秘術、ヒューマンデザイン、元素分析。\n情報が多いほど、より深いリーディングに。',
      fullNamePlaceholder: '姓名...',
      birthDateLabel: '生年月日',
      dayPlaceholder: '日',
      monthPlaceholder: '月',
      yearPlaceholder: '年',
      birthHourLabel: '出生時刻',
      hourOptional: '（任意 · HD用）',
      hourPlaceholder: '時',
      minutePlaceholder: '分',
      birthCityLabel: '出生地',
      cityOptional: '（任意）',
      cityPlaceholder: 'イスタンブール、東京...',
      continueBtn: '次へ →',
      startBtn: '旅を始める ✦',
      skipBtn: '今はスキップ',
    },
    // Stats
    stats: {
      totalReadings: '総リーディング数',
      streak: '連続日数',
      level: 'レベル',
    },
    // Level
    levelProgress: 'レベルの進捗',
    readingsProgress: '{current} / {next} リーディング',
    // Account
    account: {
      title: 'アカウント',
      premiumLabel: 'マスター ✦',
      freeLabel: '無料の旅人',
      premiumRenewal: '更新日: {date}',
      premiumLifetime: '永久',
      freeCta: '詳細な分析にはマスターになりましょう',
      upgradeBtn: 'マスターになる ✦',
      cancelBtn: 'キャンセル',
      remindersLabel: '毎日のリマインダー',
      remindersSub: '毎朝8時に導きをお届けします',
      cloudBackup: 'データはクラウドにバックアップされます',
      signOutBtn: 'ログアウト',
      licenseTitle: 'ライセンスキー',
      licensePlaceholder: 'XXXX-XXXX-XXXX',
      licenseApply: '適用',
      licenseSuccess: 'プレミアムが有効になりました！Sakin ファミリーへようこそ。',
      licenseAlready: 'このアカウントではすでにプレミアムが有効です。',
      licenseInvalid: '無効、または使用済みのキーです。',
      licenseNetwork: '接続エラー。もう一度お試しください。',
      licenseSignInRequired: 'キーを適用するには、まずアカウントにログインしてください。',
      deleteLabel: 'アカウントを削除',
      deleteSub: 'アカウントとすべてのデータを完全に削除します。',
      deleteBtn: '削除',
      deleteConfirmTitle: 'アカウントを削除しますか？',
      deleteConfirmMessage: 'すべてのリーディング、アーカイブ、プロフィール、統計が完全に削除されます。この操作は取り消せません。',
      deleteConfirm: 'はい、削除します',
      deleteCancel: 'キャンセル',
    },
    // Personal Map
    personalMap: {
      title: 'パーソナルマップ',
      editBtn: '✎ 編集',
      lifePath: 'ライフパス',
      expression: '表現数',
      soulUrge: '魂の衝動',
      personality: '人格数',
      humanDesign: 'ヒューマンデザイン',
      strategy: '戦略',
      estimated: '（推定）',
      hdTypeSelectHint: 'あなたのタイプを選択:',
      hdDisclaimer:
        '⚠ この計算は推定です——正確なHDには出生時刻と天体暦が必要です。\nご自身のタイプがわかる場合は、上から選択してください。',
      sunGates: '太陽のゲート',
      consciousSun: '意識の太陽',
      designSun: 'デザインの太陽',
      gatesNote: 'タイプは推定 · 正確な結果には出生時刻を追加し、✎ から自分で選択してください',
      notSelf: 'ノットセルフ・テーマ',
      weeklyReading: '週間の導き',
      weeklyThisWeek: '今週のためのパーソナルリーディング',
      weeklyMeta: '週間の導き · 第{week}週',
      personalYear: 'パーソナルイヤー: {year}',
      unlock: {
        title: 'パーソナルマップを開く',
        desc: 'フルネームと生年月日を入力してください。\n数秘術、ヒューマンデザイン、週間分析。',
      },
      birthForm: {
        title: '出生図の情報',
        hint: 'ヒューマンデザインの計算には時刻と都市が必要です。',
        fullNamePlaceholder: 'フルネーム（数秘術用）',
        dateLabel: '生年月日',
        dayPlaceholder: '日',
        monthPlaceholder: '月',
        yearPlaceholder: '年',
        hourLabel: '出生時刻',
        hourOptional: '（HDに重要）',
        hourPlaceholder: '時（0〜23）',
        minutePlaceholder: '分',
        cityLabel: '出生地',
        cityOptional: '（タイムゾーン用）',
        cityPlaceholder: 'イスタンブール、東京、ロンドン...',
        saveBtn: 'マップを作成 ✦',
        cancelBtn: 'キャンセル',
      },
    },
    // Animal Guidance section
    animalGuidance: {
      birthStoneTitle: 'あなたの誕生石',
      sectionTitle: 'アニマルガイダンスとは？',
      totemTitle: '⊕ トーテムアニマル',
      totemText:
        '人は誰でも、その本質のなかに一頭の動物の魂を宿しています。このトーテムアニマルはあなたを象徴します。あなたのエネルギー、強み、歩む道には、その動物の足跡が刻まれています。トーテムは決して変わりません——あなたとともに生まれ、ともに成長します。',
      nagualTitle: '◎ ナワル — 期間の導き手',
      nagualText:
        'ナワルは、特定の時期だけあなたのもとへ来る一時的な導き手です。試練や変容、危機のときに呼び寄せられます。その役目を果たすと、別の導き手にその場を譲ります。毎日のリーディングで引いた動物は、今日のナワルの声を運んでいます。',
      finderTitle: 'あなたの動物の導き手を見つける',
      finderDescPremium: '質問から、または生年月日と時刻から',
      finderDescFree: 'マスター機能 ✦',
    },
    // Spiritual Map
    spiritualMap: {
      title: 'スピリチュアルマップ',
      topGuide: '最も多く導いた詩人',
      topStone: 'あなたの守護石',
      topAnimal: 'あなたのトーテムアニマル',
      topNagual: 'あなたのナワルの導き手',
      companionCount: '{n}回寄り添いました',
      stoneCount: '{n}回現れました · {chakra}',
      nagualCount: '{n}回呼び寄せられました · {aspect}',
      emptyHint: '最初のカードを開くと、スピリチュアルマップが形を成し始めます。',
    },
    // Sakin Family
    sakinFamily: {
      title: 'Sakin ファミリー',
      intro: '一つのエコシステム。一つのサブスクリプション。たくさんの扉。',
      masterDesc: '中心の拠点——すべてのアプリへの入口',
      apps: {
        animalGuidance: 'アニマルガイダンス',
        stoneGuidance: 'クリスタルガイダンス',
        plantGuidance: '植物の知恵',
        myths: '神話とイメージ',
        humanDesign: 'ヒューマンデザイン',
        numerology: '数秘術',
      },
      appDescs: {
        animalGuidance: 'このアプリ',
        stoneGuidance: 'クリスタルの言葉',
        plantGuidance: 'ハーブの知恵',
        myths: '元型とシンボル',
        humanDesign: 'あなたのデザインを知る',
        numerology: '数字の奥にいるあなた',
      },
      active: '利用可能',
      comingSoon: '近日公開',
    },
    // Badges
    badges: {
      title: 'バッジ',
      subtitle: '同じ日に何度開いても1日につき1回のみカウントされます — 7/30/100/365は、それぞれ異なる日数を意味します。',
      list: {
        b001: { title: '旅の始まり', desc: '最初の7日間' },
        b002: { title: '炎のダルヴィーシュ', desc: '21日連続' },
        b003: { title: 'マスナヴィーの旅人', desc: '30日間' },
        b004: { title: '数珠', desc: '33個の石を見た' },
        b005: { title: '真理の友', desc: '100日間' },
        b006: { title: '光の旅人', desc: '365日間' },
      },
    },
    // Premium teaser
    premium: {
      hdTeaser: 'あなたの戦略、権威、ノットセルフ・テーマを詳しく読み解く',
      weeklyTeaser: '52週間のサイクルの中で、今どこにいるかを知る',
      upgradeCta: 'マスターになる →',
    },
    // Dev
    dev: {
      enablePremium: '⚙ DEV · プレミアムを有効化',
      disablePremium: '⚙ DEV · プレミアムを無効化',
    },
    // Notification rationale (App Store 4.5.4 / Play Console)
    notif: {
      rationaleTitle: '毎日のリマインダー',
      rationaleMessage: '毎朝8時に、今日のカードを引くための静かなリマインダーを Sakin Hayvan からお送りしてもよいですか？通知が広告やマーケティングに使われることは一切ありません。',
      rationaleConfirm: '許可する',
      rationaleCancel: '今はしない',
    },
    // Language
    language: {
      title: '言語',
      note: '選択した言語でインターフェースとコンテンツが表示されます。',
    },
    elementNotSet: '元素が未選択です',
  },

  // ─── Myths screen ─────────────────────────────────────────────────────────────
  myths: {
    back: '← 戻る',
    familyTag: 'SAKIN · 神話',
    subtitle: '魂が出会う象徴的な力 · {count}の神話',
    searchPlaceholder: '名前・シンボル・元素で検索...',
    noResults: '結果が見つかりませんでした。',
    filterAll: 'すべて',
    msgSection: 'メッセージ',
    guidanceSection: '導き',
  },

  // ─── Auth screen ──────────────────────────────────────────────────────────────
  auth: {
    subtitle: '古代アナトリアの伝統による\n日々の導き',
    orLabel: 'または',
    emailPlaceholder: 'メールアドレス',
    passwordPlaceholder: 'パスワード',
    signinBtn: 'ログイン',
    signupBtn: 'アカウント作成',
    toSignup: 'アカウントがない？ 作成する',
    toSignin: 'アカウントがある？ ログイン',
    offlineBtn: 'アカウントなしで続ける',
    offlineHint: 'データはこの端末内にのみ保存されます',
    errorNotConfigured: 'サーバーが未設定です。今はオフラインで続けてください。',
    errorInvalidInput: '有効なメールアドレスと6文字以上のパスワードが必要です。',
    errorGeneric: '問題が発生しました。',
    errorNotConfiguredShort: 'サーバーが未設定です。',
    errorAppleFailed: 'Apple サインインを完了できませんでした。',
    errorAppleError: 'Apple サインインに失敗しました。',
    infoEmailSent: '確認メールを送信しました。受信トレイをご確認ください。',
    errInvalidLogin: 'メールアドレスまたはパスワードが正しくありません。',
    errAlreadyRegistered: 'このメールアドレスはすでに登録されています。',
    errNotConfirmed: 'まずメールアドレスを確認してください。',
    errNetwork: 'インターネット接続がありません。',
  },

  // ─── Paywall screen ───────────────────────────────────────────────────────────
  paywall: {
    eyebrow: 'SAKIN ファミリー',
    mikroTitle: 'アニマルガイド ✦',
    premiumTitle: 'Sakin Premium',
    mikroSub: 'アニマルガイダンスをさらに深く',
    premiumSub: '1つのアカウントで、すべての Sakin アプリを。',
    mikroPlan: 'マイクロ',
    premiumPlan: 'プレミアム',
    mikroCadence: '月 · アニマルのみ',
    premiumCadence: '月 · 全アプリ',
    mostPopular: '一番人気',
    iosPrice: '価格は App Store に表示されます。',
    androidPrice: '価格は Play Store に表示されます。',
    ctaBtn: 'マスターになる ✦',
    restoreBtn: 'サブスクリプションを復元',
    legal: '購入の確定時に、料金が App Store アカウントに請求されます。現在の期間の終了の少なくとも24時間前に解約しない限り、サブスクリプションは自動的に更新されます。サブスクリプションの管理と解約は、App Store アカウント設定から行えます。',
    errorPurchase: '購入を完了できませんでした。',
    errorPurchaseTitle: 'エラー',
    infoRestore: 'サブスクリプション復元サービスは近日提供予定です。',
    infoRestoreTitle: 'お知らせ',
    infoRestoreNone: 'このアカウントに有効なサブスクリプションは見つかりませんでした。',
    linkTerms: '利用規約',
    linkPrivacy: 'プライバシーポリシー',
  },

  // ─── Elements ─────────────────────────────────────────────────────────────────
  elements: {
    fire: '火',
    water: '水',
    earth: '地',
    air: '風',
  },

  // ─── Glossary terms ───────────────────────────────────────────────────────────
  glossary: {
    totem: {
      term: 'トーテムアニマル',
      short: 'あなたとともに生まれ、生涯寄り添うスピリットアニマル。',
    },
    nagual: {
      term: 'ナワル',
      short: '特定の時期にあなたに寄り添う一時的な導き手。',
    },
    mit: {
      term: '神話',
      short: '魂が出会う象徴的な力——影、境界、稲妻...',
    },
    hayatYolu: {
      term: 'ライフパスナンバー',
      short: '生年月日を数秘術でまとめたもの——あなたの中核のエネルギーを示します。',
    },
    numeroloji: {
      term: '数秘術',
      short: '数字の奥にある霊的な意味を読み解く技。',
    },
    ifade: {
      term: '表現数',
      short: '名前の文字から導かれる——あなたの生まれもった才能と可能性。',
    },
    ruhIstegi: {
      term: '魂の衝動数',
      short: '名前の母音から——あなたの内なる動機。',
    },
    kisilik: {
      term: '人格数',
      short: '名前の子音から——あなたが世界に見せる顔。',
    },
    humanDesign: {
      term: 'ヒューマンデザイン',
      short: '占星術、易経、チャクラ、カバラを統合したシステム。',
    },
    jeneratör: {
      term: 'ジェネレーター',
      short: '生命エネルギーの源。戦略: 応答する。',
    },
    manifestingJeneratör: {
      term: 'マニフェスティング・ジェネレーター',
      short: '多次元的で素早いジェネレーター。戦略: 応答し、行動する。',
    },
    projektör: {
      term: 'プロジェクター',
      short: 'システムや人を深く見抜く導き手。戦略: 招待を待つ。',
    },
    manifestor: {
      term: 'マニフェスター',
      short: '独立した始動者。戦略: 知らせる。',
    },
    reflektör: {
      term: 'リフレクター',
      short: '社会の鏡。戦略: 28日間待つ。',
    },
    notSelf: {
      term: 'ノットセルフ・テーマ',
      short: '本来の道から外れていることを知らせる感情。',
    },
    unsur: {
      term: '元素',
      short: '自然の四つの根本的な性質: 火、水、地、風。',
    },
    arketip: {
      term: '元型',
      short: '全人類が共有する普遍的な象徴の姿。',
    },
    golge: {
      term: '影（シャドウ）',
      short: '私たちが意識の中で拒み、抑え込んでいる自分の側面。',
    },
    kisiselYil: {
      term: 'パーソナルイヤー',
      short: '数秘術上のその年に固有のテーマ——9年周期のどの段階にいるか。',
    },
    rehber: {
      term: 'スピリットアニマル',
      short: 'あなたの人格とエネルギーを映し出すトーテムアニマル。',
    },
  },
} as const;
