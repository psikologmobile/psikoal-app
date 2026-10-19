import { ApiError, NetworkError, getErrorMessage } from '@/lib/api'

/**
 * Giriş / kayıt hata kodlarını tasarımdaki (b0 · Giriş, b0 · Kayıt) Türkçe
 * metinlere çevirir. Kodlar backend `ErrorKeys` ile birebir.
 */
export const AUTH_ERROR_CODES = {
  invalidCredentials: 'AUTH_INVALID_CREDENTIALS',
  emailNotConfirmed: 'AUTH_EMAIL_NOT_CONFIRMED',
  accountFrozen: 'AUTH_ACCOUNT_FROZEN',
  accountInactive: 'ACCOUNT_INACTIVE',
  rateLimited: 'AUTH_RATE_LIMITED',
  emailAlreadyRegistered: 'AUTH_EMAIL_ALREADY_REGISTERED',
  weakPassword: 'AUTH_WEAK_PASSWORD',
} as const

export type LoginErrorKind =
  | 'yanlis'
  | 'onaysiz'
  | 'dondurulmus'
  | 'baglanti'
  | 'cokDeneme'
  | 'diger'

export const LOGIN_ERROR_MESSAGES: Record<Exclude<LoginErrorKind, 'diger'>, string> = {
  yanlis: 'E-posta ya da şifre hatalı. Tekrar dener misin?',
  onaysiz: 'E-posta adresin henüz onaylanmamış. Gelen kutundaki bağlantıya dokun.',
  dondurulmus: 'Hesabın dondurulmuş. Destek ekibimizle iletişime geçebilirsin.',
  baglanti: 'Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.',
  cokDeneme: 'Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene.',
}

function isNetworkError(error: unknown): boolean {
  return error instanceof NetworkError
}

function isRateLimited(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.code === AUTH_ERROR_CODES.rateLimited || error.status === 429)
  )
}

export function loginErrorKind(error: unknown): LoginErrorKind {
  if (isNetworkError(error)) return 'baglanti'
  if (isRateLimited(error)) return 'cokDeneme'
  if (!(error instanceof ApiError)) return 'diger'
  switch (error.code) {
    case AUTH_ERROR_CODES.invalidCredentials:
      return 'yanlis'
    case AUTH_ERROR_CODES.emailNotConfirmed:
      return 'onaysiz'
    case AUTH_ERROR_CODES.accountFrozen:
    case AUTH_ERROR_CODES.accountInactive:
      return 'dondurulmus'
    default:
      return 'diger'
  }
}

/** Giriş hatası → ekranda gösterilecek tek satırlık metin. */
export function loginErrorMessage(error: unknown): string {
  const kind = loginErrorKind(error)
  return kind === 'diger' ? getErrorMessage(error) : LOGIN_ERROR_MESSAGES[kind]
}

export type RegisterErrorKind = 'kullanimda' | 'zayif' | 'baglanti' | 'diger'

export const REGISTER_ERROR_MESSAGES: Record<Exclude<RegisterErrorKind, 'diger'>, string> = {
  kullanimda: 'Bu e-posta adresiyle zaten bir hesap var. Giriş yapmayı dene.',
  zayif: 'Şifren çok zayıf. En az 8 karakter, harf ve rakam kullan.',
  baglanti: 'Bağlantı kurulamadı. Tekrar dener misin?',
}

export function registerErrorKind(error: unknown): RegisterErrorKind {
  if (isNetworkError(error)) return 'baglanti'
  if (!(error instanceof ApiError)) return 'diger'
  if (error.code === AUTH_ERROR_CODES.emailAlreadyRegistered) return 'kullanimda'
  if (error.code === AUTH_ERROR_CODES.weakPassword) return 'zayif'
  return 'diger'
}

/** Kayıt hatası → ekranda gösterilecek tek satırlık metin. */
export function registerErrorMessage(error: unknown): string {
  const kind = registerErrorKind(error)
  return kind === 'diger' ? getErrorMessage(error) : REGISTER_ERROR_MESSAGES[kind]
}
