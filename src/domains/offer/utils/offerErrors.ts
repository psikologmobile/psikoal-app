import { OFFER_ERROR_CODES } from '../offer.constants'
import { OfferFeeMetaSchema } from '../schemas/offer.schema'

import { getErrorMessage, isApiErrorCode } from '@/lib/api'

/** 409 OFFER_FEE_CHANGED / 422 INSUFFICIENT_BALANCE `meta`'sı. */
export type OfferFee = { feeKurus: number; feeLabel: string }

/**
 * Teklif gönderiminin ekranın dallanacağı sonucu:
 *  - `feeChanged`: ücret değişti; `fee` yeni ücret (sunucu meta'sı). Uzman yeni
 *    ücreti onaylayıp `expectedFeeKurus: fee.feeKurus` ile tekrar gönderir.
 *  - `insufficientBalance`: bakiye yetmiyor; mobilde YALNIZ düz metin gösterilir.
 *  - `other`: diğer her hata; `message` kullanıcıya gösterilebilir Türkçe metin.
 */
export type SendOfferFailure =
  | { kind: 'feeChanged'; fee: OfferFee | null; message: string }
  | { kind: 'insufficientBalance'; fee: OfferFee | null; message: string }
  | { kind: 'other'; message: string }

function readFee(meta: unknown): OfferFee | null {
  const parsed = OfferFeeMetaSchema.safeParse(meta)
  return parsed.success ? parsed.data : null
}

export function isOfferFeeChangedError(error: unknown): boolean {
  return isApiErrorCode(error, OFFER_ERROR_CODES.feeChanged)
}

/** Hata yoksa null; varsa ekranın dallanacağı tipli sonuç. */
export function parseSendOfferError(error: unknown): SendOfferFailure | null {
  if (error === null || error === undefined) return null
  if (isApiErrorCode(error, OFFER_ERROR_CODES.feeChanged)) {
    return { kind: 'feeChanged', fee: readFee(error.meta), message: error.message }
  }
  if (isApiErrorCode(error, OFFER_ERROR_CODES.insufficientBalance)) {
    return { kind: 'insufficientBalance', fee: readFee(error.meta), message: error.message }
  }
  return { kind: 'other', message: getErrorMessage(error) }
}
