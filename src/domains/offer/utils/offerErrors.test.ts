import { isOfferFeeChangedError, parseSendOfferError } from './offerErrors'

import { ApiError, ERROR_MESSAGES, NetworkError } from '@/lib/api'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  multiGet: jest.fn(async (keys: string[]) => keys.map((k) => [k, null])),
  multiRemove: jest.fn(async () => undefined),
}))

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}))

const META = { feeKurus: 56000, feeLabel: '₺560' }

describe('parseSendOfferError', () => {
  it('hata yoksa null', () => {
    expect(parseSendOfferError(null)).toBeNull()
    expect(parseSendOfferError(undefined)).toBeNull()
  })

  it('409 OFFER_FEE_CHANGED: yeni ücret meta alanından', () => {
    const error = new ApiError('OFFER_FEE_CHANGED', 'Ücret değişti.', 409, undefined, META)
    expect(parseSendOfferError(error)).toEqual({
      kind: 'feeChanged',
      fee: META,
      message: 'Ücret değişti.',
    })
    expect(isOfferFeeChangedError(error)).toBe(true)
  })

  it('meta bozuksa fee null olur', () => {
    const error = new ApiError('OFFER_FEE_CHANGED', 'x', 409, undefined, { feeKurus: 'abc' })
    expect(parseSendOfferError(error)).toMatchObject({ kind: 'feeChanged', fee: null })
  })

  it('422 INSUFFICIENT_BALANCE', () => {
    const error = new ApiError('INSUFFICIENT_BALANCE', 'Yetersiz.', 422, undefined, META)
    expect(parseSendOfferError(error)).toMatchObject({ kind: 'insufficientBalance', fee: META })
    expect(isOfferFeeChangedError(error)).toBe(false)
  })

  it('diğer hatalar Türkçe mesajla other', () => {
    expect(parseSendOfferError(new ApiError('OFFER_ALREADY_EXISTS', 'Zaten var.', 409))).toEqual({
      kind: 'other',
      message: 'Zaten var.',
    })
    expect(parseSendOfferError(new NetworkError())).toEqual({
      kind: 'other',
      message: ERROR_MESSAGES.network,
    })
    expect(parseSendOfferError(new Error('boom'))).toEqual({
      kind: 'other',
      message: ERROR_MESSAGES.unknown,
    })
  })
})
