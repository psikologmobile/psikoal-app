import { View } from 'react-native'

import { OFFER_COMPOSER_BLOCK_TEXT } from '../utils/expertOffer'

import type { OfferQuote } from '../types/offer.types'
import type { OfferComposerState } from '../utils/expertOffer'

import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { Flash, Shake } from '@/core/motion'
import { TopupNotice } from '@/domains/wallet'

/** Mobilde YALNIZ düz metin (mağaza kuralı). */
export const OFFER_INSUFFICIENT_TEXT =
  'Teklif göndermek için bakiyen yetersiz. Bakiye yüklemek için web sitemizi ziyaret edebilirsin.'

export type OfferFeePanelProps = {
  state: OfferComposerState
  quote: OfferQuote | undefined
  /** Ücret değiştiyse uzmanın onayladığı eski ücret (üstü çizili gösterilir). */
  previousFeeLabel?: string
  /** Profil reddedildiyse admin gerekçesi (`ExpertDto.rejectionReason`). */
  rejectionReason?: string | null
}

const CAN_SEND: OfferComposerState[] = ['normal', 'free', 'feeChanged']

/**
 * Teklif gönder ekranındaki ücret kutusu (accent zemin): o anki ücret, bakiyeye
 * etkisi ve durum metni. Ücret ve "yeterli mi" kararı sunucudan (`/offers/quote`).
 */
export function OfferFeePanel({
  state,
  quote,
  previousFeeLabel,
  rejectionReason,
}: OfferFeePanelProps) {
  const free = state === 'free'
  const feeLabel = free ? 'Ücretsiz' : (quote?.feeLabel ?? '—')
  const balanceLine = quote
    ? state === 'insufficient'
      ? quote.balanceLabel
      : `${quote.balanceLabel} → ${quote.balanceAfterLabel}`
    : '—'
  const block = OFFER_COMPOSER_BLOCK_TEXT[state]
  const blockIsError = state === 'rejected' || state === 'error'

  return (
    <View testID="offer-fee-panel" className="gap-3 rounded-3xl bg-accent p-4.5">
      <View className="flex-row items-end justify-between gap-3">
        <View className="gap-0.5">
          <Text className="font-body-semibold text-badge text-accent-muted">Teklif ücreti</Text>
          {quote ? (
            <View className="flex-row items-baseline gap-2">
              {state === 'feeChanged' && previousFeeLabel ? (
                <Text className="text-base text-accent-muted line-through">{previousFeeLabel}</Text>
              ) : null}
              <Flash replayKey={state === 'feeChanged' ? feeLabel : 'static'}>
                <Text
                  accessibilityLabel={`Teklif ücreti ${feeLabel}`}
                  className="font-display text-3xl text-accent-fg"
                >
                  {feeLabel}
                </Text>
              </Flash>
            </View>
          ) : (
            <Skeleton variant="line" width={90} height={28} />
          )}
        </View>
        <View className="items-end gap-0.5">
          <Text className="font-body-semibold text-badge text-accent-muted">Bakiye</Text>
          <Text className="font-body-bold text-base text-accent-fg">{balanceLine}</Text>
        </View>
      </View>

      <View className="h-[1.5px] bg-accent-line" />

      {state === 'normal' && quote ? (
        <Text className="text-body-sm text-accent-fg">
          Teklif gönderdiğinde{' '}
          <Text className="font-body-heavy text-body-sm">{quote.feeLabel}</Text> bakiyenden düşer.
          Bu ücret, teklifin seçilmese de{' '}
          <Text className="font-body-heavy text-body-sm">iade edilmez</Text>.
        </Text>
      ) : null}
      {free && quote ? (
        <Text className="text-body-sm text-accent-fg">
          Bu teklif için ücretsiz hakkın kullanılacak (kalan {quote.freeOfferRights}).
        </Text>
      ) : null}
      {state === 'feeChanged' && quote ? (
        <Text accessibilityLiveRegion="polite" className="text-body-sm text-accent-fg">
          Teklif ücreti güncellendi:{' '}
          <Text className="font-body-heavy text-body-sm">{quote.feeLabel}</Text>. Bu tutarla
          göndermek ister misin?
        </Text>
      ) : null}
      {state === 'insufficient' ? (
        <TopupNotice
          tone="danger"
          message={OFFER_INSUFFICIENT_TEXT}
          webMessage="Teklif göndermek için bakiyen yetersiz."
          testID="offer-balance-insufficient"
        />
      ) : null}
      {block ? (
        blockIsError ? (
          <Shake withHaptic>
            <View
              accessibilityRole="alert"
              className="rounded-sm border border-danger bg-danger-soft p-3"
            >
              <Text className="text-body-sm text-danger-soft-fg">{block}</Text>
              {state === 'rejected' && rejectionReason ? (
                <Text className="mt-1.5 text-body-sm text-danger-soft-fg">
                  <Text className="font-body-bold text-body-sm text-danger-soft-fg">Gerekçe: </Text>
                  {rejectionReason}
                </Text>
              ) : null}
            </View>
          </Shake>
        ) : (
          <View className="rounded-sm border border-dashed border-accent-line p-3">
            <Text className="text-body-sm text-accent-fg">{block}</Text>
          </View>
        )
      ) : null}
      {CAN_SEND.includes(state) ? (
        <Text className="text-body-sm text-accent-muted">
          Teklif gönderdiğin an danışanın adı, telefonu ve e-postası sana açılır.
        </Text>
      ) : null}
    </View>
  )
}
