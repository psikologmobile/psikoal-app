import type {
  ClaimSchema,
  CreateClaimSchema,
  CreateListingSchema,
  ListingClaimSchema,
  ListingClientContactSchema,
  ListingRulesSchema,
  ListingSchema,
  ListingStatusSchema,
  SessionTypeSchema,
} from '../schemas/listing.schema'
import type { z } from 'zod'

export type Listing = z.infer<typeof ListingSchema>
export type ListingStatus = z.infer<typeof ListingStatusSchema>
export type SessionType = z.infer<typeof SessionTypeSchema>
export type ListingRules = z.infer<typeof ListingRulesSchema>
export type ListingClientContact = z.infer<typeof ListingClientContactSchema>
export type ListingClaim = z.infer<typeof ListingClaimSchema>
export type Claim = z.infer<typeof ClaimSchema>
export type CreateClaimRequest = z.input<typeof CreateClaimSchema>
export type CreateListingRequest = z.infer<typeof CreateListingSchema>

/** GET /listings feed süzgeçleri (uzman). */
export type ListingListFilters = {
  specialization?: string[]
  budgetMin?: number
  budgetMax?: number
  sessionType?: string[]
  /** İl adı (ör. "İstanbul"). */
  city?: string
  /** Yalnız bu uzmanın davetiyle gelen danışanların ilanları. */
  invitedOnly?: boolean
}

/** Sunucunun tanıdığı sıralamalar; bilinmeyen değer "en yeni"ye düşer. */
export type ListingSort = 'newest' | 'budget_desc' | 'budget_asc' | 'offer_asc' | 'fee_asc'

export type ListingListParams = Omit<ListingListFilters, 'invitedOnly'> & {
  invitedOnly?: true
  sort?: string
}
