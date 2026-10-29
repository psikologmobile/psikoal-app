import { Pressable, Share, View } from 'react-native'

import { Button } from '@/core/components/atoms/Button'
import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { ScreenHeader } from '@/core/components/molecules/ScreenHeader'
import { HeroCard } from '@/core/components/organisms/HeroCard'
import { Screen } from '@/core/components/templates'
import { useCopyToClipboard } from '@/core/hooks'
import { CopyTick, EnterUp } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { useWalletQuery } from '@/domains/wallet'

const HOW_IT_WORKS: Array<{ icon: 'UserRound' | 'BadgeCheck'; title: string; text: string }> = [
  {
    icon: 'UserRound',
    title: 'Danışan getirirsen',
    text: 'Danışanın bu linkle kayıt olursa ilanları sana "Davet" rozetiyle düşer ve profilini görebilir.',
  },
  {
    icon: 'BadgeCheck',
    title: 'Uzman getirirsen',
    text: 'Bir uzman bu linkle kayıt olup onaylanınca sana ücretsiz teklif hakkı tanımlanır.',
  },
]

type CopyRowProps = {
  label: string
  value: string
  copied: boolean
  onCopy: () => void
}

function CopyRow({ label, value, copied, onCopy }: CopyRowProps) {
  const colors = useThemeColors()
  return (
    <View className="flex-row items-center gap-2 rounded-md bg-bg py-1 pl-3.5 pr-1">
      <View className="flex-1 py-1.5">
        <Text className="text-badge text-fg-muted">{label}</Text>
        <Text selectable numberOfLines={1} className="font-body-semibold text-body">
          {value}
        </Text>
      </View>
      <Pressable
        onPress={onCopy}
        accessibilityRole="button"
        accessibilityLabel={copied ? `${label} kopyalandı` : `${label} kopyala`}
        accessibilityLiveRegion="polite"
        className="h-11 w-11 items-center justify-center rounded-inner"
      >
        <CopyTick copied={copied} color={colors.primaryText} />
      </Pressable>
    </View>
  )
}

/**
 * Davet linkim — uzmanın kişisel davet kodu ve linki (GET /wallet/me). Kopyala
 * (copy-tick) ve paylaş (RN Share). Tasarım çizimi yok; v2 bileşenleriyle kuruldu.
 */
export function ReferralScreen() {
  const colors = useThemeColors()
  const walletQuery = useWalletQuery()
  const wallet = walletQuery.data
  const { copiedKey, copy } = useCopyToClipboard()

  const share = () => {
    if (!wallet) return
    void Share.share({
      message: `Psikosirius'a benim davet linkimle katıl: ${wallet.referralLink}`,
      url: wallet.referralLink,
    }).catch(() => undefined)
  }

  return (
    <Screen testID="screen-referral">
      <EnterUp>
        <ScreenHeader title="Davet linkim" />
      </EnterUp>

      {walletQuery.isLoading ? (
        <Skeleton variant="rect" height={220} borderRadius="3xl" />
      ) : !wallet ? (
        <ErrorBanner
          title="Davet linkin alınamadı"
          description="Bağlantını kontrol edip tekrar dene."
          onRetry={() => void walletQuery.refetch()}
        />
      ) : (
        <EnterUp index={1}>
          <HeroCard title="Davet kodun" decor="orbit" className="gap-3">
            <Text className="font-body-semibold text-body-sm text-accent-muted">Davet kodun</Text>
            <Text
              accessibilityLabel={`Davet kodun ${wallet.referralCode.split('').join(' ')}`}
              className="font-display text-[40px] leading-[44px] tracking-[2px] text-accent-fg"
            >
              {wallet.referralCode}
            </Text>
            <CopyRow
              label="Davet linki"
              value={wallet.referralLink}
              copied={copiedKey === 'link'}
              onCopy={() => void copy('link', wallet.referralLink)}
            />
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Button
                  label="Paylaş"
                  icon="Share2"
                  size="lg"
                  fullWidth
                  onPress={share}
                  testID="referral-share"
                />
              </View>
              <View className="flex-1">
                <Button
                  label={copiedKey === 'code' ? 'Kopyalandı' : 'Kodu kopyala'}
                  variant="outline"
                  size="lg"
                  fullWidth
                  onPress={() => void copy('code', wallet.referralCode)}
                />
              </View>
            </View>
          </HeroCard>
        </EnterUp>
      )}

      <EnterUp index={2}>
        <Text variant="overline" color="muted" className="mt-1.5">
          Nasıl çalışır?
        </Text>
      </EnterUp>
      {HOW_IT_WORKS.map((item, i) => (
        <EnterUp key={item.title} index={3 + i}>
          <View className="flex-row gap-3 rounded-xl bg-surface p-4">
            <View className="h-10 w-10 items-center justify-center rounded-sm bg-accent-soft">
              <Icon name={item.icon} size={20} color={colors.onAccentSoft} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="font-body-bold text-body">{item.title}</Text>
              <Text className="text-body-sm text-fg-muted">{item.text}</Text>
            </View>
          </View>
        </EnterUp>
      ))}
    </Screen>
  )
}
