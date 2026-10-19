import { fireEvent } from '@testing-library/react-native'

import { CreateListingScreen } from './CreateListingScreen'

import { useAuthStore } from '@/domains/auth'
import { makeListing } from '@/test-utils/fixtures'
import { TEST_CLIENT } from '@/test-utils/query'
import { mockRouter, queryResult, renderScreen } from '@/test-utils/screen'

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
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn(async () => undefined) }))

const mockMyListings = jest.fn()
const mockCreate = jest.fn()
const mockCreated: { data: unknown } = { data: undefined }

jest.mock('@/domains/listing/api/useListingRulesQuery', () => ({
  useListingRulesQuery: () => ({
    data: {
      budgetMinTry: 500,
      budgetMaxTry: null,
      titleMin: 10,
      titleMax: 100,
      descriptionMax: 2000,
      cityRequiredFor: ['yüz_yüze', 'yüz_yüze_online'],
      maxActive: 3,
    },
    isLoading: false,
  }),
}))
jest.mock('@/domains/listing/api/useMyListingsQuery', () => ({
  useMyListingsQuery: () => mockMyListings(),
}))
jest.mock('@/domains/listing/api/useCreateListingMutation', () => ({
  useCreateListingMutation: () => ({
    mutate: mockCreate,
    isPending: false,
    data: mockCreated.data,
  }),
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
    isLoading: false,
  }),
}))
jest.mock('@/domains/assessment/api/useMyAssessmentResultsQuery', () => ({
  useMyAssessmentResultsQuery: () => ({ data: { data: [] } }),
}))

function myListings(activeCount: number) {
  return queryResult({ data: [], meta: { page: 1, total: activeCount, perPage: 20, activeCount } })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockCreated.data = undefined
  mockMyListings.mockReturnValue(myListings(1))
  useAuthStore.setState({ user: { ...TEST_CLIENT, phone: null, city: 'Konya' }, role: 'client' })
})

describe('CreateListingScreen', () => {
  it('7 adımı dolaşıp yayınlar (rıza zorunlu, telefon istenir)', () => {
    const { getByText, getByTestId, getByLabelText } = renderScreen(
      <CreateListingScreen initialSpecialization="Kaygı" />
    )
    expect(getByText('Neyle ilgili destek arıyorsun?')).toBeTruthy()
    expect(getByText('1/7')).toBeTruthy()
    fireEvent.changeText(getByTestId('listing-title'), 'Sınav dönemlerinde yoğun kaygı')
    fireEvent.changeText(getByTestId('listing-description'), 'Uyuyamıyorum.')
    expect(getByText('Zayıf')).toBeTruthy()
    fireEvent.press(getByTestId('listing-new-next'))

    expect(getByText('Hangi konularda?')).toBeTruthy()
    fireEvent.press(getByTestId('listing-new-next'))

    expect(getByText('Nasıl görüşmek istersin?')).toBeTruthy()
    fireEvent.press(getByText('Yüz yüze'))
    expect(getByText('Yüz yüze görüşme için zorunlu')).toBeTruthy()
    fireEvent.press(getByTestId('listing-new-next'))

    expect(getByText('Ne kadar ayırabilirsin?')).toBeTruthy()
    expect(getByText('Seans başı bütçen en az ₺500 olmalı; üst sınır yok.')).toBeTruthy()
    fireEvent.press(getByTestId('listing-new-next'))

    expect(getByText('Bir test sonucu ekle')).toBeTruthy()
    fireEvent.press(getByTestId('listing-new-next'))

    expect(getByText('Kimler görecek?')).toBeTruthy()
    expect(getByText('Devam etmek için izni işaretle')).toBeTruthy()
    expect(getByText('KVKK Aydınlatma Metni')).toBeTruthy()
    fireEvent.press(getByLabelText('İletişim izni'))
    fireEvent.changeText(getByTestId('listing-phone'), '05000000000')
    fireEvent.press(getByTestId('listing-new-next'))

    expect(getByText('Uzmanlar böyle görecek')).toBeTruthy()
    fireEvent.press(getByText('Yayınla'))
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Sınav dönemlerinde yoğun kaygı',
        city: 'Konya',
        preferredSessionType: 'yüz_yüze',
        contactConsent: true,
        phone: '05000000000',
      }),
      expect.any(Object)
    )
  })

  it('yayınlanınca başarı ekranı; ilan sınırında uyarı', () => {
    mockCreated.data = makeListing({ status: 'PENDING_APPROVAL' })
    const done = renderScreen(<CreateListingScreen />)
    expect(done.getByText('İlan yayınlandı, incelemede')).toBeTruthy()
    fireEvent.press(done.getByText('İlanımı gör'))
    expect(mockRouter.replace).toHaveBeenCalledWith('/listing/01a025d8-f8c9-78db-aa2b-aa72da13dfae')
    done.unmount()

    mockCreated.data = undefined
    mockMyListings.mockReturnValue(myListings(3))
    const limit = renderScreen(<CreateListingScreen />)
    expect(limit.getByText('3 açık ilan sınırındasın')).toBeTruthy()
    fireEvent.press(limit.getByText('İlanlarıma git'))
    expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/offers')
  })
})
