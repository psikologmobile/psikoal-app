import { act, fireEvent } from '@testing-library/react-native'

import { ClientListingDetailScreen } from './ClientListingDetailScreen'

import { makeListing, makeOffer } from '@/test-utils/fixtures'
import {
  errorQuery,
  COMPACT_LAYOUT,
  loadingQuery,
  mockLayout,
  mockRouter,
  queryResult,
  renderScreen,
  WIDE_LAYOUT,
} from '@/test-utils/screen'

jest.mock('expo-router', () => require('@/test-utils/screen').expoRouterMock)
jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@/test-utils/screen').asyncStorageMock
)
jest.mock('expo-secure-store', () => require('@/test-utils/screen').secureStoreMock)
jest.mock('@/core/hooks/useBreakpoint', () => require('@/test-utils/screen').breakpointMock)
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
)

const mockListing = jest.fn()
const mockOffers = jest.fn()
const mockDismiss = jest.fn()
const mockClose = jest.fn()
const mockMarkMatched = jest.fn()

jest.mock('@/domains/listing/api/useListingDetailQuery', () => ({
  useListingDetailQuery: () => mockListing(),
}))
jest.mock('@/domains/offer/api/useListingOffersQuery', () => ({
  useListingOffersQuery: () => mockOffers(),
}))
jest.mock('@/domains/listing/api/useDismissClaimMutation', () => ({
  useDismissClaimMutation: () => ({ mutate: mockDismiss, isPending: false }),
}))
jest.mock('@/domains/listing/api/useCloseListingMutation', () => ({
  useCloseListingMutation: () => ({ mutate: mockClose, isPending: false, error: null }),
}))
jest.mock('@/domains/listing/api/useMarkMatchedMutation', () => ({
  useMarkMatchedMutation: () => ({
    mutate: mockMarkMatched,
    reset: jest.fn(),
    isPending: false,
    error: null,
  }),
}))
jest.mock('@/domains/notification/hooks/usePushTokenRegistration', () => ({
  usePushTokenRegistration: jest.fn(),
}))

const EXPERT_ID = 'c519bd04-67c3-4e6a-af6f-f88999a8a53f'
const LISTING_ID = '01a025d8-f8c9-78db-aa2b-aa72da13dfae'
const claimedOffer = makeOffer({
  id: '11111111-2222-4333-8444-555555555555',
  expertId: EXPERT_ID,
  status: 'PENDING',
  price: 2400,
  expert: {
    id: EXPERT_ID,
    name: 'Elif Kaya',
    title: 'Klinik Psikolog',
    initials: 'EK',
    rating: 4.9,
  },
})
const otherOffer = makeOffer({ status: 'PENDING', price: 1900 })

function render(listing = makeListing({ status: 'OPEN', expiresAt: null })) {
  mockListing.mockReturnValue(queryResult(listing))
  return renderScreen(<ClientListingDetailScreen listingId={LISTING_ID} />)
}

beforeEach(() => {
  jest.clearAllMocks()
  mockOffers.mockReturnValue(queryResult({ data: [otherOffer, claimedOffer] }))
})

