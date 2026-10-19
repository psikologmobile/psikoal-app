// Node çekirdek modülleri (node:http) yalnız bu dosyada; tsconfig "types" listesi jest ile sınırlı.
/// <reference types="node" />

import http from 'node:http'
import https from 'node:https'

import { z } from 'zod'

import { AssessmentListItemSchema, MyAssessmentResultSchema } from '@/domains/assessment'
import {
  AuthUserSchema,
  LoginResponseSchema,
  ReferrerResponseSchema,
  RegisterRequestSchema,
  ResetPasswordRequestSchema,
} from '@/domains/auth'
import { BlogLikeResponseSchema, BlogListResponseSchema, BlogSchema } from '@/domains/blog'
import { CategoryDetailSchema, CategorySchema } from '@/domains/category'
import { ExpertSchema, ReviewSchema } from '@/domains/expert'
import { ListingRulesResponseSchema, ListingSchema } from '@/domains/listing'
import { MatchDetailSchema, MatchSchema } from '@/domains/match'
import { NotificationListResponseSchema } from '@/domains/notification'
import { OfferQuoteResponseSchema, OfferSchema } from '@/domains/offer'
import {
  TopupOptionsResponseSchema,
  WalletPaymentPageSchema,
  WalletResponseSchema,
  WalletTransactionPageSchema,
} from '@/domains/wallet'

// Şemalar domain barrel'ından alınıyor (domain izolasyonu kuralı), barrel ise
// api/ hook'larını da açıyor ve onlar AsyncStorage'a iniyor. Bu test ağa çıkıyor
// ama CİHAZA çıkmıyor; native modül burada yalnız import zincirini tıkıyor.
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

/**
 * CANLI sözleşme denetçisi: uygulamanın GERÇEK Zod şemalarını, çalışan API'nin
 * GERÇEK yanıtlarına karşı koşturur.
 *
 * Neden ayrı ve varsayılan olarak atlanıyor: birim testleri ağa bağlı olmamalı.
 * Koşturmak için stack ayakta olmalı ve adres verilmeli:
 *
 *   source scripts/e2e-stack.sh && node scripts/seed-demo.mjs   # psikoal-backend
 *   PSIKOAL_LIVE_API=http://localhost:5089 npx jest src/lib/contract.live.test.ts
 *
 * Neden gerekli: bu sınıf hatanın belirtisi YOK. Backend nullable alanı `null`
 * yazar, şemada `.nullable()` eksikse safeParse düşer, hook throw eder ve
 * kullanıcı BOŞ LİSTE görür — HTTP hâlâ 200'dür. Hiçbir durum-kodu testi bunu
 * göremez. Bugüne kadar iki kez tam olarak böyle kırıldı:
 *   OfferSchema.matchId  → ilana gelen tüm teklifler "Henüz teklif gelmedi"
 *   MatchSchema.email    → gizlilik düzeltmesi e-postayı null yapınca
 */
const API = process.env.PSIKOAL_LIVE_API
const describeLive = API ? describe : describe.skip

const CLIENT = { email: 'demo-client@psikoal.test', password: 'DemoClient123!' }
const EXPERT = { email: 'demo-expert-1@psikoal.test', password: 'DemoExpert123!' }

const listOf = <T extends z.ZodTypeAny>(item: T) => z.object({ data: z.array(item) })

type LiveResponse = {
  status: number
  ok: boolean
  text: () => Promise<string>
  json: () => Promise<unknown>
}

type LiveRequestInit = {
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: string
}

/**
 * Gerçek HTTP isteği — global `fetch` KULLANILMAZ.
 *
 * SDK 57'de jest-expo kurulumu `expo/src/winter`'ı yükler ve global `fetch`'i
 * expo/fetch ile değiştirir; o da testte sahte native sınıflara bağlıdır. Sonuç:
 * her istek ağa hiç çıkmadan sahte bir Response döner (`status` undefined) ve
 * bütün canlı denetimler "login ...: undefined" ile düşer. Node çekirdek modülü
 * bu yamadan etkilenmez.
 */
