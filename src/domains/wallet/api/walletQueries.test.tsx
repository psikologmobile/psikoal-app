import { act, renderHook, waitFor } from '@testing-library/react-native'
import MockAdapter from 'axios-mock-adapter'

import topupResponse from '../schemas/__fixtures__/topup-options.response.json'
import walletResponse from '../schemas/__fixtures__/wallet-me.response.json'
import paymentsResponse from '../schemas/__fixtures__/wallet-payments.response.json'
import transactionsResponse from '../schemas/__fixtures__/wallet-transactions.response.json'
import { walletKeys } from '../wallet.constants'

import { useInvoiceUrlMutation } from './useInvoiceUrlMutation'
import { usePayTrInitMutation } from './usePayTrInitMutation'
import { useTopupOptionsQuery } from './useTopupOptionsQuery'
import { useWalletPaymentsInfiniteQuery } from './useWalletPaymentsInfiniteQuery'
import { useWalletQuery } from './useWalletQuery'
import { useWalletTransactionsInfiniteQuery } from './useWalletTransactionsInfiniteQuery'

import type { QueryClient } from '@tanstack/react-query'

import { useAuthStore } from '@/domains/auth'
import { axiosInstance } from '@/lib/api'
import { createTestQueryClient, createWrapper, TEST_CLIENT, TEST_EXPERT } from '@/test-utils/query'

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

describe('cüzdan sorguları', () => {
  let mock: MockAdapter
  let queryClient: QueryClient

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
    queryClient = createTestQueryClient()
    useAuthStore.getState().setAuth(TEST_EXPERT, 'a', 'r')
  })

  afterEach(() => {
    mock.restore()
    queryClient.clear()
    useAuthStore.getState().clearAuth()
  })

  describe('useWalletQuery', () => {
    it('uzman için GET /wallet/me data alanını döner', async () => {
      mock.onGet('/wallet/me').reply(200, walletResponse)
      const { result } = renderHook(() => useWalletQuery(), {
        wrapper: createWrapper(queryClient),
      })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(walletResponse.data)
    })

    it('danışan için istek atmaz', () => {
      useAuthStore.getState().setAuth(TEST_CLIENT, 'a', 'r')
      const { result } = renderHook(() => useWalletQuery(), {
        wrapper: createWrapper(queryClient),
      })
      expect(result.current.fetchStatus).toBe('idle')
      expect(mock.history.get).toHaveLength(0)
    })

    it('şemaya uymayan yanıtta hata verir', async () => {
      mock.onGet('/wallet/me').reply(200, { data: { balance: 3 } })
      const { result } = renderHook(() => useWalletQuery(), {
        wrapper: createWrapper(queryClient),
      })
      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useWalletTransactionsInfiniteQuery', () => {
    it('tür süzgeci ve sayfa parametrelerini gönderir', async () => {
      mock.onGet('/wallet/transactions').reply(200, transactionsResponse)
      const { result } = renderHook(() => useWalletTransactionsInfiniteQuery({ type: 'TOPUP' }), {
        wrapper: createWrapper(queryClient),
      })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mock.history.get[0]?.params).toEqual({ page: 1, perPage: 20, type: 'TOPUP' })
      expect(result.current.data?.pages[0]?.data).toHaveLength(3)
      expect(result.current.hasNextPage).toBe(false)
      expect(queryClient.getQueryData(walletKeys.transactions('TOPUP'))).toBeDefined()
    })

    it('meta toplamı büyükse sonraki sayfayı ister', async () => {
      mock
        .onGet('/wallet/transactions')
        .replyOnce(200, { ...transactionsResponse, meta: { page: 1, total: 4, perPage: 3 } })
        .onGet('/wallet/transactions')
        .replyOnce(200, {
          data: [transactionsResponse.data[0]],
          meta: { page: 2, total: 4, perPage: 3 },
        })
      const { result } = renderHook(() => useWalletTransactionsInfiniteQuery(), {
        wrapper: createWrapper(queryClient),
      })
      await waitFor(() => expect(result.current.hasNextPage).toBe(true))
      await act(async () => {
        await result.current.fetchNextPage()
      })
      expect(mock.history.get[1]?.params).toMatchObject({ page: 2 })
      await waitFor(() => expect(result.current.hasNextPage).toBe(false))
    })
  })

  describe('useWalletPaymentsInfiniteQuery', () => {
    it('GET /wallet/payments sayfasını okur', async () => {
      mock.onGet('/wallet/payments').reply(200, paymentsResponse)
      const { result } = renderHook(() => useWalletPaymentsInfiniteQuery(), {
        wrapper: createWrapper(queryClient),
      })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data?.pages[0]?.data[0]?.invoice?.fileName).toBe('fatura-2026-0012.pdf')
    })
  })

  describe('useInvoiceUrlMutation', () => {
    it('imzalı adresi döner', async () => {
      const id = paymentsResponse.data[0]?.id ?? ''
      mock
        .onGet(`/wallet/payments/${id}/invoice`)
        .reply(200, { data: { url: 'https://storage.test/f.pdf?sig=1' } })
      const { result } = renderHook(() => useInvoiceUrlMutation(), {
        wrapper: createWrapper(queryClient),
      })
      let url = ''
      await act(async () => {
        url = await result.current.mutateAsync(id)
      })
      expect(url).toBe('https://storage.test/f.pdf?sig=1')
    })
  })

  describe('useTopupOptionsQuery', () => {
    it('anonim olarak da çalışır', async () => {
      useAuthStore.getState().clearAuth()
      mock.onGet('/wallet/topup-options').reply(200, topupResponse)
      const { result } = renderHook(() => useTopupOptionsQuery(), {
        wrapper: createWrapper(queryClient),
      })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data?.minKurus).toBe(25000)
    })
  })

  describe('usePayTrInitMutation', () => {
    it('amountKurus gönderir ve iframe bilgisini döner', async () => {
      mock.onPost('/payments/paytr/init').reply(200, {
        data: {
          iframeToken: 'tok',
          merchantOid: 'PA123',
          iframeUrl: 'https://www.paytr.com/odeme/guvenli/tok',
        },
      })
      const { result } = renderHook(() => usePayTrInitMutation(), {
        wrapper: createWrapper(queryClient),
      })
      await act(async () => {
        await result.current.mutateAsync({ amountKurus: 100000 })
      })
      expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({ amountKurus: 100000 })
      expect(result.current.data?.merchantOid).toBe('PA123')
    })

    it('422 TOPUP_AMOUNT_OUT_OF_RANGE hatasını taşır', async () => {
      mock.onPost('/payments/paytr/init').reply(422, {
        code: 'TOPUP_AMOUNT_OUT_OF_RANGE',
        message: 'Tutar aralık dışında.',
      })
      const { result } = renderHook(() => usePayTrInitMutation(), {
        wrapper: createWrapper(queryClient),
      })
      act(() => result.current.mutate({ amountKurus: 100 }))
      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.error).toMatchObject({ code: 'TOPUP_AMOUNT_OUT_OF_RANGE' })
    })
  })
})
