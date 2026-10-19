/** Backend `ReferralCodeMaxLength` ile aynı üst sınır. */
export const REFERRAL_CODE_MAX_LENGTH = 32

const REFERRAL_CODE_PATTERN = /^[A-Z0-9]+$/

/**
 * Davet kodunu kayıt gövdesine uygun hâle getirir: boşluk atılır, büyük harfe
 * çevrilir. Biçimi bozuk kod (harf/rakam dışı ya da çok uzun) `null` olur —
 * sunucu geçersiz kodu zaten sessizce yok sayar; burada yalnız bozuk bir
 * bağlantının (ör. `/davet/%20`) depoya yazılması engellenir.
 */
export function normalizeReferralCode(raw: string | null | undefined): string | null {
  const code = raw?.trim().toUpperCase() ?? ''
  if (code.length === 0 || code.length > REFERRAL_CODE_MAX_LENGTH) return null
  return REFERRAL_CODE_PATTERN.test(code) ? code : null
}
