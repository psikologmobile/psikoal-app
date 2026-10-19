import { useState } from 'react'

import { View } from 'react-native'

import { useMatchReview } from '../hooks/useMatchReview'

import type { CreateReviewRequest } from '../schemas/review.schema'

import { Button } from '@/core/components/atoms/Button'
import { StarRating } from '@/core/components/atoms/StarRating'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { TextArea } from '@/core/components/molecules/TextArea'
import { DrawCheck, Pop } from '@/core/motion'
import { useThemeColors } from '@/core/theme'



export type ReviewCardProps = {
  expertId: string
  /** Başlıkta: "{ad}'yı değerlendir". */
  expertName: string
  matchId: string
  sessionType?: CreateReviewRequest['sessionType']
}

/**
 * Eşleşme detayında danışanın değerlendirme kartı (b0 · Eşleşme detayı).
 * Revize 2 §5: eşleşme ACTIVE iken açıktır. Yıldızlar pop'la dolar; gönderilince
 * çizilen tik ile onay metni.
 */
export function ReviewCard({ expertId, expertName, matchId, sessionType }: ReviewCardProps) {
  const colors = useThemeColors()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const { submit, isSubmitting, isDone, doneMessage, errorMessage } = useMatchReview({
    expertId,
    matchId,
    sessionType,
  })

  return (
    <View className="gap-3 rounded-2xl border border-border-strong p-[18px]">
      {isDone ? (
        <View className="flex-row items-center gap-3" accessibilityLiveRegion="polite">
          <Pop>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
              <DrawCheck size={20} color={colors.onPrimary} strokeWidth={3} delay={200} />
            </View>
          </Pop>
          <Text className="flex-1 text-body-sm text-fg">{doneMessage}</Text>
        </View>
      ) : (
        <>
          <Text accessibilityRole="header" className="font-body-bold text-base text-fg">
            {`${expertName}'yı değerlendir`}
          </Text>
          <StarRating value={rating} onChange={setRating} />
          <TextArea
            testID="review-comment"
            value={comment}
            onChangeText={setComment}
            placeholder="Deneyimini birkaç cümleyle anlat (1–1000 karakter)"
            maxLength={1000}
            minHeight={88}
          />
          {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
          <Button
            testID="review-submit"
            label="Gönder"
            loadingLabel="Gönderiliyor"
            onPress={() => submit(rating, comment.trim())}
            isLoading={isSubmitting}
            isDisabled={rating === 0 || comment.trim().length === 0}
            fullWidth
          />
        </>
      )}
    </View>
  )
}
