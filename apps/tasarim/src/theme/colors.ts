export const Colors = {
  // Backgrounds — sakin.life ekosistemine uyumlu derin tonlar
  background: '#0D0B14',
  backgroundSecondary: '#15111E',
  backgroundTertiary: '#1C1727',
  surface: '#1F1A2C',
  surfaceElevated: '#2A2238',

  // Marka aksanları
  gold: '#C9A84C',
  goldSoft: '#D9BD6E',
  goldDeep: '#8E7430',

  purple: '#7B4FA6',
  purpleSoft: '#9C74C4',
  purpleDeep: '#503070',

  teal: '#2E9E8A',
  tealSoft: '#5CBFAE',

  ember: '#C0472A',
  emberSoft: '#D87055',

  // Human Design merkez renkleri (klasik renk kodları)
  centerHead: '#F5D547',         // sarı
  centerAjna: '#7CC576',         // yeşil
  centerThroat: '#8B6F47',       // kahverengi
  centerG: '#E8B547',            // sarı/altın
  centerHeart: '#D9534F',        // kırmızı
  centerSolarPlexus: '#D88B47',  // turuncu/kahverengi
  centerSacral: '#D9534F',       // kırmızı
  centerSpleen: '#5BC0DE',       // açık kahverengi/teal
  centerRoot: '#8B6F47',         // kahverengi

  // Çizgi/kanal renkleri
  channelDefined: '#C9A84C',
  channelUndefined: 'rgba(255,255,255,0.08)',
  centerUndefined: 'rgba(255,255,255,0.04)',
  centerStroke: 'rgba(255,255,255,0.18)',

  // Metin
  text: '#F0EAD6',
  textSecondary: '#C7BFAB',
  textMuted: '#7A7060',
  textDim: '#5A5246',

  // Yardımcı
  divider: 'rgba(201, 168, 76, 0.12)',
  overlay: 'rgba(13, 11, 20, 0.85)',
  glassBorder: 'rgba(255,255,255,0.06)',

  // Durum
  success: '#5CBFAE',
  warning: '#D9BD6E',
  error: '#C0472A',
};

export const Gradients = {
  background: ['#0D0B14', '#15111E', '#1C1727'],
  card: ['#1F1A2C', '#15111E'],
  gold: ['#D9BD6E', '#C9A84C', '#8E7430'],
  purple: ['#9C74C4', '#7B4FA6', '#503070'],
  teal: ['#5CBFAE', '#2E9E8A', '#1B6B5C'],
  ember: ['#D87055', '#C0472A', '#7E2C18'],
  glow: ['rgba(201, 168, 76, 0.25)', 'rgba(201, 168, 76, 0)'],
};

export const Typography = {
  font: {
    serif: 'Georgia',
    sans: 'System',
  },
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 42,
  },
  weight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 2.0,
  },
  letterSpacing: {
    tight: -0.3,
    normal: 0,
    wide: 0.5,
    wider: 1.2,
    widest: 2.4,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 999,
};

export const Shadows = {
  gold: {
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 10,
  },
  purple: {
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 10,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
};
