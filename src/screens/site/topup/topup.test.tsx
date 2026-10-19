import { fireEvent } from '@testing-library/react-native'

import { TopupFailureScreen, TopupSuccessScreen } from './TopupResultScreens'
import { TopupScreen } from './TopupScreen'

import type { SiteSession } from '../useSiteSession'
import type { TopupResultStatus, UseTopupFormReturn } from '@/domains/wallet'

import { mockRouter, renderScreen } from '@/test-utils/screen'

jest.mock('expo-router', () => ({
  ...require('@/test-utils/screen').expoRouterMock,
  Link: ({ children }: { children: unknown }) => children,
}))
jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@/test-utils/screen').asyncStorageMock
)
jest.mock('expo-secure-store', () => require('@/test-utils/screen').secureStoreMock)
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
)

const mockSession = jest.fn<SiteSession, []>()
jest.mock('../useSiteSession', () => ({ useSiteSession: () => mockSession() }))

const mockGate = jest.fn()
jest.mock('@/domains/expert/hooks/useExpertApprovalGate', () => ({
  useExpertApprovalGate: () => mockGate(),
}))

const mockForm = jest.fn<UseTopupFormReturn, []>()
const mockResult = jest.fn()
jest.mock('@/domains/wallet/hooks/useTopupForm', () => ({ useTopupForm: () => mockForm() }))
jest.mock('@/domains/wallet/hooks/useTopupResult', () => ({
  useTopupResult: () => mockResult(),
}))

const expert: SiteSession = {
  hydrated: true,
  isAuthenticated: true,
  role: 'expert',
  user: {
    id: '7f1c2d3e-4b5a-4c6d-8e9f-0a1b2c3d4e5f',
    email: 'elif@example.com',
    firstName: 'Elif',
    lastName: 'Kaya',
    role: 'expert',
    isVerified: true,
    avatarUrl: null,
    createdAt: '2026-10-01T10:00:00Z',
  },
}

const approved = {
  isPendingApproval: false,
  isRejected: false,
  needsOnboarding: false,
  canAct: true,
  isLoading: false,
}

function form(overrides: Partial<UseTopupFormReturn> = {}): UseTopupFormReturn {
  return {
    isLoading: false,
    isError: false,
    retry: jest.fn(),
    step: 'form',
    presets: [
      { label: '₺250', selected: false, select: jest.fn() },
      { label: '₺500', selected: true, select: jest.fn() },
    ],
    customText: '',
    setCustomText: jest.fn(),
    amountKurus: 50000,
    amountLabel: '₺500',
    amountError: null,
    rangeHint: '₺250 – ₺50.000',
    vatNote: 'KDV dahil',
    balanceLabel: '₺1.250',
    afterLabel: '₺1.750',
    consents: { distanceSales: false, preInformation: false },
    toggleConsent: jest.fn(),
    showConsentError: false,
    submit: jest.fn(),
    isSubmitting: false,
    submitError: null,
    iframeUrl: null,
    backToForm: jest.fn(),
    ...overrides,
  }
}

beforeEach(() => {
  mockSession.mockReturnValue(expert)
  mockGate.mockReturnValue(approved)
  mockForm.mockReturnValue(form())
})

