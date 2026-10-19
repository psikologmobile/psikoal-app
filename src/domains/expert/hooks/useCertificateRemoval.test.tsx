import { act, renderHook, waitFor } from '@testing-library/react-native'
import MockAdapter from 'axios-mock-adapter'

import { useCertificateRemoval } from './useCertificateRemoval'

import type { QueryClient } from '@tanstack/react-query'

import { axiosInstance } from '@/lib/api'
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

const TARGET = { value: 'certs/a.pdf', label: 'Sertifika 1 · PDF' }

describe('useCertificateRemoval', () => {
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

  function setup(onDone = jest.fn()) {
    return {
      onDone,
      ...renderHook(() => useCertificateRemoval({ onDone }), {
        wrapper: createWrapper(queryClient),
      }),
    }
  }

  it('onay → kaldırır, sayfayı kapatır, mesaj verir', async () => {
    mock.onDelete(/certificates/).reply(200, { certificates: [] })
    const { result, onDone } = setup()
    act(() => result.current.ask(TARGET))
    expect(result.current.target).toEqual(TARGET)
    act(() => result.current.confirm())
    await waitFor(() => expect(onDone).toHaveBeenCalledWith('Sertifika kaldırıldı'))
    expect(result.current.target).toBeNull()
  })

  it('404 zaten kaldırılmış: hata göstermez, profili tazeler', async () => {
    mock.onDelete(/certificates/).reply(404, { code: 'CERTIFICATE_NOT_FOUND', message: 'Yok' })
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries')
    const { result, onDone } = setup()
    act(() => result.current.ask(TARGET))
    act(() => result.current.confirm())
    await waitFor(() => expect(onDone).toHaveBeenCalledWith('Bu sertifika zaten kaldırılmış'))
    expect(result.current.target).toBeNull()
    expect(result.current.errorMessage).toBeUndefined()
    expect(invalidate).toHaveBeenCalled()
  })

  it('başka hata: sayfa açık kalır, mesaj gösterilir; vazgeç kapatır', async () => {
    mock.onDelete(/certificates/).reply(500, { code: 'SERVER', message: 'Sunucu hatası' })
    const { result, onDone } = setup()
    act(() => result.current.confirm()) // hedef yokken etkisiz
    act(() => result.current.ask(TARGET))
    act(() => result.current.confirm())
    await waitFor(() => expect(result.current.errorMessage).toBeDefined())
    expect(result.current.target).toEqual(TARGET)
    expect(onDone).not.toHaveBeenCalled()
    act(() => result.current.cancel())
    expect(result.current.target).toBeNull()
  })
})
