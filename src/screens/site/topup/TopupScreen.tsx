import type { ReactNode } from 'react'

import { Pressable, View } from 'react-native'

import { SiteButton } from '../components/SiteButton'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { SiteLink } from '../components/SiteLink'
import { SitePage, SiteSection } from '../components/SitePage'
import { SITE_ROUTES, loginHref } from '../siteRoutes'
import { useSiteSession } from '../useSiteSession'

import { PayTRFrame } from './PayTRFrame'
import { TopupStateCard } from './TopupStateCard'

import type { TopupConsentKey, UseTopupFormReturn } from '@/domains/wallet'

import { Avatar } from '@/core/components/atoms/Avatar'
import { Checkbox } from '@/core/components/atoms/Checkbox'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Spinner } from '@/core/components/atoms/Spinner'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { TextField } from '@/core/components/molecules/TextField'
import { cn } from '@/core/utils/cn'
import { getFullName, getInitials } from '@/core/utils/personName'
import { useExpertApprovalGate } from '@/domains/expert'
import { useTopupForm } from '@/domains/wallet'

const HEAD = {
  title: 'Bakiye yükle',
  description:
    'Psikosirius uzman bakiyesi yükleme: tutarı seç, sözleşmeleri onayla, PayTR ile güvenle öde.',
  path: SITE_ROUTES.topup,
  noIndex: true,
}

const CONSENTS: { key: TopupConsentKey; label: string; href: string }[] = [
  { key: 'distanceSales', label: 'Mesafeli Satış Sözleşmesi', href: SITE_ROUTES.distanceSales },
  { key: 'preInformation', label: 'Ön Bilgilendirme Formu', href: SITE_ROUTES.preInformation },
]

function UserChip() {
  const { user } = useSiteSession()
  if (!user) return null
  return (
    <View className="flex-row items-center gap-2.5">
      <Avatar size="xs" tone="accent" initials={getInitials(user) || 'U'} />
      <Text className="font-body-semibold text-body-sm text-fg">{getFullName(user)}</Text>
    </View>
  )
}

function TopupShell({ children }: { children: ReactNode }) {
  return (
    <SitePage
      testID="screen-site-topup"
      head={HEAD}
      header={<SiteHeader actions={<UserChip />} />}
      footer={<SiteFooter />}
    >
      {children}
    </SitePage>
  )
}

function Box({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <View className={cn('gap-4 rounded-3xl border border-border p-6', className)}>{children}</View>
  )
}

function SummaryRow({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <View className="flex-row justify-between gap-3">
      <Text className="text-body-sm text-fg-muted">{label}</Text>
      <Text
        className={cn('font-body-bold text-body-sm', emphasis ? 'text-primary-text' : 'text-fg')}
      >
        {value}
      </Text>
    </View>
  )
}

