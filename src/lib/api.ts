import axios from 'axios'

import { env } from './env'
import { tokenStorage } from './storage'

import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios'

export type ValidationError = { field: string; message: string }

// Backend iki farklı hata gövdesi üretiyor:
//  - ApiErrorDto (4xx/5xx, domain + beklenmeyen hata) → { code, message, errors: [...] }
//  - ValidationProblemDetails (400, model)            → { title, status, errors: { Alan: [...] } }
// Sözleşme (§3): gövdede code + message varsa durum kodundan bağımsız o kullanılır.
type ApiErrorBody = {
  code?: string
  message?: string
  field?: string | null
  title?: string
  errors?: unknown[] | Record<string, string[] | string>
  /** Domain hatasının ek verisi (ör. OFFER_FEE_CHANGED → { feeKurus, feeLabel }). */
  meta?: unknown
}

export type ApiErrorMeta = Record<string, unknown>

// Kullanıcıya gösterilen bütün yedek mesajlar Türkçe ve tek yerde.
export const ERROR_MESSAGES = {
  network: 'İnternet bağlantısı kurulamadı. Bağlantınızı kontrol edip tekrar deneyin.',
  sessionExpired: 'Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.',
  validation: 'Girdiğiniz bilgileri kontrol edin.',
  forbidden: 'Bu işlem için yetkiniz yok.',
  notFound: 'Aradığınız kayıt bulunamadı.',
  rateLimited: 'Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.',
  server: 'Sunucuda bir sorun oluştu. Lütfen daha sonra tekrar deneyin.',
  unknown: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
} as const

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly validationErrors?: ValidationError[],
    /** Sunucunun `meta` nesnesi; şekli koda göre ilgili domain'de Zod ile okunur. */
    public readonly meta?: ApiErrorMeta
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends Error {
  constructor() {
    super(ERROR_MESSAGES.network)
    this.name = 'NetworkError'
  }
}

let _onUnauthenticated: (() => void) | null = null

export function registerUnauthenticatedHandler(handler: () => void): void {
  _onUnauthenticated = handler
}

const instance: AxiosInstance = axios.create({
  baseURL: env.EXPO_PUBLIC_API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  // Dizi parametreleri ASP.NET Core'un bağladığı biçimde gitmek ZORUNDA:
  //   status=ACTIVE&status=RELEASED        ← `[FromQuery] string[] status` bunu bağlar
  // axios'un varsayılanı ise köşeli parantez üretiyor:
  //   status[]=ACTIVE&status[]=RELEASED    ← bağlanmaz, parametre null gelir
  //
  // Belirti sessizdir ve hataya benzemez: sunucu 200 döner, filtre YOK SAYILIR ve
  // kullanıcı filtrelenmemiş listenin tamamını görür. "Aktif" sekmesinde RELEASED
  // eşleşmenin görünmesi böyle bulundu. Aynı kırılma dört yerde birden vardı:
  // /matches, /listings/my, /offers/my (durum filtreleri) ve /listings
  // (specialization filtresi).
  paramsSerializer: { indexes: null },
})

instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.getAccessToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// Eşzamanlı 401'ler TEK bir yenileme isteğini paylaşır.
//
// Burada elle tutulan bir kuyruk (isRefreshing + failedQueue) vardı ve "bayrağı
// oku, sonra kuyruğa ekle" adımları atomik olmadığı için istek YETİM kalabiliyordu:
// A isteği yenilemeyi bitirip kuyruğu boşalttıktan sonra B isteği hâlâ eski bayrağa
// bakıp kuyruğa eklenirse onu artık kimse boşaltmaz — promise HİÇ çözülmez.
// Belirti sessizdir: ekran sonsuza kadar skeleton'da kalır, hata da görünmez,
// çünkü React Query uçuşta sanılan isteğe bağlı kalır ve refetch() bile yeni istek
// açmaz. Bu gerçekten yaşandı: girişten hemen sonra bildirim ekranı ve zil rozeti
// kalıcı olarak boş kaldı, uygulamayı yeniden başlatmak düzeltti.
//
// Paylaşılan promise'te yetim kalma ihtimali yapısal olarak yok: refreshPromise
// null değilse MUTLAKA çözülecek bir promise'tir.
let refreshPromise: Promise<string> | null = null

const REFRESH_PATH = '/auth/refresh'

async function refreshTokens(): Promise<string> {
  const refreshToken = await tokenStorage.getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  const { data } = await instance.post<{ accessToken: string; refreshToken: string }>(
    REFRESH_PATH,
    { refreshToken }
  )

  await tokenStorage.setAccessToken(data.accessToken)
  await tokenStorage.setRefreshToken(data.refreshToken)

  return data.accessToken
}

function fallbackMessage(status: number): string {
  if (status === 400 || status === 422) return ERROR_MESSAGES.validation
  if (status === 401) return ERROR_MESSAGES.sessionExpired
  if (status === 403) return ERROR_MESSAGES.forbidden
  if (status === 404) return ERROR_MESSAGES.notFound
  if (status === 429) return ERROR_MESSAGES.rateLimited
  if (status >= 500) return ERROR_MESSAGES.server
  return ERROR_MESSAGES.unknown
}

