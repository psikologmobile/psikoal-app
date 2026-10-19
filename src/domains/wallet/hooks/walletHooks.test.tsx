import { AppState } from 'react-native'
import type { AppStateStatus } from 'react-native'

import { act, renderHook, waitFor } from '@testing-library/react-native'
import MockAdapter from 'axios-mock-adapter'

import { walletKeys } from '../wallet.constants'

import { INVOICE_NOT_READY_MESSAGE, useOpenInvoice } from './useOpenInvoice'
import { useWalletForegroundRefresh } from './useWalletForegroundRefresh'

import type { QueryClient } from '@tanstack/react-query'

import { axiosInstance } from '@/lib/api'
import { openWebUrl } from '@/lib/externalLinks'
import { createTestQueryClient, createWrapper } from '@/test-utils/query'

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

jest.mock('@/lib/externalLinks', () => ({ openWebUrl: jest.fn(async () => undefined) }))

const PAYMENT_ID = '4e5f6a7b-8c9d-4e0f-9a1b-3c4d5e6f7a8b'

describe('useOpenInvoice', () => {
  let mock: MockAdapter
  let queryClient: QueryClient

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
    queryClient = createTestQueryClient()
    jest.mocked(openWebUrl).mockClear()
  })

  afterEach(() => {
    mock.restore()
    queryClient.clear()
  })

  it('taze adresi alır ve tarayıcıda açar', async () => {
    mock
      .onGet(`/wallet/payments/${PAYMENT_ID}/invoice`)
      .reply(200, { data: { url: 'https://storage.test/f.pdf?sig=1' } })
    const { result } = renderHook(() => useOpenInvoice(), { wrapper: createWrapper(queryClient) })

    act(() => result.current.openInvoice(PAYMENT_ID))
    await waitFor(() => expect(openWebUrl).toHaveBeenCalledWith('https://storage.test/f.pdf?sig=1'))
    expect(result.current.errorMessage).toBeUndefined()
  })

  it('istek sürerken ödeme kimliğini bildirir', async () => {
    mock
      .onGet(`/wallet/payments/${PAYMENT_ID}/invoice`)
      .reply(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([200, { data: { url: 'https://s.test/x.pdf' } }]), 300)
          )
      )
    const { result } = renderHook(() => useOpenInvoice(), { wrapper: createWrapper(queryClient) })
    act(() => result.current.openInvoice(PAYMENT_ID))
    await waitFor(() => expect(result.current.pendingPaymentId).toBe(PAYMENT_ID))
    await waitFor(() => expect(result.current.pendingPaymentId).toBeUndefined())
  })

  it('404 INVOICE_NOT_FOUND → "henüz hazır değil" mesajı', async () => {
    mock
      .onGet(`/wallet/payments/${PAYMENT_ID}/invoice`)
      .reply(404, { code: 'INVOICE_NOT_FOUND', message: 'Fatura bulunamadı.' })
    const { result } = renderHook(() => useOpenInvoice(), { wrapper: createWrapper(queryClient) })
    act(() => result.current.openInvoice(PAYMENT_ID))
    await waitFor(() => expect(result.current.errorMessage).toBe(INVOICE_NOT_READY_MESSAGE))
    expect(openWebUrl).not.toHaveBeenCalled()
  })

  it('diğer hatalarda sunucunun mesajını gösterir', async () => {
    mock
      .onGet(`/wallet/payments/${PAYMENT_ID}/invoice`)
      .reply(404, { code: 'WALLET_PAYMENT_NOT_FOUND', message: 'Ödeme bulunamadı.' })
    const { result } = renderHook(() => useOpenInvoice(), { wrapper: createWrapper(queryClient) })
    act(() => result.current.openInvoice(PAYMENT_ID))
    await waitFor(() => expect(result.current.errorMessage).toBe('Ödeme bulunamadı.'))
  })
})

describe('useWalletForegroundRefresh', () => {
  it('uygulama öne gelince cüzdan sorgularını tazeler ve temizlikte dinleyiciyi kaldırır', () => {
    const remove = jest.fn()
    let listener: ((state: AppStateStatus) => void) | undefined
    const spy = jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, handler) => {
      listener = handler
      return { remove }
    })
    const queryClient = createTestQueryClient()
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries')

    const { unmount } = renderHook(() => useWalletForegroundRefresh(), {
      wrapper: createWrapper(queryClient),
    })
    listener?.('background')
    expect(invalidate).not.toHaveBeenCalled()
    listener?.('active')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: walletKeys.all })

    unmount()
    expect(remove).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('enabled=false iken dinleyici kurmaz; invalidateWallet yine çalışır', async () => {
    const spy = jest.spyOn(AppState, 'addEventListener')
    const queryClient = createTestQueryClient()
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useWalletForegroundRefresh(false), {
      wrapper: createWrapper(queryClient),
    })
    expect(spy).not.toHaveBeenCalled()
    await act(async () => {
      await result.current.invalidateWallet()
    })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: walletKeys.all })
    spy.mockRestore()
  })
})
