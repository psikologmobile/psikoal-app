import transactionsResponse from '../schemas/__fixtures__/wallet-transactions.response.json'
import { WalletTransactionPageSchema } from '../schemas/wallet.schema'

import {
  freeRightsCaption,
  getNextWalletPage,
  isInsufficientBalanceError,
  isInvoiceUnavailableError,
  isTopupAmountOutOfRangeError,
  isTopupExpertNotApprovedError,
  toTransactionView,
} from './walletUtils'

import { ApiError } from '@/lib/api'

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

const transactions = WalletTransactionPageSchema.parse(transactionsResponse).data

describe('walletUtils', () => {
  it('getNextWalletPage meta’dan sonraki sayfayı bulur', () => {
    expect(getNextWalletPage({ meta: { page: 1, perPage: 20, total: 41 } })).toBe(2)
    expect(getNextWalletPage({ meta: { page: 3, perPage: 20, total: 41 } })).toBeUndefined()
  })

  it.each([
    ['INSUFFICIENT_BALANCE', 422, isInsufficientBalanceError],
    ['TOPUP_AMOUNT_OUT_OF_RANGE', 422, isTopupAmountOutOfRangeError],
    ['TOPUP_EXPERT_NOT_APPROVED', 403, isTopupExpertNotApprovedError],
    ['INVOICE_NOT_FOUND', 404, isInvoiceUnavailableError],
    ['INVOICE_PAYMENT_NOT_PAID', 409, isInvoiceUnavailableError],
  ])('%s kodunu tanır', (code, status, guard) => {
    expect(guard(new ApiError(code, 'm', status))).toBe(true)
    expect(guard(new ApiError('OTHER', 'm', status))).toBe(false)
    expect(guard(new Error(code))).toBe(false)
  })

  it('freeRightsCaption', () => {
    expect(freeRightsCaption(0)).toBe('')
    expect(freeRightsCaption(2)).toBe('2 ücretsiz teklif hakkı')
  })

  it('toTransactionView: tutar hareketi', () => {
    expect(toTransactionView(transactions[0]!)).toEqual({
      direction: 'out',
      title: 'Teklif ücreti',
      description: 'Panik atak ataklarım için haftalık online destek arıyorum',
      amount: '−₺625',
      after: '₺1.250',
    })
    expect(toTransactionView(transactions[2]!).direction).toBe('in')
  })

  it('toTransactionView: yalnız hak hareketi (tutar 0)', () => {
    expect(toTransactionView(transactions[1]!)).toMatchObject({
      direction: 'in',
      description: 'Hoş geldin hakkı',
      amount: '+1 hak',
    })
    expect(
      toTransactionView({ ...transactions[1]!, freeRightsDelta: -1, freeRightsLabel: '−1 hak' })
    ).toMatchObject({ direction: 'out', amount: '−1 hak' })
  })
})
