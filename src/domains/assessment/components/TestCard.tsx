import { View } from 'react-native'

import { assessmentMark, assessmentMeta } from '../utils/assessmentView'

import type { AssessmentListItem } from '../types/assessment.types'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type TestCardProps = {
  test: AssessmentListItem
  onPress: () => void
  /** tile: Keşfet yatay kartı · row: Testler listesi · compact: Kategori satırı */
  variant?: 'tile' | 'row' | 'compact'
  /** Kart altına ek bilgi ("Son sonuç: Orta"). */
  lastLevel?: string
  /** tile: ilk kart primary rozetli. */
  highlight?: boolean
}

function FreeBadge({ tone }: { tone: 'primary' | 'soft' }) {
  return (
    <View
      className={cn(
        'rounded-full px-2.5 py-1',
        tone === 'primary' ? 'bg-primary' : 'bg-accent-soft'
      )}
    >
      <Text
        variant="badge"
        className={tone === 'primary' ? 'text-primary-fg' : 'text-accent-soft-fg'}
      >
        Ücretsiz
      </Text>
    </View>
  )
}

/** TestCard — ücretsiz test kartı (Keşfet, Testler, Kategori). */
export function TestCard({
  test,
  onPress,
  variant = 'row',
  lastLevel,
  highlight = false,
}: TestCardProps) {
  const colors = useThemeColors()
  const meta = assessmentMeta(test.questionCount, test.estimatedMinutes)

  if (variant === 'tile') {
    return (
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${test.title}, ücretsiz test`}
        className="w-[200px] gap-[22px] rounded-2xl border border-border bg-surface p-4"
      >
        <View className="flex-row items-center justify-between">
          <FreeBadge tone={highlight ? 'primary' : 'soft'} />
          <Text className="text-label text-fg-muted">{test.estimatedMinutes} dk</Text>
        </View>
        <View className="gap-1">
          <Text variant="title">{test.title}</Text>
          <Text className="text-label text-fg-muted">
            {lastLevel
              ? `${test.questionCount} soru · Son sonuç: ${lastLevel}`
              : `${test.questionCount} soru`}
          </Text>
        </View>
      </PressableScale>
    )
  }

  if (variant === 'compact') {
    return (
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${test.title}, ${meta}`}
        className="flex-row items-center justify-between gap-3 rounded-xl border border-border px-4 py-3.5"
      >
        <View className="flex-1 gap-0.5">
          <Text className="font-body-bold text-body text-fg">{test.title}</Text>
          <Text className="text-label text-fg-muted">{meta}</Text>
        </View>
        <FreeBadge tone="soft" />
      </PressableScale>
    )
  }

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${test.title}, ${meta}, ücretsiz`}
      className="flex-row items-center gap-3.5 rounded-card border border-border px-4 py-3.5"
    >
      <View className="h-12 w-12 items-center justify-center rounded-lg bg-surface">
        <Text className="font-display text-lg text-fg">{assessmentMark(test.title)}</Text>
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="font-body-bold text-base text-fg">{test.title}</Text>
        <Text className="text-label text-fg-muted">{meta}</Text>
      </View>
      <FreeBadge tone="primary" />
      <Icon name="ChevronRight" size={18} color={colors.textMuted} />
    </PressableScale>
  )
}
