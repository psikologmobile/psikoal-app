import { View } from 'react-native'

import { SiteButton } from '../components/SiteButton'
import { SiteSection } from '../components/SitePage'

import type { IconName } from '@/core/components/atoms/Icon'

import { Icon } from '@/core/components/atoms/Icon'
import { Spinner } from '@/core/components/atoms/Spinner'
import { Text } from '@/core/components/atoms/Text'
import { SuccessHero } from '@/core/components/organisms/SuccessHero'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

type Action = { label: string; href: string } | { label: string; onPress: () => void }

export type TopupStateCardProps = {
  /**
   * ok: başarılı (halka + pop + tik, konfeti) · fail: başarısız (kırmızı daire, sallanma)
   * · wait: beklemede (kesikli halka + dönen halka) · info: bilgi (ikon).
   */
  tone: 'ok' | 'fail' | 'wait' | 'info'
  title: string
  text: string
  primary?: Action
  secondary?: Action
  icon?: IconName
}

function ActionButton({ action, variant }: { action: Action; variant: 'primary' | 'ghost' }) {
  return 'href' in action ? (
    <SiteButton href={action.href} label={action.label} variant={variant} />
  ) : (
    <SiteButton onPress={action.onPress} label={action.label} variant={variant} />
  )
}

function Badge({ tone, icon }: { tone: TopupStateCardProps['tone']; icon?: IconName }) {
  const colors = useThemeColors()
  if (tone === 'fail') {
    return (
      <View className="site-p h-[120px] w-[120px] items-center justify-center rounded-full bg-danger-fill">
        <Icon name="X" size={52} color={colors.onDanger} strokeWidth={2.6} />
      </View>
    )
  }
  if (tone === 'wait') {
    return (
      <View className="site-p h-[120px] w-[120px] items-center justify-center rounded-full border-2 border-dashed border-accent-line">
        <Spinner size={52} colorClassName="border-primary" />
      </View>
    )
  }
  return (
    <View className="site-p h-[120px] w-[120px] items-center justify-center rounded-full bg-accent-soft">
      <Icon name={icon ?? 'Wallet'} size={48} color={colors.onAccentSoft} />
    </View>
  )
}

/**
 * Bakiye akışının durum kartı (tasarım `isResult` bloğu): daire, başlık, metin,
 * düğmeler; ortalanmış en çok 520 px.
 */
export function TopupStateCard({
  tone,
  title,
  text,
  primary,
  secondary,
  icon,
}: TopupStateCardProps) {
  const actions = (
    <View className="site-a site-d3 flex-row flex-wrap justify-center gap-2.5">
      {primary ? <ActionButton action={primary} variant="primary" /> : null}
      {secondary ? <ActionButton action={secondary} variant="ghost" /> : null}
    </View>
  )
  return (
    <SiteSection className="items-center">
      <View
        testID={`topup-state-${tone}`}
        className={cn('mb-18 mt-14 w-full max-w-[520px] items-center gap-4')}
      >
        {tone === 'ok' ? (
          <SuccessHero title={title} description={text} tone="primary" confetti={14}>
            {actions}
          </SuccessHero>
        ) : (
          <>
            <Badge tone={tone} icon={icon} />
            <Text
              role="heading"
              aria-level={1}
              className="site-a site-d1 text-center font-display text-[32px] leading-9 text-fg sm:text-[38px] sm:leading-[42px]"
            >
              {title}
            </Text>
            <Text className="site-a site-d2 text-center font-body-regular text-base leading-6 text-fg-muted">
              {text}
            </Text>
            {actions}
          </>
        )}
      </View>
    </SiteSection>
  )
}
