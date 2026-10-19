import { fireEvent, waitFor } from '@testing-library/react-native'

import { ExpertHomeScreen } from '../home/ExpertHomeScreen'
import { ExpertListingDetailScreen } from '../listing/ExpertListingDetailScreen'
import { ExpertOfferDetailScreen } from '../offer/ExpertOfferDetailScreen'
import { SendOfferScreen } from '../offer/SendOfferScreen'
import { ExpertOffersScreen } from '../offers/ExpertOffersScreen'

import listingFixtures from '@/domains/listing/schemas/__fixtures__/listings.response.json'
import { OfferSchema } from '@/domains/offer'
import offerFixtures from '@/domains/offer/schemas/__fixtures__/listing-offers.response.json'
import { EXPERT_PROFILE, QUOTE, WALLET, setupExpertScreen } from '@/test-utils/expertScreen'
import { COMPACT_LAYOUT, mockLayout, WIDE_LAYOUT } from '@/test-utils/screen'

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
jest.mock('@/core/hooks/useBreakpoint', () => require('@/test-utils/screen').breakpointMock)
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(() => Promise.resolve(true)) }))

const OFFERED = listingFixtures.expertView
const LISTING_ID = OFFERED.id
const OPEN = {
  ...OFFERED,
  viewerHasOffered: false,
  viewerOfferId: null,
  viewerClaim: null,
  clientContact: null,
  invitedByViewer: false,
}
const MY_OFFER = {
  ...OfferSchema.parse(offerFixtures.data[0]),
  status: 'PENDING',
  statusLabel: 'Gönderildi',
  closedReason: null,
  feePaidKurus: 62500,
  feePaidLabel: '₺625',
  claimed: true,
  clientContact: { fullName: 'Ayşe Yılmaz', phone: '+905551112233', email: 'ayse@psikoal.test' },
}

let env: ReturnType<typeof setupExpertScreen>

function serveCommon(expert: Record<string, unknown> = EXPERT_PROFILE) {
  env.mock.onGet(`/experts/${EXPERT_PROFILE.id}`).reply(200, expert)
  env.mock.onGet('/wallet/me').reply(200, { data: WALLET })
  env.mock.onGet('/categories').reply(200, { data: [], meta: { page: 1, total: 0, perPage: 20 } })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockParams = {}
  env = setupExpertScreen()
})
afterEach(() => {
  env.cleanup()
  mockLayout.current = COMPACT_LAYOUT
})

