import { loginErrorKind, loginErrorMessage, registerErrorMessage } from './authErrors'
import { passwordStrength } from './passwordStrength'

import { ApiError, NetworkError } from '@/lib/api'

const api = (code: string, status = 400) => new ApiError(code, 'Sunucu mesajı', status)

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

describe('loginErrorKind / loginErrorMessage', () => {
  it.each([
    ['AUTH_INVALID_CREDENTIALS', 'yanlis'],
    ['AUTH_EMAIL_NOT_CONFIRMED', 'onaysiz'],
    ['AUTH_ACCOUNT_FROZEN', 'dondurulmus'],
    ['ACCOUNT_INACTIVE', 'dondurulmus'],
    ['AUTH_RATE_LIMITED', 'cokDeneme'],
  ])('%s → %s', (code, kind) => {
    expect(loginErrorKind(api(code))).toBe(kind)
  })

  it('429 kod olmadan da çok deneme sayılır', () => {
    expect(loginErrorKind(api('UNKNOWN_ERROR', 429))).toBe('cokDeneme')
  })

  it('ağ hatası bağlantı metnini verir', () => {
    expect(loginErrorMessage(new NetworkError())).toBe(
      'Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.'
    )
  })

  it('bilinmeyen kod sunucu mesajına düşer', () => {
    expect(loginErrorMessage(api('X_Y'))).toBe('Sunucu mesajı')
  })
})

describe('registerErrorMessage', () => {
  it('kullanımdaki e-posta', () => {
    expect(registerErrorMessage(api('AUTH_EMAIL_ALREADY_REGISTERED', 409))).toBe(
      'Bu e-posta adresiyle zaten bir hesap var. Giriş yapmayı dene.'
    )
  })
  it('zayıf şifre', () => {
    expect(registerErrorMessage(api('AUTH_WEAK_PASSWORD'))).toContain('Şifren çok zayıf')
  })
  it('bağlantı', () => {
    expect(registerErrorMessage(new NetworkError())).toBe(
      'Bağlantı kurulamadı. Tekrar dener misin?'
    )
  })
  it('diğer', () => {
    expect(registerErrorMessage(new Error('x'))).toBe(
      'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
    )
  })
})

describe('passwordStrength', () => {
  it('boş', () => expect(passwordStrength('').score).toBe(0))
  it('kısa şifre en çok 1 puan alır', () => {
    const s = passwordStrength('aB1!')
    expect(s.score).toBe(1)
    expect(s.isLongEnough).toBe(false)
    expect(s.label).toBe('Çok kısa · en az 8 karakter')
  })
  it('yalnız harf, 8 karakter → zayıf', () => {
    expect(passwordStrength('abcdefgh').label).toBe('Zayıf · en az 8 karakter')
  })
  it('harf + rakam → orta', () => expect(passwordStrength('gizlisifre1').score).toBe(2))
  it('uzun, karışık → güçlü', () => {
    const s = passwordStrength('GizliŞifre2026!')
    expect(s.score).toBe(4)
    expect(s.label).toBe('Güçlü · en az 8 karakter')
  })
})
