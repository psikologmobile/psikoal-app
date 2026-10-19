import { View } from 'react-native'

import { SiteButton } from './components/SiteButton'
import { SiteFooter } from './components/SiteFooter'
import { SiteGrid } from './components/SiteGrid'
import { SiteHeader } from './components/SiteHeader'
import { SiteHeading } from './components/SiteHeading'
import { SitePage, SiteSection, useSiteScroll } from './components/SitePage'
import { EXPERT_FAQ, EXPERT_STEPS, FEE_PRINCIPLE_BARS } from './content/siteContent'
import { SITE_ROUTES, loginHref, registerHref } from './siteRoutes'
import { useSiteSession } from './useSiteSession'

import type { SiteNavItem } from './components/SiteHeader'

import { Text } from '@/core/components/atoms/Text'
import { cn } from '@/core/utils/cn'

const NAV: SiteNavItem[] = [
  { label: 'Danışanlar için', href: SITE_ROUTES.home },
  { label: 'Teklif ücreti', anchor: 'ucret' },
  { label: 'SSS', anchor: 'sss' },
]

const DELAYS = ['site-d1', 'site-d2', 'site-d3'] as const

/** Sağdaki ilan + ücret kartı çizimi (dekor). Belirli bir ilan için ücret düşüşü YOK. */
function HeroIllustration() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="site-a site-d2 relative h-[440px] overflow-hidden rounded-[36px] bg-accent-soft"
    >
      <View className="site-ob absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full border border-dashed border-accent-line" />
      <View className="absolute left-10 right-10 top-[60px] gap-2.5 rounded-2xl bg-bg p-5">
        <View className="flex-row justify-between">
          <View className="h-2.5 w-[140px] rounded-full bg-fg" />
          <View className="site-p rounded-full bg-primary px-2.5 py-0.5">
            <Text className="font-body-heavy text-[11px] leading-4 text-primary-fg">Davet</Text>
          </View>
        </View>
        <View className="h-2 w-[220px] max-w-full rounded-full bg-border-strong" />
        <View className="h-2 w-[180px] max-w-full rounded-full bg-border-strong" />
      </View>
      <View className="absolute left-10 right-10 top-[210px] flex-row items-center justify-between rounded-2xl bg-accent p-5">
        <View>
          <Text className="text-label text-accent-fg">Teklif ücreti</Text>
          <Text className="font-display text-[32px] leading-9 text-accent-fg">₺625</Text>
        </View>
        <View className="h-[46px] justify-center rounded-md bg-primary px-4.5">
          <Text className="font-body-heavy text-body text-primary-fg">Teklif ver</Text>
        </View>
      </View>
    </View>
  )
}

function FeeChart() {
  return (
    <View
      accessible
      accessibilityLabel="Teklif ücreti ilan yeniyken ve az teklifliyken yüksektir; zamanla ve teklif geldikçe düşer."
      className="gap-3 rounded-3xl border border-border p-7"
    >
      <View className="h-[220px] flex-row items-end gap-3">
        {FEE_PRINCIPLE_BARS.map((bar, i) => (
          <View
            key={i}
            className={cn('site-bar flex-1 rounded-t-sm', bar.height, bar.tone, `site-d${i + 1}`)}
          />
        ))}
      </View>
      <View className="flex-row justify-between gap-3">
        <Text className="font-body-semibold text-label text-fg-muted">İlan yeni · az teklif</Text>
        <Text className="font-body-semibold text-label text-fg-muted">İlan eski · çok teklif</Text>
      </View>
    </View>
  )
}

function HeroButtons() {
  const { scrollToAnchor } = useSiteScroll()
  return (
    <View className="site-a site-d3 flex-row flex-wrap gap-2.5">
      <SiteButton href={registerHref('expert')} label="Uzman olarak başvur" size="lg" />
      <SiteButton
        onPress={() => scrollToAnchor('ucret')}
        label="Ücret nasıl işler?"
        variant="ghost"
        size="lg"
      />
    </View>
  )
}

/**
 * Uzmanlar için (b2_Site_Uzmanlar_için). Müşteri kararı: belirli bir ilan için
 * "X saat sonra ₺…" düşüş satırı, geri sayım ya da "bir sonraki düşüş" metni YOK;
 * yalnız genel ilke (yeni/az teklifli ilan daha değerli, zamanla ve teklifle düşer).
 */
