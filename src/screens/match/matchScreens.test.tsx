import { act, fireEvent, screen } from '@testing-library/react-native'

import { MatchCelebrateScreen } from './MatchCelebrateScreen'
import { MatchDetailScreen } from './MatchDetailScreen'
import { MatchesScreen } from './MatchesScreen'

import { useAuthStore } from '@/domains/auth'
import { useCelebratedMatchesStore, useMatchDetailQuery, useMatchesQuery } from '@/domains/match'
import { TEST_CLIENT, TEST_EXPERT } from '@/test-utils/query'
import {
  COMPACT_LAYOUT,
  mockLayout,
  mockRouter,
  mockSearchParams,
  renderScreen,
  WIDE_LAYOUT,
} from '@/test-utils/screen'

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@/test-utils/screen').asyncStorageMock
)
jest.mock('expo-secure-store', () => require('@/test-utils/screen').secureStoreMock)
jest.mock('@/core/hooks/useBreakpoint', () => require('@/test-utils/screen').breakpointMock)

jest.mock('expo-router', () => ({
  ...require('@/test-utils/screen').expoRouterMock,
  Redirect: ({ href }: { href: string }) => {
    const { Text } = jest.requireActual('react-native')
    return <Text>{`redirect:${href}`}</Text>
  },
}))

jest.mock('@/domains/match', () => {
  const actual = jest.requireActual('@/domains/match')
  return { ...actual, useMatchesQuery: jest.fn(), useMatchDetailQuery: jest.fn() }
})
jest.mock('@/domains/expert', () => {
  const actual = jest.requireActual('@/domains/expert')
  return {
    ...actual,
    useMatchReview: () => ({
      submit: jest.fn(),
      isSubmitting: false,
      isDone: false,
      doneMessage: null,
      errorMessage: null,
    }),
  }
})

const UUID = '11111111-1111-4111-8111-111111111111'
const MATCH = {
  id: UUID,
  listingId: UUID,
  acceptedOfferId: UUID,
  clientId: UUID,
  expertId: UUID,
  status: 'ACTIVE' as const,
  createdAt: '2026-10-18T10:00:00.000Z',
  client: {
    id: UUID,
    fullName: 'Zeynep Yılmaz',
    email: 'zeynep@ornek.com',
    phone: '0500 000 00 00',
    createdAt: '2026-03-10T10:00:00.000Z',
  },
  expert: {
    id: UUID,
    name: 'Uzm. Psk. Elif Kaya',
    title: 'Klinik Psikolog',
    email: 'elif@ornek.com',
    phone: '0500 111 11 11',
  },
  listing: {
    id: UUID,
    title: 'Sınav dönemlerinde yoğun kaygı yaşıyorum',
    specialization: ['Kaygı'],
    budgetMin: 2000,
    budgetMax: 3000,
    budgetLabel: '₺2.000–₺3.000',
    preferredSessionType: 'online',
    status: 'MATCHED',
  },
  offer: {
    id: UUID,
    title: 'Kaygı odaklı BDT',
    price: 2400,
    description: 'İlk görüşmede birlikte yol haritası çıkaralım.',
    sessionType: 'online' as const,
    status: 'ACCEPTED',
  },
}

