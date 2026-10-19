import { Alert, Pressable, ScrollView, Share, View } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useRouter } from 'expo-router'

import type { IconName } from '@/core/components/atoms/Icon'

import { Avatar } from '@/core/components/atoms/Avatar'
import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { MenuRow } from '@/core/components/molecules/MenuRow'
import { useThemeColors } from '@/core/theme'
import { getFullName, getInitials } from '@/core/utils/personName'
import { useAuthStore, useLogoutMutation } from '@/domains/auth'
import { useWalletQuery } from '@/domains/wallet'
import { APP_VERSION } from '@/lib/appVersion'
import { openNotificationSettings, openSupportEmail, requestStoreReview } from '@/lib/externalLinks'
import { useThemeStore } from '@/store/themeStore'

type MenuItem = {
  icon: IconName
  label: string
  onPress: () => void
  value?: string
  hasArrow?: boolean
}

type MenuSection = {
  title: string
  items: MenuItem[]
}

const THEME_LABELS: Record<string, string> = {
  light: 'Açık',
  dark: 'Koyu',
  system: 'Sistem',
}

export default function SettingsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const colors = useThemeColors()
  const { user } = useAuthStore()
  const { mutate: logout, isPending } = useLogoutMutation()
  const isExpert = user?.role === 'expert'
  const { preference, setPreference } = useThemeStore()
  // Yalnız uzmanda istek atar (danışan 403 EXPERT_ROLE_REQUIRED alırdı).
  const { data: wallet } = useWalletQuery()

  const handleThemePress = () => {
    Alert.alert('Görünüm', 'Tema tercihini seç', [
      { text: 'Açık Tema', onPress: () => setPreference('light') },
      { text: 'Koyu Tema', onPress: () => setPreference('dark') },
      { text: 'Sistem Ayarı', onPress: () => setPreference('system') },
      { text: 'Vazgeç', style: 'cancel' },
    ])
  }

  const handleInviteFriend = () => {
    Share.share({
      message:
        "PsikoAl'ı senin için önerdim! Ücretsiz psikolojik test çöz, sana uygun bir psikologla eşleş.",
    }).catch(() => undefined)
  }

  const initials = getInitials(user) || 'K'

  const communitySection: MenuSection = {
    title: 'TOPLULUK',
    items: [
      {
        icon: 'UserPlus',
        label: 'Arkadaşlarını Davet Et',
        hasArrow: false,
        onPress: handleInviteFriend,
      },
      { icon: 'Heart', label: 'Bizi Değerlendir', hasArrow: false, onPress: requestStoreReview },
    ],
  }

  const appSection: MenuSection = {
    title: 'UYGULAMA',
    items: [
      {
        icon: 'Sun',
        label: 'Görünüm',
        value: THEME_LABELS[preference],
        hasArrow: false,
        onPress: handleThemePress,
      },
      {
        icon: 'Bell',
        label: 'Bildirim Ayarları',
        hasArrow: false,
        onPress: openNotificationSettings,
      },
      {
        icon: 'LifeBuoy',
        label: 'Destek, Talep ve Öneri',
        hasArrow: false,
        onPress: openSupportEmail,
      },
    ],
  }

  const privacySection: MenuSection = {
    title: 'VERİ VE GİZLİLİK',
    items: [
      {
        icon: 'ShieldCheck',
        label: 'Veri ve Gizlilik',
        onPress: () => router.push('/profile/privacy' as never),
      },
    ],
  }

  const expertSections: MenuSection[] = [
    {
      title: 'HESAP',
      items: [
        {
          icon: 'User',
          label: 'Kişisel Bilgiler',
          onPress: () => router.push('/profile/personal' as never),
        },
        {
          icon: 'Stethoscope',
          label: 'Mesleki Bilgiler',
          onPress: () => router.push('/profile/professional' as never),
        },
        {
          icon: 'FileText',
          label: 'Belgeler ve Bağlantılar',
          onPress: () => router.push('/profile/documents' as never),
        },
        {
          icon: 'Wallet',
          label: 'Bakiyem',
          value: wallet?.balanceLabel,
          onPress: () => router.push('/wallet' as never),
        },
        {
          icon: 'Star',
          label: 'Danışan Yorumları',
          onPress: () => user && router.push(`/expert/${user.id}` as never),
        },
        {
          icon: 'Lock',
          label: 'Şifre Yönetimi',
          onPress: () => router.push('/profile/password' as never),
        },
      ],
    },
    communitySection,
    appSection,
    privacySection,
  ]

  const clientSections: MenuSection[] = [
    {
      title: 'HESAP',
      items: [
        {
          icon: 'User',
          label: 'Kişisel Bilgiler',
          onPress: () => router.push('/profile/personal' as never),
        },
        {
          icon: 'Brain',
          label: 'Testler',
          onPress: () => router.push('/assessment/list' as never),
        },
        {
          icon: 'Lock',
          label: 'Şifre Yönetimi',
          onPress: () => router.push('/profile/password' as never),
        },
      ],
    },
    communitySection,
    appSection,
    privacySection,
  ]

  const sections = isExpert ? expertSections : clientSections

  return (
    <View className="flex-1 bg-surface-base dark:bg-dark-bg">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
        <View className="px-4 pb-3" style={{ paddingTop: insets.top + 8 }}>
          <Text variant="heading">Ayarlar</Text>
        </View>

        <View className="flex-row items-center gap-4 px-4 py-4">
          <Avatar size="xl" initials={initials} isVerified={user?.isVerified ?? false} />
          <View className="flex-1 gap-1">
            <Text variant="subheading" className="font-semibold dark:text-[#F5F5F7]">
              {getFullName(user) || 'Kullanıcı'}
            </Text>
            <Text variant="caption" color="secondary">
              {user?.email ?? ''}
            </Text>
          </View>
        </View>

        {sections.map((section) => (
          <View key={section.title}>
            <View className="mx-4 mt-4 h-px bg-neutral-200 dark:bg-neutral-800" />
            <View className="px-4 pb-2 pt-4">
              <Text
                variant="caption"
                color="secondary"
                className="font-semibold uppercase tracking-widest"
              >
                {section.title}
              </Text>
            </View>
            <View>
              {section.items.map((item) => (
                <MenuRow
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  hasArrow={item.hasArrow}
                  onPress={item.onPress}
                />
              ))}
            </View>
          </View>
        ))}

        <View className="mx-4 mt-4 h-px bg-neutral-200 dark:bg-neutral-800" />
        <Pressable
          onPress={() => logout()}
          disabled={isPending}
          className="flex-row items-center gap-3 px-4 py-4 active:opacity-90"
        >
          <Icon name="LogOut" size={18} color={colors.error} />
          <Text variant="body" className="flex-1 text-red-600 dark:text-red-400">
            {isPending ? 'Çıkış Yapılıyor...' : 'Çıkış Yap'}
          </Text>
        </Pressable>

        <View className="px-5 pt-6">
          <Text
            variant="caption"
            color="secondary"
            align="center"
          >{`PsikoAl v${APP_VERSION}`}</Text>
        </View>
      </ScrollView>
    </View>
  )
}
