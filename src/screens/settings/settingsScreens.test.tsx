import { act, fireEvent, screen } from '@testing-library/react-native'

import { NotificationsScreen } from '../notifications/NotificationsScreen'

import { PasswordPrivacyScreen } from './PasswordPrivacyScreen'
import { PersonalInfoScreen } from './PersonalInfoScreen'
import { SettingsScreen } from './SettingsScreen'

import { useAuthStore, useLogoutMutation } from '@/domains/auth'
import { useNotificationsQuery } from '@/domains/notification'
import { TEST_CLIENT, TEST_EXPERT } from '@/test-utils/query'
import {
  COMPACT_LAYOUT,
  mockLayout,
  mockRouter,
  renderScreen,
  WIDE_LAYOUT,
} from '@/test-utils/screen'

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@/test-utils/screen').asyncStorageMock
)
jest.mock('expo-secure-store', () => require('@/test-utils/screen').secureStoreMock)
jest.mock('@/core/hooks/useBreakpoint', () => require('@/test-utils/screen').breakpointMock)
jest.mock('@/lib/appVersion', () => ({ APP_VERSION: '2.0.0' }))
jest.mock('@/lib/externalLinks', () => ({
  openLegalDocument: jest.fn(),
  openNotificationSettings: jest.fn(),
  openSupportEmail: jest.fn(),
  requestStoreReview: jest.fn(),
}))

jest.mock('expo-router', () => require('@/test-utils/screen').expoRouterMock)

const mockIdle = { mutate: jest.fn(), isPending: false, error: null, reset: jest.fn() }
jest.mock('@/domains/auth', () => {
  const actual = jest.requireActual('@/domains/auth')
  return {
    ...actual,
    useLogoutMutation: jest.fn(() => mockIdle),
    useUpdateProfileMutation: jest.fn(() => mockIdle),
    useChangePasswordMutation: jest.fn(() => mockIdle),
    useFreezeAccountMutation: jest.fn(() => mockIdle),
    useDeleteAccountMutation: jest.fn(() => mockIdle),
    useChangeAvatar: jest.fn(() => ({ changeAvatar: jest.fn(), isUploading: false })),
  }
})
jest.mock('@/domains/wallet', () => ({
  useWalletQuery: () => ({
    data: { balanceLabel: '₺1.250', freeOfferRights: 2, balanceKurus: 125000 },
    isLoading: false,
  }),
}))
const mockGate = {
  isPendingApproval: false,
  isRejected: false,
  rejectionReason: null as string | null,
}
jest.mock('@/domains/expert', () => ({
  ...jest.requireActual('@/domains/expert'),
  useExpertApprovalGate: () => mockGate,
}))
jest.mock('@/domains/notification', () => {
  const actual = jest.requireActual('@/domains/notification')
  return {
    ...actual,
    useNotificationsQuery: jest.fn(),
    useMarkNotificationReadMutation: () => ({ mutate: jest.fn() }),
    useMarkAllNotificationsReadMutation: () => ({ mutate: jest.fn(), isPending: false }),
    usePushTokenRegistration: jest.fn(),
  }
})

beforeEach(() => {
  jest.clearAllMocks()
  act(() => {
    useAuthStore.setState({ user: TEST_CLIENT, role: 'client', isAuthenticated: true })
  })
})

