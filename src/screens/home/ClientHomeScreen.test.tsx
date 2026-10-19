import { fireEvent } from '@testing-library/react-native'

import { ClientHomeScreen } from './ClientHomeScreen'

import { useAuthStore } from '@/domains/auth'
import { makeListing, makeOffer } from '@/test-utils/fixtures'
import { TEST_CLIENT } from '@/test-utils/query'
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
const mockReferrer = jest.fn()
const mockDismiss = jest.fn()
const mockOffers = jest.fn()

jest.mock('@/domains/listing/api/useMyListingsQuery', () => ({
  useMyListingsQuery: () => mockMyListings(),
}))
jest.mock('@/domains/listing/api/useListingRulesQuery', () => ({
  useListingRulesQuery: () => ({ data: undefined, refetch: jest.fn() }),
}))
jest.mock('@/domains/listing/api/useDismissClaimMutation', () => ({
  useDismissClaimMutation: () => ({ mutate: mockDismiss }),
}))
jest.mock('@/domains/auth/api/useReferrerQuery', () => ({
  useReferrerQuery: () => mockReferrer(),
}))
jest.mock('@/domains/offer/api/useListingOffersQuery', () => ({
  useListingOffersQuery: () => mockOffers(),
}))
jest.mock('@/domains/assessment/hooks/usePlayableAssessments', () => ({
  usePlayableAssessments: () => ({
    data: [
      { id: 't1', title: 'Kaygı ölçeği', category: 'kaygi', estimatedMinutes: 3, questionCount: 7 },
    ],
    isLoading: false,
    refetch: jest.fn(),
  }),
}))
jest.mock('@/domains/assessment/api/useMyAssessmentResultsQuery', () => ({
  useMyAssessmentResultsQuery: () => ({
    data: {
      data: [
        {
          id: 'r1',
          assessmentId: 't1',
          assessmentTitle: 'Kaygı ölçeği',
          score: 14,
          level: 'moderate',
          summary: 'Belirgin',
          suggestions: [],
          createdAt: '2026-10-12T10:00:00Z',
        },
      ],
      meta: { page: 1, total: 1, perPage: 20 },
    },
    refetch: jest.fn(),
  }),
}))
jest.mock('@/domains/blog/api/useBlogListQuery', () => ({
  useBlogListQuery: () => ({ data: { data: [] }, isLoading: false, refetch: jest.fn() }),
}))
jest.mock('@/domains/category/api/useCategoriesQuery', () => ({
  useCategoriesQuery: () => ({
    data: [
      {
        id: 'c1',
        slug: 'kaygi',
        name: 'Kaygı',
        icon: 'Brain',
        summary: '',
        description: '',
        blogTag: 'kaygi',
        assessmentCategory: null,
      },
    ],
    refetch: jest.fn(),
  }),
}))
jest.mock('@/domains/notification/hooks/useUnreadNotificationCount', () => ({
  useUnreadNotificationCount: () => 3,
}))

const open = makeListing({ status: 'OPEN', expiresAt: null })

function listingsResult(listings = [open], total = listings.length) {
  return queryResult({
    data: listings,
    meta: { page: 1, total, perPage: 20, activeCount: listings.length },
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  useAuthStore.setState({ user: { ...TEST_CLIENT, phone: null }, role: 'client' })
  mockMyListings.mockReturnValue(listingsResult())
  mockReferrer.mockReturnValue(queryResult(null))
  mockOffers.mockReturnValue(queryResult({ data: [makeOffer({ status: 'PENDING' })] }))
})

describe('ClientHomeScreen', () => {
  it('normal: selam, hero, hatırlatma, aktif ilan, testler, konular', () => {
    const { getByText, getByLabelText, getByTestId } = renderScreen(<ClientHomeScreen />)
    expect(getByText('Zeynep')).toBeTruthy()
    expect(getByLabelText('Bildirimler, 3 okunmamış')).toBeTruthy()
    expect(getByText('Nasıl bir destek arıyorsun?')).toBeTruthy()
    expect(getByText('2 ilan hakkın kaldı')).toBeTruthy()
    expect(getByText('Aktif ilanın')).toBeTruthy()
    expect(getByText('Son teklif 32 dakika önce')).toBeTruthy()
    expect(getByText('7 soru · Son sonuç: Orta')).toBeTruthy()
    expect(getByTestId('category-item-kaygi')).toBeTruthy()

    fireEvent.press(getByText('Anlaşmadım'))
    expect(mockDismiss).toHaveBeenCalledWith({
      listingId: open.id,
      expertId: 'c519bd04-67c3-4e6a-af6f-f88999a8a53f',
    })
    fireEvent.press(getByText('İlanıma git'))
    expect(mockRouter.push).toHaveBeenCalledWith(`/listing/${open.id}`)
    fireEvent.press(getByLabelText('Yeni ilan aç'))
    expect(mockRouter.push).toHaveBeenCalledWith('/listing/new')
  })

  it('davet eden uzman kartı profile gider', () => {
    mockReferrer.mockReturnValue(
      queryResult({
        id: 'e1',
        name: 'Uzm. Psk. Elif Kaya',
        title: 'Klinik Psikolog',
        avatarUrl: null,
        initials: 'EK',
      })
    )
    const { getByText, getByTestId } = renderScreen(<ClientHomeScreen />)
    expect(getByText('Seni davet eden uzman')).toBeTruthy()
    fireEvent.press(getByTestId('referrer-card'))
    expect(mockRouter.push).toHaveBeenCalledWith('/expert/e1')
  })

  it('ilk kez: ilan yok kartı ve ilan hakkı', () => {
    mockMyListings.mockReturnValue(listingsResult([], 0))
    const { getByText, queryByText } = renderScreen(<ClientHomeScreen />)
    expect(getByText('Henüz ilanın yok')).toBeTruthy()
    expect(getByText('3 ilan hakkın var')).toBeTruthy()
    expect(queryByText('Aktif ilanın')).toBeNull()
  })

  it('yükleniyor ve hata', () => {
    mockMyListings.mockReturnValue(loadingQuery())
    const loading = renderScreen(<ClientHomeScreen />)
    expect(loading.getAllByLabelText('Yükleniyor').length).toBeGreaterThan(0)
    loading.unmount()

    const failed = errorQuery()
    mockMyListings.mockReturnValue(failed)
    const { getByText } = renderScreen(<ClientHomeScreen />)
    expect(getByText('Bağlantı kurulamadı')).toBeTruthy()
    fireEvent.press(getByText('Tekrar dene'))
    expect(failed.refetch).toHaveBeenCalled()
  })
})