describe('Fırsatlar', () => {
  it('lists opportunities with fee footer and offer action', async () => {
    serveCommon()
    env.mock.onGet('/listings').reply(200, {
      data: [
        OPEN,
        { ...OFFERED, id: '01a025d8-f8c9-78db-aa2b-aa72da13dfaf', invitedByViewer: true },
      ],
      meta: { page: 1, total: 2, perPage: 20 },
    })
    env.mock.onGet('/offers/my').reply(200, {
      data: [],
      meta: { page: 1, total: 0, perPage: 0, pendingCount: 3 },
    })
    const screen = env.renderScreen(<ExpertHomeScreen />)

    expect(await screen.findByText('2 açık ilan')).toBeTruthy()
    expect(screen.getByText('Fırsatlar')).toBeTruthy()
    expect(screen.getAllByText('₺625').length).toBeGreaterThan(0)
    expect(screen.getByText('Teklifini gör')).toBeTruthy()
    expect(screen.getByText('Davet')).toBeTruthy()
    expect(await screen.findByText('3 teklif')).toBeTruthy()
    // Müşteri kararı: düşüş göstergesi yok.
    expect(screen.queryByText(/sonra ₺/)).toBeNull()

    fireEvent.press(screen.getByText('Teklif ver'))
    expect(mockRouter.push).toHaveBeenCalledWith(`/offer/new?listingId=${LISTING_ID}`)

    fireEvent.press(screen.getByLabelText(/Sıralama: En yeni/))
    expect(screen.getByText('Yüksek bütçe')).toBeTruthy()
  })

  it('shows pending profile banner, locked cards and the radar empty state', async () => {
    serveCommon({ ...EXPERT_PROFILE, status: 'pending' })
    env.mock.onGet('/listings').reply(200, { data: [], meta: { page: 1, total: 0, perPage: 20 } })
    const screen = env.renderScreen(<ExpertHomeScreen />)
    expect(await screen.findByText('Profilin incelemede.')).toBeTruthy()
    expect(await screen.findByText('Şu an açık ilan yok')).toBeTruthy()
  })

  it('shows the plain-text zero balance notice (no purchase link on native)', async () => {
    env.mock.onGet(`/experts/${EXPERT_PROFILE.id}`).reply(200, EXPERT_PROFILE)
    env.mock
      .onGet('/wallet/me')
      .reply(200, { data: { ...WALLET, balanceKurus: 0, balanceLabel: '₺0', freeOfferRights: 0 } })
    env.mock
      .onGet('/listings')
      .reply(200, { data: [OPEN], meta: { page: 1, total: 1, perPage: 20 } })
    const screen = env.renderScreen(<ExpertHomeScreen />)
    expect(
      await screen.findByText(
        'Teklif göndermek için bakiyen yetersiz. Bakiye yüklemek için web sitemizi ziyaret edebilirsin.'
      )
    ).toBeTruthy()
    expect(screen.queryByText('Bakiye yükle')).toBeNull()
    expect(await screen.findByText('Kilitli')).toBeTruthy()
  })

  it('rejected profile shows the admin reason', async () => {
    serveCommon({ ...EXPERT_PROFILE, status: 'rejected', rejectionReason: 'Diploma okunmuyor.' })
    env.mock.onGet('/listings').reply(200, { data: [], meta: { page: 1, total: 0, perPage: 20 } })
    const screen = env.renderScreen(<ExpertHomeScreen />)
    expect(await screen.findByText(/Diploma okunmuyor./)).toBeTruthy()
    fireEvent.press(screen.getByText('Belgelerimi güncelle'))
    expect(mockRouter.push).toHaveBeenCalledWith('/profile/professional?tab=belgeler')
  })

  it('web: header, stat tiles, card grid and sort button', async () => {
    mockLayout.current = WIDE_LAYOUT
    serveCommon()
    env.mock
      .onGet('/listings')
      .reply(200, { data: [OPEN], meta: { page: 1, total: 1, perPage: 20 } })
    const screen = env.renderScreen(<ExpertHomeScreen />)
    expect(await screen.findByText('1 açık ilan')).toBeTruthy()
    expect(screen.getByText('Bekleyen teklif')).toBeTruthy()
    expect(screen.getByText('Aktif eşleşme')).toBeTruthy()
    fireEvent.press(screen.getByTestId('opportunities-sort'))
    expect(screen.getByText('Sırala: Yüksek bütçe')).toBeTruthy()
  })

  it('shows the error state with retry', async () => {
    serveCommon()
    env.mock.onGet('/listings').reply(500)
    const screen = env.renderScreen(<ExpertHomeScreen />)
    expect(await screen.findByText('İlanlar yüklenemedi')).toBeTruthy()
  })
})

describe('Tekliflerim', () => {
  it('filters by statusLabel and shows paid fee', async () => {
    env.mock.onGet('/offers/my').reply(200, {
      data: [MY_OFFER, OfferSchema.parse(offerFixtures.data[1])],
      meta: { page: 1, total: 2, perPage: 2, pendingCount: 1 },
    })
    const screen = env.renderScreen(<ExpertOffersScreen />)
    expect(await screen.findByText('₺625')).toBeTruthy()
    expect(screen.getByText(/"Anlaştım" bildirildi/)).toBeTruthy()

    const [otherChip] = screen.getAllByText('Başka uzmanla eşleşti')
    if (otherChip) fireEvent.press(otherChip)
    await waitFor(() => expect(screen.queryByText('₺625')).toBeNull())

    fireEvent.press(screen.getByText('Geri çekildi'))
    expect(await screen.findByText('Bu durumda teklifin yok')).toBeTruthy()
  })
})

