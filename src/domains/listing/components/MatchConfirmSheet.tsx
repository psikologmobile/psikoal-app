import { View } from 'react-native'

import type { MatchTarget } from '../hooks/useMatchConfirm'

import { Avatar } from '@/core/components/atoms/Avatar'
import { Button } from '@/core/components/atoms/Button'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { BottomSheet } from '@/core/components/organisms/BottomSheet'
import { Pop } from '@/core/motion'

export type MatchConfirmSheetProps = {
  target: MatchTarget | null
  onCancel: () => void
  onConfirm: () => void
  isPending?: boolean
  errorMessage?: string
}

export const MATCH_CONFIRM_TEXT =
  'İlanın eşleşti olarak işaretlenecek ve yeni teklif almayacak. Teklif veren diğer uzmanlara ilanın kapandığı bildirilecek.'

/** "{Uzman} ile eşleşilsin mi?" onay sheet'i — Vazgeç / Eşleş. */
export function MatchConfirmSheet({
  target,
  onCancel,
  onConfirm,
  isPending = false,
  errorMessage,
}: MatchConfirmSheetProps) {
  return (
    <BottomSheet
      visible={target !== null}
      onClose={onCancel}
      dismissable={!isPending}
      title={target ? `${target.expertName} ile eşleşilsin mi?` : undefined}
      description={MATCH_CONFIRM_TEXT}
      actions={
        <View className="flex-row gap-2.5">
          <View className="flex-1">
            <Button
              label="Vazgeç"
              variant="outline"
              size="lg"
              fullWidth
              isDisabled={isPending}
              onPress={onCancel}
            />
          </View>
          <View className="flex-1">
            <Button
              label="Eşleş"
              size="lg"
              fullWidth
              isLoading={isPending}
              loadingLabel="Eşleşiliyor…"
              onPress={onConfirm}
              testID="match-confirm"
            />
          </View>
        </View>
      }
    >
      {target ? (
        <Pop className="self-start">
          <Avatar size="lg" tone="accent" initials={target.expertInitials} />
        </Pop>
      ) : null}
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
    </BottomSheet>
  )
}
