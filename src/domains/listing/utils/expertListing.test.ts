import fixtures from '../schemas/__fixtures__/listings.response.json'
import { ListingSchema } from '../schemas/listing.schema'

import {
  clientInitial,
  expertListingAction,
  expertListingTags,
  offerCountText,
  resolveExpertListingDetail,
} from './expertListing'

import type { Listing } from '../types/listing.types'

const offered = ListingSchema.parse(fixtures.expertView)
const open: Listing = {
  ...offered,
  viewerHasOffered: false,
  viewerOfferId: null,
  clientContact: null,
  viewerClaim: null,
}

describe('expertListingAction', () => {
  it('shows "view offer" once the expert has offered', () => {
    expect(expertListingAction(offered, { canAct: false })).toBe('viewOffer')
  })
  it('locks when the profile is not approved or balance is empty', () => {
    expect(expertListingAction(open, { canAct: false })).toBe('locked')
    expect(expertListingAction(open, { canAct: true, isBalanceEmpty: true })).toBe('locked')
  })
  it('allows offering otherwise', () => {
    expect(expertListingAction(open, { canAct: true })).toBe('offer')
  })
})

describe('card helpers', () => {
  it('formats offer count, tags and initial', () => {
    expect(offerCountText(0)).toBe('Henüz teklif yok')
    expect(offerCountText(4)).toBe('4 uzman teklif verdi')
    expect(expertListingTags(open)).toEqual(['anksiyete', 'Online'])
    expect(
      expertListingTags({
        ...open,
        city: 'Konya',
        assessmentResult: {
          id: 'a',
          score: 14,
          level: 'moderate',
          summary: 's',
          assessmentTitle: 't',
        },
      })
    ).toEqual(['anksiyete', 'Online', 'Konya', 'Test sonucu var'])
    expect(clientInitial(open)).toBe('AY')
    expect(clientInitial({ ...open, client: undefined })).toBe('A')
    expect(clientInitial({ ...open, client: undefined, clientDisplayName: undefined })).toBe('D')
  })
})

describe('resolveExpertListingDetail', () => {
  const base = { isPendingApproval: false, isRejected: false, sufficient: true }

  it('can offer on an open listing', () => {
    expect(resolveExpertListingDetail({ ...base, listing: open })).toEqual({
      offered: false,
      canClaim: false,
      claimed: false,
      closedText: null,
      showFeeBar: true,
      blockLabel: null,
    })
  })

  it('opens contact and claim after offering', () => {
    expect(resolveExpertListingDetail({ ...base, listing: offered })).toMatchObject({
      offered: true,
      canClaim: true,
      claimed: true,
      showFeeBar: false,
    })
  })

  it('explains matched-with-other and closed listings', () => {
    const matched = { ...open, matchedWithOther: true, status: 'MATCHED' as const }
    expect(resolveExpertListingDetail({ ...base, listing: matched }).closedText).toContain(
      'başka bir uzmanla'
    )
    const expired = { ...open, status: 'EXPIRED' as const }
    expect(resolveExpertListingDetail({ ...base, listing: expired }).closedText).toContain(
      'kapandı ya da süresi doldu'
    )
    const mine = { ...offered, status: 'MATCHED' as const }
    expect(resolveExpertListingDetail({ ...base, listing: mine }).closedText).toBeNull()
  })

  it('blocks sending for pending/rejected profiles and low balance', () => {
    const pending = resolveExpertListingDetail({ ...base, isPendingApproval: true, listing: open })
    expect(pending.blockLabel).toBe('Profilin onay bekliyor')
    const rejected = resolveExpertListingDetail({ ...base, isRejected: true, listing: open })
    expect(rejected.blockLabel).toBe('Profilin onaylanmadı')
    const low = resolveExpertListingDetail({ ...base, sufficient: false, listing: open })
    expect(low.blockLabel).toBe('Bakiyen yetersiz')
  })
})
