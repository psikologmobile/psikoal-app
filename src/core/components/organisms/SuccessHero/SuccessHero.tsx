import type { ReactNode } from 'react'

import { View } from 'react-native'

import type { IconName } from '@/core/components/atoms/Icon'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { Confetti, DrawCheck, EnterUp, Pop, Ring } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type SuccessHeroProps = {
  title: string
  description?: ReactNode
  /** Tik yerine ikon (ör. e-posta zarfı "E-postanı kontrol et"). */
  icon?: IconName
  /** accent: sky-200 daire (varsayılan) · primary: sky-500 daire */
  tone?: 'accent' | 'primary'
  /** 120 px (varsayılan) ya da 96 px. */
  size?: 'md' | 'lg'
  /** Halka sürekli dalgalansın (true) ya da iki kez (false). */
  loopRing?: boolean
  /** Konfeti (ilan yayınlandı: 6 parça; ödeme / eşleşti: 14). 0 kapalı. */
  confetti?: number
  /** Alt kısım (iletişim kartı, düğmeler) — sıralı girişle gelir. */
  children?: ReactNode
  className?: string
}

/**
 * SuccessHero — halka dalgası + pop daire + çizilen tik, başlık, metin.
 * Sıra: halka (200 ms) → daire pop (0 ms, 500 ms) → tik çizimi (300 ms
 * gecikme, 600 ms) → başlık / metin / ek içerik 60 ms arayla enter-up.
 * Teklif gönderildi, ilan yayınlandı, şifre güncellendi, bildirildi, ödeme.
 */
export function SuccessHero({
  title,
  description,
  icon,
  tone = 'accent',
  size = 'lg',
  loopRing = true,
  confetti = 0,
  children,
  className,
}: SuccessHeroProps) {
  const colors = useThemeColors()
  const px = size === 'lg' ? 120 : 96
  const fg = tone === 'primary' ? colors.onPrimary : colors.onAccent
  return (
    <View className={cn('items-center gap-4.5', className)}>
      {confetti > 0 ? <Confetti count={confetti} delay={300} duration={2600} /> : null}
      {/* REASON: daire çapı boyuta göre hesaplanır */}
      <View style={{ width: px, height: px }} accessibilityElementsHidden>
        <View className="absolute inset-0">
          <Ring size={px} from={1} to={1.6} delay={200} loop={loopRing} />
        </View>
        {!loopRing ? (
          <View className="absolute inset-0">
            <Ring
              size={px}
              from={1}
              to={1.6}
              delay={500}
              loop={false}
              colorClassName="border-accent-line"
            />
          </View>
        ) : null}
        <Pop duration={500} className="absolute inset-0">
          <View
            style={{ width: px, height: px }}
            className={cn(
              'items-center justify-center rounded-full',
              tone === 'primary' ? 'bg-primary' : 'bg-accent'
            )}
          >
            {icon ? (
              <Icon name={icon} size={px * 0.43} color={fg} strokeWidth={2} />
            ) : (
              <DrawCheck size={px * 0.45} color={fg} strokeWidth={2.6} delay={300} duration={600} />
            )}
          </View>
        </Pop>
      </View>
      <EnterUp index={1} className="items-center gap-2.5">
        <Text
          accessibilityRole="header"
          variant="h3"
          align="center"
          className="text-[36px] leading-[38px]"
        >
          {title}
        </Text>
        {description ? (
          typeof description === 'string' ? (
            <Text variant="bodyLg" color="muted" align="center" className="max-w-[320px]">
              {description}
            </Text>
          ) : (
            description
          )
        ) : null}
      </EnterUp>
      {children ? (
        <EnterUp index={3} className="w-full">
          {children}
        </EnterUp>
      ) : null}
    </View>
  )
}
