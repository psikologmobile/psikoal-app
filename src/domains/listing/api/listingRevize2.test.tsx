import { act, renderHook, waitFor } from '@testing-library/react-native'
import MockAdapter from 'axios-mock-adapter'

import { listingKeys } from '../listing.constants'
import fixtures from '../schemas/__fixtures__/listings.response.json'

import { useCreateClaimMutation } from './useCreateClaimMutation'
import { useCreateListingMutation } from './useCreateListingMutation'
import { useDismissClaimMutation } from './useDismissClaimMutation'
import { toListingListParams, useListingListQuery } from './useListingListQuery'
import { useListingRulesQuery } from './useListingRulesQuery'
import { useMarkMatchedMutation } from './useMarkMatchedMutation'

import type { QueryClient } from '@tanstack/react-query'

import { authKeys } from '@/domains/auth'
import { matchKeys } from '@/domains/match'
import { notificationKeys } from '@/domains/notification'
import { offerKeys } from '@/domains/offer'
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

const LISTING_ID = fixtures.expertView.id
const OFFER_ID = '01a025d8-f9fe-7b9d-9fa6-2c3f08f7e7f6'
const MATCH_ID = 'ed14dc39-8062-4216-bdfc-1e94d366075f'
const EXPERT_ID = 'c519bd04-67c3-4e6a-af6f-f88999a8a53f'
const CLAIM = {
  id: '0b8f3c6e-1d2a-4f5b-9c8d-7e6f5a4b3c2d',
  listingId: LISTING_ID,
  expertId: EXPERT_ID,
  note: 'Telefonda görüştük',
  createdAt: '2026-10-19T08:00:00.000000Z',
  dismissedAt: null,
}

describe('toListingListParams', () => {
  it('boş süzgeçleri göndermez; invitedOnly yalnız true iken gider', () => {
    expect(toListingListParams()).toEqual({})
    expect(toListingListParams({ invitedOnly: false, city: '' })).toEqual({})
    expect(
      toListingListParams(
        { invitedOnly: true, city: 'İzmir', specialization: ['depresyon'] },
        'fee_asc'
      )
    ).toEqual({ invitedOnly: true, city: 'İzmir', specialization: ['depresyon'], sort: 'fee_asc' })
  })
})

