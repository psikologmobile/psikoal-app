import type { OfferStatus } from './types/offer.types'
import type { IconName } from '@/core/components/atoms/Icon'

export const offerKeys = {
  all: ['offers'] as const,
  lists: () => [...offerKeys.all, 'list'] as const,
  my: (status?: string) => [...offerKeys.all, 'my', status ?? 'all'] as const,
  details: () => [...offerKeys.all, 'detail'] as const,
  detail: (id: string) => [...offerKeys.details(), id] as const,
  listings: () => [...offerKeys.all, 'listing'] as const,
  forListing: (listingId: string) => [...offerKeys.listings(), listingId] as const,
  quotes: () => [...offerKeys.all, 'quote'] as const,
  quote: (listingId: string) => [...offerKeys.quotes(), listingId] as const,
} as const

export const OFFER_STALE_TIME = 60 * 1000
/** Ücret zamanla ve her yeni teklifle düşer: teklif ekranında kısa ömürlü. */
export const OFFER_QUOTE_STALE_TIME = 15 * 1000

/** Sunucunun teklif hata kodları (ErrorKeys). */
export const OFFER_ERROR_CODES = {
  /** 409: anlık ücret uzmanın onayladığından farklı; meta { feeKurus, feeLabel }. */
  feeChanged: 'OFFER_FEE_CHANGED',
  /** 422: bakiye ücrete yetmiyor ve ücretsiz hak yok; meta { feeKurus, feeLabel }. */
  insufficientBalance: 'INSUFFICIENT_BALANCE',
  /** 409/422: ilan artık teklife açık değil. */
  listingNotOpen: 'OFFER_LISTING_NOT_OPEN',
} as const

/**
 * Yalnız ikon. Durum METNİ backend'in `statusLabel` alanından gelir
 * (Gönderildi · Seçildi · Başka uzmanla eşleşti · İlan kapandı · Süresi doldu · Geri çekildi).
 * `label` eski ekranlar derlensin diye duruyor; yeni kodda `offer.statusLabel` kullanılır.
 */
export const OFFER_STATUS_CONFIG: Record<
  OfferStatus,
  { label: string; icon: IconName; iconColor: string }
> = {
  PENDING: { label: 'Gönderildi', icon: 'Clock', iconColor: '#D97706' },
  ACCEPTED: { label: 'Seçildi', icon: 'CheckCircle2', iconColor: '#16A34A' },
  REJECTED: { label: 'Kapandı', icon: 'XCircle', iconColor: '#DC2626' },
  WITHDRAWN: { label: 'Geri çekildi', icon: 'MinusCircle', iconColor: '#737373' },
}
