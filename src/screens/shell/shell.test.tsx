import { Platform, Text } from 'react-native'

import { fireEvent } from '@testing-library/react-native'

import { resolveActiveNavKey } from './appNav'
import { AppWebShell } from './AppWebShell'

import { useAuthStore } from '@/domains/auth'
import { mockPathname, mockRouter, renderScreen } from '@/test-utils/screen'

jest.mock('expo-router', () => require('@/test-utils/screen').expoRouterMock)
jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@/test-utils/screen').asyncStorageMock
)
jest.mock('expo-secure-store', () => require('@/test-utils/screen').secureStoreMock)
// Masaüstü genişliği: kenar çubuğu tam modda (alt kart görünür).
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 1440, height: 900, scale: 1, fontScale: 1 }),
}))
jest.mock('@/domains/notification', () => ({ useUnreadNotificationCount: () => 3 }))
jest.mock('@/domains/wallet', () => ({
  useWalletQuery: () => ({ data: { balanceLabel: '₺1.250' } }),
}))

describe('resolveActiveNavKey', () => {
  it('sekme yolları', () => {
    expect(resolveActiveNavKey('/', 'client')).toBe('index')
    expect(resolveActiveNavKey('/offers', 'expert')).toBe('offers')
    expect(resolveActiveNavKey('/matches/', 'client')).toBe('matches')
    expect(resolveActiveNavKey('/profile', 'client')).toBe('profile')
  })

  it('yığın sayfaları ait oldukları sekmeyi işaretler', () => {
    expect(resolveActiveNavKey('/listing/abc', 'client')).toBe('offers')
    expect(resolveActiveNavKey('/listing/abc', 'expert')).toBe('index')
    expect(resolveActiveNavKey('/listing/new', 'client')).toBeNull()
    expect(resolveActiveNavKey('/offer/new', 'expert')).toBe('index')
    expect(resolveActiveNavKey('/offer/new', 'client')).toBeNull()
    expect(resolveActiveNavKey('/offer/o1', 'client')).toBe('offers')
    expect(resolveActiveNavKey('/match/m1', 'expert')).toBe('matches')
    expect(resolveActiveNavKey('/profile/personal', 'client')).toBe('profile')
    expect(resolveActiveNavKey('/referral', 'expert')).toBe('profile')
    expect(resolveActiveNavKey('/wallet/invoices', 'expert')).toBe('wallet')
    expect(resolveActiveNavKey('/wallet', 'client')).toBeNull()
    expect(resolveActiveNavKey('/notifications', 'client')).toBe('notifications')
    expect(resolveActiveNavKey('/notifications', 'expert')).toBeNull()
    expect(resolveActiveNavKey('/claim/l1', 'client')).toBe('offers')
    expect(resolveActiveNavKey('/claim/l1', 'expert')).toBeNull()
    expect(resolveActiveNavKey('/assessment/list', 'client')).toBe('index')
    expect(resolveActiveNavKey('/expert/e1', 'expert')).toBeNull()
    expect(resolveActiveNavKey('/blog', 'client')).toBeNull()
  })
})

describe('AppWebShell', () => {
  const originalOS = Platform.OS
  afterEach(() => {
    Platform.OS = originalOS
  })

  it('native: yalnız içeriği çizer', () => {
    Platform.OS = 'ios'
    useAuthStore.setState({ isAuthenticated: true, role: 'client' })
    const view = renderScreen(
      <AppWebShell>
        <Text>içerik</Text>
      </AppWebShell>
    )
    expect(view.getByText('içerik')).toBeTruthy()
    expect(view.queryByTestId('app-web-shell')).toBeNull()
  })

  it('web + oturum yok (site sayfaları): kenar çubuğu yok', () => {
    Platform.OS = 'web'
    useAuthStore.setState({ isAuthenticated: false, role: null })
    const view = renderScreen(
      <AppWebShell>
        <Text>site</Text>
      </AppWebShell>
    )
    expect(view.queryByTestId('app-web-shell')).toBeNull()
  })

  it('web + danışan: kenar çubuğu, aktif öğe ve gezinme', () => {
    Platform.OS = 'web'
    mockPathname.current = '/listing/l1'
    useAuthStore.setState({ isAuthenticated: true, role: 'client' })
    const view = renderScreen(
      <AppWebShell>
        <Text>ilan</Text>
      </AppWebShell>
    )
    expect(view.getByTestId('app-web-shell')).toBeTruthy()
    expect(view.getByTestId('sidebar-offers')).toBeSelected()
    expect(view.getByLabelText('Bildirimler, 3 yeni')).toBeTruthy()
    fireEvent.press(view.getByTestId('sidebar-matches'))
    expect(mockRouter.navigate).toHaveBeenCalledWith('/(tabs)/matches')
    fireEvent.press(view.getByLabelText('Yeni ilan'))
    expect(mockRouter.navigate).toHaveBeenCalledWith('/listing/new')
  })

  it('web + uzman: Bakiyem ve bakiye kartı', () => {
    Platform.OS = 'web'
    mockPathname.current = '/wallet'
    useAuthStore.setState({ isAuthenticated: true, role: 'expert' })
    const view = renderScreen(
      <AppWebShell>
        <Text>bakiye</Text>
      </AppWebShell>
    )
    expect(view.getByTestId('sidebar-wallet')).toBeSelected()
    expect(view.getByText('₺1.250')).toBeTruthy()
    fireEvent.press(view.getByLabelText('Bakiye yükle'))
    expect(mockRouter.navigate).toHaveBeenCalledWith('/bakiye')
  })
})
