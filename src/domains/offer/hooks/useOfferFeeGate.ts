import { useOfferQuoteQuery } from '../api/useOfferQuoteQuery'
import { parseSendOfferError } from '../utils/offerErrors'

import type { OfferQuote } from '../types/offer.types'

import { INSUFFICIENT_BALANCE_MESSAGE } from '@/domains/wallet'

type UseOfferFeeGateParams = {
  listingId: string | undefined
  /** Son gönderim denemesinin hatası (useSendOfferMutation().error). */
  submitError?: unknown
}

type UseOfferFeeGateReturn = {
  quote: OfferQuote | undefined
  isLoading: boolean
  /** Ücret yeniden çekiliyor (ör. OFFER_FEE_CHANGED sonrası) — gönderim beklemede. */
  isRefreshing: boolean
  /** POST /offers'a gidecek `expectedFeeKurus`; ücret bilinmiyorsa undefined. */
  expectedFeeKurus: number | undefined
  /** Gönder düğmesi açık mı? Ücret biliniyor, tazelenmiyor ve sunucu "yeterli" diyor. */
  canSubmit: boolean
  /** Bakiye yetmiyorsa gösterilecek düz metin (mağaza kuralı: bağlantı/düğme yok). */
  insufficientMessage: string | undefined
  /** Ücret değiştiyse: "Teklif ücreti ₺560 olarak güncellendi…" */
  feeChangedMessage: string | undefined
  /** Diğer gönderim hataları. */
  errorMessage: string | undefined
}

export function feeChangedText(feeLabel: string | undefined): string {
  return feeLabel
    ? `Teklif ücreti ${feeLabel} olarak güncellendi. Yeni ücreti onaylayıp tekrar gönderin.`
    : 'Teklif ücreti güncellendi. Yeni ücreti onaylayıp tekrar gönderin.'
}

/**
 * Teklif ekranının ücret kapısı (Revize 2 §4). Ücret ve yeterlilik kararı
 * sunucunun (`/offers/quote`); burada hesap yapılmaz. Ücret okunamazsa gönderim
 * kilitli kalır çünkü `expectedFeeKurus` zorunludur.
 */
export function useOfferFeeGate({
  listingId,
  submitError,
}: UseOfferFeeGateParams): UseOfferFeeGateReturn {
  const { data: quote, isLoading, isFetching } = useOfferQuoteQuery(listingId)
  const failure = parseSendOfferError(submitError)

  const lacksBalance = quote !== undefined && !quote.sufficient
  const serverSaysInsufficient = failure?.kind === 'insufficientBalance'

  return {
    quote,
    isLoading,
    isRefreshing: isFetching && !isLoading,
    expectedFeeKurus: quote?.feeKurus,
    canSubmit: quote !== undefined && quote.sufficient && !isFetching,
    insufficientMessage:
      lacksBalance || serverSaysInsufficient ? INSUFFICIENT_BALANCE_MESSAGE : undefined,
    feeChangedMessage:
      failure?.kind === 'feeChanged'
        ? feeChangedText(failure.fee?.feeLabel ?? quote?.feeLabel)
        : undefined,
    errorMessage: failure?.kind === 'other' ? failure.message : undefined,
  }
}