function liveFetch(url: string, init: LiveRequestInit = {}): Promise<LiveResponse> {
  const target = new URL(url)
  const client = target.protocol === 'https:' ? https : http
  const body = init.body === undefined ? undefined : Buffer.from(init.body, 'utf8')

  return new Promise((resolve, reject) => {
    const req = client.request(
      target,
      {
        method: init.method ?? 'GET',
        headers: {
          ...init.headers,
          ...(body ? { 'Content-Length': String(body.byteLength) } : {}),
        },
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk: Buffer) => chunks.push(chunk))
        res.on('error', reject)
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8')
          const status = res.statusCode ?? 0
          resolve({
            status,
            ok: status >= 200 && status < 300,
            text: async () => raw,
            json: async () => JSON.parse(raw),
          })
        })
      }
    )
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

async function login(account: { email: string; password: string }): Promise<string> {
  const response = await liveFetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account),
  })
  if (!response.ok) throw new Error(`login ${account.email}: ${response.status}`)
  const body = (await response.json()) as { tokens: { accessToken: string } }
  return body.tokens.accessToken
}

async function fetchJson(path: string, token: string): Promise<unknown> {
  const response = await liveFetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error(`GET ${path}: ${response.status}`)
  return response.json()
}

/**
 * Şemayı yanıta uygular ve düşerse HANGİ alanın bozulduğunu söyler.
 * Çıplak `expect(success).toBe(true)` yalnız "false !== true" der; kırmızı test
 * teşhis etmiyorsa yarısı kadar işe yarar.
 */
function expectMatchesContract(path: string, schema: z.ZodTypeAny, payload: unknown): void {
  const result = schema.safeParse(payload)
  const issues = (result.error?.issues ?? []).map(
    (issue) => `${path} → ${issue.path.join('.')}: ${issue.message}`
  )
  expect(issues).toEqual([])
}

describeLive('canlı sözleşme — danışan', () => {
  let token = ''

  beforeAll(async () => {
    token = await login(CLIENT)
  })

  it.each([
    ['/categories', listOf(CategorySchema)],
    ['/categories/anksiyete', CategoryDetailSchema],
    ['/listings/my', listOf(ListingSchema)],
    ['/offers/my', listOf(OfferSchema)],
    ['/matches', listOf(MatchSchema)],
    ['/notifications', NotificationListResponseSchema],
    ['/assessment', listOf(AssessmentListItemSchema)],
    ['/assessment/results/my', listOf(MyAssessmentResultSchema)],
    ['/auth/me', AuthUserSchema],
    ['/listings/rules', ListingRulesResponseSchema],
    ['/me/referrer', ReferrerResponseSchema],
  ])('%s uygulamanın şemasına uyar', async (path, schema) => {
    expectMatchesContract(path, schema, await fetchJson(path, token))
  })

  // Kimliği çalışma anında bulunan uçlar: sabit id yazmak testi seed'e bağlar
  // ve seed değişince "sözleşme bozuldu" gibi görünen bir kurulum hatası üretir.
  it('ilan detayı, gelen teklifleri ve eşleşme detayı şemaya uyar', async () => {
    const listings = (await fetchJson('/listings/my', token)) as { data: { id: string }[] }
    const listingId = listings.data[0]?.id
    expect(listingId).toBeDefined()

    expectMatchesContract(
      '/listings/{id}',
      ListingSchema,
      await fetchJson(`/listings/${listingId}`, token)
    )
    expectMatchesContract(
      '/listings/{id}/offers',
      listOf(OfferSchema),
      await fetchJson(`/listings/${listingId}/offers`, token)
    )

    const matches = (await fetchJson('/matches', token)) as { data: { id: string }[] }
    const matchId = matches.data[0]?.id
    expect(matchId).toBeDefined()
    expectMatchesContract(
      '/matches/{id}',
      MatchDetailSchema,
      await fetchJson(`/matches/${matchId}`, token)
    )
  })

  it('uzman profili ve yorumları şemaya uyar', async () => {
    const matches = (await fetchJson('/matches', token)) as {
      data: { expert?: { id: string } }[]
    }
    const expertId = matches.data[0]?.expert?.id
    expect(expertId).toBeDefined()

    expectMatchesContract(
      '/experts/{id}',
      ExpertSchema,
      await fetchJson(`/experts/${expertId}`, token)
    )
    // Bu uç zarf KULLANMIYOR: ExpertsController.GetReviews doğrudan
    // IReadOnlyList<ReviewDto> döndürüyor, yani çıplak dizi. Diğer liste uçları
    // { data, meta } sarmalıyor — sözleşme burada bilinçli olarak asimetrik.
    expectMatchesContract(
      '/experts/{id}/reviews',
      z.array(ReviewSchema),
      await fetchJson(`/experts/${expertId}/reviews`, token)
    )
  })
})