function fallbackCode(status: number): string {
  if (status === 400 || status === 422) return 'VALIDATION_ERROR'
  return 'UNKNOWN_ERROR'
}

function toValidationErrors(errors: ApiErrorBody['errors']): ValidationError[] | undefined {
  if (!errors) return undefined
  if (Array.isArray(errors)) {
    return errors.map((e) => {
      const item = typeof e === 'object' && e !== null ? e : {}
      const field = 'field' in item && typeof item.field === 'string' ? item.field : 'unknown'
      const message =
        'message' in item && typeof item.message === 'string'
          ? item.message
          : ERROR_MESSAGES.validation
      return { field, message }
    })
  }
  // ASP.NET Core ValidationProblemDetails: errors bir SÖZLÜK — { "Alan": ["mesaj", ...] }
  return Object.entries(errors).flatMap(([field, messages]) =>
    (Array.isArray(messages) ? messages : [messages]).map((message) => ({ field, message }))
  )
}

// FluentValidation mesajı bazen Türkçe metin değil hata KODUDUR
// (ör. "AUTH_TERMS_NOT_ACCEPTED"); ham kod kullanıcıya gösterilmez.
const ERROR_CODE_PATTERN = /^[A-Z][A-Z0-9_]+$/

function readableMessage(message: string | undefined | null): string | undefined {
  if (!message || ERROR_CODE_PATTERN.test(message.trim())) return undefined
  return message
}

/** HTTP hata yanıtını tek tip ApiError'a çevirir. Saf fonksiyon — test edilebilir. */
export function toApiError(status: number, body: ApiErrorBody | undefined | null): ApiError {
  const data = typeof body === 'object' && body !== null ? body : {}
  const fieldMessage = readableMessage(data.message)
  const validationErrors =
    toValidationErrors(data.errors) ??
    (typeof data.field === 'string' && data.field.length > 0
      ? [{ field: data.field, message: fieldMessage ?? ERROR_MESSAGES.validation }]
      : undefined)

  // ValidationProblemDetails'in title'ı İngilizce ("One or more validation
  // errors occurred.") — kullanıcıya gösterilmez; alan mesajı varsa o kullanılır.
  const message =
    readableMessage(data.message) ??
    (status === 400 ? readableMessage(validationErrors?.[0]?.message) : undefined) ??
    fallbackMessage(status)

  // ValidationProblemDetails'te alan mesajı bir kodsa (AUTH_*), o kod en iyi tanımlayıcıdır.
  const firstValidationCode = validationErrors?.find((e) =>
    ERROR_CODE_PATTERN.test(e.message.trim())
  )?.message
  const code = data.code ?? firstValidationCode ?? fallbackCode(status)

  return new ApiError(code, message, status, validationErrors, toMeta(data.meta))
}

function toMeta(meta: unknown): ApiErrorMeta | undefined {
  if (typeof meta !== 'object' || meta === null || Array.isArray(meta)) return undefined
  // REASON: typeof/null/Array kontrolünden geçen JSON değeri düz bir nesnedir
  return meta as ApiErrorMeta
}

/** Hata verilen domain koduna sahip bir ApiError mı? Ekranlar dallanmayı bununla yapar. */
export function isApiErrorCode(error: unknown, code: string): error is ApiError {
  return error instanceof ApiError && error.code === code
}

/** Herhangi bir hatayı kullanıcıya gösterilebilir Türkçe metne çevirir. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof NetworkError) return error.message
  return ERROR_MESSAGES.unknown
}

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    // REASON: axios hatasında config istek yapılandırmasıdır; _retry yalnız bizim işaretimiz
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (!error.response) {
      return Promise.reject(new NetworkError())
    }

    const { status, data } = error.response

    // Yenileme isteğinin KENDİSİ 401 alırsa yeniden yenilemeye kalkmak sonsuz
    // döngü olur; oturum gerçekten bitmiştir ve hata olduğu gibi yukarı çıkmalıdır.
    const isRefreshCall = originalRequest.url === REFRESH_PATH
    // Token taşımayan istek (giriş, kayıt, şifre sıfırlama) 401 alırsa bu bir
    // OTURUM hatası değildir — örn. yanlış şifre. Yenileme denenmez, çıkış
    // yapılmaz; sunucunun mesajı gösterilir.
    const hadBearer = Boolean(originalRequest.headers.get('Authorization'))

    if (status === 401 && hadBearer && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true

      try {
        refreshPromise ??= refreshTokens().finally(() => {
          refreshPromise = null
        })

        const token = await refreshPromise
        originalRequest.headers.set('Authorization', `Bearer ${token}`)
        return await instance(originalRequest)
      } catch {
        await tokenStorage.clearTokens()
        _onUnauthenticated?.()
        return Promise.reject(new ApiError('UNAUTHORIZED', ERROR_MESSAGES.sessionExpired, 401))
      }
    }

    return Promise.reject(toApiError(status, data))
  }
)

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await instance.get<T>(url, config)
  return res.data
}

export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await instance.post<T>(url, data, config)
  return res.data
}

export async function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await instance.put<T>(url, data, config)
  return res.data
}

export async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await instance.patch<T>(url, data, config)
  return res.data
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await instance.delete<T>(url, config)
  return res.data
}

export { instance as axiosInstance }
