import { Platform } from 'react-native'

import { act, renderHook, waitFor } from '@testing-library/react-native'
import MockAdapter from 'axios-mock-adapter'

import { clearPendingTopup, readPendingTopup, savePendingTopup } from '../utils/topupSession'
import { parseTopupAmountInput } from '../utils/walletUtils'

import { useTopupForm } from './useTopupForm'
import { useTopupResult } from './useTopupResult'

import type { QueryClient } from '@tanstack/react-query'

import { useAuthStore } from '@/domains/auth'
import { axiosInstance } from '@/lib/api'
import { TEST_EXPERT, createTestQueryClient, createWrapper } from '@/test-utils/query'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
  multiGet: jest.fn(async (keys: string[]) => keys.map((k) => [k, null])),
  multiRemove: jest.fn(async () => undefined),
}))
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => 'token'),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}))

const OPTIONS = {
  data: {
    presets: [
      { amountKurus: 25000, label: '₺250' },
      { amountKurus: 50000, label: '₺500' },
    ],
    minKurus: 25000,
    maxKurus: 5000000,
    vatNote: 'KDV dahil',
  },
}

const WALLET = (balanceKurus: number) => ({
  data: {
    balanceKurus,
    balanceLabel: `₺${balanceKurus / 100}`,
    freeOfferRights: 0,
    referralCode: 'K7M2PX9Q',
    referralLink: 'https://psikoal.test/davet/K7M2PX9Q',
  },
})

/** Web sessionStorage sahtesi (jest ortamı native; topupSession yalnız web'de çalışır). */
function installWebSession() {
  const store = new Map<string, string>()
  jest.replaceProperty(Platform, 'OS', 'web')
  const fake = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  }
  Object.defineProperty(window, 'sessionStorage', { value: fake, configurable: true })
  return store
}

describe('parseTopupAmountInput', () => {
  it('turns whole lira text into kuruş', () => {
    expect(parseTopupAmountInput('750')).toBe(75000)
    expect(parseTopupAmountInput('₺1.500')).toBe(150000)
    expect(parseTopupAmountInput('')).toBeNull()
    expect(parseTopupAmountInput('0')).toBeNull()
    expect(parseTopupAmountInput('abc')).toBeNull()
  })
})

describe('topupSession', () => {
  afterEach(() => jest.restoreAllMocks())

  it('is a no-op outside the web', () => {
    savePendingTopup({ amountKurus: 1, amountLabel: '₺0', balanceBeforeKurus: 0, startedAt: 0 })
    expect(readPendingTopup()).toBeNull()
  })

  it('stores, expires and clears the pending top-up on the web', () => {
    installWebSession()
    const pending = {
      amountKurus: 50000,
      amountLabel: '₺500',
      balanceBeforeKurus: 0,
      startedAt: 1000,
    }
    savePendingTopup(pending)
    expect(readPendingTopup(2000)).toEqual(pending)
    expect(readPendingTopup(1000 + 2 * 60 * 60 * 1000)).toBeNull()
    clearPendingTopup()
    expect(readPendingTopup(2000)).toBeNull()
  })
})

