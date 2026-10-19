import { normalizeReferralCode, REFERRAL_CODE_MAX_LENGTH } from './referralCode'

describe('normalizeReferralCode', () => {
  it('boşluğu atar ve büyük harfe çevirir', () => {
    expect(normalizeReferralCode('  k7m2px9q ')).toBe('K7M2PX9Q')
  })

  it.each([[undefined], [null], [''], ['   '], ['AB-12'], ['ab cd'], ['Ç1']])(
    'bozuk değer (%p) → null',
    (raw) => {
      expect(normalizeReferralCode(raw)).toBeNull()
    }
  )

  it('üst sınırı aşan kodu reddeder', () => {
    expect(normalizeReferralCode('A'.repeat(REFERRAL_CODE_MAX_LENGTH))).toHaveLength(32)
    expect(normalizeReferralCode('A'.repeat(REFERRAL_CODE_MAX_LENGTH + 1))).toBeNull()
  })
})
