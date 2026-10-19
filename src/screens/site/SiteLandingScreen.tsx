import { View } from 'react-native'

import { SiteAuthActions } from './components/SiteAuthActions'
import { SiteButton } from './components/SiteButton'
import { SiteFaq } from './components/SiteFaq'
import { SiteFooter } from './components/SiteFooter'
import { SiteGrid } from './components/SiteGrid'
import { SiteHeader } from './components/SiteHeader'
import { SiteHeading } from './components/SiteHeading'
import { SiteLink } from './components/SiteLink'
import { SitePage, SiteSection } from './components/SitePage'
import {
  LANDING_FAQ,
  LANDING_STEPS,
  LANDING_TESTS,
  LANDING_TOPICS,
  LANDING_TRUST,
} from './content/siteContent'
import { SITE_LANDING_CLASS } from './siteDocument'
import { SITE_ROUTES, blogPostHref, loginHref } from './siteRoutes'

import type { SiteNavItem } from './components/SiteHeader'
import type { IconName } from '@/core/components/atoms/Icon'

import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'
import { useBlogListQuery } from '@/domains/blog'
import { env } from '@/lib/env'

export const LANDING_NAV: SiteNavItem[] = [
  { label: 'Nasıl çalışır', anchor: 'nasil' },
  { label: 'Uzmanlar için', href: SITE_ROUTES.experts },
  { label: 'Blog', href: SITE_ROUTES.blog },
  { label: 'Destek', href: SITE_ROUTES.support },
]

const DELAYS = ['site-d1', 'site-d2', 'site-d3', 'site-d4'] as const

function StoreBadge({ store, url, icon }: { store: string; url?: string; icon: IconName }) {
  const colors = useThemeColors()
  const content = (
    <>
      <Icon name={icon} size={20} color={colors.bg} />
      <View>
        <Text className="font-body-semibold text-[11px] leading-3 text-bg">
          {url ? 'İndir' : 'Yakında'}
        </Text>
        <Text className="font-body-heavy text-[15px] leading-5 text-bg">{store}</Text>
      </View>
    </>
  )
  const box = 'h-14 flex-row items-center gap-2 rounded-md bg-fg px-5'
  if (!url) {
    return (
      <View accessibilityLabel={`${store} uygulaması yakında`} className={cn(box, 'opacity-80')}>
        {content}
      </View>
    )
  }
  return (
    <SiteLink href={url} accessibilityLabel={`${store}'dan indir`} className={box}>
      {content}
    </SiteLink>
  )
}

/** Sağdaki telefon çizimi (dekor; ekran okuyucudan gizli). */
function HeroIllustration() {
  const rows = [
    { avatar: 'bg-primary', w1: 'w-[100px]', w2: 'w-[70px]', delay: 'site-d3' },
    { avatar: 'bg-accent', w1: 'w-[90px]', w2: 'w-[60px]', delay: 'site-d4' },
    { avatar: 'bg-accent-line', w1: 'w-[110px]', w2: 'w-[50px]', delay: 'site-d5' },
  ] as const
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="site-a site-d2 relative h-[520px] w-full"
    >
      <View className="site-ob absolute inset-5 rounded-full border border-dashed border-accent-line" />
      <View className="absolute left-1/2 top-[30px] -ml-[135px] h-[460px] w-[270px] gap-2.5 rounded-[40px] border border-border-strong bg-surface px-4 py-[22px]">
        <View className="h-2.5 w-[90px] rounded-full bg-border-strong" />
        <View className="gap-2 rounded-xl bg-accent p-3.5">
          <View className="h-2.5 w-[120px] rounded-full bg-accent-fg" />
          <View className="h-2 w-[160px] rounded-full bg-accent-line" />
          <View className="h-[30px] w-[110px] rounded-inner bg-primary" />
        </View>
        {rows.map((row) => (
          <View
            key={row.delay}
            className={cn('site-r flex-row items-center gap-2.5 rounded-lg bg-bg p-3', row.delay)}
          >
            <View className={cn('h-8 w-8 rounded-full', row.avatar)} />
            <View className="flex-1 gap-1.5">
              <View className={cn('h-2 rounded-full bg-fg', row.w1)} />
              <View className={cn('h-1.5 rounded-full bg-border-strong', row.w2)} />
            </View>
            <View className="h-[18px] w-11 rounded-[6px] bg-accent-soft" />
          </View>
        ))}
      </View>
      <View className="site-ft absolute right-2.5 top-[90px]">
        <View className="site-p site-d5 rounded-full bg-primary px-3.5 py-2.5">
          <Text className="font-body-heavy text-body-sm text-primary-fg">3 yeni teklif</Text>
        </View>
      </View>
      <View className="site-ft absolute bottom-[70px] left-0">
        <View className="site-p site-d6 rounded-full border border-border-strong bg-bg px-3.5 py-2.5">
          <Text className="font-body-bold text-body-sm text-fg">Lisans doğrulandı ✓</Text>
        </View>
      </View>
    </View>
  )
}