describe('İlan detayı (uzman)', () => {
  it('offered: contact card, claim entry and no fee bar', async () => {
    mockParams = { id: LISTING_ID }
    serveCommon()
    env.mock.onGet(`/listings/${LISTING_ID}`).reply(200, OFFERED)
    const screen = env.renderScreen(<ExpertListingDetailScreen />)
    expect(await screen.findByText('İletişim bilgileri açık')).toBeTruthy()
    expect(screen.getByText('Ayşe Yılmaz')).toBeTruthy()
    expect(screen.getByText('Davet edildin')).toBeTruthy()
    expect(screen.queryByTestId('listing-fee-bar')).toBeNull()
    fireEvent.press(screen.getByText('Danışanla anlaştım'))
    expect(mockRouter.push).toHaveBeenCalledWith(`/claim/${LISTING_ID}`)
  })

  it('open: locked contact info and fee bar with send action', async () => {
    mockParams = { id: LISTING_ID }
    serveCommon()
    env.mock.onGet(`/listings/${LISTING_ID}`).reply(200, OPEN)
    env.mock.onGet('/offers/quote').reply(200, { data: QUOTE })
    const screen = env.renderScreen(<ExpertListingDetailScreen />)
    expect(
      await screen.findByText('Teklif gönderince danışanın iletişim bilgileri sana açılır.')
    ).toBeTruthy()
    expect(await screen.findByText('Teklif ücreti · bakiye ₺1.250')).toBeTruthy()
    fireEvent.press(screen.getByTestId('listing-send-offer'))
    expect(mockRouter.push).toHaveBeenCalledWith(`/offer/new?listingId=${LISTING_ID}`)
  })

  it('web: fee card with topup action and back link', async () => {
    mockLayout.current = WIDE_LAYOUT
    mockParams = { id: LISTING_ID }
    serveCommon()
    env.mock.onGet(`/listings/${LISTING_ID}`).reply(200, OPEN)
    env.mock.onGet('/offers/quote').reply(200, { data: { ...QUOTE, sufficient: false } })
    const screen = env.renderScreen(<ExpertListingDetailScreen />)
    expect(await screen.findByText('Bakiyen yetersiz')).toBeTruthy()
    expect(screen.getByText('Teklif ücreti')).toBeTruthy()
    fireEvent.press(screen.getByText('Bakiye yükle'))
    expect(mockRouter.push).toHaveBeenCalledWith('/bakiye')
    fireEvent.press(screen.getByLabelText('Geri: Fırsatlar'))
    expect(mockRouter.back).toHaveBeenCalled()
  })

  it('rejected profile: reason in listing detail', async () => {
    mockParams = { id: LISTING_ID }
    serveCommon({ ...EXPERT_PROFILE, status: 'rejected', rejectionReason: 'Belge eksik.' })
    env.mock.onGet(`/listings/${LISTING_ID}`).reply(200, OPEN)
    const screen = env.renderScreen(<ExpertListingDetailScreen />)
    expect(await screen.findByText(/Belge eksik./)).toBeTruthy()
  })

  it('insufficient balance and matched-with-other states', async () => {
    mockParams = { id: LISTING_ID }
    serveCommon()
    env.mock.onGet(`/listings/${LISTING_ID}`).reply(200, OPEN)
    env.mock.onGet('/offers/quote').reply(200, { data: { ...QUOTE, sufficient: false } })
    const screen = env.renderScreen(<ExpertListingDetailScreen />)
    expect(await screen.findByText('Bakiyen yetersiz')).toBeTruthy()
    screen.unmount()

    env.queryClient.clear()
    env.mock
      .onGet(`/listings/${LISTING_ID}`)
      .reply(200, { ...OPEN, status: 'MATCHED', matchedWithOther: true })
    const again = env.renderScreen(<ExpertListingDetailScreen />)
    expect(
      await again.findByText('Bu ilan başka bir uzmanla eşleşti; artık teklif verilemez.')
    ).toBeTruthy()
  })
})

describe('Teklif detayı (uzman)', () => {
  it('shows contact, claim and the withdraw sheet text', async () => {
    mockParams = { id: MY_OFFER.id }
    env.mock.onGet(`/offers/${MY_OFFER.id}`).reply(200, MY_OFFER)
    env.mock.onPost(`/offers/${MY_OFFER.id}/withdraw`).reply(200, {
      ...MY_OFFER,
      status: 'WITHDRAWN',
      statusLabel: 'Geri çekildi',
    })
    const screen = env.renderScreen(<ExpertOfferDetailScreen />)
    expect(await screen.findByText('Ayşe Yılmaz')).toBeTruthy()
    fireEvent.press(screen.getByText('Danışanla anlaştım'))
    expect(mockRouter.push).toHaveBeenCalledWith(`/claim/${MY_OFFER.listingId}`)

    fireEvent.press(screen.getByText('Teklifi geri çek'))
    expect(
      await screen.findByText('Teklifin geri çekilecek. Ödediğin teklif ücreti iade edilmez.')
    ).toBeTruthy()
    fireEvent.press(screen.getByText('Geri çek'))
    await waitFor(() => expect(env.mock.history.post.length).toBe(1))
  })
})

