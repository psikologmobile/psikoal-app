import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'

import { Platform, ScrollView, View } from 'react-native'

import { SiteHead } from './SiteHead'

import type { SiteHeadProps } from './SiteHead'

import { cn } from '@/core/utils/cn'

/** Tasarımın `.wrap` kabı: en çok 1200 px, kenar 32 px (≤640 px'te 16 px). */
export const SITE_WRAP = 'w-full max-w-[1200px] self-center px-4 sm:px-8'

type SiteScrollContextValue = {
  scrollToAnchor: (id: string) => void
}

/**
 * Sayfa içi bağlantı (#nasil, #ucret, #sss, içindekiler): hedef `nativeID` ile
 * web'de DOM id'si olur; tarayıcının scrollIntoView'u iç içe kaydırma kabında da
 * doğru konuma gider. Site yalnız web'de açıldığı için native karşılığı yok.
 */
function scrollToDomAnchor(id: string): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const SiteScrollContext = createContext<SiteScrollContextValue>({
  scrollToAnchor: scrollToDomAnchor,
})

export function useSiteScroll(): SiteScrollContextValue {
  return useContext(SiteScrollContext)
}

export type SitePageProps = {
  head: SiteHeadProps
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  testID?: string
  className?: string
}

/**
 * Site sayfası iskeleti: kök kaydırma alanı (RN web'de belge değil ScrollView
 * kayar), <head> etiketleri, üst menü, içerik ve en alta itilen alt bilgi.
 */
export function SitePage({ head, header, footer, children, testID, className }: SitePageProps) {
  const scrollToAnchor = useCallback((id: string) => scrollToDomAnchor(id), [])
  const value = useMemo(() => ({ scrollToAnchor }), [scrollToAnchor])

  // Adres #bölüm ile açıldıysa (ör. /uzmanlar-icin#ucret) ilk boyamadan sonra kaydır.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return
    const hash = window.location.hash.slice(1)
    if (hash) requestAnimationFrame(() => scrollToDomAnchor(decodeURIComponent(hash)))
  }, [])

  return (
    <SiteScrollContext.Provider value={value}>
      <SiteHead {...head} />
      <ScrollView
        testID={testID}
        className={cn('flex-1 bg-bg', className)}
        contentContainerClassName="min-h-full"
      >
        {header}
        {children}
        <View className="flex-1" />
        {footer}
      </ScrollView>
    </SiteScrollContext.Provider>
  )
}

export type SiteSectionProps = {
  /** Sayfa içi bağlantı hedefi (web'de id özniteliği). */
  id?: string
  children: ReactNode
  /** Dış kap (tam genişlik) sınıfları. */
  outerClassName?: string
  /** İç `.wrap` kabı sınıfları. */
  className?: string
}

/** Sayfanın bir bölümü: tam genişlik dış kap + ortalanmış `.wrap`. */
export function SiteSection({ id, children, outerClassName, className }: SiteSectionProps) {
  return (
    <View nativeID={id} className={cn('w-full', outerClassName)}>
      <View className={cn(SITE_WRAP, className)}>{children}</View>
    </View>
  )
}
