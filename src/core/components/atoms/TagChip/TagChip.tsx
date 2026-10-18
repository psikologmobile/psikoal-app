import { View } from 'react-native'

import type { IconName } from '@/core/components/atoms/Icon'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type TagChipTone = 'bg' | 'surface' | 'accent'

export type TagChipProps = {
  label: string
  /** bg: surface kart üstünde · surface: bg zemin üstünde · accent: accent-soft vurgu */
  tone?: TagChipTone
  icon?: IconName
  className?: string
}

const toneStyles: Record<TagChipTone, string> = {
  bg: 'bg-bg',
  surface: 'bg-surface',
  accent: 'bg-accent-soft',
}

/** TagChip — kart içi meta (Online, ₺ aralığı, alan). Etkileşimsiz. */
export function TagChip({ label, tone = 'bg', icon, className }: TagChipProps) {
  const colors = useThemeColors()
  return (
    <View
      accessibilityRole="text"
      className={cn(
        'flex-row items-center gap-1 self-start rounded-full px-2.5 py-1',
        toneStyles[tone],
        className
      )}
    >
      {icon ? (
        <Icon
          name={icon}
          size={13}
          strokeWidth={2.2}
          color={tone === 'accent' ? colors.onAccentSoft : colors.textMuted}
        />
      ) : null}
      <Text
        className={cn(
          'font-body-semibold text-xs',
          tone === 'accent' ? 'text-accent-soft-fg' : 'text-fg'
        )}
      >
        {label}
      </Text>
    </View>
  )
}