describe('TopupScreen', () => {
  it('asks a logged-out visitor to sign in and come back', () => {
    mockSession.mockReturnValue({ hydrated: true, isAuthenticated: false, role: null, user: null })
    const screen = renderScreen(<TopupScreen />)
    expect(screen.getByText('Bakiye yüklemek için giriş yap')).toBeTruthy()
    expect(screen.getByText('Giriş yap')).toBeTruthy()
  })

  it('waits for the session before deciding', () => {
    mockSession.mockReturnValue({ hydrated: false, isAuthenticated: false, role: null, user: null })
    const screen = renderScreen(<TopupScreen />)
    expect(screen.getAllByLabelText('Yükleniyor').length).toBeGreaterThan(0)
    expect(screen.queryByText('Tutar seç')).toBeNull()
  })

  it('explains that top-up is for experts only', () => {
    mockSession.mockReturnValue({ ...expert, role: 'client' })
    const screen = renderScreen(<TopupScreen />)
    expect(screen.getByText('Bakiye yükleme uzmanlar içindir')).toBeTruthy()
  })

  it('blocks an expert waiting for approval', () => {
    mockGate.mockReturnValue({ ...approved, isPendingApproval: true, canAct: false })
    const screen = renderScreen(<TopupScreen />)
    expect(screen.getByText('Profilin onay bekliyor')).toBeTruthy()
  })

  it('renders the form with summary and submits', () => {
    const submit = jest.fn()
    const toggleConsent = jest.fn()
    mockForm.mockReturnValue(form({ submit, toggleConsent }))
    const screen = renderScreen(<TopupScreen />)

    expect(screen.getByText('Tutar seç')).toBeTruthy()
    expect(screen.getByText('₺1.250')).toBeTruthy()
    expect(screen.getByText('₺1.750')).toBeTruthy()
    expect(screen.getByText('KDV dahil')).toBeTruthy()
    fireEvent.press(screen.getByTestId('topup-consent-distanceSales'))
    expect(toggleConsent).toHaveBeenCalledWith('distanceSales')
    fireEvent.press(screen.getByTestId('topup-submit'))
    expect(submit).toHaveBeenCalled()
  })

  it('shows the consent error', () => {
    mockForm.mockReturnValue(form({ showConsentError: true }))
    const screen = renderScreen(<TopupScreen />)
    expect(screen.getByText('Devam etmek için iki sözleşmeyi de onaylamalısın.')).toBeTruthy()
  })

  it('shows the server range error inline', () => {
    mockForm.mockReturnValue(
      form({ submitError: { kind: 'outOfRange', message: 'Tutar aralık dışında.' } })
    )
    const screen = renderScreen(<TopupScreen />)
    expect(screen.getByText('Tutar aralık dışında.')).toBeTruthy()
  })

  it('shows a friendly state when PayTR is not configured', () => {
    mockForm.mockReturnValue(form({ submitError: { kind: 'providerUnavailable' } }))
    const screen = renderScreen(<TopupScreen />)
    expect(screen.getByText('Ödeme altyapısı yakında açılacak')).toBeTruthy()
  })

  it('shows the PayTR step with a way back', () => {
    const backToForm = jest.fn()
    mockForm.mockReturnValue(
      form({ step: 'paytr', iframeUrl: 'https://www.paytr.com/odeme/guvenli/tok', backToForm })
    )
    const screen = renderScreen(<TopupScreen />)
    expect(screen.getByText('Ödeme · ₺500')).toBeTruthy()
    fireEvent.press(screen.getByText('← Tutarı değiştir'))
    expect(backToForm).toHaveBeenCalled()
  })
})

describe('Topup result pages', () => {
  const result = (status: TopupResultStatus) => ({
    status,
    pending: { amountKurus: 50000, amountLabel: '₺500', balanceBeforeKurus: 0, startedAt: 0 },
    balanceLabel: '₺500',
  })

  it('confirms once the balance arrives', () => {
    mockResult.mockReturnValue(result('confirmed'))
    const screen = renderScreen(<TopupSuccessScreen />)
    expect(screen.getByText('Bakiyen yüklendi')).toBeTruthy()
  })

  it('keeps checking while the callback is pending', () => {
    mockResult.mockReturnValue(result('checking'))
    const screen = renderScreen(<TopupSuccessScreen />)
    expect(screen.getByText('Ödeme kontrol ediliyor')).toBeTruthy()
    expect(screen.getByText(/birkaç saniye içinde yansır/)).toBeTruthy()
  })

  it('falls back to a generic note without a pending top-up', () => {
    mockResult.mockReturnValue({ status: 'unknown', pending: null, balanceLabel: null })
    const screen = renderScreen(<TopupSuccessScreen />)
    expect(screen.getByText('Ödemen alındı')).toBeTruthy()
  })

  it('offers a retry on failure', () => {
    const screen = renderScreen(<TopupFailureScreen />)
    expect(screen.getByText('Ödeme alınamadı')).toBeTruthy()
    fireEvent.press(screen.getByText('Tekrar dene'))
    expect(mockRouter.replace).toHaveBeenCalledWith('/bakiye')
  })
})
