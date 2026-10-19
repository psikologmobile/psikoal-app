import { act, renderHook, waitFor } from '@testing-library/react-native'
import MockAdapter from 'axios-mock-adapter'

import { offerKeys } from '../offer.constants'
import listingOffersResponse from '../schemas/__fixtures__/listing-offers.response.json'

import { useOfferQuoteQuery } from './useOfferQuoteQuery'
import { useSendOfferMutation } from './useSendOfferMutation'

import type { QueryClient } from '@tanstack/react-query'

import { listingKeys } from '@/domains/listing'
import { walletKeys } from '@/domains/wallet'
import { axiosInstance } from '@/lib/api'
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

const offer = listingOffersResponse.data[0]
const LISTING_ID = offer?.listingId ?? ''
const payload = {
  listingId: LISTING_ID,
  price: 1100,
  sessionType: 'online' as const,
  expectedFeeKurus: 62500,
}

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

describe('teklif gönderimi (Revize 2)', () => {
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

  it('useOfferQuoteQuery listingId ile anlık ücreti çeker', async () => {
    mock.onGet('/offers/quote').reply(200, { data: QUOTE })
    const { result } = renderHook(() => useOfferQuoteQuery(LISTING_ID), {
      wrapper: createWrapper(queryClient),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mock.history.get[0]?.params).toEqual({ listingId: LISTING_ID })
    expect(result.current.data?.feeLabel).toBe('₺625')
  })

  it('useOfferQuoteQuery listingId yoksa istek atmaz', () => {
    const { result } = renderHook(() => useOfferQuoteQuery(undefined), {
      wrapper: createWrapper(queryClient),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('expectedFeeKurus gönderir ve teklif, ilan, ücret ve cüzdan sorgularını tazeler', async () => {
    mock.onPost('/offers').reply(200, offer)
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useSendOfferMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync(payload)
    })

    expect(JSON.parse(mock.history.post[0]?.data as string)).toMatchObject({
      expectedFeeKurus: 62500,
    })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: offerKeys.my() })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: offerKeys.quote(LISTING_ID) })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: listingKeys.all })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: walletKeys.all })
  })

  it.each([
    [409, 'OFFER_FEE_CHANGED'],
    [422, 'INSUFFICIENT_BALANCE'],
  ])('%i %s: meta ile hatayı taşır, ücreti ve bakiyeyi tazeler', async (status, code) => {
    mock.onPost('/offers').reply(status, {
      code,
      message: 'Sunucu mesajı',
      meta: { feeKurus: 56000, feeLabel: '₺560' },
    })
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useSendOfferMutation(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => result.current.mutate(payload))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ code, status, meta: { feeKurus: 56000 } })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: offerKeys.quote(LISTING_ID) })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: walletKeys.me() })
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: walletKeys.all })
  })

  it('diğer hatalarda ücreti tazelemez', async () => {
    mock
      .onPost('/offers')
      .reply(409, { code: 'OFFER_ALREADY_EXISTS', message: 'Zaten teklif verdiniz.' })
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useSendOfferMutation(), {
      wrapper: createWrapper(queryClient),
    })
    act(() => result.current.mutate(payload))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidate).not.toHaveBeenCalled()
  })
})
