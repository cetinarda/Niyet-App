// Taş verisi (stones.json) için 5-dil sözlükleri: DE/ES/FR/JA/PT.
// Tekrar eden alanları (element, çakra, köken/ülke, özellik, bitki) tutarlı ve
// otomatik çevirmek için. Benzersiz cümleler (dailyMessage/howToUse/affirmation)
// + isim taş-başına ayrı dosyalarda. Sıra her zaman: de, es, fr, ja, pt.
// EN zaten stones.json'da mevcut (suffix 'En').

export const LANGS = ['de', 'es', 'fr', 'ja', 'pt'];

// ── ELEMENT ──
export const ELEMENT = {
  'hava':         { de:'Luft',  es:'Aire',  fr:'Air',   ja:'風', pt:'Ar' },
  'toprak':       { de:'Erde',  es:'Tierra',fr:'Terre', ja:'地', pt:'Terra' },
  'su':           { de:'Wasser',es:'Agua',  fr:'Eau',   ja:'水', pt:'Água' },
  'ateş':         { de:'Feuer', es:'Fuego', fr:'Feu',   ja:'火', pt:'Fogo' },
  'tüm unsurlar': { de:'Alle Elemente', es:'Todos los elementos', fr:'Tous les éléments', ja:'すべての元素', pt:'Todos os elementos' },
};

// ── ÇAKRA (22 kombinasyon, doğrudan) ──
export const CHAKRA = {
  'Taç Çakra':        { de:'Kronenchakra', es:'Chakra Corona', fr:'Chakra Couronne', ja:'クラウンチャクラ', pt:'Chakra Coroa' },
  'Kök Çakra':        { de:'Wurzelchakra', es:'Chakra Raíz', fr:'Chakra Racine', ja:'ルートチャクラ', pt:'Chakra Raiz' },
  'Kalp Çakra':       { de:'Herzchakra', es:'Chakra del Corazón', fr:'Chakra du Cœur', ja:'ハートチャクラ', pt:'Chakra Cardíaco' },
  'Üçüncü Göz':       { de:'Drittes Auge', es:'Tercer Ojo', fr:'Troisième Œil', ja:'第三の目', pt:'Terceiro Olho' },
  'Boğaz Çakra':      { de:'Halschakra', es:'Chakra de la Garganta', fr:'Chakra de la Gorge', ja:'スロートチャクラ', pt:'Chakra Laríngeo' },
  'Güneş Pleksusu':   { de:'Solarplexus', es:'Plexo Solar', fr:'Plexus Solaire', ja:'ソーラープレクサス', pt:'Plexo Solar' },
  'Sakral Çakra':     { de:'Sakralchakra', es:'Chakra Sacro', fr:'Chakra Sacré', ja:'セイクラルチャクラ', pt:'Chakra Sacral' },
  'Tüm Çakralar':     { de:'Alle Chakren', es:'Todos los Chakras', fr:'Tous les Chakras', ja:'すべてのチャクラ', pt:'Todos os Chakras' },
  'Solar Pleksus Çakra': { de:'Solarplexus-Chakra', es:'Chakra del Plexo Solar', fr:'Chakra du Plexus Solaire', ja:'ソーラープレクサスチャクラ', pt:'Chakra do Plexo Solar' },
  'Üçüncü Göz Çakra': { de:'Drittes-Augen-Chakra', es:'Chakra del Tercer Ojo', fr:'Chakra du Troisième Œil', ja:'第三の目チャクラ', pt:'Chakra do Terceiro Olho' },
  'Kalp ve Üçüncü Göz':            { de:'Herz und Drittes Auge', es:'Corazón y Tercer Ojo', fr:'Cœur et Troisième Œil', ja:'ハートと第三の目', pt:'Coração e Terceiro Olho' },
  'Boğaz ve Üçüncü Göz':           { de:'Hals und Drittes Auge', es:'Garganta y Tercer Ojo', fr:'Gorge et Troisième Œil', ja:'スロートと第三の目', pt:'Garganta e Terceiro Olho' },
  'Boğaz ve Taç Çakra':            { de:'Hals und Kronenchakra', es:'Garganta y Chakra Corona', fr:'Gorge et Chakra Couronne', ja:'スロートとクラウンチャクラ', pt:'Garganta e Chakra Coroa' },
  'Taç ve Güneş Pleksusu':         { de:'Krone und Solarplexus', es:'Corona y Plexo Solar', fr:'Couronne et Plexus Solaire', ja:'クラウンとソーラープレクサス', pt:'Coroa e Plexo Solar' },
  'Kök ve Kalp Çakra':             { de:'Wurzel und Herzchakra', es:'Raíz y Chakra del Corazón', fr:'Racine et Chakra du Cœur', ja:'ルートとハートチャクラ', pt:'Raiz e Chakra Cardíaco' },
  'Boğaz ve Kalp Çakra':           { de:'Hals und Herzchakra', es:'Garganta y Chakra del Corazón', fr:'Gorge et Chakra du Cœur', ja:'スロートとハートチャクラ', pt:'Garganta e Chakra Cardíaco' },
  'Taç ve Üçüncü Göz':             { de:'Krone und Drittes Auge', es:'Corona y Tercer Ojo', fr:'Couronne et Troisième Œil', ja:'クラウンと第三の目', pt:'Coroa e Terceiro Olho' },
  'Üçüncü Göz ve Boğaz':           { de:'Drittes Auge und Hals', es:'Tercer Ojo y Garganta', fr:'Troisième Œil et Gorge', ja:'第三の目とスロート', pt:'Terceiro Olho e Garganta' },
  'Sakral ve Güneş Pleksusu':      { de:'Sakral und Solarplexus', es:'Sacro y Plexo Solar', fr:'Sacré et Plexus Solaire', ja:'セイクラルとソーラープレクサス', pt:'Sacral e Plexo Solar' },
  'Kök ve Sakral Çakra':           { de:'Wurzel und Sakralchakra', es:'Raíz y Chakra Sacro', fr:'Racine et Chakra Sacré', ja:'ルートとセイクラルチャクラ', pt:'Raiz e Chakra Sacral' },
  'Kök ve Üçüncü Göz':             { de:'Wurzel und Drittes Auge', es:'Raíz y Tercer Ojo', fr:'Racine et Troisième Œil', ja:'ルートと第三の目', pt:'Raiz e Terceiro Olho' },
  'Güneş Pleksusu ve Üçüncü Göz':  { de:'Solarplexus und Drittes Auge', es:'Plexo Solar y Tercer Ojo', fr:'Plexus Solaire et Troisième Œil', ja:'ソーラープレクサスと第三の目', pt:'Plexo Solar e Terceiro Olho' },
};