function TopupForm({ form }: { form: UseTopupFormReturn }) {
  const error = form.submitError
  return (
    <SiteSection>
      <Text
        role="heading"
        aria-level={1}
        className="site-a mt-4 font-display text-[34px] leading-[38px] tracking-[-0.7px] text-fg sm:text-[44px] sm:leading-[46px]"
      >
        Bakiye yükle
      </Text>
      <View className="gap-6 pb-18 pt-6 min-[901px]:flex-row min-[901px]:items-start">
        <View className="gap-4.5 min-[901px]:flex-1">
          <Box className="site-a site-d1">
            <Text className="font-body-heavy text-[17px] leading-6 text-fg">Tutar seç</Text>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Tutar"
              className="-m-1.5 flex-row flex-wrap"
            >
              {form.presets.map((preset) => (
                <View key={preset.label} className="w-1/2 p-1.5 min-[641px]:w-1/4">
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: preset.selected }}
                    onPress={preset.select}
                    className={cn(
                      'site-press h-16 items-center justify-center rounded-lg border',
                      preset.selected ? 'border-primary bg-accent-soft' : 'border-border-strong'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-xl',
                        preset.selected
                          ? 'font-display text-accent-soft-fg'
                          : 'font-display-bold text-fg'
                      )}
                    >
                      {preset.label}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
            <TextField
              label="Ya da başka bir tutar"
              type="number"
              placeholder="₺ tutar yaz"
              value={form.customText}
              onChangeText={form.setCustomText}
              error={form.customText ? (form.amountError ?? undefined) : undefined}
              hint={form.rangeHint ? `Yüklenebilir tutar: ${form.rangeHint}` : undefined}
              testID="topup-custom-amount"
            />
          </Box>

          <Box className="site-a site-d2">
            <Text className="font-body-heavy text-[17px] leading-6 text-fg">Sözleşmeler</Text>
            {CONSENTS.map((consent) => {
              const checked = form.consents[consent.key]
              return (
                <View key={consent.key} className="flex-row items-start gap-3">
                  <Checkbox
                    checked={checked}
                    onChange={() => form.toggleConsent(consent.key)}
                    accessibilityLabel={`${consent.label}'ni okudum, kabul ediyorum`}
                    hasError={form.showConsentError && !checked}
                    testID={`topup-consent-${consent.key}`}
                  />
                  <Text className="flex-1 text-body leading-6 text-fg">
                    <SiteLink href={consent.href}>
                      <Text className="font-body-bold text-body text-link">{consent.label}</Text>
                    </SiteLink>
                    'ni okudum, kabul ediyorum.
                  </Text>
                </View>
              )
            })}
            {form.showConsentError ? (
              <View accessibilityRole="alert" className="rounded-sm bg-danger-soft px-3 py-2.5">
                <Text className="font-body-bold text-body-sm text-danger-soft-fg">
                  Devam etmek için iki sözleşmeyi de onaylamalısın.
                </Text>
              </View>
            ) : null}
          </Box>
        </View>

        <Box className="site-a site-d3 border-transparent bg-surface min-[901px]:w-[380px]">
          <SummaryRow label="Mevcut bakiye" value={form.balanceLabel} />
          <SummaryRow label="Yüklenecek tutar" value={form.amountLabel} />
          {form.vatNote ? (
            <View className="flex-row justify-between gap-3">
              <Text className="text-body-sm text-fg-muted">KDV</Text>
              <Text className="text-body-sm text-fg-muted">{form.vatNote}</Text>
            </View>
          ) : null}
          <View className="h-[1.5px] bg-border-strong" />
          <View className="flex-row items-baseline justify-between">
            <Text className="font-body-bold text-body text-fg">Ödenecek</Text>
            <Text className="font-display text-4xl text-fg">{form.amountLabel}</Text>
          </View>
          <SummaryRow label="Yükleme sonrası bakiye" value={form.afterLabel} emphasis />
          {error && (error.kind === 'outOfRange' || error.kind === 'generic') ? (
            <ErrorBanner message={error.message} />
          ) : null}
          <SiteButton
            onPress={form.submit}
            label={form.isSubmitting ? 'Ödeme hazırlanıyor…' : 'Ödemeye geç'}
            isLoading={form.isSubmitting}
            isDisabled={form.amountKurus === null}
            size="lg"
            testID="topup-submit"
          />
          <Text className="text-label leading-5 text-fg-muted">
            Harcanan bakiye iade edilmez. Ödemeler PayTR güvencesiyle alınır.
          </Text>
        </Box>
      </View>
    </SiteSection>
  )
}

function PayTRStep({ form }: { form: UseTopupFormReturn }) {
  return (
    <SiteSection className="items-center">
      <View className="site-a mb-18 mt-8 w-full max-w-[640px] gap-4">
        <Pressable
          accessibilityRole="button"
          onPress={form.backToForm}
          className="h-10 justify-center self-start"
        >
          <Text className="font-body-bold text-body-sm text-link">← Tutarı değiştir</Text>
        </Pressable>
        <Text
          role="heading"
          aria-level={1}
          className="font-display text-[34px] leading-[38px] text-fg sm:text-4xl"
        >
          Ödeme · {form.amountLabel}
        </Text>
        <View
          accessibilityLabel="PayTR ödeme formu alanı"
          className="min-h-[420px] overflow-hidden rounded-3xl border border-border"
        >
          {form.iframeUrl ? (
            <PayTRFrame src={form.iframeUrl} />
          ) : (
            <View className="flex-1 items-center justify-center gap-3.5 p-5">
              <Spinner size={34} colorClassName="border-primary" />
              <Text className="font-body-bold text-body text-fg">Ödeme formu yükleniyor</Text>
            </View>
          )}
        </View>
        <Text className="text-label text-fg-muted">
          Kart bilgilerin PayTR'nin güvenli sayfasında girilir; Psikosirius kart bilgisi saklamaz.
        </Text>
      </View>
    </SiteSection>
  )
}

function TopupLoading() {
  return (
    <SiteSection className="gap-4 pb-18 pt-6">
      <View accessibilityLabel="Yükleniyor" className="gap-4">
        <Skeleton width="40%" height={44} borderRadius="xs" />
        <Skeleton height={220} borderRadius="3xl" delay={120} />
        <Skeleton height={160} borderRadius="3xl" delay={240} />
      </View>
    </SiteSection>
  )
}

/** Uzman, onaylı: tutar formu → PayTR. */
function ExpertTopup() {
  const form = useTopupForm()

  if (form.submitError?.kind === 'providerUnavailable') {
    return (
      <TopupStateCard
        tone="wait"
        title="Ödeme altyapısı yakında açılacak"
        text="Kartla bakiye yükleme çok yakında burada olacak. O zamana kadar ücretsiz teklif haklarını kullanabilirsin."
        primary={{ label: 'Bakiyeme git', href: SITE_ROUTES.wallet }}
      />
    )
  }
  if (form.submitError?.kind === 'notApproved') {
    return <NotApprovedState />
  }
  if (form.isLoading) return <TopupLoading />
  if (form.isError) {
    return (
      <SiteSection className="pb-18 pt-8">
        <ErrorBanner
          title="Tutar seçenekleri yüklenemedi"
          description="Bağlantını kontrol edip tekrar dene."
          onRetry={form.retry}
        />
      </SiteSection>
    )
  }
  return form.step === 'paytr' ? <PayTRStep form={form} /> : <TopupForm form={form} />
}

function NotApprovedState({ rejected = false }: { rejected?: boolean }) {
  return (
    <TopupStateCard
      tone="wait"
      title={rejected ? 'Profilin onaylanmadı' : 'Profilin onay bekliyor'}
      text={
        rejected
          ? 'Uzman profilin onaylanmadığı için bakiye yükleyemezsin. Ret gerekçesini uygulamada profilinde görebilirsin.'
          : 'Ekibimiz belgelerini inceliyor. Profilin onaylanınca bakiye yükleyebilir ve teklif gönderebilirsin.'
      }
      primary={{ label: 'Uygulamaya git', href: SITE_ROUTES.home }}
    />
  )
}

function ExpertGate() {
  const gate = useExpertApprovalGate()
  if (gate.isLoading) return <TopupLoading />
  if (gate.needsOnboarding) {
    return (
      <TopupStateCard
        tone="wait"
        title="Önce uzman profilini tamamla"
        text="Bakiye yükleyebilmek için uzman profilini oluşturup onaya göndermelisin."
        primary={{ label: 'Profili tamamla', href: '/onboarding/expert' }}
      />
    )
  }
  if (gate.isPendingApproval || gate.isRejected)
    return <NotApprovedState rejected={gate.isRejected} />
  return <ExpertTopup />
}

/**
 * Bakiye yükle (b2_Site_Bakiye_yükle + b2_Telefon_Bakiye_yükle) — YALNIZ web.
 * Adımlar: giriş gerekli · uzman değil · onay bekliyor · form → PayTR iFrame.
 * Sonuç sayfaları ayrı adreslerde (PayTR OkUrl/FailUrl): /bakiye/basarili, /bakiye/hata.
 */
export function TopupScreen() {
  const { hydrated, isAuthenticated, role } = useSiteSession()

  let body: ReactNode
  if (!hydrated) body = <TopupLoading />
  else if (!isAuthenticated) {
    body = (
      <TopupStateCard
        tone="info"
        title="Bakiye yüklemek için giriş yap"
        text="Bakiye uzman hesabına yüklenir. Uzman hesabınla giriş yaptıktan sonra bu sayfaya geri döneceksin."
        primary={{ label: 'Giriş yap', href: loginHref(SITE_ROUTES.topup) }}
        secondary={{ label: 'Uzman olarak başvur', href: '/register?role=expert' }}
      />
    )
  } else if (role !== 'expert') {
    body = (
      <TopupStateCard
        tone="info"
        title="Bakiye yükleme uzmanlar içindir"
        text="Danışanlar için Psikosirius tamamen ücretsizdir; ilan açmak ve teklif almak için bakiye gerekmez."
        primary={{ label: 'Uygulamaya git', href: SITE_ROUTES.home }}
      />
    )
  } else body = <ExpertGate />

  return <TopupShell>{body}</TopupShell>
}

export { TopupShell }
