import { act, fireEvent } from '@testing-library/react-native'

import { ClientOfferDetailScreen } from './ClientOfferDetailScreen'

import { makeOffer } from '@/test-utils/fixtures'
import {
  errorQuery,
  loadingQuery,
  mockRouter,
  queryResult,
  renderScreen,
} from '@/test-utils/screen'

jest.mock('expo-router', () => require('@/test-utils/screen').expoRouterMock)
jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@/test-utils/screen').asyncStorageMock
)
jest.mock('expo-secure-store', () => require('@/test-utils/screen').secureStoreMock)
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
)

const mockOffer = jest.fn()
const mockMarkMatched = jest.fn()

jest.mock('@/domains/offer/api/useOfferDetailQuery', () => ({
  useOfferDetailQuery: () => mockOffer(),
}))
jest.mock('@/domains/listing/api/useMarkMatchedMutation', () => ({
  useMarkMatchedMutation: () => ({
    mutate: mockMarkMatched,
    reset: jest.fn(),
    isPending: false,
    error: null,
  }),
}))

const offer = makeOffer({ status: 'PENDING', statusLabel: 'Gönderildi' })

beforeEach(() => {
  jest.clearAllMocks()
  mockOffer.mockReturnValue(queryResult(offer))
})

describe('ClientOfferDetailScreen', () => {
  it('uzman özeti, ücret, not ve "Bu uzmanla anlaştım" onayı', () => {
    const { getByText, getByTestId, getByLabelText } = renderScreen(
      <ClientOfferDetailScreen offerId={offer.id} />
    )
    expect(getByText('Mehmet Demir')).toBeTruthy()
    expect(getByText('Gönderildi')).toBeTruthy()
    expect(getByText(offer.description)).toBeTruthy()
    expect(getByText('İlgili ilan')).toBeTruthy()

    fireEvent.press(getByLabelText('Mehmet Demir profilini gör'))
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/expert/[id]',
      params: { id: offer.expertId, offerId: offer.id },
    })

    fireEvent.press(getByTestId('offer-agree'))
    expect(getByText('Mehmet Demir ile eşleşilsin mi?')).toBeTruthy()
    fireEvent.press(getByTestId('match-confirm'))
    const { onSuccess } = mockMarkMatched.mock.calls[0]?.[1] as {
      onSuccess: (r: { matchId: string }) => void
    }
    act(() => onSuccess({ matchId: 'm-9' }))
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/match/[id]',
      params: { id: 'm-9', celebrate: '1' },
    })
  })

  it('kapanmış teklifte anlaşma düğmesi yok; yükleniyor ve hata', () => {
    mockOffer.mockReturnValue(queryResult(makeOffer({ status: 'REJECTED' })))
    const closed = renderScreen(<ClientOfferDetailScreen offerId="x" />)
    expect(closed.queryByTestId('offer-agree')).toBeNull()
    fireEvent.press(closed.getByText('Tüm tekliflere dön'))
    expect(mockRouter.replace).toHaveBeenCalledWith(`/listing/${offer.listingId}`)
    closed.unmount()

    mockOffer.mockReturnValue(loadingQuery())
    const loading = renderScreen(<ClientOfferDetailScreen offerId="x" />)
    expect(loading.getAllByLabelText('Yükleniyor').length).toBeGreaterThan(0)
    loading.unmount()

    mockOffer.mockReturnValue(errorQuery())
    expect(
      renderScreen(<ClientOfferDetailScreen offerId="x" />).getByText('Teklif bulunamadı')
    ).toBeTruthy()
  })
})