export function ExpertsLandingScreen() {
  const { isAuthenticated } = useSiteSession()
  return (
    <SitePage
      testID="screen-site-experts"
      head={{
        title: 'Uzmanlar için',
        description:
          'Psikologlar ve psikoterapistler için: danışan ilanlarını gör, uygun olanlara teklif gönder. Yalnız teklif verdiğinde ücret ödersin; abonelik yok.',
        path: SITE_ROUTES.experts,
      }}
      header={
        <SiteHeader
          nav={NAV}
          badge="Uzmanlar"
          desktopActions={
            isAuthenticated ? null : (
              <SiteButton href={loginHref()} label="Giriş yap" variant="ghost" />
            )
          }
          actions={
            isAuthenticated ? (
              <SiteButton href={SITE_ROUTES.home} label="Uygulamaya git" />
            ) : (
              <SiteButton href={registerHref('expert')} label="Uzman olarak başvur" />
            )
          }
        />
      }
      footer={<SiteFooter />}
    >
      <SiteSection className="gap-5 pb-18 pt-14 min-[961px]:flex-row min-[961px]:items-center">
        <View className="gap-5 min-[961px]:flex-1">
          <Text className="site-a font-body-heavy text-label uppercase tracking-[1.3px] text-primary-text">
            Psikologlar ve psikoterapistler için
          </Text>
          <Text
            role="heading"
            aria-level={1}
            className="site-a site-d1 font-display text-[44px] leading-[44px] tracking-[-1.3px] text-fg sm:text-[64px] sm:leading-[64px] sm:tracking-[-2px]"
          >
            Danışan aramayı bırak, <Text className="text-primary-text">ilanlar sana gelsin.</Text>
          </Text>
          <Text className="site-a site-d2 max-w-[520px] font-body-regular text-[19px] leading-[29px] text-fg-muted">
            Destek arayan danışanların ilanlarını gör, uygun olanlara teklif gönder. Yalnız teklif
            verdiğinde ücret ödersin; abonelik yok.
          </Text>
          <HeroButtons />
        </View>
        <View className="min-[961px]:flex-1">
          <HeroIllustration />
        </View>
      </SiteSection>

      <SiteSection id="ucret" className="gap-7 py-12 sm:py-18 min-[961px]:flex-row">
        <View className="gap-4 min-[961px]:flex-1">
          <SiteHeading
            kicker="Teklif ücreti"
            title="Yeni ilan daha değerli; zamanla ve teklifle ucuzlar."
          />
          <Text className="font-body-regular text-body-lg leading-7 text-fg-muted">
            Bir ilan yeni açıldığında ve az teklif aldığında teklif ücreti yüksektir. İlan eskidikçe
            ve teklif geldikçe ücret basamak basamak düşer. Her ilanda o anki ücreti görürsün;
            ücret, teklifini gönderirken onayladığın tutardır.
          </Text>
          <View className="rounded-lg bg-surface px-4 py-3.5">
            <Text className="text-body-sm text-fg-muted">
              Harcanan bakiye iade edilmez. Teklifin seçilmese de ücret düşer.
            </Text>
          </View>
        </View>
        <View className="min-[961px]:flex-1">
          <FeeChart />
        </View>
      </SiteSection>

      <SiteSection className="gap-7 py-12 sm:py-18">
        <SiteHeading kicker="Başlarken" title="Üç adımda hazır." />
        <SiteGrid itemClassName="min-[641px]:w-1/2 min-[961px]:w-1/3">
          {EXPERT_STEPS.map((step, i) => (
            <View
              key={step.title}
              className={cn(
                'site-hov site-a h-full gap-3 rounded-3xl border p-6',
                DELAYS[i],
                i === 2 ? 'border-transparent bg-accent-soft' : 'border-border'
              )}
            >
              <Text
                className={cn(
                  'font-body-heavy text-xl',
                  i === 2 ? 'text-accent-soft-fg' : 'text-fg'
                )}
              >
                {step.title}
              </Text>
              <Text
                className={cn(
                  'text-body leading-6',
                  i === 2 ? 'text-accent-soft-fg' : 'text-fg-muted'
                )}
              >
                {step.text}
              </Text>
            </View>
          ))}
        </SiteGrid>
      </SiteSection>

      <SiteSection id="sss" className="gap-7 py-12 sm:py-18 min-[961px]:flex-row">
        <View className="min-[961px]:flex-1">
          <SiteHeading kicker="Sık sorulanlar" title="Uzmanların soruları" />
        </View>
        <View className="gap-2.5 min-[961px]:flex-1">
          {EXPERT_FAQ.map((item) => (
            <View key={item.q} className="gap-3 rounded-3xl border border-border p-6">
              <Text className="font-body-bold text-body text-fg">{item.q}</Text>
              <Text className="text-body text-fg-muted">{item.a}</Text>
            </View>
          ))}
        </View>
      </SiteSection>
    </SitePage>
  )
}
