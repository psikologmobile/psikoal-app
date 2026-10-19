import { act, renderHook, waitFor } from '@testing-library/react-native'
import MockAdapter from 'axios-mock-adapter'

import { useAuthStore } from '../store/authStore'
import { useReferralStore } from '../store/referralStore'

import { useReferrerQuery } from './useReferrerQuery'
import { useRegisterMutation } from './useRegisterMutation'

import type { QueryClient } from '@tanstack/react-query'

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

const LOGIN_RESPONSE = {
  user: TEST_CLIENT,
  tokens: { accessToken: 'a', refreshToken: 'r', expiresIn: 3600 },
}

const REGISTER_BODY = {
  email: 'yeni@psikoal.test',
  password: 'Sifre1234!',
  firstName: 'Yeni',
  lastName: 'Danışan',
  role: 'client' as const,
  termsAccepted: true,
  healthDataConsent: true,
}

describe('davet kodu ve davet eden uzman', () => {
  let mock: MockAdapter
  let queryClient: QueryClient

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
    queryClient = createTestQueryClient()
    useReferralStore.getState().clear()
  })

  afterEach(() => {
    mock.restore()
    queryClient.clear()
    useAuthStore.getState().clearAuth()
  })

  describe('referralStore', () => {
    it('geçerli kodu normalize edip saklar, bozuk kodu yok sayar', () => {
      expect(useReferralStore.getState().capture(' k7m2px9q ')).toBe(true)
      expect(useReferralStore.getState().pendingCode).toBe('K7M2PX9Q')
      expect(useReferralStore.getState().capture('bozuk kod!')).toBe(false)
      expect(useReferralStore.getState().pendingCode).toBe('K7M2PX9Q')
    })
  })

  describe('useRegisterMutation', () => {
    it('saklanan davet kodunu gönderir ve kayıttan sonra siler', async () => {
      useReferralStore.getState().capture('K7M2PX9Q')
      mock.onPost('/auth/register').reply(200, LOGIN_RESPONSE)
      const { result } = renderHook(() => useRegisterMutation(), {
        wrapper: createWrapper(queryClient),
      })
      await act(async () => {
        await result.current.mutateAsync(REGISTER_BODY)
      })
      expect(JSON.parse(mock.history.post[0]?.data as string)).toMatchObject({
        referralCode: 'K7M2PX9Q',
      })
      expect(useReferralStore.getState().pendingCode).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('formdaki kod saklanandan önceliklidir', async () => {
      useReferralStore.getState().capture('ESKIKOD1')
      mock.onPost('/auth/register').reply(200, LOGIN_RESPONSE)
      const { result } = renderHook(() => useRegisterMutation(), {
        wrapper: createWrapper(queryClient),
      })
      await act(async () => {
        await result.current.mutateAsync({ ...REGISTER_BODY, referralCode: 'YENIKOD2' })
      })
      expect(JSON.parse(mock.history.post[0]?.data as string).referralCode).toBe('YENIKOD2')
    })

    it('kod yoksa alanı göndermez; hata olursa saklanan kod kalır', async () => {
      mock.onPost('/auth/register').replyOnce(200, LOGIN_RESPONSE)
      const { result } = renderHook(() => useRegisterMutation(), {
        wrapper: createWrapper(queryClient),
      })
      await act(async () => {
        await result.current.mutateAsync(REGISTER_BODY)
      })
      expect(JSON.parse(mock.history.post[0]?.data as string)).not.toHaveProperty('referralCode')

      useReferralStore.getState().capture('K7M2PX9Q')
      mock.onPost('/auth/register').replyOnce(409, { code: 'AUTH_EMAIL_TAKEN', message: 'x' })
      await act(async () => {
        await result.current.mutateAsync(REGISTER_BODY).catch(() => undefined)
      })
      expect(useReferralStore.getState().pendingCode).toBe('K7M2PX9Q')
    })
  })

  describe('useReferrerQuery', () => {
    it('danışan için davet eden uzmanı döner', async () => {
      useAuthStore.getState().setAuth(TEST_CLIENT, 'a', 'r')
      const referrer = {
        id: TEST_EXPERT.id,
        name: 'Ayşe Demir',
        title: 'Uzman Psikolog',
        avatarUrl: null,
        initials: 'AD',
      }
      mock.onGet('/me/referrer').reply(200, { data: referrer })
      const { result } = renderHook(() => useReferrerQuery(), {
        wrapper: createWrapper(queryClient),
      })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(referrer)
    })

    it('davet eden yoksa null döner', async () => {
      useAuthStore.getState().setAuth(TEST_CLIENT, 'a', 'r')
      mock.onGet('/me/referrer').reply(200, { data: null })
      const { result } = renderHook(() => useReferrerQuery(), {
        wrapper: createWrapper(queryClient),
      })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toBeNull()
    })

    it('uzman oturumunda istek atmaz', () => {
      useAuthStore.getState().setAuth(TEST_EXPERT, 'a', 'r')
      const { result } = renderHook(() => useReferrerQuery(), {
        wrapper: createWrapper(queryClient),
      })
      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
