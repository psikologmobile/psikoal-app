import type {
  ClientContactSchema,
  OfferClosedReasonSchema,
  OfferQuoteSchema,
  OfferSchema,
  OfferStatusSchema,
  SendOfferSchema,
} from '../schemas/offer.schema'
import type { z } from 'zod'

export type OfferStatus = z.infer<typeof OfferStatusSchema>
export type OfferClosedReason = z.infer<typeof OfferClosedReasonSchema>
export type Offer = z.infer<typeof OfferSchema>
export type OfferQuote = z.infer<typeof OfferQuoteSchema>
export type ClientContact = z.infer<typeof ClientContactSchema>
export type SendOfferRequest = z.infer<typeof SendOfferSchema>

/**
 * POST /offers gövdesi: form + uzmanın ekranda onayladığı ücret. Sunucunun anlık
 * ücreti farklıysa 409 OFFER_FEE_CHANGED döner ve hiçbir şey yazılmaz.
 */
export type SendOfferPayload = SendOfferRequest & { expectedFeeKurus: number }
