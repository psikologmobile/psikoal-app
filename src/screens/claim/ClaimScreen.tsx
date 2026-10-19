import { useState } from 'react'

import { View } from 'react-native'

import { useLocalSearchParams, useRouter } from 'expo-router'

import { Button } from '@/core/components/atoms/Button'
import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { ScreenHeader } from '@/core/components/molecules/ScreenHeader'
import { TextArea } from '@/core/components/molecules/TextArea'
import { BottomSheet } from '@/core/components/organisms/BottomSheet'
import { SuccessHero } from '@/core/components/organisms/SuccessHero'
import { Screen } from '@/core/components/templates'
import { EnterLeft, EnterRight, EnterUp, Pop, Spin } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { getInitials } from '@/core/utils/personName'
import { useAuthStore } from '@/domains/auth'
import {
  CLAIM_NOTE_MAX,
  LISTING_ERROR_CODES,
  useCreateClaimMutation,
  useListingDetailQuery,
} from '@/domains/listing'
import { getErrorMessage, isApiErrorCode } from '@/lib/api'

const RULES = [
  'Her ilan için yalnız bir kez bildirebilirsin.',
  'Danışana "ilanını eşleşti olarak işaretle" hatırlatması gider.',
  'Danışan yine işaretlemezse ilan admin incelemesine düşer.',
  'Bildirim ücret iadesi doğurmaz.',
]

function initialsOf(fullName: string): string {
  const [firstName = '', ...rest] = fullName.split(' ')
  return getInitials({ firstName, lastName: rest.join(' ') })
}

/**
 * "Danışanla anlaştım" (tasarım: b4_Danışanla_anlaştım). Uzman, danışan ilanını
 * işaretlemediyse ilan başına bir kez bildirir (Revize 2 §3.5). Durumlar:
 * normal · bildirildi · beklemede (zaten bildirildi).
 */
