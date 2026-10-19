import { act, renderHook, waitFor } from '@testing-library/react-native'
import MockAdapter from 'axios-mock-adapter'

import { expertKeys } from '../expert.constants'

import {
  CERTIFICATE_NOT_FOUND,
  useRemoveExpertCertificateMutation,
} from './useRemoveExpertCertificateMutation'

import type { QueryClient } from '@tanstack/react-query'

import { axiosInstance, isApiErrorCode } from '@/lib/api'
import { createTestQueryClient, createWrapper } from '@/test-utils/query'

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@/test-utils/screen').asyncStorageMock
)
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => 'token'),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}))

const CERT = 'experts/abc/certificates/BDT sertifikası & 2024.pdf'

describe('useRemoveExpertCertificateMutation', () => {
  let mock: MockAdapter
  let queryClient: QueryClient

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
    queryClient = createTestQueryClient()
  })

  afterEach(() => {
    mock.restore()
    queryClient.clear()
  })

  it('değeri URL kodlayıp DELETE gönderir, güncel listeyi döndürür ve profili tazeler', async () => {
    mock.onDelete(/\/experts\/profile\/certificates/).reply(200, { certificates: ['kalan.pdf'] })
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useRemoveExpertCertificateMutation(), {
      wrapper: createWrapper(queryClient),
    })

    let data: unknown
    await act(async () => {
      data = await result.current.mutateAsync(CERT)
    })

    expect(mock.history.delete[0]?.url).toBe(
      `/experts/profile/certificates?certificate=${encodeURIComponent(CERT)}`
    )
    expect(data).toEqual({ certificates: ['kalan.pdf'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: expertKeys.all })
  })

  it('zarflı yanıtı da açar', async () => {
    mock.onDelete(/\/experts\/profile\/certificates/).reply(200, { data: { certificates: [] } })
    const { result } = renderHook(() => useRemoveExpertCertificateMutation(), {
      wrapper: createWrapper(queryClient),
    })
    let data: unknown
    await act(async () => {
      data = await result.current.mutateAsync('a.pdf')
    })
    expect(data).toEqual({ certificates: [] })
  })

  it('404 CERTIFICATE_NOT_FOUND tipli hata olarak gelir', async () => {
    mock.onDelete(/\/experts\/profile\/certificates/).reply(404, {
      code: CERTIFICATE_NOT_FOUND,
      message: 'Sertifika bulunamadı.',
    })
    const { result } = renderHook(() => useRemoveExpertCertificateMutation(), {
      wrapper: createWrapper(queryClient),
    })
    act(() => result.current.mutate('yok.pdf'))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(isApiErrorCode(result.current.error, CERTIFICATE_NOT_FOUND)).toBe(true)
  })
})
