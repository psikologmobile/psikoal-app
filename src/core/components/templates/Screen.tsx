import type { ReactElement, ReactNode } from 'react'

import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import type { RefreshControlProps } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useSidebarMode } from '@/core/components/organisms/Sidebar'
import { cn } from '@/core/utils/cn'

export type ScreenProps = {
  children: ReactNode
  /** İçerik kaydırılsın mı (varsayılan true). Liste ekranları false verip FlatList kullanır. */
  scroll?: boolean
  /** Üstte güvenli alan boşluğu (varsayılan true). */
  safeTop?: boolean
  /** Klavye açılınca içerik yukarı itilsin (form ekranları). */
  keyboard?: boolean
  /** Kaydırmanın dışında sabit alt alan (birincil düğme). */
  footer?: ReactNode
  refreshControl?: ReactElement<RefreshControlProps>
  /** İçerik kabı sınıfları (gap, ek padding). */
  contentClassName?: string
  testID?: string
}

/**
 * Screen (template) — bg zemin, mobilde 20 px yatay kenar + üstte güvenli alan
 * + 12 px; web'de (kenar çubuğu yanında) 40 px kenar (ikon rayında 28), en çok 1200 px ve ortalı.
 * Sekme ekranlarında alt boşluğu (tabs)/_layout verir.
 */
export function Screen({
  children,
  scroll = true,
  safeTop = true,
  keyboard = false,
  footer,
  refreshControl,
  contentClassName,
  testID,
}: ScreenProps) {
  const insets = useSafeAreaInsets()
  const mode = useSidebarMode()
  const isWebWide = Platform.OS === 'web' && mode !== 'top'
  // Web: tam kenar çubuğunda 40/32/56, ikon rayında (≤1100) 28/28/48 (tasarım `.main`).
  const pad = !isWebWide ? 'px-5 pb-8' : mode === 'rail' ? 'px-7 pb-12 pt-7' : 'px-10 pb-14 pt-8'
  // REASON: üst boşluk cihazın güvenli alanından hesaplanır
  const topStyle = safeTop && !isWebWide ? { paddingTop: insets.top + 12 } : undefined

  const content = (
    <View
      style={topStyle}
      className={cn('w-full gap-3.5', isWebWide && 'max-w-web self-center', pad, contentClassName)}
    >
      {children}
    </View>
  )

  const body = scroll ? (
    <ScrollView
      testID={testID}
      className="flex-1 bg-bg"
      contentContainerClassName="flex-grow"
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      {content}
    </ScrollView>
  ) : (
    <View testID={testID} className="flex-1 bg-bg">
      {content}
    </View>
  )

  const withFooter = (
    <View className="flex-1 bg-bg">
      {body}
      {footer ? (
        <View
          style={{ paddingBottom: Math.max(16, insets.bottom) }}
          className={cn('border-t border-border bg-bg px-5 pt-3', isWebWide && 'items-center')}
        >
          <View className={cn('w-full', isWebWide && 'max-w-web')}>{footer}</View>
        </View>
      ) : null}
    </View>
  )

  if (!keyboard) return withFooter
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {withFooter}
    </KeyboardAvoidingView>
  )
}