export function ClaimScreen() {
  const { listingId = '' } = useLocalSearchParams<{ listingId: string }>()
  const router = useRouter()
  const colors = useThemeColors()
  const user = useAuthStore((s) => s.user)
  const listingQuery = useListingDetailQuery(listingId)
  const listing = listingQuery.data
  const claim = useCreateClaimMutation()
  const [note, setNote] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)

  const back = () => router.replace('/(tabs)/offers')

  if (listingQuery.isLoading) {
    return (
      <Screen testID="screen-claim">
        <ScreenHeader title="Danışanla anlaştım" />
        <Skeleton variant="rect" height={150} borderRadius="3xl" />
        <Skeleton variant="rect" height={120} delay={150} />
      </Screen>
    )
  }

  if (!listing) {
    return (
      <Screen testID="screen-claim">
        <ScreenHeader title="Danışanla anlaştım" />
        <ErrorBanner
          title="İlan yüklenemedi"
          description="Bağlantını kontrol edip tekrar dene."
          onRetry={() => void listingQuery.refetch()}
        />
      </Screen>
    )
  }

  const clientName = listing.clientContact?.fullName ?? listing.clientDisplayName ?? 'Danışan'
  const alreadyClaimed =
    listing.viewerClaim !== null ||
    isApiErrorCode(claim.error, LISTING_ERROR_CODES.claimAlreadyExists)

  if (claim.isSuccess) {
    return (
      <Screen
        testID="screen-claim-done"
        footer={<Button label="Tekliflerime dön" size="lg" fullWidth onPress={back} />}
      >
        <ScreenHeader title="Danışanla anlaştım" />
        <SuccessHero
          className="pt-16"
          title="Bildirildi"
          tone="primary"
          description={`${clientName} için hatırlatma gönderdik. İşaretlediğinde eşleşme Eşleşmelerim'de görünecek.`}
        />
      </Screen>
    )
  }

  if (alreadyClaimed) {
    return (
      <Screen
        testID="screen-claim-pending"
        footer={
          <Button label="Tekliflerime dön" variant="outline" size="lg" fullWidth onPress={back} />
        }
      >
        <ScreenHeader title="Danışanla anlaştım" />
        <View className="items-center gap-4 pt-16">
          <Pop>
            <View className="h-[120px] w-[120px] items-center justify-center rounded-full border-2 border-dashed border-border-strong">
              <Spin duration={4000}>
                <Icon name="Clock" size={48} color={colors.primaryText} />
              </Spin>
            </View>
          </Pop>
          <EnterUp index={1}>
            <Text
              accessibilityRole="header"
              variant="h3"
              align="center"
              className="text-[30px] leading-[34px]"
            >
              Zaten bildirdin
            </Text>
          </EnterUp>
          <EnterUp index={2}>
            <Text align="center" className="max-w-[320px] text-body text-fg-muted">
              Bu ilan için bildirimin alındı. Her ilan için yalnız bir kez bildirebilirsin; danışan
              işaretlemezse ilan admin incelemesine düşer.
            </Text>
          </EnterUp>
        </View>
      </Screen>
    )
  }

  const canClaim = listing.viewerHasOffered && listing.status === 'OPEN'
  if (!canClaim) {
    return (
      <Screen testID="screen-claim">
        <ScreenHeader title="Danışanla anlaştım" />
        <EmptyState
          icon="Info"
          title="Bu ilan için bildirim yapılamıyor"
          description="Bildirim için bu ilana teklif vermiş olman ve ilanın açık olması gerekir."
          ctaLabel="Tekliflerime dön"
          onCta={back}
        />
      </Screen>
    )
  }

  const submitError =
    claim.error && !alreadyClaimed
      ? isApiErrorCode(claim.error, LISTING_ERROR_CODES.claimNotAllowed)
        ? 'Bu ilan için bildirim yapılamıyor. İlan kapanmış olabilir.'
        : getErrorMessage(claim.error)
      : undefined

  return (
    <Screen
      keyboard
      testID="screen-claim"
      footer={
        <Button
          label="Bildir"
          size="xl"
          fullWidth
          onPress={() => setSheetOpen(true)}
          testID="claim-open"
        />
      }
    >
      <EnterUp>
        <ScreenHeader title="Danışanla anlaştım" />
      </EnterUp>

      <EnterUp index={1}>
        <View
          accessibilityElementsHidden
          className="h-[150px] flex-row items-center justify-center rounded-panel bg-accent-soft"
        >
          <EnterLeft>
            <View className="h-[84px] w-[84px] items-center justify-center rounded-full bg-accent">
              <Text className="font-body-heavy text-2xl text-accent-fg">{getInitials(user)}</Text>
            </View>
          </EnterLeft>
          <EnterRight>
            <View className="-ml-3.5 h-[84px] w-[84px] items-center justify-center rounded-full border-4 border-accent-soft bg-primary">
              <Text className="font-body-heavy text-2xl text-primary-fg">
                {initialsOf(clientName)}
              </Text>
            </View>
          </EnterRight>
        </View>
      </EnterUp>

      <EnterUp index={2}>
        <Text className="text-body leading-[23px] text-fg-muted">
          <Text className="font-body-bold text-body text-fg">{clientName}</Text> ile anlaştığın
          halde ilanını işaretlemediyse bunu bildir; ona bir hatırlatma gönderelim.
        </Text>
      </EnterUp>

      <EnterUp index={3} className="gap-2.5">
        {RULES.map((rule, i) => (
          <View key={rule} className="flex-row items-start gap-2.5">
            <View className="h-6 w-6 items-center justify-center rounded-xs bg-surface">
              <Text className="font-body-heavy text-badge">{i + 1}</Text>
            </View>
            <Text className="flex-1 text-body-sm">{rule}</Text>
          </View>
        ))}
      </EnterUp>

      <EnterUp index={4}>
        <TextArea
          label="Kısa not"
          optional
          value={note}
          onChangeText={setNote}
          maxLength={CLAIM_NOTE_MAX}
          placeholder="Telefonda görüştük, ilk seansı planladık."
          testID="claim-note"
        />
      </EnterUp>

      {submitError ? <ErrorBanner message={submitError} /> : null}

      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Bildirim gönderilsin mi?"
        description={`${clientName} adlı danışana ilanını eşleşti olarak işaretlemesi için hatırlatma gidecek.`}
        actions={
          <View className="flex-row gap-2.5">
            <View className="flex-1">
              <Button
                label="Vazgeç"
                variant="outline"
                size="lg"
                fullWidth
                onPress={() => setSheetOpen(false)}
              />
            </View>
            <View className="flex-1">
              <Button
                label="Bildir"
                size="lg"
                fullWidth
                isLoading={claim.isPending}
                loadingLabel="Gönderiliyor…"
                testID="claim-confirm"
                onPress={() =>
                  claim.mutate({ listingId, note }, { onSettled: () => setSheetOpen(false) })
                }
              />
            </View>
          </View>
        }
      />
    </Screen>
  )
}
