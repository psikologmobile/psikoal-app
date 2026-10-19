import { Platform, useWindowDimensions } from 'react-native'

import { size } from '@/core/theme'

/**
 * Yerleşim kırılımı (docs/design-v2/screens.md · Web uygulaması):
 * - `compact` — native ya da web ≤640 px: mobil yerleşim (tek sütun).
 * - `medium`  — web 641–1100 px (tablet): web yerleşimi, sütunlar alt alta, ikon rayı.
 * - `wide`    — web >1100 px (masaüstü): çok sütunlu web yerleşimi, tam kenar çubuğu.
 */
export type Breakpoint = 'compact' | 'medium' | 'wide'

export function getBreakpoint(width: number, isWeb: boolean): Breakpoint {
  if (!isWeb || width <= size.web.topMenuBreakpoint) return 'compact'
  if (width <= size.web.railBreakpoint) return 'medium'
  return 'wide'
}

export type UseBreakpointReturn = {
  breakpoint: Breakpoint
  width: number
  isWeb: boolean
  /** Web yerleşimi çizilsin mi (medium ya da wide). Native'de her zaman false. */
  isWebLayout: boolean
  /** Masaüstü (çok sütun). */
  isWide: boolean
}

/** Pencere genişliğine göre web/tablet/mobil yerleşim anahtarı. */
export function useBreakpoint(): UseBreakpointReturn {
  const { width } = useWindowDimensions()
  const isWeb = Platform.OS === 'web'
  const breakpoint = getBreakpoint(width, isWeb)
  return {
    breakpoint,
    width,
    isWeb,
    isWebLayout: breakpoint !== 'compact',
    isWide: breakpoint === 'wide',
  }
}
