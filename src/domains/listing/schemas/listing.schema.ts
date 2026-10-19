import { z } from 'zod'

import { formatTry } from '@/core/utils/formatTry'

// Sözleşme: docs/design-v2/API-REVIZE-2.md §3 + backend Dtos/Listing/*.
// Backend ListingDto'nun bütün alanlarını HER görünümde yazar; görünüme ait olmayan
// alan null/false gelir (uzman: offerFee*, invitedByViewer, viewerClaim, clientContact,
// matchedWithOther — danışan: matchedExpert, claims, contactConsentAt).

export const ListingStatusSchema = z.enum([
  'PENDING_APPROVAL',
  'OPEN',
  'MATCHED',
  'CLOSED',
  'EXPIRED',
  'REJECTED_BY_ADMIN',
])

export const SessionTypeSchema = z.enum(['online', 'yüz_yüze', 'yüz_yüze_online'])

const timestamp = z.string().datetime({ offset: true })

/** Danışanın iletişimi — yalnız bu ilana teklif vermiş uzmana dolu (rıza ile). */
export const ListingClientContactSchema = z.object({
  fullName: z.string(),
  phone: z.string().nullable(),
  email: z.string(),
})

/** Danışan görünümü: uzmanın "Danışanla anlaştım" bildirimi (kapatılmamış). */
export const ListingClaimSchema = z.object({
  expertId: z.string().uuid(),
  expertName: z.string(),
  createdAt: timestamp,
})

export const ListingSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  // Eşleşme öncesi danışanın tam adı burada hiç gönderilmez (bkz. clientDisplayName);
  // teklif vermiş uzman tam adı clientContact'tan görür.
  client: z
    .object({
      id: z.string().uuid(),
      initials: z.string().optional(),
      avatarUrl: z.string().url().nullable().optional(),
      createdAt: timestamp.optional(),
    })
    .optional(),
  clientDisplayName: z.string().optional(),
  rejectionReason: z.string().nullable().optional(),
  title: z.string(),
  description: z.string(),
  specialization: z.array(z.string()),
  budgetMin: z.number().positive(),
  budgetMax: z.number().positive(),
  preferredSessionType: z.preprocess(
    (v) => (v === 'fark_etmez' ? 'yüz_yüze_online' : v),
    SessionTypeSchema
  ),
  // .nullable(): sehirsiz acilan ilanda ListingDto.City null ve JSON'a
  // "city": null yaziliyor. Yalniz .optional() ile feed'in TAMAMI parse
  // hatasina duser ve kullanici bos liste gorur.
  city: z.string().nullable().optional(),
  offerCount: z.number().int().min(0).default(0),
  status: ListingStatusSchema,
  budgetLabel: z.string(),
  expiresAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  createdAtRelative: z.string(),
  viewerHasOffered: z.boolean(),
  viewerOfferId: z.string().uuid().nullable(),
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
  // ── Uzman görünümü ────────────────────────────────────────────────────────
  /** Bu ilana ŞU AN teklif vermenin ücreti (kuruş). Danışana null. */
  offerFeeKurus: z.number().int().nullable(),
  /** "₺625". Bir sonraki düşüş bilerek yok (müşteri kararı). */
  offerFeeLabel: z.string().nullable(),
  /** İlan sahibi bu uzmanın davetiyle geldi ("Davet" rozeti). */
  invitedByViewer: z.boolean(),
  /** Uzmanın bu ilan için "anlaştım" bildirimi; yoksa null. */
  viewerClaim: z.object({ createdAt: timestamp }).nullable(),
  clientContact: ListingClientContactSchema.nullable(),
  /** Danışan başka bir uzmanla eşleşti (bu uzmanın teklifi seçilmedi). */
  matchedWithOther: z.boolean(),
  // ── Danışan görünümü ──────────────────────────────────────────────────────
  matchedExpert: z.object({ id: z.string().uuid(), name: z.string() }).nullable(),
  claims: z.array(ListingClaimSchema).nullable(),
  contactConsentAt: timestamp.nullable(),
})

/** GET /listings/rules → data (Revize 2 §3.1). Dönemsel; admin değiştirebilir. */
export const ListingRulesSchema = z.object({
  budgetMinTry: z.number().int().min(0),
  /** null = üst sınır yok. */
  budgetMaxTry: z.number().int().nullable(),
  titleMin: z.number().int().min(0),
  titleMax: z.number().int().min(1),
  descriptionMax: z.number().int().min(1),
  cityRequiredFor: z.array(z.string()),
  maxActive: z.number().int().min(1),
})

