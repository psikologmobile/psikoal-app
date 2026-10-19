import MockAdapter from 'axios-mock-adapter'

import {
  ApiError,
  ERROR_MESSAGES,
  NetworkError,
  axiosInstance,
  get,
  getErrorMessage,
  isApiErrorCode,
  post,
  toApiError,
} from './api'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  multiGet: jest.fn(async (keys: string[]) => keys.map((k) => [k, null])),
  multiRemove: jest.fn(async () => undefined),
}))

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}))

describe('api error mapping', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  afterEach(() => {
    mock.restore()
  })

  // ASP.NET Core model validation 400 ValidationProblemDetails döner: errors bir SÖZLÜK.
  // Bu dal olmadan tüm form hataları 'UNKNOWN_ERROR'a düşüyordu.
  it('maps a 400 ValidationProblemDetails body to validationErrors', async () => {
    mock.onGet('/listings').reply(400, {
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
      title: 'One or more validation errors occurred.',
      status: 400,
      errors: {
        Title: ['Başlık zorunludur.', 'Başlık en az 5 karakter olmalıdır.'],
        BudgetMin: ['Bütçe negatif olamaz.'],
      },
    })

    await expect(get('/listings')).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      validationErrors: [
        { field: 'Title', message: 'Başlık zorunludur.' },
        { field: 'Title', message: 'Başlık en az 5 karakter olmalıdır.' },
        { field: 'BudgetMin', message: 'Bütçe negatif olamaz.' },
      ],
    })
  })

  it('maps a 422 ApiErrorDto body and preserves the domain code', async () => {
    mock.onGet('/listings').reply(422, {
      code: 'LISTING_MAX_ACTIVE_EXCEEDED',
      message: 'En fazla 3 açık ilanınız olabilir.',
      errors: [{ field: 'status', message: 'En fazla 3 açık ilanınız olabilir.' }],
    })

    await expect(get('/listings')).rejects.toMatchObject({
      status: 422,
      code: 'LISTING_MAX_ACTIVE_EXCEEDED',
    })
  })

  it('falls back to UNKNOWN_ERROR with a Turkish message for an empty 500', async () => {
    mock.onGet('/listings').reply(500, {})

    const error = await get('/listings').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ code: 'UNKNOWN_ERROR', message: ERROR_MESSAGES.server })
  })

  // Sözleşme §3: backend artık 404/403/409/500'de de ApiErrorDto dönebiliyor.
  it.each([403, 404, 409, 500])('uses body code + message for status %i', async (status) => {
    mock
      .onGet('/listings/1')
      .reply(status, { code: 'SOME_CODE', message: 'Türkçe mesaj', errors: [] })

    await expect(get('/listings/1')).rejects.toMatchObject({
      status,
      code: 'SOME_CODE',
      message: 'Türkçe mesaj',
    })
  })

  it('never shows the English ValidationProblemDetails title', async () => {
    mock.onPost('/auth/register').reply(400, {
      title: 'One or more validation errors occurred.',
      status: 400,
      errors: { TermsAccepted: ['Kullanım koşullarını kabul etmelisiniz.'] },
    })

    await expect(post('/auth/register', {})).rejects.toMatchObject({
      message: 'Kullanım koşullarını kabul etmelisiniz.',
    })
  })

  it('maps a network failure to a Turkish NetworkError', async () => {
    mock.onGet('/listings').networkError()

    const error = await get('/listings').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(NetworkError)
    expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.network)
  })

  it('does not treat a 401 on an unauthenticated request as session expiry', async () => {
    mock
      .onPost('/auth/login')
      .reply(401, { code: 'INVALID_CREDENTIALS', message: 'E-posta veya şifre hatalı.' })

    await expect(post('/auth/login', {})).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'E-posta veya şifre hatalı.',
    })
    expect(mock.history.post.filter((r) => r.url === '/auth/refresh')).toHaveLength(0)
  })
})