function BlogTeasers() {
  const { data, isLoading, isError } = useBlogListQuery({ limit: 3 })
  const posts = data?.data ?? []
  if (isError || (!isLoading && posts.length === 0)) return null

  return (
    <SiteSection className="gap-7 py-12 sm:py-18">
      <View className="flex-row flex-wrap items-end justify-between gap-3">
        <SiteHeading kicker="Blog" title="Okumaya değer." />
        <SiteButton href={SITE_ROUTES.blog} label="Tüm yazılar" variant="ghost" />
      </View>
      <SiteGrid itemClassName="min-[641px]:w-1/2 min-[961px]:w-1/3">
        {isLoading
          ? [0, 1, 2].map((i) => (
              <Skeleton key={i} height={240} borderRadius="3xl" delay={i * 120} />
            ))
          : posts.map((post, i) => (
              <SiteLink
                key={post.id}
                href={blogPostHref(post.slug)}
                className="site-hov overflow-hidden rounded-3xl border border-border"
              >
                <View
                  className={cn('h-40', ['bg-accent-soft', 'bg-accent', 'bg-surface'][i % 3])}
                />
                <View className="gap-1.5 p-4.5">
                  <Text className="font-body-bold text-label text-primary-text">
                    {post.categories[0] ? `${post.categories[0]} · ` : ''}
                    {post.readingTime} dk
                  </Text>
                  <Text className="font-body-heavy text-lg text-fg">{post.title}</Text>
                </View>
              </SiteLink>
            ))}
      </SiteGrid>
    </SiteSection>
  )
}

/**
 * Tanıtım (b2_Site_Tanıtım + b2_Telefon_Tanıtım): oturumsuz ziyaretçinin `/`
 * sayfası. Statik HTML olarak üretilir (SEO); oturumlu kullanıcıda kök sınıfı
 * sayesinde hidrasyona kadar gizli kalır (siteDocument).
 */
