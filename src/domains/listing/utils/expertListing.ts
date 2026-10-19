import { SESSION_MODE_LABELS } from '../listing.constants'

import type { Listing } from '../types/listing.types'

/** Fırsatlar kartının sağ eylemi. */
export type ExpertListingAction = 'offer' | 'viewOffer' | 'locked'

type ExpertGate = {
  /** Profil onaylı ve teklif verebilir mi (useExpertApprovalGate().canAct). */
  canAct: boolean
  /** Bakiye ve ücretsiz hak ikisi de sıfır mı (Fırsatlar "bakiyeSifir"). */
  isBalanceEmpty?: boolean
}

/**
 * Kartta hangi eylem görünür: teklif verilmişse "Teklifini gör"; profil onaysız
 * ya da bakiye/hak sıfırsa "Kilitli"; aksi halde "Teklif ver". Ücret yeterliliğinin
 * son sözü sunucudadır (`/offers/quote`).
 */
export function expertListingAction(listing: Listing, gate: ExpertGate): ExpertListingAction {
  if (listing.viewerHasOffered) return 'viewOffer'
  if (!gate.canAct || gate.isBalanceEmpty) return 'locked'
  return 'offer'
}

/** "4 uzman teklif verdi" / "Henüz teklif yok". */
export function offerCountText(offerCount: number): string {
  return offerCount > 0 ? `${offerCount} uzman teklif verdi` : 'Henüz teklif yok'
}

/** Kart etiketleri: alanlar, görüşme şekli, şehir, test sonucu. */
export function expertListingTags(listing: Listing): string[] {
  const tags = [
    ...listing.specialization.slice(0, 2),
    SESSION_MODE_LABELS[listing.preferredSessionType],
  ]
  if (listing.city) tags.push(listing.city)
  if (listing.assessmentResult) tags.push('Test sonucu var')
  return tags
}

/** Danışanın baş harfi (kart avatarı). Tam ad eşleşme/teklif öncesi gönderilmez. */
export function clientInitial(listing: Listing): string {
  return listing.client?.initials?.trim() || listing.clientDisplayName?.trim().charAt(0) || 'D'
}

export type ExpertListingDetailView = {
  /** Uzman bu ilana teklif verdi (iletişim açık). */
  offered: boolean
  /** "Danışanla anlaştım" girişi (teklif verilmiş + ilan açık). */
  canClaim: boolean
  /** Bu ilan için "anlaştım" zaten bildirildi. */
  claimed: boolean
  /** Kapalı ilan notu; yoksa null. */
  closedText: string | null
  /** Alt ücret çubuğu (teklif verilmemiş, ilan açık). */
  showFeeBar: boolean
  /** Çubukta gönderim engeli metni; null ise "Teklif gönder" açık. */
  blockLabel: string | null
}

type DetailInput = {
  listing: Listing
  isPendingApproval: boolean
  isRejected: boolean
  /** `/offers/quote` → sufficient; quote yoksa undefined (engel sayılmaz). */
  sufficient: boolean | undefined
}

/**
 * Uzman ilan detayının durumları (tasarım: teklifVerilebilir · teklifVerdin ·
 * başkasıylaEşleşti · kapandı · onayBekliyor · bakiyeYetersiz).
 */
export function resolveExpertListingDetail({
  listing,
  isPendingApproval,
  isRejected,
  sufficient,
}: DetailInput): ExpertListingDetailView {
  const offered = listing.viewerHasOffered
  const isOpen = listing.status === 'OPEN'

  let closedText: string | null = null
  if (listing.matchedWithOther) {
    closedText = 'Bu ilan başka bir uzmanla eşleşti; artık teklif verilemez.'
  } else if (!isOpen && !(offered && listing.status === 'MATCHED')) {
    closedText = 'Bu ilan kapandı ya da süresi doldu; artık teklif verilemez.'
  }

  let blockLabel: string | null = null
  if (isPendingApproval) blockLabel = 'Profilin onay bekliyor'
  else if (isRejected) blockLabel = 'Profilin onaylanmadı'
  else if (sufficient === false) blockLabel = 'Bakiyen yetersiz'

  return {
    offered,
    canClaim: offered && isOpen,
    claimed: listing.viewerClaim !== null,
    closedText,
    showFeeBar: !offered && isOpen,
    blockLabel,
  }
}
