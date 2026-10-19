import { useState } from 'react'

import { Share, View } from 'react-native'

import { useRouter } from 'expo-router'

import type { IconName } from '@/core/components/atoms/Icon'
import type { ThemePreference } from '@/store/themeStore'

import { Button } from '@/core/components/atoms/Button'
import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { VerifiedBadge } from '@/core/components/atoms/VerifiedBadge'
import { SegmentedControl } from '@/core/components/molecules/SegmentedControl'
import { SettingsGroup, SettingsRow } from '@/core/components/molecules/SettingsRow'
import { BottomSheet } from '@/core/components/organisms/BottomSheet'
import { Screen } from '@/core/components/templates/Screen'
import { EnterUp, Orbit, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { getFullName, getInitials } from '@/core/utils/personName'
import { useAuthStore, useLogoutMutation } from '@/domains/auth'
import { useExpertApprovalGate } from '@/domains/expert'
import { useWalletQuery } from '@/domains/wallet'
import { APP_VERSION } from '@/lib/appVersion'
import { openNotificationSettings, openSupportEmail, requestStoreReview } from '@/lib/externalLinks'
import { useThemeStore } from '@/store/themeStore'

type Row = { label: string; icon: IconName; href: string; testID?: string }

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: 'light', label: 'Açık', icon: 'Sun' },
  { value: 'dark', label: 'Koyu', icon: 'Moon' },
  { value: 'system', label: 'Sistem', icon: 'Monitor' },
]

const INVITE_MESSAGE =
  "PsikoAl'ı senin için önerdim! Ücretsiz psikolojik test çöz, sana uygun bir psikologla eşleş."

function accountRows(isExpert: boolean, userId: string | null): Row[] {
  if (!isExpert) {
    return [
      { label: 'Kişisel bilgiler', icon: 'User', href: '/profile/personal' },
      { label: 'Testlerim', icon: 'ClipboardList', href: '/assessment/list' },
      { label: 'Şifre', icon: 'Lock', href: '/profile/password' },
    ]
  }
  return [
    { label: 'Kişisel bilgiler', icon: 'User', href: '/profile/personal' },
    {
      label: 'Mesleki bilgiler ve belgeler',
      icon: 'BriefcaseBusiness',
      href: '/profile/professional',
    },
    { label: 'Bakiyem', icon: 'Wallet', href: '/wallet', testID: 'settings-wallet' },
    { label: 'Faturalarım', icon: 'ReceiptText', href: '/wallet/invoices' },
    { label: 'Davet linkim', icon: 'Link', href: '/referral', testID: 'settings-referral' },
    ...(userId
      ? [
          {
            label: 'Profilim (danışanların gördüğü)',
            icon: 'Eye' as const,
            href: `/expert/${userId}`,
          },
        ]
      : []),
    { label: 'Şifre', icon: 'Lock', href: '/profile/password' },
  ]
}

/** Uzman: bakiye + ücretsiz hak + profil durumu (dokununca Bakiyem). */
function BalanceCard() {
  const router = useRouter()
  const colors = useThemeColors()
  const { data: wallet, isLoading } = useWalletQuery()
  const { isPendingApproval, isRejected } = useExpertApprovalGate()
  const profileLabel = isRejected
    ? 'Profil reddedildi'
    : isPendingApproval
      ? 'Profil incelemede'
      : 'Profil onaylı'
  if (isLoading) return <Skeleton height={72} borderRadius="xl" />
  if (!wallet) return null
  return (
    <PressableScale
      onPress={() => router.push('/wallet' as never)}
      accessibilityRole="button"
      accessibilityLabel={`Bakiye ${wallet.balanceLabel}, ${wallet.freeOfferRights} ücretsiz hak. ${profileLabel}`}
      className="flex-row items-center gap-3 rounded-card bg-accent-soft px-4 py-3.5"
    >
      <View className="flex-1">
        <Text className="font-body-semibold text-xs text-accent-soft-fg">
          Bakiye · {profileLabel}
        </Text>
        <Text className="font-display-bold text-2xl text-accent-soft-fg">
          {wallet.balanceLabel}
          <Text className="font-body-semibold text-body-sm text-accent-soft-fg">
            {` · ${wallet.freeOfferRights} ücretsiz hak`}
          </Text>
        </Text>
      </View>
      <Icon name="ChevronRight" size={20} color={colors.onAccentSoft} strokeWidth={2.4} />
    </PressableScale>
  )
}

