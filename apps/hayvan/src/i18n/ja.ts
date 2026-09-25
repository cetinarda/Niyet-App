export const ja = {
  common: {
    share: 'シェア',
  },

  // ─── Tab bar ──────────────────────────────────────────────────────────────────
  tabs: {
    today: '今日',
    animals: '動物',
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
        title: '動物',
        short: '動物',
        subtitle: '魂の伴侶の声に耳を澄ませて',
      },
      quote: {
        title: '言葉',
        short: '言葉',
        subtitle: '叡智の伝統より',
      },
    },
    tapHint: '振る · タップ',
    nextDeck: '次のデッキ →',
    completed: '完了 ✦',
    doneTitle: '今日の導きが\n完了しました',
    doneSub: '明日、新たな旅が始まります',
    detailBtn: 'の深い導き →',
  },

  // ─── Animals hub ─────────────────────────────────────────────────────────────
  animalsHub: {
    eyebrow: 'SAKIN · 動物',
    panels: {
      library: '動物',
      finder: '探す',
      guidance: '導き',
    },
  },

  // ─── Animal library ───────────────────────────────────────────────────────────
  animalLibrary: {
    back: '← 戻る',
    familyTag: 'SAKIN · 動物',
    subtitle: 'アナトリアから世界へ · {count}体の動物ガイド',
    searchPlaceholder: '名前・シンボル・要素で検索...',
    noResults: '結果が見つかりません。',
  },

  // ─── Animal detail ────────────────────────────────────────────────────────────
  animalDetail: {
    back: '← 戻る',
    familyTag: 'SAKIN · 動物',
    sections: {
      anatolian: 'アナトリアでは',
      world: '世界では',
      todayMessage: '今日あなたへのメッセージ',
      guidance: '導き',
      jung: 'ユングの言葉で',
      dream: '夢で見るとき',
      traditions: '伝統の中で',
      myths: '伝説',
      shadow: '影の側面',
      whenAppears: '現れるとき',
      thisPractice: '今週のプラクティス',
      relatedMyth: '関連する神話',
    },
    missingLore:
      'この動物の深い導きは近日中に拡充されます。\n今はアナトリアの声と今日のリーディングをお届けします。',
    resonanceHint: 'この動物と共鳴する象徴的な力 →',
    footer: 'SAKIN ファミリー ✦',
  },

  // ─── Animal finder ────────────────────────────────────────────────────────────
  animalFinder: {
    headerTitle: 'あなたの動物ガイドを見つける',
    intro: {
      title: 'あなたのスピリットアニマルを発見する',
      desc: '魂と調和するトーテムアニマルを見つける道は二つあります。',
      note: 'Sakinはあなたに鏡を掲げます。すでにあなたの中にあるものを映し、可能性をささやきます。\nそれを心の中で目覚めさせ、感じ、自らのものにできるのは、あなただけです。',
      quizBtn: {
        title: '質問で見つける',
        desc: '7つの質問で、あなたの性格に合わせます',
      },
      birthBtn: {
        title: '生年月日で見つける',
        desc: '日付と時刻によるネイタルトーテム',
      },
    },
    birth: {
      title: '生年月日を入力',
      desc: 'あなたが生まれた季節・年・時刻のすべてが、トーテムアニマルを形づくります。',
      dateLabel: '生年月日',
      dayPlaceholder: '日',
      monthPlaceholder: '月',
      yearPlaceholder: '年',
      cityLabel: '出生地',
      cityOptional: '（任意）',
      cityPlaceholder: '例：イスタンブール、東京、京都...',
      cityHint: '生まれた土地のエネルギーが、リーディングに深みを加えます。',
      hourLabel: '出生時刻',
      hourOptional: '（任意）',
      hourPlaceholder: '時（0-23）',
      hourHint: '時刻が分からない場合は空欄のままで構いません。それでも力強いマッチングが行われます。',
      submitBtn: 'ガイドを見つける ✦',
    },
    result: {
      label: 'あなたの動物ガイド',
      rediscoverBtn: '再発見する ✦',
      closeBtn: '閉じる ✦',
    },
    quiz: {
      hint: '心惹かれるものが複数あれば、すべて選んでください。',
      continueBtn: '続ける',
      questions: [
        {
          q: '自然の中で、どの環境があなたを呼んでいますか？',
          options: [
            '山々と開けた空',
            '森と孤独な大地',
            '川、海、深い水',
            '温かな炎と火',
          ],
        },
        {
          q: '困難な状況に直面したとき、あなたの反応は？',
          options: [
            '立ち止まり、観察し、戦略を立てる',
            '素早く行動する',
            '周りの人々をまとめる',
            '内にこもり、内なる力を求める',
          ],
        },
        {
          q: 'あなたを最もよく表す言葉は？',
          options: ['自由', '強さ', '賢さ', '愛情深い'],
        },
        {
          q: 'グループの中で、あなたが担う役割は？',
          options: [
            '先駆者であり道を切り開く者',
            '仲裁者でありバランスを取る者',
            '創造的で人を鼓舞する者',
            '観察者であり分析する者',
          ],
        },
        {
          q: 'あなたの最大の強みは？',
          options: [
            '本能と直感',
            '忍耐力と回復力',
            '知性と適応力',
            '勇気と情熱',
          ],
        },
        {
          q: '人生において、何に自由を感じますか？',
          options: [
            '自立した決断ができること',
            '愛する人々と安心して過ごせること',
            '変化し変容できること',
            '真実を見出し、深く探求すること',
          ],
        },
        {
          q: '今、あなたの中で最も強いエネルギーは？',
          options: [
            '動きと速さのエネルギー',
            '静けさと観察のエネルギー',
            '豊かさと共同体のエネルギー',
            '力と変容のエネルギー',
          ],
        },
      ],
    },
  },

  // ─── Nagual screen ────────────────────────────────────────────────────────────
  nagual: {
    back: '← 戻る',
    familyTag: 'SAKIN · ナワル',
    introTitle: 'ナワル 、 期間の導き手',
    introText:
      'あなたのトーテムアニマルはあなたと共に生まれ、生涯ともにあります。一方、ナワルは特定の期間に\nあなたに寄り添う一時的な導き手です。試練、変容、危機のときに現れます。\nその役目を終えると、別の導き手へとその座を譲ります。',
    weekTag: '今週 · 普遍',
    thisWeek: 'この期間',
    daysLeft: '残り{n}日',
    personalTag: '私の個人的な導き手',
    guidance: '導き',
    locked: {
      title: '私の個人的な導き手',
      text: '出生図に基づいてあなただけの期間の導き手となる動物を定めるには、\nプロフィールを完成させてください。\n\nプロフィール → 個人マップから、生年月日と要素を追加できます。',
    },
  },

  // ─── Archive screen ───────────────────────────────────────────────────────────
  archive: {
    title: 'アーカイブ',
    readingsCount: '{n}件のリーディング',
    spiritualMap: 'スピリチュアルマップ',
    reportLabels: {
      guide: 'ガイド',
      stone: '石',
      animal: '動物',
      nagual: 'ナワル',
    },
    filters: {
      all: 'すべて',
      quote: 'メッセージ',
      stone: '石',
      animal: '動物',
      nagual: 'ナワル',
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
      subtitle: '古代アナトリアの伝統からの日々の導き',
      step1Question: 'あなたの名前は、旅人よ？',
      step1Placeholder: '名前を入力...',
      step2Question: 'どの要素に最も近いと感じますか？',
      step3Question: '個人マップのために',
      step3Hint: '数秘術、ヒューマンデザイン、要素分析。\nより多くの情報 = より強いリーディング。',
      fullNamePlaceholder: '氏名...',
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
      continueBtn: '続ける →',
      startBtn: '旅に出る ✦',
      skipBtn: '今はしない、スキップ',
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
      premiumRenewal: '更新日：{date}',
      premiumLifetime: '無期限',
      freeCta: '深い分析のためにマスターになりましょう',
      upgradeBtn: 'マスターになる ✦',
      cancelBtn: 'キャンセル',
      remindersLabel: '毎日のリマインダー',
      remindersSub: '毎朝8:00にあなたの導きが届きます',
      cloudBackup: 'データはクラウドにバックアップされています',
      signOutBtn: 'サインアウト',
      licenseTitle: 'ライセンスキー',
      licensePlaceholder: 'XXXX-XXXX-XXXX',
      licenseApply: '適用',
      licenseSuccess: 'プレミアムが有効になりました！Sakinファミリーへようこそ。',
      licenseAlready: 'このアカウントではプレミアムがすでに有効です。',
      licenseInvalid: '無効、または使用済みのキーです。',
      licenseNetwork: '接続エラー。もう一度お試しください。',
      licenseSignInRequired: 'キーを適用するには、まずアカウントにサインインしてください。',
      deleteLabel: 'アカウントを削除',
      deleteSub: 'アカウントとすべてのデータを完全に削除します。',
      deleteBtn: '削除',
      deleteConfirmTitle: 'アカウントを削除しますか？',
      deleteConfirmMessage: 'すべてのリーディング、アーカイブ、プロフィール、統計が完全に消去されます。この操作は取り消せません。',
      deleteConfirm: 'はい、削除します',
      deleteCancel: 'キャンセル',
    },
    // Personal Map
    personalMap: {
      title: '個人マップ',
      editBtn: '✎ 編集',
      lifePath: 'ライフパス',
      expression: '表現',
      soulUrge: '魂の衝動',
      personality: '人格',
      humanDesign: 'ヒューマンデザイン',
      strategy: '戦略',
      estimated: '（推定）',
      hdTypeSelectHint: 'あなたのタイプを選択：',
      hdDisclaimer:
        '⚠ 計算は推定値です。正確なHDには出生時刻と天体暦が必要です。\nご自身のタイプが分かる場合は、上から選択してください。',
      sunGates: '太陽のゲート',
      consciousSun: '意識の太陽',
      designSun: 'デザインの太陽',
      gatesNote: 'タイプは推定 · 正確な結果を得るには出生時刻を追加し、✎で選択してください',
      notSelf: 'ノットセルフのテーマ',
      weeklyReading: '週ごとの導き',
      weeklyThisWeek: '今週のためのパーソナルリーディング',
      weeklyMeta: '週ごとの導き · 第{week}週',
      personalYear: 'パーソナルイヤー：{year}',
      unlock: {
        title: '個人マップを開く',
        desc: '氏名と生年月日を入力してください。\n数秘術、ヒューマンデザイン、週ごとの分析。',
      },
      birthForm: {
        title: '出生図の情報',
        hint: 'ヒューマンデザインの計算には、時刻と都市が必要です。',
        fullNamePlaceholder: '氏名（数秘術用）',
        dateLabel: '生年月日',
        dayPlaceholder: '日',
        monthPlaceholder: '月',
        yearPlaceholder: '年',
        hourLabel: '出生時刻',
        hourOptional: '（HDに重要）',
        hourPlaceholder: '時（0-23）',
        minutePlaceholder: '分',
        cityLabel: '出生地',
        cityOptional: '（タイムゾーン用）',
        cityPlaceholder: 'イスタンブール、東京、京都...',
        saveBtn: 'マップを作成する ✦',
        cancelBtn: 'キャンセル',
      },
    },
    // Animal Guidance section
    animalGuidance: {
      birthAnimalTitle: 'あなたの誕生動物',
      sectionTitle: '動物の導きとは？',
      totemTitle: '⊕ トーテムアニマル',
      totemText:
        'すべての人は、その本性の中に一つの動物の魂を宿しています。このトーテムアニマルはあなたを表します。あなたのエネルギー、強み、そして歩む道は、その痕跡を帯びています。トーテムは決して変わりません。あなたと共に生まれ、あなたと共に育ちます。',
      nagualTitle: '◎ ナワル 、 期間の導き手',
      nagualText:
        'ナワルは、特定の期間にあなたのもとへ訪れる一時的な導き手です。試練、変容、危機のときに呼ばれます。その役目を終えると、別の導き手へとその座を譲ります。日々のリーディングで引かれる動物は、今日のナワルの声を運んでいます。',
      finderTitle: 'あなたの動物ガイドを見つける',
      finderDescPremium: '質問から、または生年月日と時刻から',
      finderDescFree: 'マスター機能 ✦',
    },
    // Spiritual Map
    spiritualMap: {
      title: 'スピリチュアルマップ',
      topGuide: '最も多く導いた詩人',
      topStone: 'あなたの守護石',
      topAnimal: 'あなたのトーテムアニマル',
      topNagual: 'あなたのナワルガイド',
      companionCount: '{n}回寄り添いました',
      stoneCount: '{n}回現れました · {chakra}',
      nagualCount: '{n}回呼ばれました · {aspect}',
      emptyHint: '最初のカードを開くと、あなたのスピリチュアルマップが形づくられ始めます。',
    },
    // Sakin Family
    sakinFamily: {
      title: 'Sakin ファミリー',
      intro: '一つのエコシステム。一つのサブスクリプション。たくさんの扉。',
      masterDesc: 'ホーム拠点 、 すべてのアプリへの入口',
      apps: {
        animalGuidance: '動物の導き',
        stoneGuidance: '結晶の導き',
        plantGuidance: '植物の叡智',
        myths: '神話とイメージ',
        humanDesign: 'ヒューマンデザイン',
        numerology: '数秘術',
      },
      appDescs: {
        animalGuidance: 'このアプリ',
        stoneGuidance: '結晶の言語',
        plantGuidance: 'ハーブの叡智',
        myths: '元型と象徴',
        humanDesign: '自分のデザインを知る',
        numerology: '数の奥にいるあなた',
      },
      active: 'アクティブ',
      comingSoon: '近日公開',
    },
    // Badges
    badges: {
      title: 'バッジ',
      list: {
        b001: { title: '旅の始まり', desc: '最初の7回のリーディング' },
        b002: { title: '炎のデルヴィーシュ', desc: '21日連続' },
        b003: { title: 'メスネヴィの旅人', desc: '30回のリーディング' },
        b004: { title: '数珠', desc: '33個の石を見た' },
        b005: { title: '真理の友', desc: '100回のリーディング' },
        b006: { title: '光の旅人', desc: '365回のリーディング' },
      },
    },
    // Premium teaser
    premium: {
      hdTeaser: 'あなたの戦略、権威、ノットセルフのテーマを詳しく読む',
      weeklyTeaser: '52週のサイクルの中で、今どこにいるかを知る',
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
      rationaleMessage: 'Sakin Hayvanが毎朝8:00に、今日のカードを引くための静かなリマインダーを送ってもよろしいですか？通知は広告やマーケティングに使用されることは一切ありません。',
      rationaleConfirm: '許可する',
      rationaleCancel: '今はしない',
    },
    // Language
    language: {
      title: '言語',
      note: '選択した言語でインターフェースとコンテンツが表示されます。',
    },
    elementNotSet: '要素が選択されていません',
  },

  // ─── Myths screen ─────────────────────────────────────────────────────────────
  myths: {
    back: '← 戻る',
    familyTag: 'SAKIN · 神話',
    subtitle: '魂が出会う象徴的な力 · {count}の神話',
    searchPlaceholder: '名前・シンボル・要素で検索...',
    noResults: '結果が見つかりません。',
    filterAll: 'すべて',
    msgSection: 'メッセージ',
    guidanceSection: '導き',
  },

  // ─── Auth screen ──────────────────────────────────────────────────────────────
  auth: {
    subtitle: '古代アナトリアの伝統からの\n日々の導き',
    orLabel: 'または',
    emailPlaceholder: 'メールアドレス',
    passwordPlaceholder: 'パスワード',
    signinBtn: 'サインイン',
    signupBtn: 'アカウントを作成',
    toSignup: 'アカウントをお持ちでない方はこちら',
    toSignin: 'すでにアカウントをお持ちの方はサインイン',
    offlineBtn: 'アカウントなしで続ける',
    offlineHint: 'データはこのデバイスにのみ保存されます',
    errorNotConfigured: 'サーバーが構成されていません。今はオフラインで続けてください。',
    errorInvalidInput: '有効なメールアドレスと6文字以上のパスワードが必要です。',
    errorGeneric: '問題が発生しました。',
    errorNotConfiguredShort: 'サーバーが構成されていません。',
    errorAppleFailed: 'Appleでのサインインを完了できませんでした。',
    errorAppleError: 'Appleでのサインインに失敗しました。',
    infoEmailSent: '確認メールを送信しました。受信トレイをご確認ください。',
    errInvalidLogin: 'メールアドレスまたはパスワードが正しくありません。',
    errAlreadyRegistered: 'このメールアドレスはすでに登録されています。',
    errNotConfirmed: 'まずメールアドレスを確認してください。',
    errNetwork: 'インターネット接続がありません。',
  },

  // ─── Paywall screen ───────────────────────────────────────────────────────────
  paywall: {
    eyebrow: 'SAKIN ファミリー',
    mikroTitle: '動物ガイド ✦',
    premiumTitle: 'Sakin Premium',
    mikroSub: '動物の導きをより深く探る',
    premiumSub: '一つのアカウント。すべてのSakinアプリ。',
    mikroPlan: 'マイクロ',
    premiumPlan: 'プレミアム',
    mikroCadence: '月 · 動物のみ',
    premiumCadence: '月 · 全アプリ',
    mostPopular: '一番人気',
    iosPrice: '価格はApp Storeに表示されます。',
    androidPrice: '価格はPlay Storeに表示されます。',
    ctaBtn: 'マスターになる ✦',
    restoreBtn: 'サブスクリプションを復元',
    legal: '購入の確定時に、App Storeアカウントに料金が請求されます。現在の期間が終了する少なくとも24時間前に解約しない限り、サブスクリプションは自動的に更新されます。サブスクリプションの管理と解約は、App Storeアカウントの設定から行えます。',
    errorPurchase: '購入を完了できませんでした。',
    errorPurchaseTitle: 'エラー',
    infoRestore: 'サブスクリプションの復元サービスは近日提供予定です。',
    infoRestoreTitle: 'お知らせ',
    infoRestoreNone: 'このアカウントに有効なサブスクリプションは見つかりませんでした。',
    linkTerms: '利用規約',
    linkPrivacy: 'プライバシーポリシー',
    features: {
      f1Title: "あなたの誕生動物",
      f1Desc: "出生情報、またはいくつかの質問から、あなたのガイドアニマルを見つける",
      f2Title: "週ごとの導き",
      f2Desc: "52週のサイクルの中で今どこにいるか、そしてあなたの個人年",
      f3Title: "動物の詳しいページ",
      f3Desc: "神話、ユング、伝承、シャドウ、夢の意味",
      f4Title: "個人マップ",
      f4Desc: "ライフパスと、名前から導かれる主要な数",
      f5Title: "アーカイブ",
      f5Desc: "これまでのリーディングを、ひとつの場所に",
    },
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
      short: 'あなたと共に生まれ、生涯ともにあるスピリットアニマル。',
    },
    nagual: {
      term: 'ナワル',
      short: '特定の期間にあなたに寄り添う一時的な導き手。',
    },
    mit: {
      term: '神話',
      short: '魂が出会う象徴的な力 、 影、敷居、稲妻...',
    },
    hayatYolu: {
      term: 'ライフパスナンバー',
      short: '生年月日の数秘術的な要約 、 あなたの核となるエネルギーを示します。',
    },
    numeroloji: {
      term: '数秘術',
      short: '数の奥にある霊的な意味を読み解く技。',
    },
    ifade: {
      term: '表現数',
      short: '名前の文字から導かれる 、 あなたの生まれ持った才能と可能性。',
    },
    ruhIstegi: {
      term: '魂の衝動数',
      short: '名前の母音から 、 あなたの内なる動機。',
    },
    kisilik: {
      term: '人格数',
      short: '名前の子音から 、 あなたが世界に見せる顔。',
    },
    humanDesign: {
      term: 'ヒューマンデザイン',
      short: '占星術、易経、チャクラ、カバラを統合したシステム。',
    },
    jeneratör: {
      term: 'ジェネレーター',
      short: '生命エネルギーの源。戦略：応答する。',
    },
    manifestingJeneratör: {
      term: 'マニフェスティング・ジェネレーター',
      short: '多次元的で素早いジェネレーター。戦略：応答し、行動する。',
    },
    projektör: {
      term: 'プロジェクター',
      short: 'システムや人々を深く見抜く導き手。戦略：招待を待つ。',
    },
    manifestor: {
      term: 'マニフェスター',
      short: '独立した開始者。戦略：知らせる。',
    },
    reflektör: {
      term: 'リフレクター',
      short: '社会の鏡。戦略：28日間待つ。',
    },
    notSelf: {
      term: 'ノットセルフのテーマ',
      short: '自分が本当の道から外れていると感じさせる感情。',
    },
    unsur: {
      term: '要素（エレメント）',
      short: '自然の四つの基本的な性質：火、水、地、風。',
    },
    arketip: {
      term: '元型',
      short: '全人類が共有する普遍的な象徴的形象。',
    },
    golge: {
      term: '影（シャドウ）',
      short: '私たちが意識の中で否定し、抑圧している自分の側面。',
    },
    kisiselYil: {
      term: 'パーソナルイヤー',
      short: 'あなたの数秘術的な年に固有のテーマ 、 9年周期のどの段階にいるか。',
    },
    rehber: {
      term: 'スピリットアニマル',
      short: 'あなたの人格とエネルギーを映し出すトーテムアニマル。',
    },
  },
} as const;
