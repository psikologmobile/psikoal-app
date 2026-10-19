import { View } from 'react-native'

import { SiteButton } from './components/SiteButton'
import { SiteHead } from './components/SiteHead'
import { SITE_ROUTES } from './siteRoutes'

import { Text } from '@/core/components/atoms/Text'

/** 404 (b2_Site_404): "4 ◉ 4", başlık, açıklama, ana sayfaya dönüş. */
export function NotFoundScreen() {
  return (
    <View
      testID="screen-not-found"
      className="flex-1 items-center justify-center gap-6 bg-bg px-4 py-10"
    >
      <SiteHead
        title="Sayfa bulunamadı"
        description="Aradığın sayfa taşınmış ya da hiç var olmamış olabilir."
        path="/404"
        noIndex
      />
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="h-[220px] flex-row items-end gap-4"
      >
        <Text className="site-a font-display text-[120px] leading-[120px] text-fg sm:text-[160px] sm:leading-[160px]">
          4
        </Text>
        <View className="site-p mb-3.5 h-[110px] w-[110px] flex-row items-center justify-center gap-4.5 rounded-full bg-accent sm:h-[140px] sm:w-[140px]">
          <View className="site-ob absolute -inset-3 rounded-full border-2 border-dashed border-accent-line" />
          <View className="h-4 w-4 rounded-full bg-accent-fg" />
          <View className="h-4 w-4 rounded-full bg-accent-fg" />
        </View>
        <Text className="site-a site-d2 font-display text-[120px] leading-[120px] text-primary sm:text-[160px] sm:leading-[160px]">
          4
        </Text>
      </View>
      <Text
        role="heading"
        aria-level={1}
        className="site-a text-center font-display text-[34px] leading-[38px] text-fg sm:text-[40px] sm:leading-[44px]"
      >
        Bu sayfa kaybolmuş.
      </Text>
      <Text className="site-a site-d1 max-w-[420px] text-center font-body-regular text-body-lg leading-[26px] text-fg-muted">
        Aradığın sayfa taşınmış ya da hiç var olmamış olabilir. Seni ana sayfaya götürelim.
      </Text>
      <SiteButton
        href={SITE_ROUTES.home}
        label="Ana sayfaya dön"
        size="lg"
        className="site-a site-d2 px-6"
      />
    </View>
  )
}
