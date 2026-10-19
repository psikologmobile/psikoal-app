import { z } from 'zod'

import listingOffersResponse from './__fixtures__/listing-offers.response.json'
import {
  OfferFeeMetaSchema,
  OfferQuoteResponseSchema,
  OfferSchema,
  SendOfferSchema,
} from './offer.schema'

// Fixture UYDURMA DEĞİL: lokal stack'e karşı koşan gerçek
// GET /listings/{id}/offers yanıtının kaydı (21 Ağustos 2026). Elle yazılmış bir
// gövde backend'in null yazma davranışını yansıtmaz ve tam da bu testin yakalaması
// gereken sapmayı kaçırırdı.
// Revize 2 (2026-10-19): kayda yeni alanlar (feePaid*, usedFreeRight, closedReason,
// statusLabel, claimed, clientContact) backend OfferDto'ya göre eklendi; danışan
// görünümünde feePaid* ve clientContact null gelir.
//
// Yakalanan hata: teklif listesinin TAMAMI parse hatasına düşüyordu, çünkü
// matchId şemada `.optional()` idi ve Zod 4'te `.optional()` null'ı KABUL ETMEZ.
// Backend ise nullable alanları null olarak YAZIYOR (Program.cs'te
// DefaultIgnoreCondition bilinçli olarak ayarlanmıyor — bkz. docs/E2E.md).
// Belirti sessizdi: HTTP 200, istisna yok, ekranda "Henüz teklif gelmedi" —
// oysa ilana iki teklif gelmiş ve biri kabul edilip eşleşme kurulmuştu.
const ListingOffersResponseSchema = z.object({
  data: z.array(OfferSchema),
  meta: z.object({ page: z.number(), total: z.number(), perPage: z.number() }),
})

describe('OfferSchema — gerçek API yanıtı', () => {
  it('teklif listesini eksiksiz parse eder', () => {
    const result = ListingOffersResponseSchema.safeParse(listingOffersResponse)

    // Hata mesajını iddiaya taşımak şart: aksi hâlde kırmızı test yalnız
    // "false !== true" der ve HANGİ alanın sözleşmeyi bozduğu görünmez.
    expect(result.error?.issues ?? []).toEqual([])
    expect(result.success).toBe(true)
  })

  it('matchId null olan teklifi kabul eder', () => {
    const withNullMatch = listingOffersResponse.data.find((offer) => offer.matchId === null)

    // Fixture'ın bu vakayı gerçekten içerdiğini doğrula. İçermeseydi yukarıdaki
    // test de yeşil olurdu ve hiçbir şey ölçmezdi.
    expect(withNullMatch).toBeDefined()
    expect(OfferSchema.safeParse(withNullMatch).success).toBe(true)
  })

  it('nullable alanlar null geldiğinde de parse eder', () => {
    // Backend'in `Guid?` / `string?` yazdığı her alan null gelebilir. Biri
    // .nullable() olmadan bırakılırsa TEK bir kayıt tüm listeyi düşürür.
    const nullable = {
      ...listingOffersResponse.data[0],
      title: null,
      matchId: null,
      listing: null,
      expert: null,
    }

    const result = OfferSchema.safeParse(nullable)
    expect(result.error?.issues ?? []).toEqual([])
  })
})

// Form alanları boş string ile başlıyor (react-hook-form defaultValues).
// `.min(3).optional()` boş string'i GEÇİRMEZ: '' geçerli bir string olduğu için
// .optional() devreye girmez ve .min(3) düşer. Belirti kullanıcı için anlamsız:
// "opsiyonel" yazan alan boş bırakıldığında form "En az 3 karakter" diyerek
// kilitleniyor ve teklif hiç gönderilemiyor.
describe('SendOfferSchema — opsiyonel metin alanları', () => {
  const base = {
    listingId: '3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    price: 1100,
    sessionType: 'online' as const,
  }

  it('boş başlık ve açıklama ile teklif gönderilebilir', () => {
    const result = SendOfferSchema.safeParse({ ...base, title: '', description: '' })

    expect(result.error?.issues ?? []).toEqual([])
    expect(result.data?.title).toBeUndefined()
    expect(result.data?.description).toBeUndefined()
  })

  it('yalnız boşluk içeren başlık da yok sayılır', () => {
    const result = SendOfferSchema.safeParse({ ...base, title: '   ' })

    expect(result.error?.issues ?? []).toEqual([])
    expect(result.data?.title).toBeUndefined()
  })

  // Kural gevşetilmiş olmamalı: DOLU ama kısa bir başlık hâlâ reddedilir.
  // Aksi hâlde düzeltme, doğrulamayı tamamen kaldırmış olurdu.
  it('dolu ama üç karakterden kısa başlığı hâlâ reddeder', () => {
    const result = SendOfferSchema.safeParse({ ...base, title: 'ab' })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('En az 3 karakter')
  })
})

describe('Revize 2 alanları', () => {
  const base = listingOffersResponse.data[0]

  it('uzman görünümü: ödenen ücret ve danışan iletişimi', () => {
    const result = OfferSchema.safeParse({
      ...base,
      feePaidKurus: 62500,
      feePaidLabel: '₺625',
      clientContact: { fullName: 'Ayşe Yılmaz', phone: null, email: 'ayse@psikoal.test' },
    })
    expect(result.error?.issues ?? []).toEqual([])
    expect(result.data?.clientContact?.phone).toBeNull()
  })

  it('ücretsiz hakla gönderilmiş teklif', () => {
    const result = OfferSchema.safeParse({
      ...base,
      feePaidKurus: 0,
      feePaidLabel: 'Ücretsiz hak',
      usedFreeRight: true,
    })
    expect(result.data?.usedFreeRight).toBe(true)
  })

  it('bilinmeyen closedReason reddedilir; statusLabel zorunludur', () => {
    expect(OfferSchema.safeParse({ ...base, closedReason: 'ADMIN' }).success).toBe(false)
    const { statusLabel: _omit, ...withoutLabel } = base ?? { statusLabel: '' }
    expect(OfferSchema.safeParse(withoutLabel).success).toBe(false)
  })

  it('GET /offers/quote yanıtı', () => {
    const quote = OfferQuoteResponseSchema.parse({
      data: {
        feeKurus: 62500,
        feeLabel: '₺625',
        balanceKurus: 125000,
        balanceLabel: '₺1.250',
        freeOfferRights: 0,
        willUseFreeRight: false,
        balanceAfterKurus: 62500,
        balanceAfterLabel: '₺625',
        sufficient: true,
      },
    }).data
    expect(quote.sufficient).toBe(true)
  })

  it('OFFER_FEE_CHANGED meta şeması', () => {
    expect(OfferFeeMetaSchema.safeParse({ feeKurus: 56000, feeLabel: '₺560' }).success).toBe(true)
    expect(OfferFeeMetaSchema.safeParse({ feeKurus: '560' }).success).toBe(false)
  })
})