describe('useTopupForm', () => {
  let mock: MockAdapter
  let queryClient: QueryClient

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
    queryClient = createTestQueryClient()
    useAuthStore.setState({
      isAuthenticated: true,
      role: 'expert',
      userId: TEST_EXPERT.id,
      user: TEST_EXPERT,
    })
    mock.onGet('/wallet/topup-options').reply(200, OPTIONS)
    mock.onGet('/wallet/me').reply(200, WALLET(125000))
  })

  afterEach(() => {
    mock.restore()
    queryClient.clear()
  })

  const render = () => renderHook(() => useTopupForm(), { wrapper: createWrapper(queryClient) })

  it('starts on the second preset and previews the balance after top-up', async () => {
    const { result } = render()
    await waitFor(() => expect(result.current.afterLabel).toBe('₺1.750'))
    expect(result.current.amountLabel).toBe('₺500')
    expect(result.current.presets.map((p) => p.selected)).toEqual([false, true])
    expect(result.current.vatNote).toBe('KDV dahil')
  })

  it('validates a custom amount against the range', async () => {
    const { result } = render()
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.setCustomText('100'))
    expect(result.current.amountError).toBe('Tutar ₺250 ile ₺50.000 arasında olmalı.')
    expect(result.current.amountKurus).toBeNull()
    act(() => result.current.setCustomText('750'))
    expect(result.current.amountError).toBeNull()
    expect(result.current.amountKurus).toBe(75000)
    expect(result.current.amountLabel).toBe('₺750')
  })

  it('requires both contracts before starting PayTR', async () => {
    const { result } = render()
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.submit())
    expect(result.current.showConsentError).toBe(true)
    expect(mock.history.post).toHaveLength(0)
  })

  it('opens the PayTR step with the iframe url', async () => {
    mock.onPost('/payments/paytr/init').reply(200, {
      data: {
        iframeToken: 'tok',
        merchantOid: 'PA123',
        iframeUrl: 'https://www.paytr.com/odeme/guvenli/tok',
      },
    })
    const { result } = render()
    await waitFor(() => expect(result.current.afterLabel).toBe('₺1.750'))
    act(() => {
      result.current.toggleConsent('distanceSales')
      result.current.toggleConsent('preInformation')
    })
    act(() => result.current.submit())
    await waitFor(() => expect(result.current.step).toBe('paytr'))
    expect(JSON.parse(mock.history.post[0]?.data ?? '{}')).toEqual({ amountKurus: 50000 })
    expect(result.current.iframeUrl).toBe('https://www.paytr.com/odeme/guvenli/tok')
    act(() => result.current.backToForm())
    expect(result.current.step).toBe('form')
  })

  it.each([
    [503, 'PAYMENT_PROVIDER_UNAVAILABLE', 'providerUnavailable'],
    [403, 'TOPUP_EXPERT_NOT_APPROVED', 'notApproved'],
    [422, 'TOPUP_AMOUNT_OUT_OF_RANGE', 'outOfRange'],
    [500, 'INTERNAL', 'generic'],
  ])('maps %s %s to %s', async (status, code, kind) => {
    mock.onPost('/payments/paytr/init').reply(status, { code, message: 'Hata' })
    const { result } = render()
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => {
      result.current.toggleConsent('distanceSales')
      result.current.toggleConsent('preInformation')
    })
    act(() => result.current.submit())
    await waitFor(() => expect(result.current.submitError?.kind).toBe(kind))
    expect(result.current.step).toBe('form')
  })
})

describe('useTopupResult', () => {
  let mock: MockAdapter
  let queryClient: QueryClient

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
    queryClient = createTestQueryClient()
    useAuthStore.setState({
      isAuthenticated: true,
      role: 'expert',
      userId: TEST_EXPERT.id,
      user: TEST_EXPERT,
    })
  })

  afterEach(() => {
    mock.restore()
    queryClient.clear()
    jest.restoreAllMocks()
  })

  const render = () => renderHook(() => useTopupResult(), { wrapper: createWrapper(queryClient) })

  it('is unknown without a pending top-up', async () => {
    mock.onGet('/wallet/me').reply(200, WALLET(0))
    const { result } = render()
    expect(result.current.status).toBe('unknown')
  })

  it('confirms once the balance includes the paid amount', async () => {
    installWebSession()
    savePendingTopup({
      amountKurus: 50000,
      amountLabel: '₺500',
      balanceBeforeKurus: 125000,
      startedAt: Date.now(),
    })
    mock.onGet('/wallet/me').reply(200, WALLET(175000))
    const { result } = render()
    await waitFor(() => expect(result.current.status).toBe('confirmed'))
    expect(readPendingTopup()).toBeNull()
  })

  it('stays checking while the balance has not arrived yet', async () => {
    installWebSession()
    savePendingTopup({
      amountKurus: 50000,
      amountLabel: '₺500',
      balanceBeforeKurus: 125000,
      startedAt: Date.now(),
    })
    mock.onGet('/wallet/me').reply(200, WALLET(125000))
    const { result } = render()
    await waitFor(() => expect(result.current.balanceLabel).not.toBeNull())
    expect(result.current.status).toBe('checking')
  })
})
