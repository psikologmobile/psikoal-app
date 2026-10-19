import { LISTING_EXPIRE_DAYS } from '../listing.constants'

import type { Listing, ListingStatus, SessionType } from '../types/listing.types'
import type { StatusPillVariant } from '@/core/components/atoms/StatusPill'

import { formatTry } from '@/core/utils/formatTry'

const DAY_MS = 24 * 60 * 60 * 1000

/** Danışan ekranlarındaki durum rozeti (v2 StatusPill varyantı + metin). */
export const CLIENT_LISTING_STATUS: Record<
  ListingStatus,
  { label: string; variant: StatusPillVariant }
> = {
  OPEN: { label: 'Yayında', variant: 'live' },
  PENDING_APPROVAL: { label: 'Onay bekliyor', variant: 'soft' },
  MATCHED: { label: 'Eşleşti', variant: 'matched' },
  CLOSED: { label: 'Kapatıldı', variant: 'neutral' },
  EXPIRED: { label: 'Süresi doldu', variant: 'neutral' },
  REJECTED_BY_ADMIN: { label: 'Reddedildi', variant: 'danger' },
}

/** Tasarımdaki görüşme şekli adları (danışan dili). */
export const CLIENT_SESSION_MODE_LABELS: Record<SessionType, string> = {
  online: 'Online',
  yüz_yüze: 'Yüz yüze',
  yüz_yüze_online: 'İkisi de olur',
}

/** İlanın bitişine kalan tam gün (en az 0); bitiş yoksa null. */
export function listingDaysLeft(expiresAt: string | null, now: Date = new Date()): number | null {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / DAY_MS))
}

/** "₺2.000–₺3.000" (backend etiketi varsa o). */
export function listingBudgetLabel(
  listing: Pick<Listing, 'budgetLabel' | 'budgetMin' | 'budgetMax'>
) {
  if (listing.budgetLabel) return listing.budgetLabel
  return `${formatTry(listing.budgetMin * 100)}–${formatTry(listing.budgetMax * 100)}`
}

/** Kart etiketleri: alanlar, görüşme şekli, bütçe ya da şehir. */
export function listingTags(listing: Listing): string[] {
  const tags = [...listing.specialization.slice(0, 2)]
  tags.push(CLIENT_SESSION_MODE_LABELS[listing.preferredSessionType])
  tags.push(
    listing.status === 'PENDING_APPROVAL' && listing.city
      ? listing.city
      : listingBudgetLabel(listing)
  )
  return tags
}

/** Kapatılmamış "anlaştık" bildirimi var mı (yalnız yayındaki ilanda anlamlı). */
export function hasOpenClaim(listing: Pick<Listing, 'status' | 'claims'>): boolean {
  return listing.status === 'OPEN' && (listing.claims?.length ?? 0) > 0
}

export function offerCountLabel(count: number): string {
  return count === 0 ? 'Henüz teklif yok' : `${count} teklif`
}

/** AdCard alt satırı (sol kalın, sağ soluk) ve özet metni. */
export function adCardView(
  listing: Listing,
  now: Date = new Date()
): { excerpt: string; left: string; right: string } {
  const days = listingDaysLeft(listing.expiresAt, now)
  switch (listing.status) {
    case 'OPEN':
      return {
        excerpt: listing.description,
        left: offerCountLabel(listing.offerCount),
        right: days === null ? listing.createdAtRelative : `${days} gün kaldı`,
      }
    case 'PENDING_APPROVAL':
      return {
        excerpt: listing.description,
        left: 'Henüz yayında değil',
        right: listing.createdAtRelative,
      }
    case 'MATCHED':
      return {
        excerpt: listing.description,
        left: listing.matchedExpert ? `${listing.matchedExpert.name} ile eşleşti` : 'Eşleşti',
        right: listing.createdAtRelative,
      }
    case 'EXPIRED':
      return {
        excerpt: listing.description,
        left: offerCountLabel(listing.offerCount),
        right: `${LISTING_EXPIRE_DAYS} gün doldu`,
      }
    case 'REJECTED_BY_ADMIN':
      return {
        excerpt: listing.rejectionReason
          ? `Gerekçe: ${listing.rejectionReason}`
          : listing.description,
        left: 'Yeniden düzenleyebilirsin',
        right: listing.createdAtRelative,
      }
    case 'CLOSED':
      return {
        excerpt: listing.description,
        left: offerCountLabel(listing.offerCount),
        right: listing.createdAtRelative,
      }
  }
}

/** Kalan ilan hakkı notu ("2 ilan hakkın kaldı" / "3 ilan hakkın var"). */
export function listingQuotaNote(activeCount: number, maxActive: number): string {
  if (activeCount === 0) return `${maxActive} ilan hakkın var`
  const left = Math.max(0, maxActive - activeCount)
  return left === 0 ? 'İlan sınırındasın' : `${left} ilan hakkın kaldı`
}

/** Keşfet'teki "Aktif ilanın" kartı: ilk yayındaki ilan. */
export function pickActiveListing(listings: Listing[]): Listing | undefined {
  return listings.find((listing) => listing.status === 'OPEN')
}

/** Keşfet hatırlatması: yayındaki ilanlardaki ilk "anlaştık" bildirimi. */
export function firstClaimReminder(
  listings: Listing[]
): { listing: Listing; claim: NonNullable<Listing['claims']>[number] } | null {
  for (const listing of listings) {
    const claim = hasOpenClaim(listing) ? listing.claims?.[0] : undefined
    if (claim) return { listing, claim }
  }
  return null
}
