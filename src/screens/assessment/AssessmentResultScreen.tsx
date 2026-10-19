import { View } from 'react-native'

import { useRouter } from 'expo-router'

import { Button } from '@/core/components/atoms/Button'
import { IconButton } from '@/core/components/atoms/IconButton'
import { LevelBar } from '@/core/components/atoms/LevelBar'
import { ScoreRing } from '@/core/components/atoms/ScoreRing'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { Screen } from '@/core/components/templates'
import { EnterUp, Pop } from '@/core/motion'
import { formatDate } from '@/core/utils/formatDate'
import {
  assessmentMaxScore,
  RESULT_LEVEL_LABELS,
  RESULT_LEVEL_POSITION,
  useAssessmentQuery,
  useAssessmentResultQuery,
} from '@/domains/assessment'

type AssessmentResultScreenProps = {
  resultId: string
}

/** Test sonucu (tasarım: b0_Test_sonucu): ScoreRing + LevelBar + öneriler. */
export function AssessmentResultScreen({ resultId }: AssessmentResultScreenProps) {
  const router = useRouter()
  const resultQuery = useAssessmentResultQuery(resultId)
  // Puan tavanı ve test adı sonuçta yok: tek aktif testten okunur.
  const assessmentQuery = useAssessmentQuery()
  const result = resultQuery.data
  const assessment = assessmentQuery.data
  const maxScore = assessment ? assessmentMaxScore(assessment) : 0

  const close = (
    <IconButton
      accessibilityLabel="Kapat"
      icon="X"
      onPress={() => router.replace('/assessment/list')}
    />
  )

  if (resultQuery.isLoading) {
    return (
      <Screen testID="screen-assessment-result">
        {close}
        <View accessibilityLabel="Yükleniyor" className="gap-4">
          <Skeleton height={160} borderRadius="3xl" />
          <Skeleton height={30} borderRadius="xs" delay={120} />
          <Skeleton height={110} borderRadius="xl" delay={240} />
        </View>
      </Screen>
    )
  }

  if (resultQuery.isError || !result) {
    return (
      <Screen testID="screen-assessment-result">
        {close}
        <EmptyState
          icon="ClipboardX"
          title="Sonuç bulunamadı"
          description="Testi yeniden çözerek yeni bir sonuç alabilirsin."
          ctaLabel="Teste dön"
          onCta={() => router.replace('/assessment')}
        />
      </Screen>
    )
  }

  const level = RESULT_LEVEL_LABELS[result.level]
  const ringMax = maxScore > 0 ? Math.max(maxScore, result.score) : Math.max(result.score, 1)

  return (
    <Screen
      testID="screen-assessment-result"
      contentClassName="flex-1 gap-4"
      footer={
        <View className="w-full gap-2.5">
          <Button
            label="Destek al"
            size="xl"
            fullWidth
            onPress={() => router.push('/listing/new')}
          />
          <View className="flex-row gap-2.5">
            <View className="flex-1">
              <Button
                label="Testi tekrar yap"
                variant="outline"
                fullWidth
                onPress={() => router.replace('/assessment')}
              />
            </View>
            <View className="flex-1">
              <Button
                label="Sonuçlarım"
                variant="outline"
                fullWidth
                onPress={() => router.replace('/assessment/list')}
              />
            </View>
          </View>
        </View>
      }
    >
      <EnterUp className="flex-row items-center justify-between">
        {close}
        <Text className="text-body-sm text-fg-muted">{formatDate(result.createdAt, 'long')}</Text>
      </EnterUp>

      <EnterUp index={1} className="flex-row items-center gap-5 rounded-panel bg-surface p-5">
        <ScoreRing
          value={result.score}
          max={ringMax}
          accessibilityLabel={
            maxScore > 0 ? `${result.score} / ${maxScore} puan` : `${result.score} puan`
          }
        >
          <Text className="font-display-bold text-[34px] leading-9 text-fg">{result.score}</Text>
          <Text className="text-xs text-fg-muted">
            {maxScore > 0 ? `/ ${maxScore} puan` : 'puan'}
          </Text>
        </ScoreRing>
        <View className="flex-1 gap-1.5">
          {assessment ? (
            <Text className="font-body-bold text-label text-fg-muted">{assessment.title}</Text>
          ) : null}
          <Pop delay={1200} className="self-start">
            <View className="rounded-full bg-primary px-3.5 py-1.5">
              <Text className="font-display text-[22px] leading-7 text-primary-fg">{level}</Text>
            </View>
          </Pop>
          <Text className="text-label text-fg-muted">{level} düzey</Text>
        </View>
      </EnterUp>

      <EnterUp index={2}>
        <LevelBar
          position={RESULT_LEVEL_POSITION[result.level]}
          accessibilityLabel={`Seviye: ${level}`}
        />
      </EnterUp>

      <EnterUp index={3} className="gap-2">
        <Text variant="title" accessibilityRole="header">
          Değerlendirme
        </Text>
        <Text className="text-body leading-6 text-fg-muted">{result.summary}</Text>
      </EnterUp>

      {result.suggestions.length > 0 ? (
        <EnterUp index={4} className="gap-2">
          <Text variant="title" accessibilityRole="header">
            Öneriler
          </Text>
          {result.suggestions.map((suggestion, i) => (
            <View key={i} className="flex-row items-start gap-3">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-accent-soft">
                <Text className="font-body-heavy text-body-sm text-accent-soft-fg">{i + 1}</Text>
              </View>
              <Text className="flex-1 text-body text-fg">{suggestion}</Text>
            </View>
          ))}
        </EnterUp>
      ) : null}

      <EnterUp index={5}>
        <Text className="rounded-md border border-border-strong px-3.5 py-3 text-label text-fg-muted">
          Bu test tanı koymaz. Sonuçlar bilgilendirme amaçlıdır.
        </Text>
      </EnterUp>
    </Screen>
  )
}
