import { z } from 'zod'

// Sözleşme: docs/design-v2/API-REVIZE-2.md §4 + backend Dtos/Offer/*.

export const OfferStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'])

/** REJECTED teklifin neden kapandığı (danışan kararı değil, ilanın durumu). */
export const OfferClosedReasonSchema = z.enum(['OTHER_EXPERT', 'LISTING_CLOSED', 'LISTING_EXPIRED'])

const SessionTypeSchema = z.enum(['online', 'yüz_yüze', 'yüz_yüze_online'])

/**
 * Danışanın iletişim bilgisi — yalnız teklifin sahibi uzmana ve danışan ilan
 * açarken rıza verdiyse dolu (Revize 2 §3.2). Telefon profilde yoksa null.
 */
export const ClientContactSchema = z.object({
  fullName: z.string(),
  phone: z.string().nullable(),
  email: z.string(),
})

export const OfferSchema = z.object({
  id: z.string().uuid(),
  listingId: z.string().uuid(),
  expertId: z.string().uuid(),
  title: z.string().max(100).nullable().optional(),
  price: z.number().positive(),
  description: z.string().max(300).default(''),
  sessionType: SessionTypeSchema,
  status: OfferStatusSchema,
  matchId: z.string().uuid().nullable().optional(),
  createdAt: z.string().datetime(),
  createdAtRelative: z.string().optional(),
  listing: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      clientId: z.string().uuid(),
      city: z.string().nullable().optional(),
      clientDisplayName: z.string().nullable().optional(),
      // Eşleşme öncesi danışanın tam adı burada hiç gönderilmez — bkz. clientContact.
      client: z
        .object({
          id: z.string().uuid(),
          initials: z.string().nullable().optional(),
          avatarUrl: z.string().url().nullable().optional(),
        })
        .nullable()
        .optional(),
      assessmentResult: z
        .object({
          id: z.string(),
          score: z.number(),
          level: z.enum(['low', 'moderate', 'high']),
          summary: z.string(),
          assessmentTitle: z.string(),
        })
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
  expert: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      title: z.string(),
      initials: z.string().nullable().optional(),
      avatarUrl: z.string().url().nullable().optional(),
      rating: z.number(),
    })
    .nullable()
    .optional(),
  // ── Revize 2 ──────────────────────────────────────────────────────────────
  /** Ödenen teklif ücreti (kuruş). Yalnız teklif sahibi uzmana dolu; danışana null. */
  feePaidKurus: z.number().int().nullable(),
  /** "₺625" ya da "Ücretsiz hak". Danışana null. */
  feePaidLabel: z.string().nullable(),
  usedFreeRight: z.boolean(),
  closedReason: OfferClosedReasonSchema.nullable(),
  /** Gönderildi · Seçildi · Başka uzmanla eşleşti · İlan kapandı · Süresi doldu · Geri çekildi */
  statusLabel: z.string(),
  /** Uzman bu ilan için "Danışanla anlaştım" bildirdi mi? */
  claimed: z.boolean(),
  clientContact: ClientContactSchema.nullable(),
})

/** GET /offers/quote?listingId= → data. Yalnız ŞU ANKİ ücret; bir sonraki düşüş hiç dönmez. */
export const OfferQuoteSchema = z.object({
  feeKurus: z.number().int().min(0),
  feeLabel: z.string(),
  balanceKurus: z.number().int(),
  balanceLabel: z.string(),
  freeOfferRights: z.number().int().min(0),
  willUseFreeRight: z.boolean(),
  balanceAfterKurus: z.number().int(),
  balanceAfterLabel: z.string(),
  /** Gönderim mümkün mü (hak var ya da bakiye ≥ ücret). Karar sunucunun. */
  sufficient: z.boolean(),
})

export const OfferQuoteResponseSchema = z.object({ data: OfferQuoteSchema })

/** 409 OFFER_FEE_CHANGED ve 422 INSUFFICIENT_BALANCE yanıtlarının `meta`'sı. */
export const OfferFeeMetaSchema = z.object({
  feeKurus: z.number().int().min(0),
  feeLabel: z.string(),
})

/**
 * Boş bırakılan opsiyonel metin alanını YOK sayar.
 *
 * Form alanları `defaultValues` gereği boş string ile başlıyor ve `.optional()`
 * boş string'i geçirmiyor: `''` geçerli bir string olduğu için `.min(3)` yine
 * koşuyor ve düşüyor. Sonuç: "opsiyonel" etiketli alan boş bırakıldığında form
 * "En az 3 karakter" diyerek KİLİTLENİYOR ve kullanıcı, doldurması gerekmediği
 * söylenen bir alan yüzünden ilerleyemiyor.
 */
const optionalText = (schema: z.ZodString) =>
  z
    .string()
    .transform((value) => value.trim())
    .pipe(z.union([z.literal(''), schema]))
    .transform((value) => (value === '' ? undefined : value))
    .optional()

/** Teklif FORMU. Gönderim gövdesi buna ek olarak `expectedFeeKurus` taşır (SendOfferPayload). */
export const SendOfferSchema = z.object({
  listingId: z.string().uuid({ message: 'İlan seçiniz' }),
  title: optionalText(z.string().min(3, 'En az 3 karakter').max(100, 'En fazla 100 karakter')),
  price: z.number({ error: 'Fiyat giriniz' }).positive('Geçerli fiyat giriniz'),
  sessionType: SessionTypeSchema,
  description: optionalText(z.string().max(300, 'En fazla 300 karakter')),
})
