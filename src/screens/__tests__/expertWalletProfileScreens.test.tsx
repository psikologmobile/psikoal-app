import { Share } from 'react-native'

import { act, fireEvent, waitFor } from '@testing-library/react-native'

import { ClaimScreen } from '../claim/ClaimScreen'
import { ProfessionalProfileScreen } from '../profile/ProfessionalProfileScreen'
import { ReferralScreen } from '../wallet/ReferralScreen'
import { WalletInvoicesScreen } from '../wallet/WalletInvoicesScreen'
import { WalletScreen } from '../wallet/WalletScreen'

import listingFixtures from '@/domains/listing/schemas/__fixtures__/listings.response.json'
import paymentFixtures from '@/domains/wallet/schemas/__fixtures__/wallet-payments.response.json'
import transactionFixtures from '@/domains/wallet/schemas/__fixtures__/wallet-transactions.response.json'
import { EXPERT_PROFILE, WALLET, setupExpertScreen } from '@/test-utils/expertScreen'

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() }
let mockParams: Record<string, string> = {}

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
  Redirect: () => null,
}))
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
)
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
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(() => Promise.resolve(true)) }))
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn(async () => undefined) }))

const LISTING = listingFixtures.expertView
let env: ReturnType<typeof setupExpertScreen>

beforeEach(() => {
  jest.clearAllMocks()
  mockParams = {}
  env = setupExpertScreen()
})
afterEach(() => env.cleanup())

describe('Bakiyem', () => {
  it('shows balance, free rights, plain-text topup notice and transactions', async () => {
    env.mock.onGet('/wallet/me').reply(200, { data: WALLET })
    env.mock.onGet('/wallet/transactions').reply(200, transactionFixtures)
    const screen = env.renderScreen(<WalletScreen />)

    expect(await screen.findByLabelText('Bakiye ₺1.250')).toBeTruthy()
    expect(screen.getByText('Ücretsiz hak · 1')).toBeTruthy()
    expect(screen.getByText('Bakiye yükleme web sitemizden yapılır.')).toBeTruthy()
    expect(screen.queryByText('Bakiye yükle')).toBeNull()
    expect(await screen.findByText('−₺625')).toBeTruthy()

    // "Haklar": yalnız hak hareketi olan satırlar.
    fireEvent.press(screen.getByText('Haklar'))
    await waitFor(() => expect(screen.queryByText('−₺625')).toBeNull())
    expect(screen.getByText('+1 hak')).toBeTruthy()

    fireEvent.press(screen.getByText('Yüklemeler'))
    await waitFor(() =>
      expect(env.mock.history.get.some((r) => r.params?.type === 'TOPUP')).toBe(true)
    )

    fireEvent.press(screen.getByText('Faturalarım'))
    expect(mockRouter.push).toHaveBeenCalledWith('/wallet/invoices')
  })

  it('empty state', async () => {
    env.mock
      .onGet('/wallet/me')
      .reply(200, { data: { ...WALLET, balanceKurus: 0, balanceLabel: '₺0' } })
    env.mock
      .onGet('/wallet/transactions')
      .reply(200, { data: [], meta: { page: 1, total: 0, perPage: 20 } })
    const screen = env.renderScreen(<WalletScreen />)
    expect(await screen.findByText('Henüz hareket yok')).toBeTruthy()
  })
})

describe('Faturalarım', () => {
  it('lists payments with open-invoice action', async () => {
    env.mock.onGet('/wallet/payments').reply(200, {
      ...paymentFixtures,
      data: [
        ...paymentFixtures.data,
        { ...paymentFixtures.data[0], id: '6a7b8c9d-0e1f-4a2b-8c3d-5e6f7a8b9c0d', invoice: null },
      ],
    })
    env.mock
      .onGet(/\/wallet\/payments\/.+\/invoice/)
      .reply(200, { data: { url: 'https://storage.psikoal.test/f.pdf' } })
    const screen = env.renderScreen(<WalletInvoicesScreen />)
    expect(await screen.findByText('Faturayı aç')).toBeTruthy()
    expect(screen.getByText('Hazırlanıyor')).toBeTruthy()
    fireEvent.press(screen.getByText('Faturayı aç'))
    await waitFor(() =>
      expect(env.mock.history.get.some((r) => r.url?.endsWith('/invoice'))).toBe(true)
    )
  })

  it('empty state', async () => {
    env.mock
      .onGet('/wallet/payments')
      .reply(200, { data: [], meta: { page: 1, total: 0, perPage: 20 } })
    const screen = env.renderScreen(<WalletInvoicesScreen />)
    expect(await screen.findByText('Henüz ödeme yok')).toBeTruthy()
  })
})

