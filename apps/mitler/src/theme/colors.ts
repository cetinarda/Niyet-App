export const Colors = {
  // Ana renkler — Tasavvuf estetiği: koyu gece, altın, duman
  background: '#0D0B14',
  backgroundSecondary: '#13111E',
  backgroundCard: '#1A1630',
  surface: '#221E38',
  surfaceElevated: '#2A2545',

  // Altın — manevi ışık
  gold: '#C9A84C',
  goldLight: '#E8C96A',
  goldDark: '#8A6B28',
  goldGlow: 'rgba(201,168,76,0.15)',

  // Mor — dönüşüm ve ruhsallık
  purple: '#7B4FA6',
  purpleLight: '#9D68CC',
  purpleDark: '#4A2870',
  purpleGlow: 'rgba(123,79,166,0.2)',

  // Turkuaz — bilgelik ve arınma
  teal: '#2E9E8A',
  tealLight: '#3DBFA8',
  tealDark: '#1A6B5E',

  // Ateş — tutku ve cesaret
  ember: '#C0472A',
  emberLight: '#E05A36',
  emberDark: '#7A2B18',

  // Metin renkleri
  textPrimary: '#F0EAD6',
  textSecondary: '#B8B0A0',
  textMuted: '#7A7060',
  textOnGold: '#1A1200',

  // Durum renkleri
  success: '#3DBFA8',
  warning: '#C9A84C',
  error: '#C0472A',

  // Şeffaflıklar
  overlay: 'rgba(13,11,20,0.85)',
  overlayLight: 'rgba(13,11,20,0.5)',
  cardBorder: 'rgba(201,168,76,0.25)',
  divider: 'rgba(240,234,214,0.1)',

  // Sekme renkleri
  tabArchetype: '#C9A84C',
  tabMyth: '#7B4FA6',
  tabImage: '#2E9E8A',

  // Sakin ailesi paleti
  sakinNight: '#2E2540',
  sakinPlum: '#4A3A6B',
  sakinLavender: '#8A7FA8',
  sakinMoonstone: '#C5B8D4',
  sakinCream: '#FAF6EF',
  sakinSand: '#F0E9DC',
  sakinGold: '#C9A14A',
  sakinTerra: '#C97B5F',
  sakinMint: '#7A9B8E',
} as const;

export const Gradients = {
  background: ['#0D0B14', '#1A1630'],
  gold: ['#C9A84C', '#8A6B28'],
  card: ['#1A1630', '#221E38'],
  cardQuote: ['#1A1428', '#2A1F4A'],
  cardStone: ['#12182A', '#1E1635'],
  cardAnimal: ['#0F1E1E', '#152A2A'],
  glow: ['rgba(201,168,76,0)', 'rgba(201,168,76,0.3)', 'rgba(201,168,76,0)'],
} as const;

export const Typography = {
  fontFamily: {
    serif: 'Georgia',
    sansSerif: 'System',
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
    normal: 1.5,
    relaxed: 1.75,
    loose: 2.0,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
} as const;

export const Shadows = {
  gold: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  purple: {
    shadowColor: '#7B4FA6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;
