import fixtures from './__fixtures__/listings.response.json'
import {
  ClaimResponseSchema,
  CreateClaimSchema,
  createListingSchemaFor,
  CreateListingSchema,
  ListingRulesResponseSchema,
  ListingSchema,
  MarkMatchedResponseSchema,
} from './listing.schema'

const VALID_LISTING = {
  title: 'Kaygı için haftalık destek',
  specialization: ['anksiyete'],
  budgetMin: 800,
  budgetMax: 1500,
  preferredSessionType: 'online' as const,
  contactConsent: true,
}

const RULES = {
  budgetMinTry: 500,
  budgetMaxTry: 3000,
  titleMin: 10,
  titleMax: 100,
  descriptionMax: 2000,
  cityRequiredFor: ['yüz_yüze', 'yüz_yüze_online'],
  maxActive: 3,
}

describe('ListingSchema (Revize 2 §3.3)', () => {
  it('uzman görünümü: ücret, davet, anlaşma bildirimi ve iletişim', () => {
    const result = ListingSchema.safeParse(fixtures.expertView)
    expect(result.error?.issues ?? []).toEqual([])
    expect(result.data?.offerFeeLabel).toBe('₺625')
    expect(result.data?.clientContact?.fullName).toBe('Ayşe Yılmaz')
  })

  it('danışan görünümü: eşleşilen uzman ve anlaşma bildirimleri', () => {
    const result = ListingSchema.safeParse(fixtures.clientView)
    expect(result.error?.issues ?? []).toEqual([])
    expect(result.data?.matchedExpert?.name).toBe('Mehmet Demir')
    expect(result.data?.claims).toHaveLength(1)
  })

  it('2000 karaktere kadar açıklamayı kabul eder', () => {
    const long = { ...fixtures.expertView, description: 'a'.repeat(2000) }
    expect(ListingSchema.safeParse(long).success).toBe(true)
  })

  it('eski "fark_etmez" görüşme şeklini yüz_yüze_online sayar', () => {
    const legacy = { ...fixtures.expertView, preferredSessionType: 'fark_etmez' }
    expect(ListingSchema.parse(legacy).preferredSessionType).toBe('yüz_yüze_online')
  })
})

describe('kural, eşleşti ve anlaşma yanıtları', () => {
  it('GET /listings/rules: budgetMaxTry null olabilir', () => {
    const parsed = ListingRulesResponseSchema.parse({ data: { ...RULES, budgetMaxTry: null } })
    expect(parsed.data.budgetMaxTry).toBeNull()
  })

  it('POST /listings/{id}/match → matchId', () => {
    const matchId = 'ed14dc39-8062-4216-bdfc-1e94d366075f'
    expect(MarkMatchedResponseSchema.parse({ data: { matchId } }).data.matchId).toBe(matchId)
  })

  it('ClaimDto', () => {
    const claim = {
      id: '0b8f3c6e-1d2a-4f5b-9c8d-7e6f5a4b3c2d',
      listingId: fixtures.expertView.id,
      expertId: 'c519bd04-67c3-4e6a-af6f-f88999a8a53f',
      note: null,
      createdAt: '2026-10-19T08:00:00.000000Z',
      dismissedAt: null,
    }
    expect(ClaimResponseSchema.parse({ data: claim }).data.note).toBeNull()
  })

  it('CreateClaimSchema boş notu yok sayar ve 300 karakter sınırını uygular', () => {
    expect(CreateClaimSchema.parse({ note: '   ' }).note).toBeUndefined()
    expect(CreateClaimSchema.parse({}).note).toBeUndefined()
    expect(CreateClaimSchema.parse({ note: ' Görüştük ' }).note).toBe('Görüştük')
    expect(CreateClaimSchema.safeParse({ note: 'x'.repeat(301) }).success).toBe(false)
  })
})

describe('createListingSchemaFor', () => {
  it('varsayılan kurallarla geçerli ilanı kabul eder', () => {
    expect(CreateListingSchema.safeParse(VALID_LISTING).success).toBe(true)
  })

  it('iletişim rızası olmadan reddeder', () => {
    const result = CreateListingSchema.safeParse({ ...VALID_LISTING, contactConsent: false })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(['contactConsent'])
  })

  it('yüz yüze görüşmede şehir ister', () => {
    const faceToFace = { ...VALID_LISTING, preferredSessionType: 'yüz_yüze' as const }
    const missing = CreateListingSchema.safeParse(faceToFace)
    expect(missing.error?.issues.map((i) => i.path.join('.'))).toEqual(['city'])
    expect(CreateListingSchema.safeParse({ ...faceToFace, city: 'Ankara' }).success).toBe(true)
  })

  it('bütçe dönem aralığında olmalı', () => {
    const schema = createListingSchemaFor(RULES)
    const low = schema.safeParse({ ...VALID_LISTING, budgetMin: 400 })
    expect(low.error?.issues[0]?.message).toBe('En az ₺500 olmalı')
    const high = schema.safeParse({ ...VALID_LISTING, budgetMax: 3500 })
    expect(high.error?.issues[0]?.message).toBe('En fazla ₺3.000 olabilir')
    expect(schema.safeParse(VALID_LISTING).success).toBe(true)
  })

  it('üst sınırsız dönemde yüksek bütçeyi kabul eder', () => {
    const schema = createListingSchemaFor({ ...RULES, budgetMaxTry: null })
    expect(schema.safeParse({ ...VALID_LISTING, budgetMax: 50000 }).success).toBe(true)
  })

  it('maksimum minimumdan küçük olamaz; başlık ve açıklama sınırları kurallardan gelir', () => {
    const schema = createListingSchemaFor({ ...RULES, titleMin: 20, descriptionMax: 10 })
    expect(
      schema.safeParse({ ...VALID_LISTING, budgetMin: 1500, budgetMax: 800 }).error?.issues[0]?.path
    ).toEqual(['budgetMax'])
    expect(schema.safeParse({ ...VALID_LISTING, title: 'Kısa başlık' }).success).toBe(false)
    expect(
      schema.safeParse({ ...VALID_LISTING, title: 'x'.repeat(20), description: 'y'.repeat(11) })
        .success
    ).toBe(false)
  })
})
