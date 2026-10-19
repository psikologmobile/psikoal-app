import {
  OFFER_COMPOSER_BLOCK_TEXT,
  isOfferContactVisible,
  matchesOfferFilter,
  offerTone,
  resolveOfferComposerState,
} from './expertOffer'

import { ApiError } from '@/lib/api'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
}))
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}))

const QUOTE = {
  feeKurus: 62500,
  feeLabel: '₺625',
  balanceKurus: 125000,
  balanceLabel: '₺1.250',
  freeOfferRights: 0,
  willUseFreeRight: false,
  balanceAfterKurus: 62500,
  balanceAfterLabel: '₺625',
  sufficient: true,
}
const OPEN = { viewerHasOffered: false, status: 'OPEN' }
const base = {
  isLoading: false,
  isPendingApproval: false,
  isRejected: false,
  listing: OPEN,
  quote: QUOTE,
  quoteFailed: false,
  submitError: null as unknown,
}
const apiError = (code: string, meta?: Record<string, unknown>) =>
  new ApiError(code, code, 409, undefined, meta)

describe('resolveOfferComposerState', () => {
  it('normal, free and fee-changed', () => {
    expect(resolveOfferComposerState(base)).toBe('normal')
    const free = { ...QUOTE, willUseFreeRight: true }
    expect(resolveOfferComposerState({ ...base, quote: free })).toBe('free')
    const changed = apiError('OFFER_FEE_CHANGED', { feeKurus: 57500, feeLabel: '₺575' })
    expect(resolveOfferComposerState({ ...base, submitError: changed })).toBe('feeChanged')
  })

  it('insufficient balance from quote or server', () => {
    const low = { ...QUOTE, sufficient: false }
    expect(resolveOfferComposerState({ ...base, quote: low })).toBe('insufficient')
    const err = apiError('INSUFFICIENT_BALANCE')
    expect(resolveOfferComposerState({ ...base, submitError: err })).toBe('insufficient')
  })

  it('profile blocks', () => {
    expect(resolveOfferComposerState({ ...base, isPendingApproval: true })).toBe('pendingApproval')
    const notApproved = apiError('OFFER_EXPERT_NOT_APPROVED')
    expect(resolveOfferComposerState({ ...base, submitError: notApproved })).toBe('pendingApproval')
    expect(resolveOfferComposerState({ ...base, isRejected: true })).toBe('rejected')
  })

  it('listing blocks', () => {
    const offered = { viewerHasOffered: true, status: 'OPEN' }
    expect(resolveOfferComposerState({ ...base, listing: offered })).toBe('alreadyOffered')
    const exists = apiError('OFFER_ALREADY_EXISTS')
    expect(resolveOfferComposerState({ ...base, submitError: exists })).toBe('alreadyOffered')
    const closed = { ...OPEN, status: 'CLOSED' }
    expect(resolveOfferComposerState({ ...base, listing: closed })).toBe('listingClosed')
    const notOpen = apiError('OFFER_LISTING_NOT_OPEN')
    expect(resolveOfferComposerState({ ...base, submitError: notOpen })).toBe('listingClosed')
  })

  it('error and loading', () => {
    expect(resolveOfferComposerState({ ...base, submitError: new Error('x') })).toBe('error')
    expect(resolveOfferComposerState({ ...base, quote: undefined, quoteFailed: true })).toBe(
      'error'
    )
    expect(resolveOfferComposerState({ ...base, isLoading: true, quote: undefined })).toBe(
      'loading'
    )
  })

  it('has a block text for blocked states', () => {
    expect(OFFER_COMPOSER_BLOCK_TEXT.alreadyOffered).toContain('zaten teklif verdin')
    expect(OFFER_COMPOSER_BLOCK_TEXT.normal).toBeUndefined()
  })
})

describe('offer view helpers', () => {
  it('maps tones, filters and contact visibility', () => {
    expect(offerTone({ status: 'ACCEPTED' })).toBe('selected')
    expect(offerTone({ status: 'PENDING' })).toBe('live')
    expect(offerTone({ status: 'WITHDRAWN' })).toBe('closed')
    expect(matchesOfferFilter({ statusLabel: 'Gönderildi' }, 'Tümü')).toBe(true)
    expect(matchesOfferFilter({ statusLabel: 'Gönderildi' }, 'Seçildi')).toBe(false)
    const contact = { fullName: 'Ayşe Yılmaz', phone: null, email: 'a@b.c' }
    expect(isOfferContactVisible({ status: 'PENDING', clientContact: contact })).toBe(true)
    expect(isOfferContactVisible({ status: 'WITHDRAWN', clientContact: contact })).toBe(false)
    expect(isOfferContactVisible({ status: 'ACCEPTED', clientContact: null })).toBe(false)
  })
})
