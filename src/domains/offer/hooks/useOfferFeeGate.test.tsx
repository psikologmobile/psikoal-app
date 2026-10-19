import { renderHook, waitFor } from '@testing-library/react-native'
import MockAdapter from 'axios-mock-adapter'

import { feeChangedText, useOfferFeeGate } from './useOfferFeeGate'

import type { QueryClient } from '@tanstack/react-query'

import { INSUFFICIENT_BALANCE_MESSAGE } from '@/domains/wallet'
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

const LISTING_ID = '01a025d8-f8c9-78db-aa2b-aa72da13dfae'
const QUOTE = {
  feeKurus: 62500,
  feeLabel: '₺625',
  balanceKurus: 125000,
  balanceLabel: '₺1.250',
  freeOfferRights: 0,
  willUseFreeRight: false,
  balanceAfterKurus: 62500,
  balanceAfterLabel: '₺625',
  sufficient: true,
}

describe('useOfferFeeGate', () => {
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

  function renderGate(submitError?: unknown) {
    return renderHook(() => useOfferFeeGate({ listingId: LISTING_ID, submitError }), {
      wrapper: createWrapper(queryClient),
    })
  }

  it('ücret gelene kadar gönderim kilitli; sonra expectedFeeKurus = ücret', async () => {
    mock.onGet('/offers/quote').reply(200, { data: QUOTE })
    const { result } = renderGate()
    expect(result.current.canSubmit).toBe(false)
    expect(result.current.expectedFeeKurus).toBeUndefined()

    await waitFor(() => expect(result.current.canSubmit).toBe(true))
    expect(result.current.expectedFeeKurus).toBe(62500)
    expect(result.current.isRefreshing).toBe(false)
    expect(result.current.insufficientMessage).toBeUndefined()
    expect(result.current.feeChangedMessage).toBeUndefined()
    expect(result.current.errorMessage).toBeUndefined()
  })

  it('sunucu yetersiz derse kilitler ve düz metni verir', async () => {
    mock.onGet('/offers/quote').reply(200, { data: { ...QUOTE, sufficient: false } })
    const { result } = renderGate()
    await waitFor(() => expect(result.current.quote).toBeDefined())
    expect(result.current.canSubmit).toBe(false)
    expect(result.current.insufficientMessage).toBe(INSUFFICIENT_BALANCE_MESSAGE)
  })

  it('422 INSUFFICIENT_BALANCE gönderim hatası da aynı metni verir', async () => {
    mock.onGet('/offers/quote').reply(200, { data: QUOTE })
    const { result } = renderGate(new ApiError('INSUFFICIENT_BALANCE', 'x', 422))
    await waitFor(() => expect(result.current.quote).toBeDefined())
    expect(result.current.insufficientMessage).toBe(INSUFFICIENT_BALANCE_MESSAGE)
  })

  it('409 OFFER_FEE_CHANGED: yeni ücret mesajı', async () => {
    mock.onGet('/offers/quote').reply(200, { data: QUOTE })
    const error = new ApiError('OFFER_FEE_CHANGED', 'x', 409, undefined, {
      feeKurus: 56000,
      feeLabel: '₺560',
    })
    const { result } = renderGate(error)
    await waitFor(() => expect(result.current.quote).toBeDefined())
    expect(result.current.feeChangedMessage).toBe(feeChangedText('₺560'))
  })

  it('feeChangedText: etiket yoksa genel metin', () => {
    expect(feeChangedText(undefined)).toBe(
      'Teklif ücreti güncellendi. Yeni ücreti onaylayıp tekrar gönderin.'
    )
    expect(feeChangedText('₺625')).toContain('₺625')
  })

  it('diğer hatalar errorMessage alanına düşer', async () => {
    mock.onGet('/offers/quote').reply(200, { data: QUOTE })
    const { result } = renderGate(
      new ApiError('OFFER_ALREADY_EXISTS', 'Zaten teklif verdiniz.', 409)
    )
    await waitFor(() => expect(result.current.quote).toBeDefined())
    expect(result.current.errorMessage).toBe('Zaten teklif verdiniz.')
  })
})
