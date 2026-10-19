import { fireEvent } from '@testing-library/react-native'

import { ExpertProfileScreen } from './ExpertProfileScreen'

import { useAuthStore } from '@/domains/auth'
import { TEST_CLIENT, TEST_EXPERT } from '@/test-utils/query'
import { mockRouter, renderScreen } from '@/test-utils/screen'

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

const mockAccess = jest.fn()
jest.mock('@/domains/expert/hooks/useExpertProfileAccess', () => ({
  useExpertProfileAccess: () => mockAccess(),
}))
jest.mock('@/domains/expert/api/useExpertReviewsQuery', () => ({
  useExpertReviewsQuery: () => ({
    data: [
      {
        id: '5b1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d4e',
        expertId: '3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
        rating: 5,
        comment: 'Çok sakin ve anlaşılır.',
        sessionType: 'online',
        createdAt: '2026-09-10T10:00:00Z',
      },
    ],
    isLoading: false,
    refetch: jest.fn(),
  }),
}))

const EXPERT = {
  id: TEST_EXPERT.id,
  firstName: 'Elif',
  lastName: 'Kaya',
  title: 'Klinik Psikolog',
  specializations: ['Kaygı', 'Stres'],
  experienceYears: 8,
  bio: 'Bilişsel davranışçı terapi ile çalışıyorum.',
  avatarUrl: null,
  rating: 4.9,
  reviewCount: 38,
  isVerified: true,
  status: 'approved' as const,
  initials: 'EK',
  acceptsOffers: true,
  education: 'Ankara Üniversitesi Psikoloji',
  certificates: ['BDT Uygulayıcı'],
  personalWebsite: null,
}

beforeEach(() => {
  jest.clearAllMocks()
  useAuthStore.setState({ user: TEST_CLIENT, role: 'client' })
  mockAccess.mockReturnValue({ state: 'visible', expert: EXPERT, refetch: jest.fn() })
})

describe('ExpertProfileScreen', () => {
  it('danışan: profil, istatistik, belgeler, yorumlar ve anlaşma düğmesi', () => {
    const { getByText, queryByText } = renderScreen(
      <ExpertProfileScreen expertId={EXPERT.id} offerId="o-1" />
    )
    expect(getByText('Elif Kaya')).toBeTruthy()
    expect(getByText('4,9')).toBeTruthy()
    expect(getByText('8 yıl')).toBeTruthy()
    expect(getByText('Çok sakin ve anlaşılır.')).toBeTruthy()
    expect(queryByText('Danışanların gördüğü profilin')).toBeNull()
    expect(queryByText(/davet/i)).toBeNull()

    fireEvent.press(getByText('Eğitim ve belgeler'))
    expect(getByText(/BDT Uygulayıcı/)).toBeTruthy()

    fireEvent.press(getByText('Bu uzmanla anlaştım'))
    expect(mockRouter.push).toHaveBeenCalledWith('/offer/o-1')
  })

  it('kendi profili + onay bekliyor; teklif yoksa düğme yok', () => {
    useAuthStore.setState({ user: TEST_EXPERT, role: 'expert' })
    mockAccess.mockReturnValue({
      state: 'visible',
      expert: { ...EXPERT, status: 'pending' },
      refetch: jest.fn(),
    })
    const { getByText, queryByText } = renderScreen(<ExpertProfileScreen expertId={EXPERT.id} />)
    expect(getByText('Danışanların gördüğü profilin')).toBeTruthy()
    expect(
      getByText('Profilin onay bekliyor. Onaylanınca danışanlar seni bu şekilde görecek.')
    ).toBeTruthy()
    expect(queryByText('Bu uzmanla anlaştım')).toBeNull()
  })

  it('görüntülenemiyor, yükleniyor, hata', () => {
    mockAccess.mockReturnValue({ state: 'notVisible', expert: undefined, refetch: jest.fn() })
    const hidden = renderScreen(<ExpertProfileScreen expertId="x" />)
    expect(hidden.getByText('Bu profil görüntülenemiyor')).toBeTruthy()
    hidden.unmount()

    mockAccess.mockReturnValue({ state: 'loading', expert: undefined, refetch: jest.fn() })
    const loading = renderScreen(<ExpertProfileScreen expertId="x" />)
    expect(loading.getAllByLabelText('Yükleniyor').length).toBeGreaterThan(0)
    loading.unmount()

    const refetch = jest.fn()
    mockAccess.mockReturnValue({ state: 'error', expert: undefined, refetch })
    const failed = renderScreen(<ExpertProfileScreen expertId="x" />)
    fireEvent.press(failed.getByText('Tekrar dene'))
    expect(refetch).toHaveBeenCalled()
  })
})
