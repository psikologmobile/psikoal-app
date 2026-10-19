/**
 * Web sitesi adresleri. Site ve uygulama TEK Expo Router web derlemesi, tek alan adı:
 * `/` oturumsuz ziyaretçiye tanıtım, oturumlu kullanıcıya uygulama ana sayfası.
 * Bu sayfalar YALNIZ web'de açılır; mobil uygulamada (site) grubu uygulamaya yönlendirir.
 */
export const SITE_ROUTES = {
  home: '/',
  experts: '/uzmanlar-icin',
  blog: '/blog',
  support: '/destek',
  topup: '/bakiye',
  topupSuccess: '/bakiye/basarili',
  topupFailure: '/bakiye/hata',
  privacy: '/gizlilik',
  terms: '/kosullar',
  kvkk: '/kvkk',
  distanceSales: '/mesafeli-satis',
  preInformation: '/on-bilgilendirme',
  login: '/login',
  register: '/register',
  wallet: '/wallet',
} as const

export type SiteRoute = (typeof SITE_ROUTES)[keyof typeof SITE_ROUTES]

/** Giriş sayfası; girişten sonra `returnTo` adresine dönülür ((auth)/_layout). */
export function loginHref(returnTo?: string): string {
  return returnTo
    ? `${SITE_ROUTES.login}?returnTo=${encodeURIComponent(returnTo)}`
    : SITE_ROUTES.login
}

/** Kayıt sayfası; rol önceden seçilebilir (Uzman olarak başvur). */
export function registerHref(role?: 'expert' | 'client'): string {
  return role ? `${SITE_ROUTES.register}?role=${role}` : SITE_ROUTES.register
}

export function blogPostHref(slug: string): string {
  return `${SITE_ROUTES.blog}/${encodeURIComponent(slug)}`
}

/**
 * Yalnız sitenin kendi sayfalarına dönüş: "/" ile başlar, "//" (başka alan adı) ya da
 * şema içermez. Açık yönlendirme (open redirect) önlemi.
 */
export function isSafeReturnPath(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\') &&
    !/^\/[a-z][a-z0-9+.-]*:/i.test(value)
  )
}