export function SiteLandingScreen() {
  return (
    <SitePage
      testID="screen-site-landing"
      className={SITE_LANDING_CLASS}
      head={{
        title: 'PsikoAl · İhtiyacını anlat, uzmanlar sana gelsin',
        description:
          'Bir ilan aç; lisansı doğrulanmış psikologlar tekliflerini göndersin. Karşılaştır, sana en uygun uzmanı sen seç. Danışan için tamamen ücretsiz.',
        path: SITE_ROUTES.home,
      }}
      header={
        <SiteHeader
          nav={LANDING_NAV}
          desktopActions={<SiteAuthActions />}
          menuFooter={<SiteButton href={loginHref()} label="Web'de kullan" />}
        />
      }
      footer={<SiteFooter variant="full" />}
    >
      <SiteSection className="gap-12 pb-18 pt-14 min-[961px]:flex-row min-[961px]:items-center">
        <View className="gap-5 min-[961px]:flex-[1.1]">
          <Text className="site-a font-body-heavy text-label uppercase tracking-[1.3px] text-primary-text">
            Terapi arayanlar için · ücretsiz
          </Text>
          <Text
            role="heading"
            aria-level={1}
            className="site-a site-d1 font-display text-[44px] leading-[44px] tracking-[-1.3px] text-fg sm:text-[68px] sm:leading-[67px] sm:tracking-[-2px]"
          >
            İhtiyacını anlat, uzmanlar <Text className="text-primary-text">sana gelsin.</Text>
          </Text>
          <Text className="site-a site-d2 max-w-[520px] font-body-regular text-[19px] leading-[29px] text-fg-muted">
            Bir ilan aç; lisansı doğrulanmış psikologlar tekliflerini göndersin. Karşılaştır, sana
            en uygun uzmanı sen seç. Danışan için tamamen ücretsiz.
          </Text>
          <View className="site-a site-d3 flex-row flex-wrap gap-2.5">
            <StoreBadge store="App Store" url={env.EXPO_PUBLIC_APP_STORE_URL} icon="Smartphone" />
            <StoreBadge store="Google Play" url={env.EXPO_PUBLIC_PLAY_STORE_URL} icon="Play" />
            <SiteButton href={loginHref()} label="Web'de kullan" size="lg" />
          </View>
        </View>
        <View className="min-[961px]:flex-[0.9]">
          <HeroIllustration />
        </View>
      </SiteSection>

      <SiteSection id="nasil" className="gap-7 py-12 sm:py-18">
        <SiteHeading kicker="Nasıl çalışır" title="Üç adımda doğru uzman." />
        <SiteGrid itemClassName="min-[641px]:w-1/2 min-[961px]:w-1/3">
          {LANDING_STEPS.map((step, i) => (
            <View
              key={step.title}
              className={cn(
                'site-hov site-a h-full gap-3 rounded-3xl border border-border p-6',
                DELAYS[i]
              )}
            >
              <View
                className={cn(
                  'h-13 w-13 items-center justify-center rounded-lg',
                  i === 2 ? 'bg-primary' : 'bg-accent-soft'
                )}
              >
                <Text
                  className={cn(
                    'font-display text-2xl',
                    i === 2 ? 'text-primary-fg' : 'text-accent-soft-fg'
                  )}
                >
                  {i + 1}
                </Text>
              </View>
              <Text className="font-body-heavy text-xl text-fg">{step.title}</Text>
              <Text className="text-body leading-6 text-fg-muted">{step.text}</Text>
            </View>
          ))}
        </SiteGrid>
      </SiteSection>

      <SiteSection className="gap-7 py-12 sm:py-18 min-[961px]:flex-row min-[961px]:items-center">
        <View className="gap-4 min-[961px]:flex-1">
          <SiteHeading kicker="Ücretsiz testler" title="Kendini tanı, sonra karar ver." />
          <Text className="font-body-regular text-body-lg leading-7 text-fg-muted">
            Kaygı, uyku, stres ve özgüven için kısa testler. Sonucunu ilanına ekleyerek uzmanın seni
            daha iyi anlamasını sağla. Testler tanı koymaz, bilgilendirme amaçlıdır.
          </Text>
        </View>
        <View className="min-[961px]:flex-1">
          <SiteGrid gap="sm" itemClassName="w-1/2">
            {LANDING_TESTS.map((test, i) => (
              <View
                key={test.title}
                className={cn(
                  'site-hov h-full gap-3 rounded-3xl border p-6',
                  i === 0 ? 'border-transparent bg-accent-soft' : 'border-border'
                )}
              >
                <Text
                  className={cn(
                    'font-body-heavy text-lg',
                    i === 0 ? 'text-accent-soft-fg' : 'text-fg'
                  )}
                >
                  {test.title}
                </Text>
                <Text
                  className={i === 0 ? 'text-body text-accent-soft-fg' : 'text-body text-fg-muted'}
                >
                  {test.meta}
                </Text>
              </View>
            ))}
          </SiteGrid>
        </View>
      </SiteSection>

      <SiteSection className="py-6">
        <View className="gap-7 rounded-[36px] bg-accent p-7 sm:p-14">
          <SiteHeading kicker="Güven" title="Lisanslı uzmanlar, senin iznin." tone="accent" />
          <SiteGrid itemClassName="min-[641px]:w-1/2 min-[961px]:w-1/3">
            {LANDING_TRUST.map((item) => (
              <View key={item.title} className="gap-2">
                <Text className="font-body-heavy text-lg text-accent-fg">{item.title}</Text>
                <Text className="text-body leading-6 text-accent-muted">{item.text}</Text>
              </View>
            ))}
          </SiteGrid>
        </View>
      </SiteSection>

      <SiteSection className="gap-7 py-12 sm:py-18">
        <SiteHeading kicker="Konular" title="Neyle uğraşıyorsun?" />
        <SiteGrid gap="sm" itemClassName="min-[641px]:w-1/2 min-[961px]:w-1/4">
          {LANDING_TOPICS.map((topic, i) => (
            <View
              key={topic.name}
              className={cn(
                'site-hov site-a h-full gap-3 rounded-3xl border border-border p-5',
                DELAYS[i % 4]
              )}
            >
              <Text className="font-body-heavy text-[17px] leading-6 text-fg">{topic.name}</Text>
              <Text className="text-body-sm text-fg-muted">{topic.sub}</Text>
            </View>
          ))}
        </SiteGrid>
      </SiteSection>

      <BlogTeasers />

      <SiteSection className="gap-7 py-12 sm:py-18 min-[961px]:flex-row">
        <View className="min-[961px]:flex-1">
          <SiteHeading kicker="Sık sorulanlar" title="Merak ettiklerin" />
        </View>
        <SiteFaq items={LANDING_FAQ} className="min-[961px]:flex-1" />
      </SiteSection>
    </SitePage>
  )
}
