import { OFFER_ERROR_CODES } from '../offer.constants'

import { parseSendOfferError } from './offerErrors'

import type { ExpertOfferFilter } from '../offer.constants'
import type { Offer, OfferQuote } from '../types/offer.types'

import { isApiErrorCode } from '@/lib/api'

/** Kart/rozet tonu: seçildi (primary) · gönderildi (nabızlı soft) · kapandı (outline). */
export type OfferTone = 'selected' | 'live' | 'closed'

export function offerTone(offer: Pick<Offer, 'status'>): OfferTone {
  if (offer.status === 'ACCEPTED') return 'selected'
  if (offer.status === 'PENDING') return 'live'
  return 'closed'
}

/** Tekliflerim süzgeci: "Tümü" ya da backend `statusLabel` eşleşmesi. */
export function matchesOfferFilter(offer: Pick<Offer, 'statusLabel'>, filter: ExpertOfferFilter) {
  return filter === 'Tümü' || offer.statusLabel === filter
}

/**
 * Teklif detayında danışan iletişimi gösterilsin mi: teklif bekliyor (ilan açık)
 * ya da seçildi (eşleşti). Geri çekilen/kapanan teklifte gizlenir.
 */
export function isOfferContactVisible(offer: Pick<Offer, 'status' | 'clientContact'>): boolean {
  return offer.clientContact !== null && (offer.status === 'PENDING' || offer.status === 'ACCEPTED')
}

/** Teklif gönder ekranının durumları (tasarım: b4_Teklif_gönder). */
export type OfferComposerState =
  | 'loading'
  | 'normal'
  | 'free'
  | 'feeChanged'
  | 'insufficient'
  | 'pendingApproval'
  | 'rejected'
  | 'alreadyOffered'
  | 'listingClosed'
  | 'error'

type ComposerInput = {
  isLoading: boolean
  isPendingApproval: boolean
  isRejected: boolean
  listing: { viewerHasOffered: boolean; status: string } | undefined
  quote: OfferQuote | undefined
  /** Ücret (quote) okunamadı. */
  quoteFailed: boolean
  /** Son gönderim hatası (useSendOfferMutation().error). */
  submitError: unknown
}

/**
 * Ekranın tek durumu. Engel sırası: profil → ilan → ücret. Ücret ve yeterlilik
 * kararı sunucunun (`/offers/quote`, POST /offers hataları).
 */
export function resolveOfferComposerState(input: ComposerInput): OfferComposerState {
  const { listing, quote, submitError } = input
  if (input.isPendingApproval || isApiErrorCode(submitError, OFFER_ERROR_CODES.expertNotApproved)) {
    return 'pendingApproval'
  }
  if (input.isRejected) return 'rejected'
  if (listing?.viewerHasOffered || isApiErrorCode(submitError, OFFER_ERROR_CODES.alreadyExists)) {
    return 'alreadyOffered'
  }
  if (
    (listing && listing.status !== 'OPEN') ||
    isApiErrorCode(submitError, OFFER_ERROR_CODES.listingNotOpen)
  ) {
    return 'listingClosed'
  }
  if (input.isLoading) return 'loading'

  const failure = parseSendOfferError(submitError)
  if (failure?.kind === 'feeChanged') return 'feeChanged'
  if (failure?.kind === 'insufficientBalance' || quote?.sufficient === false) return 'insufficient'
  if (failure?.kind === 'other' || input.quoteFailed || !quote) return 'error'
  return quote.willUseFreeRight ? 'free' : 'normal'
}

/** Engelli durumların düz metni (tasarım metinleri). */
export const OFFER_COMPOSER_BLOCK_TEXT: Partial<Record<OfferComposerState, string>> = {
  pendingApproval: 'Profilin onay bekliyor. Onaylanınca teklif gönderebilirsin.',
  rejected: 'Profilin onaylanmadı. Belgelerini güncelleyip yeniden başvurabilirsin.',
  alreadyOffered: 'Bu ilana zaten teklif verdin. Teklifini Tekliflerim’den görebilirsin.',
  listingClosed: 'Bu ilan artık açık değil; başka bir uzmanla eşleşti ya da kapandı.',
  error: 'Teklif gönderilemedi. Bağlantını kontrol edip tekrar dene.',
}