describe('Teklif gönder', () => {
  beforeEach(() => {
    mockParams = { listingId: LISTING_ID }
    env.mock.onGet(`/experts/${EXPERT_PROFILE.id}`).reply(200, EXPERT_PROFILE)
    env.mock.onGet(`/listings/${LISTING_ID}`).reply(200, OPEN)
  })

  it('normal: exact fee confirmation texts, then success with contact', async () => {
    env.mock.onGet('/offers/quote').reply(200, { data: QUOTE })
    env.mock.onPost('/offers').reply(200, MY_OFFER)
    env.mock.onGet('/wallet/me').reply(200, { data: { ...WALLET, balanceLabel: '₺625' } })
    const screen = env.renderScreen(<SendOfferScreen />)

    expect(
      await screen.findByText(/bakiyenden düşer\. Bu ücret, teklifin seçilmese de/)
    ).toBeTruthy()
    expect(
      screen.getByText('Teklif gönderdiğin an danışanın adı, telefonu ve e-postası sana açılır.')
    ).toBeTruthy()

    fireEvent.changeText(screen.getByTestId('offer-price'), '2400')
    fireEvent.press(screen.getByText('Teklif gönder (₺625)'))

    expect(await screen.findByText('Teklif gönderildi')).toBeTruthy()
    expect(JSON.parse(String(env.mock.history.post[0]?.data))).toMatchObject({
      expectedFeeKurus: 62500,
      price: 2400,
    })
    expect(screen.getByText('Ayşe Yılmaz')).toBeTruthy()
  })

  it('web: form card + fee aside; sends with the same flow', async () => {
    mockLayout.current = WIDE_LAYOUT
    env.mock.onGet('/offers/quote').reply(200, { data: QUOTE })
    env.mock.onPost('/offers').reply(200, MY_OFFER)
    env.mock.onGet('/wallet/me').reply(200, { data: WALLET })
    const screen = env.renderScreen(<SendOfferScreen />)
    expect(await screen.findByText(/bakiyenden düşer/)).toBeTruthy()
    expect(screen.getByLabelText('Geri: İlan')).toBeTruthy()
    fireEvent.changeText(screen.getByTestId('offer-price'), '2400')
    fireEvent.press(screen.getByText('Teklif gönder (₺625)'))
    expect(await screen.findByText('Teklif gönderildi')).toBeTruthy()
  })

  it('rejected profile: reason inside the fee panel', async () => {
    env.mock
      .onGet(`/experts/${EXPERT_PROFILE.id}`)
      .reply(200, { ...EXPERT_PROFILE, status: 'rejected', rejectionReason: 'Lisans eksik.' })
    env.mock.onGet('/offers/quote').reply(200, { data: QUOTE })
    const screen = env.renderScreen(<SendOfferScreen />)
    expect(await screen.findByText(/Lisans eksik./)).toBeTruthy()
  })

  it('free right and insufficient balance variants', async () => {
    env.mock
      .onGet('/offers/quote')
      .reply(200, { data: { ...QUOTE, willUseFreeRight: true, freeOfferRights: 2 } })
    const screen = env.renderScreen(<SendOfferScreen />)
    expect(
      await screen.findByText('Bu teklif için ücretsiz hakkın kullanılacak (kalan 2).')
    ).toBeTruthy()
    expect(screen.getByText('Ücretsiz hakla gönder')).toBeTruthy()
    screen.unmount()

    env.queryClient.clear()
    env.mock.onGet('/offers/quote').reply(200, { data: { ...QUOTE, sufficient: false } })
    const low = env.renderScreen(<SendOfferScreen />)
    expect(
      await low.findByText(
        'Teklif göndermek için bakiyen yetersiz. Bakiye yüklemek için web sitemizi ziyaret edebilirsin.'
      )
    ).toBeTruthy()
  })

  it('fee changed: asks to re-confirm with the new fee', async () => {
    let quoteCalls = 0
    env.mock.onGet('/offers/quote').reply(() => {
      quoteCalls += 1
      return [
        200,
        { data: quoteCalls === 1 ? QUOTE : { ...QUOTE, feeKurus: 57500, feeLabel: '₺575' } },
      ]
    })
    env.mock.onPost('/offers').reply(409, {
      code: 'OFFER_FEE_CHANGED',
      message: 'Ücret değişti',
      meta: { feeKurus: 57500, feeLabel: '₺575' },
    })
    const screen = env.renderScreen(<SendOfferScreen />)
    await screen.findByText('Teklif gönder (₺625)')
    fireEvent.changeText(screen.getByTestId('offer-price'), '2400')
    fireEvent.press(screen.getByText('Teklif gönder (₺625)'))
    expect(await screen.findByText('₺575 ile gönder')).toBeTruthy()
    expect(screen.getByText(/Teklif ücreti güncellendi:/)).toBeTruthy()
  })

  it('already offered blocks the form', async () => {
    env.mock.onGet(`/listings/${LISTING_ID}`).reply(200, OFFERED)
    env.mock.onGet('/offers/quote').reply(200, { data: QUOTE })
    const screen = env.renderScreen(<SendOfferScreen />)
    expect(
      await screen.findByText(
        'Bu ilana zaten teklif verdin. Teklifini Tekliflerim’den görebilirsin.'
      )
    ).toBeTruthy()
  })
})
