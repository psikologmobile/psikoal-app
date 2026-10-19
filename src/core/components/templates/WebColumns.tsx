import type { ReactNode } from 'react'

import { useWindowDimensions, View } from 'react-native'

import { size } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type WebColumnsProps = {
  /** Ana sütun (esnek). */
  children: ReactNode
  /** Yan sütun (sabit genişlik). */
  aside?: ReactNode
  /** Yan sütun genişliği (px). Tasarım: 260 · 340 · 360 · 380 · 400. */
  asideWidth?: number
  /** Dar pencerede kullanılacak yan sütun genişliği (ör. 1100'de 300/320/340). */
  asideWidthNarrow?: number
  /** `asideWidthNarrow` bu genişliğin altında (≤) devreye girer. Varsayılan 1100. */
  narrowAt?: number
  asidePosition?: 'left' | 'right'
  /** Bu pencere genişliğinin altında (≤) sütunlar alt alta. Varsayılan 1100. */
  stackAt?: number
  /** Alt alta düzende yan sütun gizlensin (Fırsatlar süzgeç paneli, İlan oluştur adım listesi). */
  hideAsideWhenStacked?: boolean
  className?: string
  testID?: string
}

/** Pencere genişliğine göre sütun düzeni: yan yana mı, yan sütun genişliği ne. */
export function resolveColumns(
  width: number,
  {
    stackAt = size.web.railBreakpoint,
    narrowAt = size.web.railBreakpoint,
    asideWidth = 360,
    asideWidthNarrow,
  }: Pick<WebColumnsProps, 'stackAt' | 'narrowAt' | 'asideWidth' | 'asideWidthNarrow'>
): { stacked: boolean; asideWidth: number } {
  const stacked = width <= stackAt
  const narrow = asideWidthNarrow !== undefined && width <= narrowAt
  return { stacked, asideWidth: narrow ? (asideWidthNarrow ?? asideWidth) : asideWidth }
}

/**
 * WebColumns (template) — web uygulamasının iki sütunlu ızgarası
 * (`grid-template-columns: minmax(0,1fr) <aside>px; gap 24`). `stackAt` altında
 * sütunlar alt alta dizilir (DOM sırası: sol sütun önce). Yalnız web yerleşiminde kullanılır.
 */
export function WebColumns({
  children,
  aside,
  asideWidth,
  asideWidthNarrow,
  narrowAt,
  asidePosition = 'right',
  stackAt,
  hideAsideWhenStacked = false,
  className,
  testID,
}: WebColumnsProps) {
  const { width } = useWindowDimensions()
  const layout = resolveColumns(width, { stackAt, narrowAt, asideWidth, asideWidthNarrow })
  const showAside =
    aside !== undefined && aside !== null && !(layout.stacked && hideAsideWhenStacked)

  const main = <View className="min-w-0 flex-1 gap-4">{children}</View>
  const side = showAside ? (
    <View
      testID={testID ? `${testID}-aside` : undefined}
      // REASON: yan sütun genişliği tasarımdaki px değerinden gelir (prop)
      style={layout.stacked ? undefined : { width: layout.asideWidth }}
      className={cn('gap-4', layout.stacked ? 'w-full' : 'shrink-0')}
    >
      {aside}
    </View>
  ) : null

  return (
    <View
      testID={testID}
      className={cn(layout.stacked ? 'gap-4' : 'flex-row items-start gap-6', className)}
    >
      {asidePosition === 'left' ? side : null}
      {main}
      {asidePosition === 'right' ? side : null}
    </View>
  )
}
