export {
  useOfferDetailQuery,
  useOfferQuoteQuery,
  useSendOfferMutation,
  useWithdrawOfferMutation,
  useListingOffersQuery,
  useExpertOffersQuery,
} from './api'

export { useOfferFeeGate, feeChangedText } from './hooks/useOfferFeeGate'

export {
  offerKeys,
  OFFER_STALE_TIME,
  OFFER_QUOTE_STALE_TIME,
  OFFER_STATUS_CONFIG,
  OFFER_ERROR_CODES,
} from './offer.constants'

export {
  OfferStatusSchema,
  OfferClosedReasonSchema,
  OfferSchema,
  OfferQuoteSchema,
  OfferQuoteResponseSchema,
  OfferFeeMetaSchema,
  ClientContactSchema,
  SendOfferSchema,
} from './schemas/offer.schema'

export { parseSendOfferError, isOfferFeeChangedError } from './utils/offerErrors'
export type { SendOfferFailure, OfferFee } from './utils/offerErrors'

export type {
  OfferStatus,
  OfferClosedReason,
  Offer,
  OfferQuote,
  ClientContact,
  SendOfferRequest,
  SendOfferPayload,
} from './types/offer.types'
