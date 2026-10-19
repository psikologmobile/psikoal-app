/**
 * PsikoAl · v2 "Flat" tasarım tokenları — React Native tarafının TEK kaynağı.
 *
 * Kaynak: docs/design-v2/theme.ts + tokens.css (Claude Design teslimi). Değerler
 * birebir kopyadır; global.css'teki CSS değişkenleri ve tailwind.config.js bu
 * dosyayla aynı tutulur. Kural: gölge yok, gradyan yok — ayrım 1,5 px çizgi ve
 * zemin tonuyla yapılır.
 */

export const palette = {
  zinc: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#09090B',
  },
  sky: {
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
    950: '#082F49',
  },
  red: {
    50: '#FEF2F2',
    300: '#FCA5A5',
    400: '#F87171',
    600: '#DC2626',
    700: '#B91C1C',
    950: '#450A0A',
  },
  white: '#FFFFFF',
} as const

const p = palette

/** Semantik renkler. Ekranlar bu adları kullanır; ham palet kullanılmaz. */
export const semanticColors = {
  light: {
    bg: p.zinc[50],
    surface: p.zinc[100],
    border: p.zinc[200],
    borderStrong: p.zinc[300],
    text: p.zinc[900],
    textMuted: p.zinc[600],
    primary: p.sky[500],
    onPrimary: p.sky[950],
    primaryText: p.sky[700],
    accent: p.sky[200],
    onAccent: p.sky[950],
    onAccentMuted: p.sky[800],
    accentLine: p.sky[300],
    accentSoft: p.sky[100],
    onAccentSoft: p.sky[800],
    link: p.sky[700],
    danger: p.red[600],
    dangerSoft: p.red[50],
    onDangerSoft: p.red[700],
    dangerFill: p.red[600],
    onDanger: p.white,
    scrim: 'rgba(9,9,11,0.45)',
    focus: p.sky[500],
  },
  dark: {
    bg: p.zinc[950],
    surface: p.zinc[900],
    border: p.zinc[800],
    borderStrong: p.zinc[700],
    text: p.zinc[50],
    textMuted: p.zinc[400],
    primary: p.sky[500],
    onPrimary: p.sky[950],
    primaryText: p.sky[400],
    accent: p.sky[950],
    onAccent: p.sky[100],
    onAccentMuted: p.sky[300],
    accentLine: p.sky[900],
    accentSoft: p.sky[900],
    onAccentSoft: p.sky[100],
    link: p.sky[300],
    danger: p.red[400],
    dangerSoft: p.red[950],
    onDangerSoft: p.red[300],
    dangerFill: p.red[600],
    onDanger: p.white,
    scrim: 'rgba(0,0,0,0.6)',
    focus: p.sky[500],
  },
} as const

export type SemanticColorName = keyof typeof semanticColors.light
export type SemanticColors = { [K in SemanticColorName]: string }

/** Yazı tipleri — @expo-google-fonts/bricolage-grotesque (700/800) + figtree (400–800). */
export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayBold: 'BricolageGrotesque_700Bold',
  body: 'Figtree_500Medium',
  bodyRegular: 'Figtree_400Regular',
  bodySemi: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
  bodyHeavy: 'Figtree_800ExtraBold',
} as const

/** Tip ölçeği. className karşılıkları: `text-hero`, `text-h1` … (tailwind.config.js). */
export const typography = {
  hero: { fontFamily: fonts.display, fontSize: 44, lineHeight: 46, letterSpacing: -1.3 },
  h1: { fontFamily: fonts.display, fontSize: 40, lineHeight: 41, letterSpacing: -1.2 },
  h2: { fontFamily: fonts.display, fontSize: 34, lineHeight: 36, letterSpacing: -0.7 },
  h3: { fontFamily: fonts.display, fontSize: 28, lineHeight: 31, letterSpacing: -0.6 },
  sheet: { fontFamily: fonts.display, fontSize: 24, lineHeight: 28 },
  title: { fontFamily: fonts.displayBold, fontSize: 20, lineHeight: 24 },
  number: { fontFamily: fonts.display, fontSize: 22, lineHeight: 26 },
  bodyLg: { fontFamily: fonts.body, fontSize: 17, lineHeight: 25 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  bodySm: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.bodyBold, fontSize: 13, lineHeight: 18 },
  button: { fontFamily: fonts.bodyHeavy, fontSize: 17, lineHeight: 22 },
  badge: { fontFamily: fonts.bodyHeavy, fontSize: 12, lineHeight: 16 },
  overline: {
    fontFamily: fonts.bodyHeavy,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
} as const

export const radius = {
  xs: 8,
  checkbox: 9,
  inner: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  card: 20,
  '2xl': 22,
  '3xl': 24,
  panel: 26,
  '4xl': 28,
  sheet: 30,
  phone: 32,
  pill: 999,
} as const

export const space = {
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  4.5: 18,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  14: 56,
  18: 72,
} as const

export const size = {
  borderWidth: 1.5,
  touchMin: 44,
  button: { sm: 44, md: 50, lg: 56, xl: 58 },
  input: 52,
  iconButton: 44,
  avatar: { xs: 30, sm: 34, md: 44, lg: 48, xl: 56, xxl: 64, hero: 112 },
  tabBar: { height: 72, inset: 12, bottom: 20, radius: 24, activePill: { w: 48, h: 30 } },
  screen: { x: 20, top: 56 },
  checkbox: 28,
  web: { sidebar: 248, rail: 84, max: 1200, railBreakpoint: 1100, topMenuBreakpoint: 640 },
} as const

/** Hareket değerleri — src/core/motion bunları kullanır. */
export const motion = {
  easing: {
    out: [0.2, 0.8, 0.2, 1] as const,
    spring: [0.3, 1.3, 0.5, 1] as const,
  },
  spring: { damping: 14, stiffness: 180 },
  duration: { press: 150, fast: 250, tab: 300, base: 400, sheet: 380, enter: 550, slow: 900 },
  stagger: 60,
  staggerWeb: 80,
  pressScale: 0.96,
  enterOffsetY: 18,
  enterOffsetX: 40,
} as const

/** Gölge ve gradyan kullanılmaz. */
export const elevation = { none: { elevation: 0, shadowOpacity: 0 } } as const