describe('Davet linkim', () => {
  it('shows code + link, copies and shares', async () => {
    env.mock.onGet('/wallet/me').reply(200, { data: WALLET })
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' })
    const screen = env.renderScreen(<ReferralScreen />)
    expect(await screen.findByText('K7M2PX9Q')).toBeTruthy()
    expect(screen.getByText(WALLET.referralLink)).toBeTruthy()
    expect(screen.getByText(/"Davet" rozetiyle düşer/)).toBeTruthy()

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Davet linki kopyala'))
    })
    expect(await screen.findByLabelText('Davet linki kopyalandı')).toBeTruthy()

    fireEvent.press(screen.getByTestId('referral-share'))
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ url: WALLET.referralLink }))
  })
})

describe('Danışanla anlaştım', () => {
  const open = { ...LISTING, viewerClaim: null }

  it('reports once with an optional note', async () => {
    mockParams = { listingId: LISTING.id }
    env.mock.onGet(`/listings/${LISTING.id}`).reply(200, open)
    env.mock.onPost(`/listings/${LISTING.id}/claims`).reply(201, {
      data: {
        id: '7b8c9d0e-1f2a-4b3c-8d4e-6f7a8b9c0d1e',
        listingId: LISTING.id,
        expertId: EXPERT_PROFILE.id,
        note: 'Görüştük',
        createdAt: '2026-10-19T10:00:00.000Z',
        dismissedAt: null,
      },
    })
    const screen = env.renderScreen(<ClaimScreen />)
    expect(await screen.findByText('Her ilan için yalnız bir kez bildirebilirsin.')).toBeTruthy()
    fireEvent.changeText(screen.getByTestId('claim-note'), 'Görüştük')
    fireEvent.press(screen.getByTestId('claim-open'))
    fireEvent.press(await screen.findByTestId('claim-confirm'))
    expect(await screen.findByText('Bildirildi')).toBeTruthy()
    expect(JSON.parse(String(env.mock.history.post[0]?.data))).toEqual({ note: 'Görüştük' })
  })

  it('already reported → pending explanation', async () => {
    mockParams = { listingId: LISTING.id }
    env.mock.onGet(`/listings/${LISTING.id}`).reply(200, LISTING)
    const screen = env.renderScreen(<ClaimScreen />)
    expect(await screen.findByText('Zaten bildirdin')).toBeTruthy()
  })
})

describe('Mesleki bilgiler ve belgeler', () => {
  it('validates the website, switches tabs and saves with a toast', async () => {
    env.mock.onGet(`/experts/${EXPERT_PROFILE.id}`).reply(200, EXPERT_PROFILE)
    env.mock.onGet('/categories').reply(200, { data: [], meta: { page: 1, total: 0, perPage: 20 } })
    env.mock.onPatch('/experts/profile').reply(200, EXPERT_PROFILE)
    const screen = env.renderScreen(<ProfessionalProfileScreen />)

    expect(await screen.findByDisplayValue('Klinik Psikolog')).toBeTruthy()
    fireEvent.press(screen.getByText('Belgeler'))
    expect(await screen.findByText('Sertifika ekle')).toBeTruthy()
    expect(screen.getByText('Sertifika 1 · PDF')).toBeTruthy()

    fireEvent.changeText(screen.getByPlaceholderText('https://ornek.com'), 'ornek')
    fireEvent.press(screen.getByTestId('professional-save'))
    expect(await screen.findByText('Geçerli bir adres yaz (https://ornek.com)')).toBeTruthy()

    fireEvent.changeText(screen.getByPlaceholderText('https://ornek.com'), 'https://ornek.com')
    fireEvent.press(screen.getByTestId('professional-save'))
    expect(await screen.findByText('Değişikliğin incelemede')).toBeTruthy()
    expect(JSON.parse(String(env.mock.history.patch[0]?.data))).toMatchObject({
      personalWebsite: 'https://ornek.com',
      title: 'Klinik Psikolog',
    })
  })

  it('removes a certificate after confirmation', async () => {
    mockParams = { tab: 'belgeler' }
    env.mock.onGet(`/experts/${EXPERT_PROFILE.id}`).reply(200, EXPERT_PROFILE)
    env.mock.onDelete(/certificates/).reply(200, { certificates: [] })
    const screen = env.renderScreen(<ProfessionalProfileScreen />)
    fireEvent.press(await screen.findByLabelText('Sertifika 1 · PDF kaldır'))
    expect(await screen.findByText('Sertifika kaldırılsın mı?')).toBeTruthy()
    fireEvent.press(screen.getByTestId('certificate-remove-confirm'))
    expect(await screen.findByText('Sertifika kaldırıldı')).toBeTruthy()
    expect(env.mock.history.delete[0]?.url).toBe(
      `/experts/profile/certificates?certificate=${encodeURIComponent('id/certificates/b.pdf')}`
    )
  })

  it('opens on the documents tab from the old /profile/documents link', async () => {
    mockParams = { tab: 'belgeler' }
    env.mock.onGet(`/experts/${EXPERT_PROFILE.id}`).reply(200, EXPERT_PROFILE)
    const screen = env.renderScreen(<ProfessionalProfileScreen />)
    expect(await screen.findByText('Sertifika ekle')).toBeTruthy()
  })
})
