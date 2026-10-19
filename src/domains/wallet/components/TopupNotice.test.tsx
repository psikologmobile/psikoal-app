import { Platform } from 'react-native'

import { fireEvent, render } from '@testing-library/react-native'

import transactions from '../schemas/__fixtures__/wallet-transactions.response.json'
import { WalletTransactionPageSchema } from '../schemas/wallet.schema'
import { isRightsTransaction } from '../utils/walletUtils'

import { TopupNotice } from './TopupNotice'

const mockPush = jest.fn()
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }))
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
}))
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}))

const MESSAGE = 'Bakiye yükleme web sitemizden yapılır.'

describe('TopupNotice', () => {
  const original = Platform.OS
  afterEach(() => {
    Platform.OS = original
  })

  it('native: plain text only — no purchase link (store rule)', () => {
    Platform.OS = 'ios'
    const { getByText, queryByText } = render(<TopupNotice message={MESSAGE} tone="danger" />)
    expect(getByText(MESSAGE)).toBeTruthy()
    expect(queryByText('Bakiye yükle')).toBeNull()
  })

  it('web: "Bakiye yükle" opens /bakiye', () => {
    Platform.OS = 'web'
    const { getByText, queryByText } = render(
      <TopupNotice message={MESSAGE} webMessage="Bakiyen yetersiz." />
    )
    expect(queryByText(MESSAGE)).toBeNull()
    expect(getByText('Bakiyen yetersiz.')).toBeTruthy()
    fireEvent.press(getByText('Bakiye yükle'))
    expect(mockPush).toHaveBeenCalledWith('/bakiye')
  })
})

describe('isRightsTransaction', () => {
  it('is true only for rows with a free-right change', () => {
    const [fee, welcome] = WalletTransactionPageSchema.parse(transactions).data
    expect(welcome && isRightsTransaction(welcome)).toBe(true)
    expect(fee && isRightsTransaction(fee)).toBe(false)
  })
})
