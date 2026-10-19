import { z } from 'zod'

const LEGAL_URL_KEYS = [
  'EXPO_PUBLIC_PRIVACY_URL',
  'EXPO_PUBLIC_TERMS_URL',
  'EXPO_PUBLIC_KVKK_URL',
] as const

// Varsayılan 'production': değişken unutulursa uygulama en sıkı modda açılır
// (fail-safe). Geliştirme ortamı bunu .env içinde açıkça söylemek zorunda.
export const envSchema = z
  .object({
    EXPO_PUBLIC_API_URL: z.string().min(1, 'EXPO_PUBLIC_API_URL is required'),
    EXPO_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('production'),
    EXPO_PUBLIC_SUPPORT_EMAIL: z.string().email('EXPO_PUBLIC_SUPPORT_EMAIL must be an e-mail'),
    EXPO_PUBLIC_PRIVACY_URL: z.string().url('EXPO_PUBLIC_PRIVACY_URL must be a URL'),
    EXPO_PUBLIC_TERMS_URL: z.string().url('EXPO_PUBLIC_TERMS_URL must be a URL'),
    EXPO_PUBLIC_KVKK_URL: z.string().url('EXPO_PUBLIC_KVKK_URL must be a URL'),
    // Mağaza sayfası yayından sonra belli olur; yoksa değerlendirme yalnız
    // sistemin uygulama içi penceresiyle istenir.
    EXPO_PUBLIC_STORE_URL: z.string().url('EXPO_PUBLIC_STORE_URL must be a URL').optional(),
    // Web sitesinin kök adresi (kanonik adres / og:url). Alan adı alınınca verilir.
    EXPO_PUBLIC_SITE_URL: z.string().url('EXPO_PUBLIC_SITE_URL must be a URL').optional(),
    // Tanıtım sayfasındaki mağaza rozetleri; boşsa rozet "Yakında" olarak çizilir.
    EXPO_PUBLIC_APP_STORE_URL: z.string().url('EXPO_PUBLIC_APP_STORE_URL must be a URL').optional(),
    EXPO_PUBLIC_PLAY_STORE_URL: z
      .string()
      .url('EXPO_PUBLIC_PLAY_STORE_URL must be a URL')
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.EXPO_PUBLIC_APP_ENV !== 'production') return
    for (const key of [...LEGAL_URL_KEYS, 'EXPO_PUBLIC_STORE_URL'] as const) {
      const url = value[key]
      if (url !== undefined && !url.startsWith('https://')) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: `${key} must use https in production`,
        })
      }
    }
  })

export function parseEnv(source: Record<string, string | undefined>) {
  const result = envSchema.safeParse({
    EXPO_PUBLIC_API_URL: source['EXPO_PUBLIC_API_URL'],
    EXPO_PUBLIC_APP_ENV: source['EXPO_PUBLIC_APP_ENV'],
    EXPO_PUBLIC_SUPPORT_EMAIL: source['EXPO_PUBLIC_SUPPORT_EMAIL'],
    EXPO_PUBLIC_PRIVACY_URL: source['EXPO_PUBLIC_PRIVACY_URL'],
    EXPO_PUBLIC_TERMS_URL: source['EXPO_PUBLIC_TERMS_URL'],
    EXPO_PUBLIC_KVKK_URL: source['EXPO_PUBLIC_KVKK_URL'],
    EXPO_PUBLIC_STORE_URL: source['EXPO_PUBLIC_STORE_URL'] || undefined,
    EXPO_PUBLIC_SITE_URL: source['EXPO_PUBLIC_SITE_URL'] || undefined,
    EXPO_PUBLIC_APP_STORE_URL: source['EXPO_PUBLIC_APP_STORE_URL'] || undefined,
    EXPO_PUBLIC_PLAY_STORE_URL: source['EXPO_PUBLIC_PLAY_STORE_URL'] || undefined,
  })

  if (!result.success) {
    const missing = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`[env] Missing or invalid environment variables:\n${missing}`)
  }

  return result.data
}

// EXPO_PUBLIC_* değişkenleri derleme anında YALNIZ `process.env.X` biçiminde
// yazıldıklarında satır içine gömülür; bu yüzden nesne burada tek tek kurulur.
export const env = parseEnv({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_SUPPORT_EMAIL: process.env.EXPO_PUBLIC_SUPPORT_EMAIL,
  EXPO_PUBLIC_PRIVACY_URL: process.env.EXPO_PUBLIC_PRIVACY_URL,
  EXPO_PUBLIC_TERMS_URL: process.env.EXPO_PUBLIC_TERMS_URL,
  EXPO_PUBLIC_KVKK_URL: process.env.EXPO_PUBLIC_KVKK_URL,
  EXPO_PUBLIC_STORE_URL: process.env.EXPO_PUBLIC_STORE_URL,
  EXPO_PUBLIC_SITE_URL: process.env.EXPO_PUBLIC_SITE_URL,
  EXPO_PUBLIC_APP_STORE_URL: process.env.EXPO_PUBLIC_APP_STORE_URL,
  EXPO_PUBLIC_PLAY_STORE_URL: process.env.EXPO_PUBLIC_PLAY_STORE_URL,
})

export type Env = typeof env
