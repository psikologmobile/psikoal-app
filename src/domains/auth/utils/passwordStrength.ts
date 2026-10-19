export const PASSWORD_MIN_LENGTH = 8

export type PasswordStrength = {
  /** 0–4 dolu parça (StrengthMeter). */
  score: number
  label: string
  /** En az uzunluk sağlandı mı (sunucu kuralı ≥ 8). */
  isLongEnough: boolean
}

// Hermes'te Unicode özellik kaçışlarına güvenmemek için Türkçe harfler açıkça yazıldı.
const LOWER = /[a-zçğıöşü]/
const UPPER = /[A-ZÇĞİÖŞÜ]/
const LETTER = /[a-zA-ZçğıöşüÇĞİÖŞÜ]/
const DIGIT = /\d/
const SYMBOL = /[^a-zA-ZçğıöşüÇĞİÖŞÜ0-9\s]/

const SUFFIX = ` · en az ${PASSWORD_MIN_LENGTH} karakter`

/**
 * Şifre gücü göstergesi (Kayıt, Şifre). Yalnız görsel ipucu; geçerlilik kuralı
 * sunucuda ve Zod şemasında (≥ 8 karakter).
 *   +1 en az 8 karakter · +1 harf ve rakam · +1 en az 12 karakter ·
 *   +1 büyük/küçük harf karışımı ya da sembol
 */
export function passwordStrength(password: string): PasswordStrength {
  if (password.length === 0) {
    return { score: 0, label: `En az ${PASSWORD_MIN_LENGTH} karakter`, isLongEnough: false }
  }
  const isLongEnough = password.length >= PASSWORD_MIN_LENGTH
  let score = 0
  if (isLongEnough) score += 1
  if (LETTER.test(password) && DIGIT.test(password)) score += 1
  if (password.length >= 12) score += 1
  if ((UPPER.test(password) && LOWER.test(password)) || SYMBOL.test(password)) score += 1
  if (!isLongEnough) score = Math.min(score, 1)
  const label = !isLongEnough
    ? `Çok kısa${SUFFIX}`
    : score <= 1
      ? `Zayıf${SUFFIX}`
      : score === 2
        ? `Orta${SUFFIX}`
        : `Güçlü${SUFFIX}`
  return { score, label, isLongEnough }
}
