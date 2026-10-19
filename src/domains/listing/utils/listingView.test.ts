import {
  adCardView,
  hasOpenClaim,
  listingBudgetLabel,
  listingDaysLeft,
  listingQuotaNote,
  listingTags,
  offerCountLabel,
  pickActiveListing,
  firstClaimReminder,
} from './listingView'

import { makeListing } from '@/test-utils/fixtures'

const NOW = new Date('2026-10-19T12:00:00Z')

describe('listingView', () => {
  it('kalan günü yukarı yuvarlar, geçmişte 0, bitiş yoksa null', () => {
    expect(listingDaysLeft('2026-10-20T13:00:00Z', NOW)).toBe(2)
    expect(listingDaysLeft('2026-10-01T00:00:00Z', NOW)).toBe(0)
    expect(listingDaysLeft(null, NOW)).toBeNull()
  })

  it('bütçe etiketi backend etiketini, yoksa aralığı verir', () => {
    expect(listingBudgetLabel({ budgetLabel: '₺1', budgetMin: 1, budgetMax: 2 })).toBe('₺1')
    expect(listingBudgetLabel({ budgetLabel: '', budgetMin: 2000, budgetMax: 3000 })).toBe(
      '₺2.000–₺3.000'
    )
  })

  it('etiketler: alanlar + görüşme + bütçe; onay bekleyende şehir', () => {
    const listing = makeListing({ status: 'OPEN', specialization: ['Kaygı', 'Stres', 'Uyku'] })
    expect(listingTags(listing)).toEqual(['Kaygı', 'Stres', 'Yüz yüze', '₺800 – ₺1.500'])
    expect(listingTags(makeListing({ status: 'PENDING_APPROVAL' }))).toContain('İstanbul')
  })

  it('hatırlatma yalnız yayındaki ilanda ve bildirim varsa', () => {
    expect(hasOpenClaim(makeListing({ status: 'OPEN' }))).toBe(true)
    expect(hasOpenClaim(makeListing({ status: 'MATCHED' }))).toBe(false)
    expect(hasOpenClaim(makeListing({ status: 'OPEN', claims: null }))).toBe(false)
  })

  it('teklif sayısı metni', () => {
    expect(offerCountLabel(0)).toBe('Henüz teklif yok')
    expect(offerCountLabel(4)).toBe('4 teklif')
  })

  it('AdCard alt satırı her durum için', () => {
    const open = makeListing({ status: 'OPEN', offerCount: 4, expiresAt: '2026-11-14T12:00:00Z' })
    expect(adCardView(open, NOW)).toMatchObject({ left: '4 teklif', right: '26 gün kaldı' })
    expect(adCardView(makeListing({ status: 'OPEN', expiresAt: null }), NOW).right).toBe(
      '1 gün önce'
    )
    expect(adCardView(makeListing({ status: 'PENDING_APPROVAL' }), NOW).left).toBe(
      'Henüz yayında değil'
    )
    expect(adCardView(makeListing({ status: 'MATCHED' }), NOW).left).toBe(
      'Mehmet Demir ile eşleşti'
    )
    expect(adCardView(makeListing({ status: 'MATCHED', matchedExpert: null }), NOW).left).toBe(
      'Eşleşti'
    )
    expect(adCardView(makeListing({ status: 'EXPIRED' }), NOW).right).toBe('30 gün doldu')
    expect(adCardView(makeListing({ status: 'CLOSED', offerCount: 0 }), NOW).left).toBe(
      'Henüz teklif yok'
    )
    const rejected = adCardView(
      makeListing({ status: 'REJECTED_BY_ADMIN', rejectionReason: 'Açıklama yetersiz' }),
      NOW
    )
    expect(rejected).toMatchObject({
      excerpt: 'Gerekçe: Açıklama yetersiz',
      left: 'Yeniden düzenleyebilirsin',
    })
    expect(
      adCardView(makeListing({ status: 'REJECTED_BY_ADMIN', rejectionReason: null }), NOW).excerpt
    ).toBe('Son üç aydır sık panik atak yaşıyorum.')
    expect(adCardView(makeListing({ status: 'OPEN' })).left).toBe('2 teklif')
  })

  it('ilan hakkı notu', () => {
    expect(listingQuotaNote(0, 3)).toBe('3 ilan hakkın var')
    expect(listingQuotaNote(1, 3)).toBe('2 ilan hakkın kaldı')
    expect(listingQuotaNote(3, 3)).toBe('İlan sınırındasın')
  })
})

describe('Keşfet seçicileri', () => {
  const open = makeListing({ id: '11111111-1111-4111-8111-111111111111', status: 'OPEN' })
  const matched = makeListing({ status: 'MATCHED' })

  it('ilk yayındaki ilanı seçer', () => {
    expect(pickActiveListing([matched, open])).toBe(open)
    expect(pickActiveListing([matched])).toBeUndefined()
  })

  it('ilk açık anlaşma bildirimini bulur', () => {
    expect(firstClaimReminder([matched, open])).toEqual({ listing: open, claim: open.claims?.[0] })
    expect(firstClaimReminder([matched])).toBeNull()
  })
})