// ── ÜLKE / KÖKEN ──
export const COUNTRY = {
  'Brezilya':   { de:'Brasilien', es:'Brasil', fr:'Brésil', ja:'ブラジル', pt:'Brasil' },
  'Uruguay':    { de:'Uruguay', es:'Uruguay', fr:'Uruguay', ja:'ウルグアイ', pt:'Uruguai' },
  'İzlanda':    { de:'Island', es:'Islandia', fr:'Islande', ja:'アイスランド', pt:'Islândia' },
  'Türkiye':    { de:'Türkei', es:'Turquía', fr:'Turquie', ja:'トルコ', pt:'Turquia' },
  'Meksika':    { de:'Mexiko', es:'México', fr:'Mexique', ja:'メキシコ', pt:'México' },
  'Madagaskar': { de:'Madagaskar', es:'Madagascar', fr:'Madagascar', ja:'マダガスカル', pt:'Madagáscar' },
  'Kanada':     { de:'Kanada', es:'Canadá', fr:'Canada', ja:'カナダ', pt:'Canadá' },
  'Finlandiya': { de:'Finnland', es:'Finlandia', fr:'Finlande', ja:'フィンランド', pt:'Finlândia' },
  'İran':       { de:'Iran', es:'Irán', fr:'Iran', ja:'イラン', pt:'Irão' },
  'Afganistan': { de:'Afghanistan', es:'Afganistán', fr:'Afghanistan', ja:'アフガニスタン', pt:'Afeganistão' },
  'Avustralya': { de:'Australien', es:'Australia', fr:'Australie', ja:'オーストラリア', pt:'Austrália' },
  'Hindistan':  { de:'Indien', es:'India', fr:'Inde', ja:'インド', pt:'Índia' },
  'Sri Lanka':  { de:'Sri Lanka', es:'Sri Lanka', fr:'Sri Lanka', ja:'スリランカ', pt:'Sri Lanka' },
  'Şili':       { de:'Chile', es:'Chile', fr:'Chili', ja:'チリ', pt:'Chile' },
  'Güney Afrika': { de:'Südafrika', es:'Sudáfrica', fr:'Afrique du Sud', ja:'南アフリカ', pt:'África do Sul' },
  'Fas':        { de:'Marokko', es:'Marruecos', fr:'Maroc', ja:'モロッコ', pt:'Marrocos' },
  'Kongo':      { de:'Kongo', es:'Congo', fr:'Congo', ja:'コンゴ', pt:'Congo' },
  'Namibya':    { de:'Namibia', es:'Namibia', fr:'Namibie', ja:'ナミビア', pt:'Namíbia' },
  'Afrika':     { de:'Afrika', es:'África', fr:'Afrique', ja:'アフリカ', pt:'África' },
  'Çin':        { de:'China', es:'China', fr:'Chine', ja:'中国', pt:'China' },
  'İngiltere':  { de:'England', es:'Inglaterra', fr:'Angleterre', ja:'イングランド', pt:'Inglaterra' },
  'İspanya':    { de:'Spanien', es:'España', fr:'Espagne', ja:'スペイン', pt:'Espanha' },
  'Peru':       { de:'Peru', es:'Perú', fr:'Pérou', ja:'ペルー', pt:'Peru' },
  'Etiyopya':   { de:'Äthiopien', es:'Etiopía', fr:'Éthiopie', ja:'エチオピア', pt:'Etiópia' },
  'Rusya':      { de:'Russland', es:'Rusia', fr:'Russie', ja:'ロシア', pt:'Rússia' },
  'İsveç':      { de:'Schweden', es:'Suecia', fr:'Suède', ja:'スウェーデン', pt:'Suécia' },
  'İskoçya':    { de:'Schottland', es:'Escocia', fr:'Écosse', ja:'スコットランド', pt:'Escócia' },
  'Nepal':      { de:'Nepal', es:'Nepal', fr:'Népal', ja:'ネパール', pt:'Nepal' },
  'Yeni Zelanda': { de:'Neuseeland', es:'Nueva Zelanda', fr:'Nouvelle-Zélande', ja:'ニュージーランド', pt:'Nova Zelândia' },
  'Fransa':     { de:'Frankreich', es:'Francia', fr:'France', ja:'フランス', pt:'França' },
  'Libya':      { de:'Libyen', es:'Libia', fr:'Libye', ja:'リビア', pt:'Líbia' },
  'Çekya':      { de:'Tschechien', es:'Chequia', fr:'Tchéquie', ja:'チェコ', pt:'Chéquia' },
  'Bolivya':    { de:'Bolivien', es:'Bolivia', fr:'Bolivie', ja:'ボリビア', pt:'Bolívia' },
  'Pakistan':   { de:'Pakistan', es:'Pakistán', fr:'Pakistan', ja:'パキスタン', pt:'Paquistão' },
  'Mısır':      { de:'Ägypten', es:'Egipto', fr:'Égypte', ja:'エジプト', pt:'Egito' },
  'ABD':        { de:'USA', es:'EE. UU.', fr:'États-Unis', ja:'アメリカ', pt:'EUA' },
  'Nijerya':    { de:'Nigeria', es:'Nigeria', fr:'Nigéria', ja:'ナイジェリア', pt:'Nigéria' },
  'Kolombiya':  { de:'Kolumbien', es:'Colombia', fr:'Colombie', ja:'コロンビア', pt:'Colômbia' },
  'Zambiya':    { de:'Sambia', es:'Zambia', fr:'Zambie', ja:'ザンビア', pt:'Zâmbia' },
  'Myanmar':    { de:'Myanmar', es:'Birmania', fr:'Birmanie', ja:'ミャンマー', pt:'Mianmar' },
  'Tayland':    { de:'Thailand', es:'Tailandia', fr:'Thaïlande', ja:'タイ', pt:'Tailândia' },
  'Dominik Cumhuriyeti': { de:'Dominikanische Republik', es:'República Dominicana', fr:'République dominicaine', ja:'ドミニカ共和国', pt:'República Dominicana' },
  'Almanya':    { de:'Deutschland', es:'Alemania', fr:'Allemagne', ja:'ドイツ', pt:'Alemanha' },
  'Arjantin':   { de:'Argentinien', es:'Argentina', fr:'Argentine', ja:'アルゼンチン', pt:'Argentina' },
  'Avusturya':  { de:'Österreich', es:'Austria', fr:'Autriche', ja:'オーストリア', pt:'Áustria' },
  'Baltık':     { de:'Baltikum', es:'Báltico', fr:'Baltique', ja:'バルト海沿岸', pt:'Báltico' },
  'Botsvana':   { de:'Botswana', es:'Botsuana', fr:'Botswana', ja:'ボツワナ', pt:'Botswana' },
  'Grönland':   { de:'Grönland', es:'Groenlandia', fr:'Groenland', ja:'グリーンランド', pt:'Gronelândia' },
  'Japonya':    { de:'Japan', es:'Japón', fr:'Japon', ja:'日本', pt:'Japão' },
  'Kamboçya':   { de:'Kambodscha', es:'Camboya', fr:'Cambodge', ja:'カンボジア', pt:'Camboja' },
  'Kazakistan': { de:'Kasachstan', es:'Kazajistán', fr:'Kazakhstan', ja:'カザフスタン', pt:'Cazaquistão' },
  'Kenya':      { de:'Kenia', es:'Kenia', fr:'Kenya', ja:'ケニア', pt:'Quénia' },
  'Mozambik':   { de:'Mosambik', es:'Mozambique', fr:'Mozambique', ja:'モザンビーク', pt:'Moçambique' },
  'Norveç':     { de:'Norwegen', es:'Noruega', fr:'Norvège', ja:'ノルウェー', pt:'Noruega' },
  'Polonya':    { de:'Polen', es:'Polonia', fr:'Pologne', ja:'ポーランド', pt:'Polónia' },
  'Tacikistan': { de:'Tadschikistan', es:'Tayikistán', fr:'Tadjikistan', ja:'タジキスタン', pt:'Tajiquistão' },
  'Tanzanya':   { de:'Tansania', es:'Tanzania', fr:'Tanzanie', ja:'タンザニア', pt:'Tanzânia' },
  'Ukrayna':    { de:'Ukraine', es:'Ucrania', fr:'Ukraine', ja:'ウクライナ', pt:'Ucrânia' },
  'Yunanistan': { de:'Griechenland', es:'Grecia', fr:'Grèce', ja:'ギリシャ', pt:'Grécia' },
  'İtalya':     { de:'Italien', es:'Italia', fr:'Italie', ja:'イタリア', pt:'Itália' },
  'Dünya genelinde': { de:'Weltweit', es:'En todo el mundo', fr:'Partout dans le monde', ja:'世界中', pt:'Em todo o mundo' },
};

