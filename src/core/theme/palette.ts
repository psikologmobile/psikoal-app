import { useColorScheme } from 'nativewind'

import { semanticColors } from './tokens'

import type { SemanticColors } from './tokens'

/**
 * className kabul etmeyen prop'lar (Icon `color`, SVG `stroke`, `placeholderTextColor`,
 * ActivityIndicator `color` …) için hex kaynağı. className yazılabiliyorsa
 * `bg-surface`, `text-fg-muted` gibi semantik sınıflar kullanılır.
 *
 * `legacy*` alanlar v1 (Sky/iOS Health) temasından kalan adlardır; değerleri v2
 * semantik renklere yönlendirilmiştir. Yeni kodda KULLANILMAZ, ekranlar v2'ye
 * taşındıkça kaldırılacak.
 */
function withLegacy(c: SemanticColors) {
  return {
    ...c,
    /** @deprecated → primary */
    brand: c.primary,
    /** @deprecated → primary */
    brandHover: c.primary,
    /** @deprecated → accentSoft */
    brandSubtle: c.accentSoft,
    /** @deprecated → accent */
    brandMuted: c.accent,
    /** @deprecated → accentLine */
    brandBorder: c.accentLine,
    /** @deprecated → primaryText */
    brandText: c.primaryText,
    /** @deprecated → accentSoft */
    accentSubtle: c.accentSoft,
    /** @deprecated → onAccentSoft */
    accentText: c.onAccentSoft,
    /** @deprecated → bg */
    surfaceBase: c.bg,
    /** @deprecated → surface */
    surfaceRaised: c.surface,
    /** @deprecated → surface */
    surfaceSunken: c.surface,
    /** @deprecated → text */
    contentPrimary: c.text,
    /** @deprecated → textMuted */
    contentSecondary: c.textMuted,
    /** @deprecated → textMuted */
    contentTertiary: c.textMuted,
    /** @deprecated → textMuted */
    contentDisabled: c.textMuted,
    /** @deprecated → bg */
    contentInverse: c.bg,
    /** @deprecated → link */
    contentLink: c.link,
    /** @deprecated → danger */
    error: c.danger,
    /** @deprecated → dangerSoft */
    errorLight: c.dangerSoft,
    /** @deprecated → primaryText (v2'de yeşil yok) */
    success: c.primaryText,
    /** @deprecated → primaryText (v2'de sarı yok) */
    warning: c.primaryText,
  }
}

export const themeColors = {
  light: withLegacy(semanticColors.light),
  dark: withLegacy(semanticColors.dark),
} as const

export type ThemeColors = ReturnType<typeof withLegacy>
export type ColorSchemeName = 'light' | 'dark'

/** Etkin temanın (açık/koyu) hex renkleri. */
export function useThemeColors(): ThemeColors {
  const { colorScheme } = useColorScheme()
  return colorScheme === 'dark' ? themeColors.dark : themeColors.light
}

/** Etkin tema adı — 'light' | 'dark'. */
export function useResolvedColorScheme(): ColorSchemeName {
  const { colorScheme } = useColorScheme()
  return colorScheme === 'dark' ? 'dark' : 'light'
}
