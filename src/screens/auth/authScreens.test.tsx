import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'

import { ClientOnboardingScreen } from './ClientOnboardingScreen'
import { ExpertOnboardingScreen } from './ExpertOnboardingScreen'
import { ForgotPasswordScreen } from './ForgotPasswordScreen'
import { LoginScreen } from './LoginScreen'
import { RegisterScreen } from './RegisterScreen'
import { ResetPasswordScreen } from './ResetPasswordScreen'
import { VerifyEmailScreen } from './VerifyEmailScreen'
import { WelcomeScreen } from './WelcomeScreen'

import { useAuthStore, useLoginMutation, useReferralStore } from '@/domains/auth'
import { ApiError } from '@/lib/api'
import { TEST_CLIENT, TEST_EXPERT } from '@/test-utils/query'
import { renderScreen } from '@/test-utils/screen'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
  multiGet: jest.fn(async (keys: string[]) => keys.map((k) => [k, null])),
  multiRemove: jest.fn(async () => undefined),
}))
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}))

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() }
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
}))
jest.mock('expo-linking', () => ({ useLinkingURL: () => null }))

const mockIdle = {
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isPending: false,
  error: null,
  reset: jest.fn(),
}

jest.mock('@/domains/auth', () => {
  const actual = jest.requireActual('@/domains/auth')
  return {
    ...actual,
    useLoginMutation: jest.fn(),
    useRegisterMutation: jest.fn(() => mockIdle),
    useForgotPasswordMutation: jest.fn(() => mockIdle),
    useResetPasswordMutation: jest.fn(() => mockIdle),
    useUpdateProfileMutation: jest.fn(() => mockIdle),
    useChangeAvatar: jest.fn(() => ({ changeAvatar: jest.fn(), isUploading: false })),
  }
})
jest.mock('@/domains/category', () => ({
  useCategoriesQuery: () => ({
    data: [{ id: 'c1', name: 'Kaygı' }],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}))
jest.mock('@/domains/expert', () => {
  const actual = jest.requireActual('@/domains/expert')
  return {
    ...actual,
    useCreateExpertProfileMutation: jest.fn(() => mockIdle),
    useUploadExpertDocumentMutation: jest.fn(() => mockIdle),
  }
})

const mockedLogin = jest.mocked(useLoginMutation)

beforeEach(() => {
  jest.clearAllMocks()
  mockedLogin.mockReturnValue(mockIdle as unknown as ReturnType<typeof useLoginMutation>)
})

describe('Karşılama', () => {
  it('üç slaytı gezip son slaytta kayıt/giriş düğmelerini gösterir', () => {
    renderScreen(<WelcomeScreen />)
    expect(screen.getByText('İhtiyacını anlat, uzmanlar sana gelsin.')).toBeTruthy()
    fireEvent.press(screen.getByTestId('welcome-next'))
    expect(screen.getByText('Kendini ücretsiz testlerle tanı.')).toBeTruthy()
    fireEvent.press(screen.getByTestId('welcome-next'))
    expect(screen.getByText('Güvenle başla.')).toBeTruthy()
    fireEvent.press(screen.getByLabelText('Hemen başla'))
    expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/register')
  })
})

describe('Giriş', () => {
  it('normal durumda başlık ve düğme', () => {
    renderScreen(<LoginScreen />)
    expect(screen.getByText('E-posta ve şifrenle giriş yap.')).toBeTruthy()
    expect(screen.getByText('Giriş yap')).toBeTruthy()
  })

  it('dondurulmuş hesap hata koduna tasarım metnini gösterir', () => {
    mockedLogin.mockReturnValue({
      ...mockIdle,
      error: new ApiError('AUTH_ACCOUNT_FROZEN', 'x', 403),
    } as unknown as ReturnType<typeof useLoginMutation>)
    renderScreen(<LoginScreen />)
    expect(
      screen.getByText('Hesabın dondurulmuş. Destek ekibimizle iletişime geçebilirsin.')
    ).toBeTruthy()
  })

  it('gönderilirken yükleniyor etiketi', () => {
    mockedLogin.mockReturnValue({
      ...mockIdle,
      isPending: true,
    } as unknown as ReturnType<typeof useLoginMutation>)
    renderScreen(<LoginScreen />)
    expect(screen.getByText('Giriş yapılıyor')).toBeTruthy()
  })
})

describe('Kayıt', () => {
  it('rol → bilgiler; davet kodu bekleyen koddan dolar, onaysız düğme pasif', () => {
    act(() => {
      useReferralStore.setState({ pendingCode: 'K7M2Q9XA' })
    })
    renderScreen(<RegisterScreen />)
    expect(screen.getByText('Seni nasıl tanıyalım?')).toBeTruthy()
    fireEvent.press(screen.getByTestId('register-role-expert'))
    fireEvent.press(screen.getByText('Devam'))
    expect(screen.getByText('Uzman hesabını aç')).toBeTruthy()
    expect(screen.getByDisplayValue('K7M2Q9XA')).toBeTruthy()
    expect(screen.getByText('Devam etmek için iki onayı da işaretle')).toBeTruthy()
    fireEvent.press(screen.getByTestId('register-terms'))
    fireEvent.press(screen.getByTestId('register-health-consent'))
    expect(screen.getByText('Kayıt ol')).toBeTruthy()
  })
})

describe('E-postanı onayla', () => {
  it("e-postayı gösterir ve role göre onboarding'e geçer", () => {
    act(() => {
      useAuthStore.setState({ user: TEST_EXPERT, role: 'expert', isAuthenticated: true })
    })
    renderScreen(<VerifyEmailScreen />)
    expect(screen.getByText(TEST_EXPERT.email)).toBeTruthy()
    fireEvent.press(screen.getByText('Onayladım, devam et'))
    expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/onboarding/expert')
  })
})

describe('Şifre sıfırlama', () => {
  it('unuttum formu', () => {
    renderScreen(<ForgotPasswordScreen />)
    expect(screen.getByText('Şifreni mi unuttun?')).toBeTruthy()
    expect(screen.getByText('Sıfırlama bağlantısı gönder')).toBeTruthy()
  })

  it('bağlantı yoksa süresi dolmuş durumu', () => {
    renderScreen(<ResetPasswordScreen />)
    expect(screen.getByText('Bağlantının süresi dolmuş')).toBeTruthy()
    fireEvent.press(screen.getByText('Yeni bağlantı iste'))
    expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/forgot-password')
  })
})

describe('Onboarding', () => {
  it('danışan: boş alanlarla devam doğrudan sekmelere gider', () => {
    act(() => {
      useAuthStore.setState({ user: TEST_CLIENT, role: 'client', isAuthenticated: true })
    })
    renderScreen(<ClientOnboardingScreen />)
    expect(screen.getByText('Hoş geldin, Zeynep.')).toBeTruthy()
    fireEvent.press(screen.getByTestId('onboarding-continue'))
    expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)')
  })

  it('uzman: ünvansız devam hata verir, ünvanla 2. adıma geçer', async () => {
    act(() => {
      useAuthStore.setState({ user: TEST_EXPERT, role: 'expert', isAuthenticated: true })
    })
    renderScreen(<ExpertOnboardingScreen />)
    expect(screen.getByText('Seni tanıyalım, Ayşe.')).toBeTruthy()
    fireEvent.press(screen.getByTestId('onboarding-expert-next'))
    expect(screen.getByText('Ünvan en az 2 karakter olmalı')).toBeTruthy()
    fireEvent.changeText(screen.getByTestId('onboarding-title'), 'Klinik Psikolog')
    fireEvent.press(screen.getByTestId('onboarding-expert-next'))
    await waitFor(() => expect(screen.getByText('Uzmanlık alanların')).toBeTruthy())
    expect(screen.getByText('Kaygı')).toBeTruthy()
  })
})
