import { act, renderHook, waitFor } from '@testing-library/react-native'
import MockAdapter from 'axios-mock-adapter'

import { isExpertNotVisibleError } from '../utils/expertVisibility'

import { useExpertProfileAccess } from './useExpertProfileAccess'

import type { QueryClient } from '@tanstack/react-query'

import { ApiError, axiosInstance } from '@/lib/api'
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

const EXPERT_ID = 'ebd85687-7c16-481d-a456-b09565928a2a'
const EXPERT = {
  id: EXPERT_ID,
  firstName: 'Mehmet',
  lastName: 'Demir',
  title: 'Uzman Psikolog',
  specializations: ['anksiyete'],
  experienceYears: 8,
  bio: 'Bilişsel davranışçı terapi alanında çalışıyorum.',
  avatarUrl: null,
  rating: 4.8,
  reviewCount: 12,
  isVerified: true,
  status: 'approved',
  initials: 'MD',
  acceptsOffers: true,
  education: null,
  cvUrl: null,
  certificates: [],
  personalWebsite: null,
}

describe('useExpertProfileAccess (Revize 2 §6)', () => {
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

  function renderAccess(id = EXPERT_ID) {
    return renderHook(() => useExpertProfileAccess(id), { wrapper: createWrapper(queryClient) })
  }

  it('görünür profil', async () => {
    mock.onGet(`/experts/${EXPERT_ID}`).reply(200, EXPERT)
    const { result } = renderAccess()
    expect(result.current.state).toBe('loading')
    await waitFor(() => expect(result.current.state).toBe('visible'))
    expect(result.current.expert?.lastName).toBe('Demir')
  })

  it('404 EXPERT_NOT_FOUND → notVisible', async () => {
    mock
      .onGet(`/experts/${EXPERT_ID}`)
      .reply(404, { code: 'EXPERT_NOT_FOUND', message: 'Uzman bulunamadı.' })
    const { result } = renderAccess()
    await waitFor(() => expect(result.current.state).toBe('notVisible'))
    expect(result.current.expert).toBeUndefined()
  })

  it('sunucu hatası → error; refetch yeniden dener', async () => {
    mock.onGet(`/experts/${EXPERT_ID}`).replyOnce(500, { code: 'INTERNAL_ERROR', message: 'x' })
    const { result } = renderAccess()
    await waitFor(() => expect(result.current.state).toBe('error'))
    mock.onGet(`/experts/${EXPERT_ID}`).replyOnce(200, EXPERT)
    act(() => result.current.refetch())
    await waitFor(() => expect(result.current.state).toBe('visible'))
  })

  it('kimlik yoksa istek atmadan notVisible', () => {
    const { result } = renderAccess('')
    expect(result.current.state).toBe('notVisible')
    expect(mock.history.get).toHaveLength(0)
  })

  it('isExpertNotVisibleError yalnız EXPERT_NOT_FOUND için true', () => {
    expect(isExpertNotVisibleError(new ApiError('EXPERT_NOT_FOUND', 'x', 404))).toBe(true)
    expect(isExpertNotVisibleError(new ApiError('LISTING_NOT_FOUND', 'x', 404))).toBe(false)
  })
})
