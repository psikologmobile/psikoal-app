import { useState } from 'react'

import { View } from 'react-native'

import { SiteButton } from './components/SiteButton'
import { SiteFaq } from './components/SiteFaq'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { SiteLink } from './components/SiteLink'
import { SitePage, SiteSection } from './components/SitePage'
import { SUPPORT_FAQ } from './content/siteContent'
import { SITE_ROUTES } from './siteRoutes'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { SegmentedControl } from '@/core/components/molecules/SegmentedControl'
import { useThemeColors } from '@/core/theme'
import { env } from '@/lib/env'

type Audience = 'client' | 'expert'

const AUDIENCES: { value: Audience; label: string }[] = [
  { value: 'client', label: 'Danışanlar' },
  { value: 'expert', label: 'Uzmanlar' },
]

/** Destek (b2_Site_Destek): Danışan/Uzman sekmeleri, SSS, destek e-postası. */
export function SupportScreen() {
  const colors = useThemeColors()
  const [audience, setAudience] = useState<Audience>('client')
  const email = env.EXPO_PUBLIC_SUPPORT_EMAIL

  return (
    <SitePage
      testID="screen-site-support"
      head={{
        title: 'Destek',
        description:
          'Psikosirius danışan ve uzman sık sorulan soruları. Cevabı bulamazsan destek ekibimize e-posta ile ulaş.',
        path: SITE_ROUTES.support,
      }}
      header={
        <SiteHeader
          actions={
            <SiteLink href={SITE_ROUTES.home}>
              <Text className="font-body-bold text-body text-link">Ana sayfa</Text>
            </SiteLink>
          }
        />
      }
      footer={<SiteFooter />}
    >
      <SiteSection className="gap-5 pb-20 pt-8">
        <Text
          role="heading"
          aria-level={1}
          className="site-a font-display text-[40px] leading-[42px] tracking-[-1.2px] text-fg sm:text-[56px] sm:leading-[58px] sm:tracking-[-1.7px]"
        >
          Nasıl yardımcı olabiliriz?
        </Text>
        <View className="site-a site-d1 w-full max-w-[420px]">
          <SegmentedControl
            options={AUDIENCES}
            value={audience}
            onChange={setAudience}
            accessibilityLabel="Soru grubu"
          />
        </View>
        <SiteFaq key={audience} items={SUPPORT_FAQ[audience]} className="site-a site-d2" />
        <View className="site-a site-d3 flex-row flex-wrap items-center gap-4.5 rounded-panel bg-accent-soft p-6">
          <View className="h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Icon name="Mail" size={26} color={colors.onPrimary} />
          </View>
          <View className="min-w-[200px] flex-1 gap-1">
            <Text className="font-body-heavy text-lg text-accent-soft-fg">
              Cevabı bulamadın mı?
            </Text>
            <Text className="text-body text-accent-soft-fg">
              Bize yaz, en geç bir iş günü içinde dönelim.
            </Text>
          </View>
          <SiteButton
            href={`mailto:${email}?subject=${encodeURIComponent('Psikosirius Destek')}`}
            label={email}
            accessibilityLabel={`Destek e-postası: ${email}`}
          />
        </View>
      </SiteSection>
    </SitePage>
  )
}