describe('toApiError / getErrorMessage', () => {
  it('reads the flat ApiErrorDto { code, message, field }', () => {
    const error = toApiError(409, {
      code: 'REVIEW_ALREADY_EXISTS',
      message: 'Bu eşleşme için değerlendirmenizi zaten bıraktınız.',
      field: 'matchId',
    })
    expect(error).toMatchObject({
      code: 'REVIEW_ALREADY_EXISTS',
      message: 'Bu eşleşme için değerlendirmenizi zaten bıraktınız.',
      validationErrors: [{ field: 'matchId' }],
    })
  })

  it('never shows a raw error code as the message', () => {
    const error = toApiError(400, {
      title: 'One or more validation errors occurred.',
      errors: { TermsAccepted: ['AUTH_TERMS_NOT_ACCEPTED'] },
    })
    expect(error.code).toBe('AUTH_TERMS_NOT_ACCEPTED')
    expect(error.message).toBe(ERROR_MESSAGES.validation)
  })

  it('uses the Turkish message of AUTH_RATE_LIMITED / INTERNAL_ERROR', () => {
    expect(
      toApiError(429, { code: 'AUTH_RATE_LIMITED', message: 'Çok fazla deneme.' }).message
    ).toBe('Çok fazla deneme.')
    expect(toApiError(500, { code: 'INTERNAL_ERROR', message: 'Beklenmeyen hata.' }).code).toBe(
      'INTERNAL_ERROR'
    )
  })

  it.each([
    [400, ERROR_MESSAGES.validation],
    [403, ERROR_MESSAGES.forbidden],
    [404, ERROR_MESSAGES.notFound],
    [422, ERROR_MESSAGES.validation],
    [429, ERROR_MESSAGES.rateLimited],
    [503, ERROR_MESSAGES.server],
    [418, ERROR_MESSAGES.unknown],
  ])('status %i without a body falls back to Turkish', (status, message) => {
    expect(toApiError(status, null).message).toBe(message)
  })

  it('carries the domain meta object (OFFER_FEE_CHANGED → yeni ücret)', () => {
    const error = toApiError(409, {
      code: 'OFFER_FEE_CHANGED',
      message: 'Teklif ücreti değişti.',
      field: 'expectedFeeKurus',
      meta: { feeKurus: 62500, feeLabel: '₺625' },
    })
    expect(error.meta).toEqual({ feeKurus: 62500, feeLabel: '₺625' })
    expect(isApiErrorCode(error, 'OFFER_FEE_CHANGED')).toBe(true)
    expect(isApiErrorCode(error, 'INSUFFICIENT_BALANCE')).toBe(false)
  })

  it.each([[null], ['metin'], [[1, 2]], [undefined]])('ignores a non-object meta (%p)', (meta) => {
    expect(toApiError(409, { code: 'X', message: 'Y', meta }).meta).toBeUndefined()
  })

  it('isApiErrorCode is false for non-ApiError values', () => {
    expect(isApiErrorCode(new Error('OFFER_FEE_CHANGED'), 'OFFER_FEE_CHANGED')).toBe(false)
    expect(isApiErrorCode(undefined, 'OFFER_FEE_CHANGED')).toBe(false)
  })

  it('hides non-API error messages (e.g. Zod) behind a Turkish text', () => {
    expect(getErrorMessage(new Error('Expected string, received null'))).toBe(
      ERROR_MESSAGES.unknown
    )
  })
})

