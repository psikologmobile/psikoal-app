import { useEffect } from 'react'

import { Platform } from 'react-native'

import { useRouter } from 'expo-router'

import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { SitePage } from '../components/SitePage'
import { SITE_ROUTES } from '../siteRoutes'

import { TopupStateCard } from './TopupStateCard'

import { useTopupResult } from '@/domains/wallet'

/**
 * PayTR dönüş adresi iframe'in içinde açılırsa (OkUrl/FailUrl) sayfa ödeme
 * kutusunun içinde kalmasın: aynı kökenden üst pencere bu adrese taşınır.
 */
function useBreakOutOfFrame() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return
    try {
      if (window.top && window.top !== window.self) {
        window.top.location.href = window.location.href
      }
    } catch {
      // Farklı köken: tarayıcı engeller; sayfa iframe içinde gösterilir.
    }
  }, [])
}

function ResultPage({
  path,
  title,
  children,
}: {
  path: string
  title: string
  children: React.ReactNode
}) {
  return (
    <SitePage
      testID="screen-site-topup-result"
      head={{ title, description: 'PsikoAl bakiye yükleme sonucu.', path, noIndex: true }}
      header={<SiteHeader />}
      footer={<SiteFooter />}
    >
      {children}
    </SitePage>
  )
}

/**
 * /bakiye/basarili (PayTR OkUrl). Yönlendirme ödemenin kanıtı değildir: bakiye
 * birkaç kez okunur (useTopupResult) — yansıyınca başarılı, yansımazsa beklemede.
 */
export function TopupSuccessScreen() {
  useBreakOutOfFrame()
  const { status, pending, balanceLabel } = useTopupResult()

  let card
  if (status === 'confirmed') {
    card = (
      <TopupStateCard
        tone="ok"
        title="Bakiyen yüklendi"
        text={`${pending?.amountLabel ?? 'Tutar'} bakiyene eklendi${balanceLabel ? ` (güncel bakiye ${balanceLabel})` : ''}. Uygulamada hemen kullanabilirsin.`}
        primary={{ label: 'Bakiyeme git', href: SITE_ROUTES.wallet }}
      />
    )
  } else if (status === 'unknown') {
    card = (
      <TopupStateCard
        tone="info"
        icon="CircleCheck"
        title="Ödemen alındı"
        text="Bakiyen birkaç saniye içinde yansır. Bakiyem sayfasından güncel tutarı görebilirsin."
        primary={{ label: 'Bakiyeme git', href: SITE_ROUTES.wallet }}
      />
    )
  } else {
    card = (
      <TopupStateCard
        tone="wait"
        title="Ödeme kontrol ediliyor"
        text={
          status === 'checking'
            ? 'Bankandan onay bekleniyor. Bakiyen birkaç saniye içinde yansır.'
            : 'Bankandan onay bekleniyor. Bu birkaç dakika sürebilir; sonuçlanınca bildirim göndereceğiz.'
        }
        primary={{ label: 'Bakiyeme git', href: SITE_ROUTES.wallet }}
      />
    )
  }

  return (
    <ResultPage path={SITE_ROUTES.topupSuccess} title="Ödeme sonucu">
      {card}
    </ResultPage>
  )
}

/** /bakiye/hata (PayTR FailUrl). */
export function TopupFailureScreen() {
  useBreakOutOfFrame()
  const router = useRouter()
  return (
    <ResultPage path={SITE_ROUTES.topupFailure} title="Ödeme alınamadı">
      <TopupStateCard
        tone="fail"
        title="Ödeme alınamadı"
        text="Bankan işlemi onaylamadı. Kart bilgilerini kontrol edip tekrar dene; kartından para çekilmedi."
        primary={{
          label: 'Tekrar dene',
          // REASON: typed routes üretilmiş tipleri derleme zamanında yok
          onPress: () => router.replace(SITE_ROUTES.topup as never),
        }}
        secondary={{ label: 'Bakiyeme git', href: SITE_ROUTES.wallet }}
      />
    </ResultPage>
  )
}