async function postJson(path: string, body: unknown): Promise<{ status: number; body: unknown }> {
  const response = await liveFetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await response.text()
  return { status: response.status, body: text ? JSON.parse(text) : null }
}

// Kayıt gövdesi UYGULAMANIN şemasından üretiliyor: şemaya alan eklenip backend'e
// eklenmezse (ya da tersi) bu test kırmızıya döner. Sözleşme §1.
describeLive('canlı sözleşme — kayıt ve şifre sıfırlama', () => {
  const uniqueEmail = () => `contract-${Date.now()}-${Math.round(Math.random() * 1e6)}@psikoal.test`

  const registerBody = (overrides: Record<string, unknown> = {}) => ({
    email: uniqueEmail(),
    password: 'Sozlesme123!',
    firstName: 'Sözleşme',
    lastName: 'Testi',
    role: 'client',
    termsAccepted: true,
    healthDataConsent: true,
    ...overrides,
  })

  it('iki KVKK onayıyla kayıt LoginResponseSchema döner', async () => {
    const body = RegisterRequestSchema.parse(registerBody())
    const response = await postJson('/auth/register', body)

    expect(response.status).toBe(200)
    expectMatchesContract('/auth/register', LoginResponseSchema, response.body)
  })

  it.each([
    ['termsAccepted', { termsAccepted: false }],
    ['healthDataConsent', { healthDataConsent: false }],
  ])('%s false iken kayıt 400 döner', async (_field, overrides) => {
    const response = await postJson('/auth/register', registerBody(overrides))
    expect(response.status).toBe(400)
  })

  it("geçersiz kurtarma token'ı 422 RESET_TOKEN_INVALID döner", async () => {
    const body = ResetPasswordRequestSchema.parse({
      accessToken: 'gecersiz-token',
      newPassword: 'YeniSifre123!',
    })
    const response = await postJson('/auth/reset-password', body)

    expect(response.status).toBe(422)
    expect(response.body).toMatchObject({ code: 'RESET_TOKEN_INVALID' })
  })
})

async function request(
  method: 'GET' | 'POST',
  path: string,
  token?: string
): Promise<{ status: number; body: unknown }> {
  const response = await liveFetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: method === 'POST' ? '{}' : undefined,
  })
  const text = await response.text()
  return { status: response.status, body: text ? JSON.parse(text) : null }
}

// Sözleşme §6: blog uçları uygulamanın Zod şemalarına göre kuruldu.
describeLive('canlı sözleşme — blog', () => {
  it('GET /blogs?limit=3 liste şemasına uyar ve perPage=3', async () => {
    const { status, body } = await request('GET', '/blogs?limit=3')
    expect(status).toBe(200)
    expectMatchesContract('/blogs?limit=3', BlogListResponseSchema, body)
    expect(BlogListResponseSchema.parse(body).meta.perPage).toBe(3)
  })

  it('GET /blogs?category=anksiyete yalnız o kategoriyi döner', async () => {
    const { body } = await request('GET', '/blogs?category=anksiyete')
    const list = BlogListResponseSchema.parse(body)
    for (const blog of list.data) expect(blog.categories).toContain('anksiyete')
  })

  it('GET /blogs/{slug} içerikli BlogSchema döner; beğeni token ister ve tersine çevrilir', async () => {
    const list = BlogListResponseSchema.parse((await request('GET', '/blogs?limit=1')).body)
    const slug = list.data[0]?.slug
    expect(slug).toBeDefined()

    const detail = await request('GET', `/blogs/${slug}`)
    expectMatchesContract('/blogs/{slug}', BlogSchema, detail.body)
    expect(BlogSchema.parse(detail.body).content?.trim().length ?? 0).toBeGreaterThan(0)

    expect((await request('POST', `/blogs/${slug}/like`)).status).toBe(401)

    const token = await login(CLIENT)
    const first = BlogLikeResponseSchema.parse(
      (await request('POST', `/blogs/${slug}/like`, token)).body
    )
    const second = BlogLikeResponseSchema.parse(
      (await request('POST', `/blogs/${slug}/like`, token)).body
    )
    expect(second.liked).toBe(!first.liked)
    expect(Math.abs(second.likeCount - first.likeCount)).toBe(1)
  })
})

