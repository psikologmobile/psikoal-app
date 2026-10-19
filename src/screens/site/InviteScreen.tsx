import { View } from 'react-native'

import { SiteButton } from './components/SiteButton'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { SitePage, SiteSection } from './components/SitePage'
import { SITE_ROUTES, loginHref, registerHref } from './siteRoutes'
import { useSiteSession } from './useSiteSession'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { useThemeColors } from '@/core/theme'

export type InviteScreenProps = {
  /** Kod geçerli biçimde saklandı mı? null: henüz denenmedi (statik HTML). */
  captured: boolean | null
}

const POINTS = [
  'Seni davet eden uzmanın profilini görebilirsin.',
  'Açtığın ilanlar o uzmana "Davet" rozetiyle düşer; dilersen başka uzmanlardan da teklif alırsın.',
  'Danışan olarak PsikoAl tamamen ücretsizdir.',
] as const

/**
 * Davet bağlantısı (/davet/{kod}) — web: daveti açıklar, "Hesap oluştur" ile kayda
 * götürür. Kod tarayıcıda saklanır; kayıt formu gönderir (useRegisterMutation).
 */
export function InviteScreen({ captured }: InviteScreenProps) {
  const colors = useThemeColors()
  const { isAuthenticated } = useSiteSession()

  return (
    <SitePage
      testID="screen-site-invite"
      head={{
        title: 'Davet',
        description: 'Bir uzman seni PsikoAl’a davet etti. Ücretsiz hesap oluştur, ilanını aç.',
        path: '/davet',
        noIndex: true,
      }}
      header={<SiteHeader />}
      footer={<SiteFooter />}
    >
      <SiteSection className="items-center pb-20 pt-10">
        <View className="w-full max-w-[560px] gap-5">
          <View className="site-p h-16 w-16 items-center justify-center rounded-xl bg-accent">
            <Icon name="Gift" size={30} color={colors.onAccent} />
          </View>
          <Text
            role="heading"
            aria-level={1}
            className="site-a font-display text-[36px] leading-[40px] tracking-[-1px] text-fg sm:text-5xl sm:leading-[52px]"
          >
            Bir uzman seni PsikoAl’a davet etti
          </Text>
          <Text className="site-a site-d1 font-body-regular text-body-lg leading-7 text-fg-muted">
            PsikoAl’da ihtiyacını anlatan bir ilan açarsın, lisanslı uzmanlar sana teklif gönderir.
            Davet bağlantısıyla kayıt olursan:
          </Text>
          <View className="site-a site-d2 gap-3 rounded-3xl border border-border p-6">
            {POINTS.map((point) => (
              <View key={point} className="flex-row gap-3">
                <Icon name="Check" size={20} color={colors.primaryText} strokeWidth={2.6} />
                <Text className="flex-1 text-body leading-6 text-fg">{point}</Text>
              </View>
            ))}
          </View>
          {captured === false ? (
            <View accessibilityRole="alert" className="rounded-sm bg-danger-soft px-3 py-2.5">
              <Text className="font-body-bold text-body-sm text-danger-soft-fg">
                Bu davet bağlantısı geçersiz görünüyor. Yine de ücretsiz hesap oluşturabilirsin.
              </Text>
            </View>
          ) : null}
          {isAuthenticated ? (
            <View className="site-a site-d3 gap-3">
              <Text className="text-body text-fg-muted">
                Zaten oturum açmışsın. Davet yalnız yeni hesaplarda geçerlidir.
              </Text>
              <SiteButton href={SITE_ROUTES.home} label="Uygulamaya git" size="lg" />
            </View>
          ) : (
            <View className="site-a site-d3 flex-row flex-wrap gap-2.5">
              <SiteButton href={registerHref('client')} label="Hesap oluştur" size="lg" />
              <SiteButton href={loginHref()} label="Giriş yap" variant="ghost" size="lg" />
            </View>
          )}
        </View>
      </SiteSection>
    </SitePage>
  )
}
