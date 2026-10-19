export {
  useListingListQuery,
  toListingListParams,
  useMyListingsQuery,
  useListingDetailQuery,
  useListingRulesQuery,
  useCreateListingMutation,
  useCloseListingMutation,
  useMarkMatchedMutation,
  useCreateClaimMutation,
  useDismissClaimMutation,
} from './api'

export {
  listingKeys,
  LISTING_STATUS_CONFIG,
  LISTING_MAX_ACTIVE,
  LISTING_EXPIRE_DAYS,
  LISTING_ERROR_CODES,
  SESSION_TYPE_LABELS,
  SESSION_MODE_LABELS,
  OPPORTUNITY_SORTS,
  OPPORTUNITY_BUDGETS,
} from './listing.constants'

export {
  ListingSchema,
  ListingStatusSchema,
  SessionTypeSchema,
  ListingClientContactSchema,
  ListingClaimSchema,
  ListingRulesSchema,
  ListingRulesResponseSchema,
  MarkMatchedResponseSchema,
  ClaimSchema,
  ClaimResponseSchema,
  CreateClaimSchema,
  CLAIM_NOTE_MAX,
  CreateListingSchema,
  DEFAULT_LISTING_RULES,
  createListingSchemaFor,
} from './schemas/listing.schema'

export type {
  Listing,
  ListingStatus,
  SessionType,
  ListingRules,
  ListingClientContact,
  ListingClaim,
  Claim,
  CreateClaimRequest,
  CreateListingRequest,
  ListingListFilters,
  ListingSort,
} from './types/listing.types'

export { ExpertListingCard } from './components/expert/ExpertListingCard'
export type { ExpertListingCardProps } from './components/expert/ExpertListingCard'
export { FeeFooter } from './components/expert/FeeFooter'
export { InvitedBadge } from './components/expert/InvitedBadge'
export {
  OpportunityFilterFields,
  OpportunityFilterSheet,
  withBudget,
} from './components/expert/OpportunityFilterSheet'
export type { OpportunityFilters } from './components/expert/OpportunityFilterSheet'

export { useOpportunityFeed, countActiveFilters, toQueryFilters } from './hooks/useOpportunityFeed'
export type { OpportunityChip } from './hooks/useOpportunityFeed'

export {
  expertListingAction,
  expertListingTags,
  offerCountText,
  clientInitial,
  resolveExpertListingDetail,
} from './utils/expertListing'
export type { ExpertListingAction, ExpertListingDetailView } from './utils/expertListing'

export {
  CLIENT_LISTING_STATUS,
  CLIENT_SESSION_MODE_LABELS,
  listingDaysLeft,
  listingBudgetLabel,
  listingTags,
  hasOpenClaim,
  offerCountLabel,
  adCardView,
  listingQuotaNote,
  pickActiveListing,
  firstClaimReminder,
} from './utils/listingView'

export { useMatchConfirm } from './hooks/useMatchConfirm'
export type { MatchTarget } from './hooks/useMatchConfirm'

export { AdCard } from './components/AdCard'
export type { AdCardProps } from './components/AdCard'
export { MatchConfirmSheet, MATCH_CONFIRM_TEXT } from './components/MatchConfirmSheet'
export type { MatchConfirmSheetProps } from './components/MatchConfirmSheet'
export { ActiveListingCard } from './components/ActiveListingCard'
export type { ActiveListingCardProps } from './components/ActiveListingCard'

export {
  DESCRIPTION_FULL_CHARS,
  BUDGET_CELL_COUNT,
  BUDGET_PRESETS,
  descriptionStrength,
  budgetScale,
  budgetRangeLabel,
  budgetRuleText,
  shortClientName,
} from './utils/createListingView'
export { useCreateListingWizard, CREATE_LISTING_STEPS } from './hooks/useCreateListingWizard'
export type { CreateListingValues, CreateListingErrors } from './hooks/useCreateListingWizard'