const matchesResult = (data: unknown[], extra: object = {}) =>
  ({
    data: {
      data,
      meta: { page: 1, total: data.length, perPage: 20, activeCount: data.length, pastCount: 0 },
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    isRefetching: false,
    ...extra,
  }) as unknown as ReturnType<typeof useMatchesQuery>

const detailResult = (extra: object = {}) =>
  ({
    data: MATCH,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    isRefetching: false,
    ...extra,
  }) as unknown as ReturnType<typeof useMatchDetailQuery>

beforeEach(() => {
  jest.clearAllMocks()
  mockSearchParams.current = { id: '11111111-1111-4111-8111-111111111111' }
  act(() => {
    useAuthStore.setState({ user: TEST_CLIENT, role: 'client', isAuthenticated: true })
    useCelebratedMatchesStore.setState({ ids: [] })
  })
  jest.mocked(useMatchDetailQuery).mockReturnValue(detailResult())
})

describe('Eşleşmelerim', () => {
  it('dolu liste: sayaç, kart ve detaya geçiş', () => {
    jest.mocked(useMatchesQuery).mockReturnValue(matchesResult([MATCH]))
    renderScreen(<MatchesScreen />)
    expect(screen.getByText('Aktif · 1')).toBeTruthy()
    expect(screen.getByText('Uzm. Psk. Elif Kaya')).toBeTruthy()
    expect(screen.getByText('₺2.400')).toBeTruthy()
    fireEvent.press(screen.getByTestId(`match-card-${UUID}`))
    expect(mockRouter.push).toHaveBeenCalledWith(`/match/${UUID}`)
  })

  it('boş durum (uzman metni)', () => {
    act(() => {
      useAuthStore.setState({ user: TEST_EXPERT, role: 'expert' })
    })
    jest.mocked(useMatchesQuery).mockReturnValue(matchesResult([]))
    renderScreen(<MatchesScreen />)
    expect(screen.getByText('Aktif eşleşmen yok')).toBeTruthy()
    expect(
      screen.getByText('Fırsatlar’dan teklif ver; danışan seni seçtiğinde burada görünür.')
    ).toBeTruthy()
  })

  it('hata durumu', () => {
    jest
      .mocked(useMatchesQuery)
      .mockReturnValue(matchesResult([], { data: undefined, isError: true }))
    renderScreen(<MatchesScreen />)
    expect(screen.getByText('Eşleşmeler yüklenemedi')).toBeTruthy()
  })
})

describe('Eşleşme detayı', () => {
  it('danışan: uzman iletişimi, teklif özeti, değerlendirme, sonlandırma yok', () => {
    renderScreen(<MatchDetailScreen />)
    expect(screen.getByText('Uzm. Psk. Elif Kaya')).toBeTruthy()
    expect(screen.getByText('elif@ornek.com')).toBeTruthy()
    expect(screen.getByText('Kaygı odaklı BDT')).toBeTruthy()
    expect(screen.getByText("Uzm. Psk. Elif Kaya'yı değerlendir")).toBeTruthy()
    expect(screen.queryByText('Eşleşmeyi sonlandır')).toBeNull()
  })

  it('uzman: danışan iletişimi ve üyelik bilgisi, değerlendirme yok', () => {
    act(() => {
      useAuthStore.setState({ user: TEST_EXPERT, role: 'expert' })
    })
    renderScreen(<MatchDetailScreen />)
    expect(screen.getByText('Zeynep Yılmaz')).toBeTruthy()
    expect(screen.getByText('Danışan · Mart 2026’dan beri üye')).toBeTruthy()
    expect(screen.getByText('0500 000 00 00')).toBeTruthy()
    expect(screen.queryByText(/değerlendir$/)).toBeNull()
  })

  it('web: iletişim sol sütunda, özet ve değerlendirme sağda; geri bağlantısı', () => {
    mockLayout.current = WIDE_LAYOUT
    renderScreen(<MatchDetailScreen />)
    expect(screen.getByTestId('match-columns')).toBeTruthy()
    expect(screen.getByText('elif@ornek.com')).toBeTruthy()
    expect(screen.getByText("Uzm. Psk. Elif Kaya'yı değerlendir")).toBeTruthy()
    fireEvent.press(screen.getByLabelText('Geri: Eşleşmelerim'))
    expect(mockRouter.navigate).toHaveBeenCalledWith('/(tabs)/matches')
    mockLayout.current = COMPACT_LAYOUT
  })

  it('bulunamadı', () => {
    jest
      .mocked(useMatchDetailQuery)
      .mockReturnValue(detailResult({ data: undefined, isError: true }))
    renderScreen(<MatchDetailScreen />)
    expect(screen.getByText('Eşleşme bulunamadı')).toBeTruthy()
  })
})

describe('Eşleşti', () => {
  it('ilk açılışta kutlar ve işaretler', () => {
    renderScreen(<MatchCelebrateScreen />)
    expect(screen.getByText('Eşleştiniz.')).toBeTruthy()
    expect(screen.getByText('₺2.400')).toBeTruthy()
    expect(useCelebratedMatchesStore.getState().ids).toContain(UUID)
    fireEvent.press(screen.getByTestId('celebrate-go'))
    expect(mockRouter.replace).toHaveBeenCalledWith(`/match/${UUID}`)
  })

  it('daha önce gösterildiyse detaya yönlendirir', () => {
    act(() => {
      useCelebratedMatchesStore.setState({ ids: [UUID] })
    })
    renderScreen(<MatchCelebrateScreen />)
    expect(screen.getByText(`redirect:/match/${UUID}`)).toBeTruthy()
  })
})