describe('ilan uçları (Revize 2)', () => {
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

  it('useListingListQuery şehir/davet/fee_asc ile feed çeker', async () => {
    mock.onGet('/listings').reply(200, {
      data: [fixtures.expertView],
      meta: { page: 1, total: 1, perPage: 1 },
    })
    const { result } = renderHook(
      () => useListingListQuery({ city: 'İstanbul', invitedOnly: true }, 'fee_asc'),
      { wrapper: createWrapper(queryClient) }
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mock.history.get[0]?.params).toEqual({
      city: 'İstanbul',
      invitedOnly: true,
      sort: 'fee_asc',
    })
    expect(result.current.data?.data[0]?.invitedByViewer).toBe(true)
  })

  it('useListingRulesQuery', async () => {
    const rules = {
      budgetMinTry: 500,
      budgetMaxTry: null,
      titleMin: 10,
      titleMax: 100,
      descriptionMax: 2000,
      cityRequiredFor: ['yüz_yüze', 'yüz_yüze_online'],
      maxActive: 3,
    }
    mock.onGet('/listings/rules').reply(200, { data: rules })
    const { result } = renderHook(() => useListingRulesQuery(), {
      wrapper: createWrapper(queryClient),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(rules)
  })

  it('useCreateListingMutation rıza ve telefonla gönderir; telefon varsa profili tazeler', async () => {
    mock.onPost('/listings').reply(200, fixtures.clientView)
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateListingMutation(), {
      wrapper: createWrapper(queryClient),
    })
    const request = {
      title: 'Kaygı için haftalık destek',
      specialization: ['anksiyete'],
      budgetMin: 800,
      budgetMax: 1500,
      preferredSessionType: 'yüz_yüze' as const,
      city: 'İstanbul',
      contactConsent: true,
      phone: '+905551112233',
    }
    await act(async () => {
      await result.current.mutateAsync(request)
    })
    expect(JSON.parse(mock.history.post[0]?.data as string)).toMatchObject({
      contactConsent: true,
      city: 'İstanbul',
      phone: '+905551112233',
    })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: listingKeys.my() })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: authKeys.me() })

    invalidate.mockClear()
    await act(async () => {
      await result.current.mutateAsync({ ...request, phone: undefined })
    })
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: authKeys.me() })
  })

  it('useCreateListingMutation 422 CONTACT_CONSENT_REQUIRED hatasını taşır', async () => {
    mock.onPost('/listings').reply(422, {
      code: 'CONTACT_CONSENT_REQUIRED',
      message: 'Rıza gerekli.',
      field: 'contactConsent',
    })
    const { result } = renderHook(() => useCreateListingMutation(), {
      wrapper: createWrapper(queryClient),
    })
    act(() =>
      result.current.mutate({
        title: 'Kaygı için haftalık destek',
        specialization: ['anksiyete'],
        budgetMin: 800,
        budgetMax: 1500,
        preferredSessionType: 'online',
        contactConsent: true,
      })
    )
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ code: 'CONTACT_CONSENT_REQUIRED' })
  })

  it('useMarkMatchedMutation matchId döner ve ilgili sorguları tazeler', async () => {
    mock.onPost(`/listings/${LISTING_ID}/match`).reply(200, { data: { matchId: MATCH_ID } })
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useMarkMatchedMutation(), {
      wrapper: createWrapper(queryClient),
    })
    let matchId = ''
    await act(async () => {
      matchId = (await result.current.mutateAsync({ listingId: LISTING_ID, offerId: OFFER_ID }))
        .matchId
    })
    expect(matchId).toBe(MATCH_ID)
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({ offerId: OFFER_ID })
    for (const queryKey of [
      listingKeys.detail(LISTING_ID),
      listingKeys.my(),
      offerKeys.all,
      matchKeys.all,
      notificationKeys.all,
    ]) {
      expect(invalidate).toHaveBeenCalledWith({ queryKey })
    }
  })

  it('useMarkMatchedMutation 409 LISTING_NOT_OPEN hatasını taşır', async () => {
    mock
      .onPost(`/listings/${LISTING_ID}/match`)
      .reply(409, { code: 'LISTING_NOT_OPEN', message: 'İlan açık değil.' })
    const { result } = renderHook(() => useMarkMatchedMutation(), {
      wrapper: createWrapper(queryClient),
    })
    act(() => result.current.mutate({ listingId: LISTING_ID, offerId: OFFER_ID }))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ code: 'LISTING_NOT_OPEN', status: 409 })
  })

  it('useCreateClaimMutation notu gönderir ve ilanı, teklifleri tazeler', async () => {
    mock.onPost(`/listings/${LISTING_ID}/claims`).reply(201, { data: CLAIM })
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateClaimMutation(), {
      wrapper: createWrapper(queryClient),
    })
    await act(async () => {
      await result.current.mutateAsync({ listingId: LISTING_ID, note: ' Telefonda görüştük ' })
    })
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      note: 'Telefonda görüştük',
    })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: listingKeys.detail(LISTING_ID) })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: offerKeys.all })
  })

  it('useCreateClaimMutation 409 CLAIM_ALREADY_EXISTS hatasını taşır', async () => {
    mock
      .onPost(`/listings/${LISTING_ID}/claims`)
      .reply(409, { code: 'CLAIM_ALREADY_EXISTS', message: 'Zaten bildirdiniz.' })
    const { result } = renderHook(() => useCreateClaimMutation(), {
      wrapper: createWrapper(queryClient),
    })
    act(() => result.current.mutate({ listingId: LISTING_ID }))
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ code: 'CLAIM_ALREADY_EXISTS' })
  })

  it('useDismissClaimMutation doğru uca gider ve bildirimleri tazeler', async () => {
    mock
      .onPost(`/listings/${LISTING_ID}/claims/${EXPERT_ID}/dismiss`)
      .reply(200, { data: { ...CLAIM, dismissedAt: '2026-10-19T09:00:00.000000Z' } })
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useDismissClaimMutation(), {
      wrapper: createWrapper(queryClient),
    })
    await act(async () => {
      await result.current.mutateAsync({ listingId: LISTING_ID, expertId: EXPERT_ID })
    })
    expect(result.current.data?.dismissedAt).not.toBeNull()
    expect(invalidate).toHaveBeenCalledWith({ queryKey: listingKeys.detail(LISTING_ID) })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: notificationKeys.all })
  })
})
