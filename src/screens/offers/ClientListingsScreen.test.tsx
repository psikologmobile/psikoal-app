import { fireEvent } from '@testing-library/react-native'

import { ClientListingsScreen } from './ClientListingsScreen'

import { makeListing } from '@/test-utils/fixtures'
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

const mockMyListings = jest.fn()
jest.mock('@/domains/listing/api/useMyListingsQuery', () => ({
  useMyListingsQuery: (status?: string) => mockMyListings(status),
}))
jest.mock('@/domains/listing/api/useListingRulesQuery', () => ({
  useListingRulesQuery: () => ({ data: undefined }),
}))

const listing = makeListing({ status: 'OPEN', offerCount: 4, expiresAt: null })

beforeEach(() => {
  jest.clearAllMocks()
  mockMyListings.mockImplementation((status?: string) =>
    queryResult({
      data: status && status !== 'OPEN' ? [] : [listing],
      meta: { page: 1, total: 1, perPage: 20, activeCount: 2 },
    })
  )
})

describe('ClientListingsScreen', () => {
  it('kota, 7 süzgeç ve ilan kartı', () => {
    const { getByText, getByTestId, getAllByTestId } = renderScreen(<ClientListingsScreen />)
    expect(getByText('İlanlarım')).toBeTruthy()
    expect(getByText('2 / 3 açık ilan')).toBeTruthy()
    expect(getAllByTestId(/listing-filter-/)).toHaveLength(7)
    expect(getByText('Hatırlatma var')).toBeTruthy()
    fireEvent.press(getByTestId(`ad-card-${listing.id}`))
    expect(mockRouter.push).toHaveBeenCalledWith(`/listing/${listing.id}`)
  })

  it('süzgeçte ilan yoksa boş durum metni değişir', () => {
    const { getByTestId, getByText } = renderScreen(<ClientListingsScreen />)
    fireEvent.press(getByTestId('listing-filter-MATCHED'))
    expect(mockMyListings).toHaveBeenLastCalledWith('MATCHED')
    expect(getByText('Bu durumda ilanın yok')).toBeTruthy()
    fireEvent.press(getByText('Yeni ilan aç'))
    expect(mockRouter.push).toHaveBeenCalledWith('/listing/new')
  })

  it('hiç ilan yok, yükleniyor, hata', () => {
    mockMyListings.mockReturnValue(
      queryResult({ data: [], meta: { page: 1, total: 0, perPage: 20, activeCount: 0 } })
    )
    const empty = renderScreen(<ClientListingsScreen />)
    expect(empty.getByText('Henüz ilan açmadın')).toBeTruthy()
    empty.unmount()

    mockMyListings.mockReturnValue(loadingQuery())
    const loading = renderScreen(<ClientListingsScreen />)
    expect(loading.getAllByLabelText('Yükleniyor').length).toBeGreaterThan(0)
    loading.unmount()

    mockMyListings.mockReturnValue(errorQuery())
    expect(renderScreen(<ClientListingsScreen />).getByText('İlanların yüklenemedi')).toBeTruthy()
  })
})