// Parantez içi bölge adları (ör. "ABD (Arizona)"): çevrilenler; yoksa olduğu gibi kalır.
export const REGION = {
  'Tasmanya': { de:'Tasmanien', es:'Tasmania', fr:'Tasmanie', ja:'タスマニア', pt:'Tasmânia' },
  'Sibirya':  { de:'Sibirien', es:'Siberia', fr:'Sibérie', ja:'シベリア', pt:'Sibéria' },
  'Karelya':  { de:'Karelien', es:'Carelia', fr:'Carélie', ja:'カレリア', pt:'Carélia' },
};

// Köken metnini ("Brezilya, Türkiye (Erzurum)") dile çevir.
export function translateOrigin(origin, lang) {
  if (!origin) return null;
  const sep = lang === 'ja' ? '、' : ', ';
  const parts = origin.split(',').map(s => s.trim());
  const out = [];
  for (const part of parts) {
    const m = part.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (m) {
      const base = COUNTRY[m[1].trim()];
      const reg = REGION[m[2].trim()];
      const baseT = base ? base[lang] : m[1].trim();
      const regT = reg ? reg[lang] : m[2].trim();
      out.push(`${baseT} (${regT})`);
    } else {
      const c = COUNTRY[part];
      out.push(c ? c[lang] : part);
    }
  }
  return out.join(sep);
}
