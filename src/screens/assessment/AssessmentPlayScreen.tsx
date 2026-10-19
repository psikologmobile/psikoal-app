import { useState } from 'react'

import { View } from 'react-native'

import { useRouter } from 'expo-router'

import { BudgetCells } from '@/core/components/atoms/BudgetCells'
import { Button } from '@/core/components/atoms/Button'
import { Icon } from '@/core/components/atoms/Icon'
import { IconButton } from '@/core/components/atoms/IconButton'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { TagChip } from '@/core/components/atoms/TagChip'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { Screen } from '@/core/components/templates'
import { Breathe, EnterRight, EnterUp, Pop, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'
import {
  questionTypeLabel,
  useAssessmentEngine,
  useAssessmentQuery,
  useSubmitAssessmentMutation,
} from '@/domains/assessment'
import { getErrorMessage } from '@/lib/api'

/** Test çözme: giriş + sorular (tasarım: b0_Test_çözme). */
export function AssessmentPlayScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const assessmentQuery = useAssessmentQuery()
  const assessment = assessmentQuery.data
  const submitMutation = useSubmitAssessmentMutation()
  const [started, setStarted] = useState(false)
  const engine = useAssessmentEngine(assessment)

  if (assessmentQuery.isLoading) {
    return (
      <Screen testID="screen-assessment-play">
        <View accessibilityLabel="Yükleniyor" className="gap-4">
          <Skeleton width={44} height={44} variant="circle" />
          <Skeleton height={230} borderRadius="3xl" delay={120} />
          <Skeleton width="70%" height={36} borderRadius="xs" delay={240} />
        </View>
      </Screen>
    )
  }

  if (assessmentQuery.isError || !assessment) {
    return (
      <Screen testID="screen-assessment-play">
        <IconButton accessibilityLabel="Kapat" icon="X" onPress={() => router.back()} />
        <EmptyState
          icon="ClipboardX"
          title="Test yüklenemedi"
          description="Lütfen biraz sonra tekrar dene."
          ctaLabel="Tekrar dene"
          onCta={() => void assessmentQuery.refetch()}
        />
      </Screen>
    )
  }

  const total = assessment.questions.length

  if (!started) {
    return (
      <Screen
        testID="screen-assessment-play"
        contentClassName="flex-1 gap-4"
        footer={
          <Button
            label="Testi başlat"
            size="xl"
            fullWidth
            onPress={() => setStarted(true)}
            testID="assessment-start"
          />
        }
      >
        <IconButton accessibilityLabel="Kapat" icon="X" onPress={() => router.back()} />
        <EnterUp>
          <View
            className="h-[230px] items-center justify-center overflow-hidden rounded-4xl bg-accent-soft"
            accessibilityElementsHidden
          >
            <Breathe>
              <View className="h-[150px] w-[150px] rounded-full bg-accent" />
            </Breathe>
            <View className="absolute">
              <Breathe duration={3500}>
                <View className="h-[90px] w-[90px] rounded-full bg-primary" />
              </Breathe>
            </View>
          </View>
        </EnterUp>
        <EnterUp index={1}>
          <Text variant="overline" color="link">
            Ücretsiz test
          </Text>
        </EnterUp>
        <EnterUp index={2}>
          <Text accessibilityRole="header" className="font-display text-4xl tracking-tight text-fg">
            {assessment.title}
          </Text>
        </EnterUp>
        <EnterUp index={3}>
          <Text className="text-base text-fg-muted">{assessment.description}</Text>
        </EnterUp>
        <EnterUp index={4} className="flex-row gap-2">
          <TagChip label={`${total} soru`} tone="surface" />
          <TagChip label={`Yaklaşık ${assessment.estimatedMinutes} dk`} tone="surface" />
        </EnterUp>
        <EnterUp index={5}>
          <View className="flex-row items-start gap-2.5 rounded-lg border border-border-strong p-3.5">
            <Icon name="Info" size={18} color={colors.textMuted} />
            <Text className="flex-1 text-body-sm text-fg">
              Bu test tanı koymaz. Sonuçlar bilgilendirme amaçlıdır.
            </Text>
          </View>
        </EnterUp>
      </Screen>
    )
  }

  const question = engine.currentQuestion
  const selected = engine.currentAnswer?.values ?? []
  const isMulti = question?.type === 'multiple_choice'
  const isScale = question?.type === 'scale'

  const submit = () => {
    submitMutation.mutate(
      { assessmentId: assessment.id, answers: engine.answers },
      {
        onSuccess: (result) =>
          router.replace({ pathname: '/assessment/result', params: { resultId: result.id } }),
      }
    )
  }

  const footer = (
    <View className="w-full gap-2.5">
      {submitMutation.error ? (
        <ErrorBanner message={getErrorMessage(submitMutation.error)} />
      ) : null}
      {engine.canProceed ? (
        <Pop replayKey={engine.currentIndex}>
          <Button
            label={engine.isLast ? 'Gönder ve sonucu gör' : 'Sonraki soru'}
            size="xl"
            fullWidth
            isLoading={submitMutation.isPending}
            loadingLabel="Gönderiliyor…"
            onPress={engine.isLast ? submit : engine.goNext}
            testID="assessment-next"
          />
        </Pop>
      ) : (
        <Button
          label="Devam etmek için bir seçenek seç"
          size="xl"
          fullWidth
          isDisabled
          onPress={submit}
        />
      )}
    </View>
  )

  const options = question?.options ?? []
  const firstText = options[0]?.text
  const lastText = options[options.length - 1]?.text

  return (
    <Screen testID="screen-assessment-play" footer={footer} contentClassName="gap-[18px]">
      <View className="flex-row items-center gap-3">
        <IconButton
          accessibilityLabel="Önceki soru"
          icon="ChevronLeft"
          onPress={() => (engine.isFirst ? setStarted(false) : engine.goPrev())}
        />
        <BudgetCells count={total} from={0} to={engine.currentIndex} className="h-[22px] flex-1" />
        <Text className="font-body-bold text-body-sm text-fg-muted">
          {engine.currentIndex + 1}/{total}
        </Text>
      </View>

      {question ? (
        <View key={question.id} className="gap-3.5">
          <EnterRight>
            <Text variant="overline" color="link">
              {questionTypeLabel(question.type, question.options)}
            </Text>
          </EnterRight>
          <EnterRight index={1}>
            <Text
              accessibilityRole="header"
              className="font-display text-h3 tracking-tight text-fg"
            >
              {question.text}
            </Text>
          </EnterRight>

          {isScale ? (
            <EnterRight index={2} className="mt-2.5 gap-3">
              <View className="flex-row gap-2" accessibilityRole="radiogroup">
                {options.map((option) => {
                  const on = selected.includes(option.value)
                  return (
                    <PressableScale
                      key={option.id}
                      onPress={() => engine.selectOption(option.value)}
                      haptics="selection"
                      accessibilityRole="radio"
                      accessibilityState={{ checked: on }}
                      accessibilityLabel={option.text}
                      wrapperClassName="flex-1"
                      className={cn(
                        'h-16 items-center justify-center rounded-xl',
                        on ? 'bg-primary' : 'border border-border-strong bg-surface'
                      )}
                    >
                      <Text
                        className={cn(
                          'font-display text-[22px]',
                          on ? 'text-primary-fg' : 'text-fg'
                        )}
                      >
                        {option.value}
                      </Text>
                    </PressableScale>
                  )
                })}
              </View>
              {firstText && lastText && firstText !== String(options[0]?.value) ? (
                <View className="flex-row justify-between">
                  <Text className="font-body-semibold text-label text-fg-muted">{firstText}</Text>
                  <Text className="font-body-semibold text-label text-fg-muted">{lastText}</Text>
                </View>
              ) : null}
            </EnterRight>
          ) : (
            <View className="mt-1.5 gap-2.5" accessibilityRole={isMulti ? undefined : 'radiogroup'}>
              {options.map((option, i) => {
                const on = selected.includes(option.value)
                return (
                  <EnterRight key={option.id} index={i + 2}>
                    <PressableScale
                      onPress={() => engine.selectOption(option.value)}
                      haptics="selection"
                      accessibilityRole={isMulti ? 'checkbox' : 'radio'}
                      accessibilityState={{ checked: on }}
                      accessibilityLabel={option.text}
                      className={cn(
                        'min-h-[60px] flex-row items-center justify-between gap-2.5 rounded-xl border px-4 py-3',
                        on ? 'border-accent-line bg-accent-soft' : 'border-border-strong bg-surface'
                      )}
                    >
                      <Text
                        className={cn(
                          'flex-1 text-base',
                          on ? 'font-body-bold text-accent-soft-fg' : 'font-body-semibold text-fg'
                        )}
                      >
                        {option.text}
                      </Text>
                      {on ? (
                        <Pop>
                          <View
                            className={cn(
                              'h-7 w-7 items-center justify-center bg-primary',
                              isMulti ? 'rounded-xs' : 'rounded-full'
                            )}
                          >
                            <Icon name="Check" size={16} color={colors.onPrimary} strokeWidth={3} />
                          </View>
                        </Pop>
                      ) : (
                        <View
                          className={cn(
                            'h-7 w-7 border border-border-strong',
                            isMulti ? 'rounded-xs' : 'rounded-full'
                          )}
                        />
                      )}
                    </PressableScale>
                  </EnterRight>
                )
              })}
            </View>
          )}
        </View>
      ) : null}
    </Screen>
  )
}