describe('ClientListingDetailScreen', () => {
  it('yayında: hatırlatma, sıralama, ClaimBadge ve eşleş onayı', () => {
    const { getByText, getAllByText, getByTestId } = render()
    expect(getByText('Yayında')).toBeTruthy()
    expect(getByText('Teklifler (2)')).toBeTruthy()
    expect(getByText('Anlaştık dedi')).toBeTruthy()

    fireEvent.press(getByText('En düşük ücret'))
    fireEvent.press(getByText('En yüksek puan'))

    fireEvent.press(getByText('İşaretle'))
    expect(getByText('Elif Kaya ile eşleşilsin mi?')).toBeTruthy()
    fireEvent.press(getByTestId('match-confirm'))
    expect(mockMarkMatched).toHaveBeenCalledWith(
      { listingId: LISTING_ID, offerId: claimedOffer.id },
      expect.any(Object)
    )
    const { onSuccess } = mockMarkMatched.mock.calls[0]?.[1] as {
      onSuccess: (r: { matchId: string }) => void
    }
    act(() => onSuccess({ matchId: 'm-1' }))
    expect(mockRouter.replace).toHaveBeenCalledWith('/match/m-1/celebrate')

    fireEvent.press(getByText('Anlaşmadım'))
    expect(mockDismiss).toHaveBeenCalledWith({ listingId: LISTING_ID, expertId: EXPERT_ID })
    expect(getAllByText('Anlaştım')).toHaveLength(2)
  })

  it('web: başlıkta durum ve kapat, teklif ızgarası, yan sütunda ilan özeti', () => {
    mockLayout.current = WIDE_LAYOUT
    const { getByText, getByTestId, getByLabelText } = render()
    expect(getByTestId('listing-detail-columns')).toBeTruthy()
    expect(getByText('Teklifler (2)')).toBeTruthy()
    expect(getByText('İlan özeti')).toBeTruthy()
    expect(getByText('Açıldı')).toBeTruthy()
    fireEvent.press(getByText('İlanı kapat'))
    expect(getByText('İlanın kapanacak ve yeni teklif gelmeyecek.')).toBeTruthy()
    fireEvent.press(getByLabelText('Geri: İlanlarım'))
    expect(mockRouter.navigate).toHaveBeenCalledWith('/(tabs)/offers')
    mockLayout.current = COMPACT_LAYOUT
  })

  it('ilanı kapat sheet’i kapatma isteği gönderir', () => {
    const { getByText, getAllByText } = render()
    fireEvent.press(getByText('İlanı kapat'))
    expect(getByText('İlanın kapanacak ve yeni teklif gelmeyecek.')).toBeTruthy()
    const closeButtons = getAllByText('Kapat')
    const lastClose = closeButtons[closeButtons.length - 1]
    if (!lastClose) throw new Error('Kapat düğmesi yok')
    fireEvent.press(lastClose)
    expect(mockClose).toHaveBeenCalledWith(LISTING_ID, expect.any(Object))
  })

  it('teklif yok (radar), onay bekliyor, reddedildi, süresi doldu, eşleşti', () => {
    mockOffers.mockReturnValue(queryResult({ data: [] }))
    expect(render().getByText('Henüz teklif yok')).toBeTruthy()

    expect(
      render(makeListing({ status: 'PENDING_APPROVAL' })).getByText('İlanın incelemede.')
    ).toBeTruthy()

    const rejected = render(
      makeListing({ status: 'REJECTED_BY_ADMIN', rejectionReason: 'Açıklama yetersiz' })
    )
    expect(rejected.getByText('Açıklama yetersiz')).toBeTruthy()
    fireEvent.press(rejected.getByText('Yeniden düzenle'))
    expect(mockRouter.push).toHaveBeenCalledWith('/listing/new')

    mockOffers.mockReturnValue(queryResult({ data: [otherOffer] }))
    expect(
      render(makeListing({ status: 'EXPIRED' })).getByText(
        'İlanın 30 günü doldu ve kapandı. Gelen teklifleri hâlâ görebilirsin.'
      )
    ).toBeTruthy()

    mockOffers.mockReturnValue(
      queryResult({
        data: [makeOffer({ status: 'ACCEPTED', matchId: 'ed14dc39-8062-4216-bdfc-1e94d366075f' })],
      })
    )
    const matched = render(makeListing({ status: 'MATCHED' }))
    fireEvent.press(matched.getByText('Mehmet Demir ile eşleştin'))
    expect(mockRouter.push).toHaveBeenCalledWith('/match/ed14dc39-8062-4216-bdfc-1e94d366075f')
  })

  it('yükleniyor ve bulunamadı', () => {
    mockListing.mockReturnValue(loadingQuery())
    const loading = renderScreen(<ClientListingDetailScreen listingId={LISTING_ID} />)
    expect(loading.getAllByLabelText('Yükleniyor').length).toBeGreaterThan(0)
    loading.unmount()
    mockListing.mockReturnValue(errorQuery())
    const missing = renderScreen(<ClientListingDetailScreen listingId={LISTING_ID} />)
    expect(missing.getByText('İlan bulunamadı')).toBeTruthy()
  })
})