/** Ayarlar (b0 / b5 · Ayarlar): rol menüleri, görünüm, çıkış onayı. */
export function SettingsScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isExpert = user?.role === 'expert'
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation()
  const preference = useThemeStore((s) => s.preference)
  const setPreference = useThemeStore((s) => s.setPreference)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const rows = accountRows(isExpert, user?.id ?? null)
  const appRows: (Omit<Row, 'href'> & { hint?: string; onPress: () => void })[] = [
    { label: 'Bildirim ayarları', icon: 'Bell', hint: 'Cihaz', onPress: openNotificationSettings },
    ...(isExpert
      ? []
      : [
          {
            label: 'Davet et',
            icon: 'Share2' as const,
            onPress: () => void Share.share({ message: INVITE_MESSAGE }).catch(() => undefined),
          },
        ]),
    { label: 'Bizi değerlendir', icon: 'Star', onPress: () => void requestStoreReview() },
    {
      label: 'Destek',
      icon: 'CircleHelp',
      hint: 'E-posta',
      onPress: () => void openSupportEmail(),
    },
    {
      label: 'Veri ve gizlilik',
      icon: 'ShieldCheck',
      onPress: () => router.push('/profile/privacy' as never),
    },
  ]

  const doLogout = () =>
    logout(undefined, {
      onSettled: () => {
        setConfirmLogout(false)
        router.replace('/(auth)/login')
      },
    })

  return (
    <Screen testID="screen-settings" contentClassName="gap-3.5">
      <EnterUp>
        <Text accessibilityRole="header" className="font-display text-h2 text-fg">
          Ayarlar
        </Text>
      </EnterUp>

      <EnterUp delay={60}>
        <View className="flex-row items-center gap-3.5 rounded-3xl bg-surface p-4">
          <View className="h-16 w-16 items-center justify-center">
            <View className="absolute -inset-[5px]">
              <Orbit duration={14000}>
                <View className="h-[74px] w-[74px] rounded-full border border-dashed border-accent-line" />
              </Orbit>
            </View>
            <View className="h-16 w-16 items-center justify-center rounded-full bg-accent">
              <Text className="font-display text-[22px] text-accent-fg">
                {getInitials(user) || '·'}
              </Text>
            </View>
          </View>
          <View className="min-w-0 flex-1 gap-[3px]">
            <View className="flex-row items-center gap-1.5">
              <Text numberOfLines={1} className="shrink font-body-bold text-lg text-fg">
                {getFullName(user) || 'Kullanıcı'}
              </Text>
              {isExpert && user?.isVerified ? <VerifiedBadge size={16} /> : null}
            </View>
            <Text numberOfLines={1} className="text-label text-fg-muted">
              {user?.email ?? ''}
            </Text>
            <View className="mt-1 self-start rounded-full bg-accent-soft px-2.5 py-[3px]">
              <Text className="font-body-bold text-xs text-accent-soft-fg">
                {isExpert ? 'Uzman' : 'Danışan'}
              </Text>
            </View>
          </View>
        </View>
      </EnterUp>

      {isExpert ? (
        <EnterUp delay={120}>
          <BalanceCard />
        </EnterUp>
      ) : null}

      <EnterUp delay={120}>
        <SettingsGroup title="Hesap" className="mt-1">
          {rows.map((r, i) => (
            <SettingsRow
              key={r.label}
              testID={r.testID}
              label={r.label}
              icon={r.icon}
              isLast={i === rows.length - 1}
              onPress={() => router.push(r.href as never)}
            />
          ))}
        </SettingsGroup>
      </EnterUp>

      <EnterUp delay={180} className="mt-1 gap-2">
        <Text variant="overline" color="muted" accessibilityRole="header" className="px-1.5">
          Uygulama
        </Text>
        <View className="gap-2 rounded-card border border-border p-3.5">
          <Text className="font-body-semibold text-body text-fg">Görünüm</Text>
          <SegmentedControl
            accessibilityLabel="Görünüm"
            value={preference}
            onChange={setPreference}
            options={THEME_OPTIONS}
          />
        </View>
      </EnterUp>

      <EnterUp delay={240}>
        <SettingsGroup>
          {appRows.map((r, i) => (
            <SettingsRow
              key={r.label}
              label={r.label}
              icon={r.icon}
              hint={r.hint}
              isLast={i === appRows.length - 1}
              onPress={r.onPress}
            />
          ))}
        </SettingsGroup>
      </EnterUp>

      <EnterUp delay={300}>
        <Button
          testID="settings-logout"
          label="Çıkış yap"
          variant="outline"
          onPress={() => setConfirmLogout(true)}
          fullWidth
        />
      </EnterUp>
      <Text align="center" className="text-xs text-fg-muted">
        PsikoAl {APP_VERSION}
      </Text>

      <BottomSheet
        visible={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        title="Çıkış yapılsın mı?"
        description="Tekrar giriş yaptığında her şey kaldığın yerde olacak."
        actions={
          <View className="flex-row gap-2.5">
            <View className="flex-1">
              <Button
                label="Vazgeç"
                variant="outline"
                size="lg"
                onPress={() => setConfirmLogout(false)}
                fullWidth
              />
            </View>
            <View className="flex-1">
              <PressableScale
                testID="settings-logout-confirm"
                onPress={doLogout}
                disabled={isLoggingOut}
                haptics="medium"
                accessibilityRole="button"
                accessibilityLabel="Çıkış yap"
                accessibilityState={{ busy: isLoggingOut }}
                className="h-btn-lg items-center justify-center rounded-lg bg-fg"
              >
                <Text className="font-body-heavy text-base text-bg">
                  {isLoggingOut ? 'Çıkış yapılıyor' : 'Çıkış yap'}
                </Text>
              </PressableScale>
            </View>
          </View>
        }
      />
    </Screen>
  )
}
