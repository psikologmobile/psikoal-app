import { View } from 'react-native'

import { RESULT_LEVEL_LABELS, RESULT_LEVEL_STEPS } from '../utils/assessmentView'

import type { MyAssessmentResult } from '../types/assessment.types'

import { Text } from '@/core/components/atoms/Text'
import { Fill, PressableScale } from '@/core/motion'
import { formatDate } from '@/core/utils/formatDate'

export type ResultCardProps = {
  result: MyAssessmentResult
  onPress: () => void
}

/** ResultCard — geçmiş test sonucu: ad, seviye rozeti, 3 parçalı seviye çubuğu. */
export function ResultCard({ result, onPress }: ResultCardProps) {
  const level = RESULT_LEVEL_LABELS[result.level]
  const steps = RESULT_LEVEL_STEPS[result.level]
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${result.assessmentTitle}, seviye ${level}`}
      className="gap-2.5 rounded-card border border-border bg-surface p-4"
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text className="shrink font-body-bold text-base text-fg" numberOfLines={1}>
          {result.assessmentTitle}
        </Text>
        <View className="rounded-full bg-accent-soft px-2.5 py-1">
          <Text variant="badge" className="text-accent-soft-fg">
            {level}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-1" accessibilityElementsHidden>
        {[0, 1, 2].map((i) => (
          <View key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-border-strong">
            {i < steps ? <Fill value={1} delay={400 + i * 300} duration={900} /> : null}
          </View>
        ))}
      </View>
      <View className="flex-row justify-between gap-3">
        <Text className="shrink text-label text-fg-muted" numberOfLines={1}>
          {result.score} puan · {result.summary}
        </Text>
        <Text className="text-label text-fg-muted">
          {formatDate(result.createdAt, 'dayMonthShort')}
        </Text>
      </View>
    </PressableScale>
  )
}
