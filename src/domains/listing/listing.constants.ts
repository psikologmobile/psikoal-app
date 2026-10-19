import type { ListingSort, ListingStatus, SessionType } from './types/listing.types'
import type { IconName } from '@/core/components/atoms/Icon'

export const listingKeys = {
  all: ['listings'] as const,
  lists: (params?: unknown) => [...listingKeys.all, 'list', params ?? {}] as const,
  my: (status?: string) => [...listingKeys.all, 'my', status ?? 'all'] as const,
  detail: (id: string) => [...listingKeys.all, 'detail', id] as const,
  rules: () => [...listingKeys.all, 'rules'] as const,
} as const

export const LISTING_STALE_TIME = 60 * 1000
export const LISTING_RULES_STALE_TIME = 10 * 60 * 1000
export const LISTING_EXPIRE_DAYS = 30
/** Varsayılan; güncel değer `/listings/rules` → maxActive. */
export const LISTING_MAX_ACTIVE = 3

/** Sunucunun ilan / eşleşti işaretleme / anlaşma bildirimi hata kodları (ErrorKeys). */
export const LISTING_ERROR_CODES = {
  contactConsentRequired: 'CONTACT_CONSENT_REQUIRED',
  phoneRequired: 'PHONE_REQUIRED',
  budgetOutOfRange: 'LISTING_BUDGET_OUT_OF_RANGE',
  maxActiveExceeded: 'LISTING_MAX_ACTIVE_EXCEEDED',
  notFound: 'LISTING_NOT_FOUND',
  notOwner: 'LISTING_NOT_OWNER',
  notOpen: 'LISTING_NOT_OPEN',
  offerNotOnListing: 'OFFER_NOT_ON_LISTING',
  offerNotPending: 'OFFER_NOT_PENDING',
  claimAlreadyExists: 'CLAIM_ALREADY_EXISTS',
  claimNotAllowed: 'CLAIM_NOT_ALLOWED',
  claimNotFound: 'CLAIM_NOT_FOUND',
} as const

export const LISTING_STATUS_CONFIG: Record<
  ListingStatus,
  { label: string; icon: IconName; iconColor: string }
> = {
  PENDING_APPROVAL: { label: 'Onay Bekliyor', icon: 'Hourglass', iconColor: '#D97706' },
  OPEN: { label: 'Yayında', icon: 'Radio', iconColor: '#0EA5E9' },
  MATCHED: { label: 'Eşleşildi', icon: 'CheckCircle2', iconColor: '#16A34A' },
  CLOSED: { label: 'Kapatıldı', icon: 'CircleX', iconColor: '#737373' },
  EXPIRED: { label: 'Süresi Doldu', icon: 'Clock', iconColor: '#D97706' },
  REJECTED_BY_ADMIN: { label: 'Reddedildi', icon: 'XCircle', iconColor: '#DC2626' },
} as const

export const SESSION_TYPE_LABELS: Record<string, string> = {
  online: 'Online',
  yüz_yüze: 'Yüz Yüze',
  yüz_yüze_online: 'Yüz Yüze / Online',
} as const

/** v2 kısa görüşme şekli etiketleri (kart etiketi, ilan detayı, teklif formu). */
export const SESSION_MODE_LABELS: Record<SessionType, string> = {
  online: 'Online',
  yüz_yüze: 'Yüz yüze',
  yüz_yüze_online: 'İkisi de',
}

/** Fırsatlar sıralaması — sırayla döner (tasarım: tek düğme). */
export const OPPORTUNITY_SORTS: ReadonlyArray<{ value: ListingSort; label: string }> = [
  { value: 'newest', label: 'En yeni' },
  { value: 'budget_desc', label: 'Yüksek bütçe' },
  { value: 'budget_asc', label: 'Düşük bütçe' },
  { value: 'offer_asc', label: 'Az teklif' },
  { value: 'fee_asc', label: 'Düşük teklif ücreti' },
]

/** Fırsatlar bütçe süzgeci (seans başı, TL). Tek seçim. */
export const OPPORTUNITY_BUDGETS: ReadonlyArray<{
  key: string
  label: string
  budgetMin: number
  budgetMax?: number
}> = [
  { key: 'b1', label: '₺1.500’e kadar', budgetMin: 0, budgetMax: 1500 },
  { key: 'b2', label: '₺1.500–₺3.000', budgetMin: 1500, budgetMax: 3000 },
  { key: 'b3', label: '₺3.000+', budgetMin: 3000 },
]