describeLive('canlı sözleşme — uzman', () => {
  let token = ''

  beforeAll(async () => {
    token = await login(EXPERT)
  })

  // Uzman tarafı ayrı ölçülüyor: aynı uçlar farklı gövde üretiyor (danışan adı
  // maskeleniyor, iletişim alanları gizlilik tercihine göre null'lanıyor). Yalnız
  // danışan tarafını doğrulamak uzmana özgü sapmayı kaçırırdı.
  it.each([
    ['/listings', listOf(ListingSchema)],
    ['/offers/my', listOf(OfferSchema)],
    ['/matches', listOf(MatchSchema)],
    ['/notifications', NotificationListResponseSchema],
    ['/auth/me', AuthUserSchema],
  ])('%s uygulamanın şemasına uyar', async (path, schema) => {
    expectMatchesContract(path, schema, await fetchJson(path, token))
  })

  it('eşleşme detayında iletişim alanları şemaya uyar', async () => {
    const matches = (await fetchJson('/matches', token)) as { data: { id: string }[] }
    const matchId = matches.data[0]?.id
    expect(matchId).toBeDefined()

    const detail = await fetchJson(`/matches/${matchId}`, token)
    expectMatchesContract('/matches/{id}', MatchDetailSchema, detail)
  })
})

// Uzman cüzdanı (Revize 2 §2.2, backend docs/PAYMENTS.md). Uçlar henüz yayında olmayan
// bir backend'e karşı koşulursa (lokal dev API'si o dalı çalıştırmıyorsa) bu blok
// sessizce geçer: uç yoksa ASP.NET çıplak 404 döner. Uzmanın profili yoksa da 404
// gelir ama gövdesinde EXPERT_NOT_FOUND kodu bulunur; o durum bir kurulum hatasıdır
// ve test kırmızıya döner.
describeLive('canlı sözleşme — uzman cüzdanı ve teklif ücreti', () => {
  let expertToken = ''
  let available = false

  beforeAll(async () => {
    expertToken = await login(EXPERT)
    const probe = await request('GET', '/wallet/me', expertToken)
    const code = (probe.body as { code?: string } | null)?.code
    available = !(probe.status === 404 && code !== 'EXPERT_NOT_FOUND')
  })

  it('uzman: GET /wallet/me şemaya uyar', async () => {
    if (!available) return
    expectMatchesContract(
      '/wallet/me',
      WalletResponseSchema,
      await fetchJson('/wallet/me', expertToken)
    )
  })

  it('uzman: GET /wallet/transactions şemaya uyar ve perPage uygulanır', async () => {
    if (!available) return
    const path = '/wallet/transactions?page=1&perPage=5'
    const body = await fetchJson(path, expertToken)
    expectMatchesContract(path, WalletTransactionPageSchema, body)
    expect(WalletTransactionPageSchema.parse(body).meta.perPage).toBe(5)
  })

  it('uzman: GET /wallet/payments şemaya uyar', async () => {
    if (!available) return
    const path = '/wallet/payments?page=1&perPage=5'
    expectMatchesContract(path, WalletPaymentPageSchema, await fetchJson(path, expertToken))
  })

  it('anonim: GET /wallet/topup-options şemaya uyar', async () => {
    if (!available) return
    const { status, body } = await request('GET', '/wallet/topup-options')
    expect(status).toBe(200)
    expectMatchesContract('/wallet/topup-options', TopupOptionsResponseSchema, body)
  })

  it('uzman: GET /offers/quote şemaya uyar', async () => {
    if (!available) return
    const feed = (await fetchJson('/listings', expertToken)) as {
      data: { id: string; viewerHasOffered: boolean }[]
    }
    const listingId = feed.data.find((listing) => !listing.viewerHasOffered)?.id
    if (!listingId) return
    const path = `/offers/quote?listingId=${listingId}`
    expectMatchesContract(path, OfferQuoteResponseSchema, await fetchJson(path, expertToken))
  })

  it('danışan: GET /wallet/me 403 EXPERT_ROLE_REQUIRED döner', async () => {
    if (!available) return
    const clientToken = await login(CLIENT)
    const response = await request('GET', '/wallet/me', clientToken)
    expect(response.status).toBe(403)
    expect(response.body).toMatchObject({ code: 'EXPERT_ROLE_REQUIRED' })
  })
})