// Eşzamanlı 401'lerin HEPSİ sonuçlanmak zorunda. Eski elle kuyruk (isRefreshing +
// failedQueue) "bayrağı oku, sonra kuyruğa ekle" adımları atomik olmadığı için
// isteği YETİM bırakabiliyordu: promise hiç çözülmüyordu. Belirti sessizdi —
// ekran sonsuza kadar skeleton'da kalıyor, hata görünmüyor ve React Query uçuşta
// sanılan isteğe bağlandığı için refetch() bile yeni istek açmıyordu. Girişten
// hemen sonra bildirim ekranı ve zil rozeti kalıcı olarak boş kalıyordu.
//
// Bu blok "asla çözülmeyen promise"i ölçer: jest'in kendi timeout'u da bunu
// yakalardı ama sebebi söylemezdi, bu yüzden yarış açıkça kurgulanıyor.
describe('401 yenileme yarışı', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  afterEach(() => {
    mock.restore()
    axiosInstance.defaults.headers.common['Authorization'] = undefined
  })

  it('aynı anda 401 alan İKİ istek de sonuçlanır ve yenileme bir kez yapılır', async () => {
    const secureStore = jest.requireMock('expo-secure-store')
    secureStore.getItemAsync.mockImplementation(async () => 'eski-token')

    let refreshCount = 0
    mock.onPost('/auth/refresh').reply(() => {
      refreshCount += 1
      return [200, { accessToken: 'yeni-token', refreshToken: 'yeni-refresh' }]
    })

    // İlk çağrıda 401, ikinci çağrıda 200: yenileme sonrası tekrar denemenin
    // gerçekten yapıldığını da kanıtlar.
    const seen: Record<string, number> = {}
    const replyOnceUnauthorized = (path: string) => {
      mock.onGet(path).reply(() => {
        seen[path] = (seen[path] ?? 0) + 1
        return seen[path] === 1 ? [401, {}] : [200, { ok: true }]
      })
    }
    replyOnceUnauthorized('/notifications')
    replyOnceUnauthorized('/categories')

    // allSettled: yetim kalan promise burada ASLA sonuçlanmaz ve test timeout'a
    // düşer — tam olarak ölçmek istediğimiz kırılma bu.
    const results = await Promise.allSettled([get('/notifications'), get('/categories')])

    expect(results.map((r) => r.status)).toEqual(['fulfilled', 'fulfilled'])
    expect(refreshCount).toBe(1)
  }, 10_000)

  // ESKİ KODDA KİLİTLENEN YOL — bu testin ölçtüğü asıl kırılma bu.
  // Yenileme isteği de aynı axios örneği üzerinden gidiyor. 401 dönerse eski kod
  // onu da "401 geldi" dalına sokuyordu; o an isRefreshing zaten TRUE olduğu için
  // yenileme isteği KENDİ kuyruğuna ekleniyor ve onu bekleyen await hiç
  // sonuçlanmıyordu. Sonuç: finally çalışmıyor, isRefreshing kalıcı olarak true
  // kalıyor ve bundan sonraki HER 401 sonsuza kadar kuyrukta ölüyor.
  // Doğru davranış: oturum bitmiştir, hata yukarı çıkar ve token'lar temizlenir.
  it('yenileme isteğinin kendisi 401 alırsa kilitlenmez, oturum sonlanır', async () => {
    const secureStore = jest.requireMock('expo-secure-store')
    secureStore.getItemAsync.mockImplementation(async () => 'suresi-gecmis-token')

    mock.onPost('/auth/refresh').reply(401, {})
    mock.onGet('/notifications').reply(401, {})

    await expect(get('/notifications')).rejects.toMatchObject({ status: 401 })
    expect(secureStore.deleteItemAsync).toHaveBeenCalled()

    // Kilitlenme kalıcıysa BU istek de asla sonuçlanmaz — asıl siper burası.
    await expect(get('/notifications')).rejects.toMatchObject({ status: 401 })
  }, 10_000)
})

// Dizi parametreleri ASP.NET Core'un bağlayabileceği biçimde gitmezse belirti
// SESSİZDİR: sunucu 200 döner, filtre yok sayılır, kullanıcı listenin tamamını
// görür. "Aktif" sekmesinde RELEASED eşleşmenin görünmesi tam olarak buydu.
describe('dizi sorgu parametreleri', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance)
  })

  afterEach(() => {
    mock.restore()
  })

  it('köşeli parantez DEĞİL, tekrarlanan anahtar üretir', async () => {
    let seenUrl = ''
    mock.onGet('/matches').reply((config) => {
      seenUrl = axiosInstance.getUri(config)
      return [200, { data: [], meta: { page: 1, total: 0, perPage: 0 } }]
    })

    await get('/matches', { params: { status: ['COMPLETED', 'RELEASED'] } })

    expect(seenUrl).toContain('status=COMPLETED')
    expect(seenUrl).toContain('status=RELEASED')
    expect(seenUrl).not.toContain('status[]')
    expect(seenUrl).not.toContain('status%5B%5D')
  })
})