export const ListingRulesResponseSchema = z.object({ data: ListingRulesSchema })

/** POST /listings/{id}/match → data (Revize 2 §3.4). */
export const MarkMatchedResponseSchema = z.object({
  data: z.object({ matchId: z.string().uuid() }),
})

/** POST /listings/{id}/claims ve .../dismiss → data. */
export const ClaimSchema = z.object({
  id: z.string().uuid(),
  listingId: z.string().uuid(),
  expertId: z.string().uuid(),
  note: z.string().nullable(),
  createdAt: timestamp,
  dismissedAt: timestamp.nullable(),
})

export const ClaimResponseSchema = z.object({ data: ClaimSchema })

export const CLAIM_NOTE_MAX = 300

export const CreateClaimSchema = z.object({
  note: z
    .string()
    .trim()
    .max(CLAIM_NOTE_MAX, `En fazla ${CLAIM_NOTE_MAX} karakter`)
    .transform((value) => (value === '' ? undefined : value))
    .optional(),
})

type ListingRulesInput = z.infer<typeof ListingRulesSchema>

/**
 * `/listings/rules` gelmeden önce kullanılan varsayılanlar (backend başlangıç
 * değerleri). Bütçe aralığı dönemseldir; kesin kontrol sunucuda
 * (422 LISTING_BUDGET_OUT_OF_RANGE).
 */
export const DEFAULT_LISTING_RULES: ListingRulesInput = {
  budgetMinTry: 0,
  budgetMaxTry: null,
  titleMin: 10,
  titleMax: 100,
  descriptionMax: 2000,
  cityRequiredFor: ['yüz_yüze', 'yüz_yüze_online'],
  maxActive: 3,
}

/**
 * İlan oluşturma şeması, sunucunun o anki kurallarıyla (Revize 2 §3.2):
 * başlık/açıklama sınırları, bütçe aralığı, yüz yüze görüşmede şehir zorunluluğu
 * ve iletişim paylaşımına AÇIK rıza (false → gönderilmez).
 */
export function createListingSchemaFor(rules: ListingRulesInput = DEFAULT_LISTING_RULES) {
  const budget = (requiredMessage: string) => {
    let schema = z
      .number({ error: requiredMessage })
      .positive('Geçerli tutar giriniz')
      .min(rules.budgetMinTry, `En az ${formatTry(rules.budgetMinTry * 100)} olmalı`)
    if (rules.budgetMaxTry !== null) {
      schema = schema.max(
        rules.budgetMaxTry,
        `En fazla ${formatTry(rules.budgetMaxTry * 100)} olabilir`
      )
    }
    return schema
  }

  return z
    .object({
      title: z
        .string()
        .min(rules.titleMin, `En az ${rules.titleMin} karakter giriniz`)
        .max(rules.titleMax, `En fazla ${rules.titleMax} karakter giriniz`),
      description: z
        .string()
        .max(rules.descriptionMax, `En fazla ${rules.descriptionMax} karakter giriniz`)
        .optional(),
      specialization: z.array(z.string()).min(1, 'En az 1 uzmanlık alanı seçiniz'),
      budgetMin: budget('Minimum bütçe giriniz'),
      budgetMax: budget('Maksimum bütçe giriniz'),
      preferredSessionType: SessionTypeSchema,
      city: z.string().trim().min(1).optional(),
      assessmentResultId: z.string().optional(),
      /** Ad soyad, telefon ve e-postanın teklif veren uzmanlarla paylaşılmasına açık rıza. */
      contactConsent: z.boolean().refine((value) => value, {
        message: 'İletişim bilgilerinizin teklif veren uzmanlarla paylaşılmasına onay vermelisiniz',
      }),
      /** Profilde telefon yoksa zorunlu (sunucu 422 PHONE_REQUIRED); gelirse profile yazılır. */
      phone: z.string().trim().min(1).optional(),
    })
    .refine((d) => d.budgetMax >= d.budgetMin, {
      message: 'Maksimum bütçe minimumdan küçük olamaz',
      path: ['budgetMax'],
    })
    .refine((d) => !rules.cityRequiredFor.includes(d.preferredSessionType) || Boolean(d.city), {
      message: 'Yüz yüze görüşme için şehir seçiniz',
      path: ['city'],
    })
}

export const CreateListingSchema = createListingSchemaFor()