describe('Ayarlar', () => {
  afterEach(() => {
    mockLayout.current = COMPACT_LAYOUT
    mockGate.isRejected = false
    mockGate.rejectionReason = null
  })

  it('web: sol sekmeler, panel değişimi ve çıkış', () => {
    mockLayout.current = WIDE_LAYOUT
    renderScreen(<SettingsScreen />)
    expect(screen.getByText('Testlerim')).toBeTruthy()
    fireEvent.press(screen.getByLabelText('Görünüm ve bildirimler'))
    expect(
      screen.getByText('Tarayıcı bildirimlerini tarayıcı ayarlarından yönetebilirsin.')
    ).toBeTruthy()
    expect(screen.queryByText('Testlerim')).toBeNull()
    fireEvent.press(screen.getByLabelText('Destek ve gizlilik'))
    expect(screen.getByText('Veri ve gizlilik')).toBeTruthy()
    fireEvent.press(screen.getByTestId('settings-logout'))
    expect(screen.getByText('Çıkış yapılsın mı?')).toBeTruthy()
  })

  it('uzman: profil reddedildiyse gerekçe görünür', () => {
    mockGate.isRejected = true
    mockGate.rejectionReason = 'Diploma eksik.'
    act(() => {
      useAuthStore.setState({ user: TEST_EXPERT, role: 'expert' })
    })
    renderScreen(<SettingsScreen />)
    expect(screen.getByText(/Diploma eksik./)).toBeTruthy()
  })

  it('danışan menüsü ve çıkış onayı', () => {
    renderScreen(<SettingsScreen />)
    expect(screen.getByText('Testlerim')).toBeTruthy()
    expect(screen.getByText('Davet et')).toBeTruthy()
    expect(screen.queryByText('Bakiyem')).toBeNull()
    fireEvent.press(screen.getByTestId('settings-logout'))
    expect(screen.getByText('Çıkış yapılsın mı?')).toBeTruthy()
    fireEvent.press(screen.getByTestId('settings-logout-confirm'))
    expect(jest.mocked(useLogoutMutation)().mutate).toHaveBeenCalled()
  })

  it('uzman: bakiye kartı, faturalar ve davet linki', () => {
    act(() => {
      useAuthStore.setState({ user: TEST_EXPERT, role: 'expert' })
    })
    renderScreen(<SettingsScreen />)
    expect(screen.getByText('Bakiye · Profil onaylı')).toBeTruthy()
    expect(screen.getByText('Faturalarım')).toBeTruthy()
    expect(screen.getByText('Mesleki bilgiler ve belgeler')).toBeTruthy()
    fireEvent.press(screen.getByTestId('settings-referral'))
    expect(mockRouter.push).toHaveBeenCalledWith('/referral')
  })
})

describe('Kişisel bilgiler', () => {
  it('kilitli e-posta ve sözleşme bilgisi; paylaşım anahtarları yok', () => {
    renderScreen(<PersonalInfoScreen />)
    expect(screen.getByText(TEST_CLIENT.email)).toBeTruthy()
    expect(screen.getByText('Giriş kimliğin olduğu için değiştirilemez.')).toBeTruthy()
    expect(
      screen.getByText(
        'Telefon ve e-postan, ilan açarken verdiğin izinle yalnız ilanına teklif veren uzmanlara açılır.'
      )
    ).toBeTruthy()
    expect(screen.queryByText('İletişim Paylaşımı')).toBeNull()
  })
})

describe('Şifre ve gizlilik', () => {
  it('hesap silme iki adımlı', () => {
    renderScreen(<PasswordPrivacyScreen />)
    expect(screen.getByText('Mevcut şifre')).toBeTruthy()
    fireEvent.press(screen.getByTestId('privacy-delete'))
    expect(
      screen.getByText('Bu işlem geri alınamaz. Hesabın ve tüm verilerin kalıcı olarak silinir.')
    ).toBeTruthy()
    fireEvent.press(screen.getByTestId('privacy-confirm'))
    expect(screen.getByText('Son onay')).toBeTruthy()
  })
})

describe('Bildirimler', () => {
  const base = { isLoading: false, isError: false, refetch: jest.fn(), isRefetching: false }

  it('boş durum', () => {
    jest.mocked(useNotificationsQuery).mockReturnValue({
      ...base,
      data: { data: [], meta: { page: 1, total: 0, perPage: 20, unreadCount: 0 } },
    } as unknown as ReturnType<typeof useNotificationsQuery>)
    renderScreen(<NotificationsScreen />)
    expect(screen.getByText('Her şey sakin')).toBeTruthy()
  })

  it('okunmamış eşleşme bildirimi kutlamaya gider', () => {
    jest.mocked(useNotificationsQuery).mockReturnValue({
      ...base,
      data: {
        data: [
          {
            id: 'n1',
            type: 'MATCHED',
            title: 'Danışan seninle eşleşti',
            body: 'Deniz Kara ilanını seninle eşleşti olarak işaretledi.',
            createdAt: new Date().toISOString(),
            timeLabel: '1 sa önce',
            read: false,
            entityId: 'm1',
          },
        ],
        meta: { page: 1, total: 1, perPage: 20, unreadCount: 1 },
      },
    } as unknown as ReturnType<typeof useNotificationsQuery>)
    renderScreen(<NotificationsScreen />)
    expect(screen.getByText('Bugün')).toBeTruthy()
    expect(screen.getByText('Tümünü okundu yap')).toBeTruthy()
    fireEvent.press(screen.getByTestId('notification-n1'))
    expect(mockRouter.push).toHaveBeenCalledWith('/match/m1/celebrate')
  })
})
