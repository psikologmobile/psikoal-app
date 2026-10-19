import { z } from 'zod'

export const MatchStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'RELEASED'])

export const MatchSchema = z.object({
  id: z.string().uuid(),
  listingId: z.string().uuid(),
  acceptedOfferId: z.string().uuid(),
  clientId: z.string().uuid(),
  expertId: z.string().uuid(),
  status: MatchStatusSchema,
  createdAt: z.string().datetime(),
  createdAtRelative: z.string().optional(),
  // Revize 2: kullanıcı sonlandırma ucu kalktı; alanlar yalnız admin sonlandırmasının izi.
  clientReleasedAt: z.string().datetime().nullable().optional(),
  expertReleasedAt: z.string().datetime().nullable().optional(),
  client: z
    .object({
      id: z.string().uuid(),
      fullName: z.string(),
      initials: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
    })
    .optional(),
  expert: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      title: z.string(),
      initials: z.string().nullable().optional(),
      // Revize 2 §5: eşleşmede iki taraf da karşı tarafın telefon ve e-postasını görür
      // (uzman profilindeki telefon, auth e-postası). Yoksa null.
      email: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  listing: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      description: z.string().nullable().optional(),
      specialization: z.array(z.string()).default([]),
      budgetMin: z.number(),
      budgetMax: z.number(),
      budgetLabel: z.string().nullable().optional(),
      preferredSessionType: z.string(),
      status: z.string(),
      city: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  offer: z
    .object({
      id: z.string().uuid(),
      price: z.number(),
      sessionType: z.enum(['online', 'yüz_yüze', 'yüz_yüze_online']),
      status: z.string(),
    })
    .nullable()
    .optional(),
})

const EmbeddedAssessmentResultSchema = z
  .object({
    id: z.string(),
    score: z.number(),
    level: z.enum(['low', 'moderate', 'high']),
    summary: z.string(),
    assessmentTitle: z.string(),
  })
  .optional()

const EmbeddedListingSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable().optional(),
    specialization: z.array(z.string()).default([]),
    budgetMin: z.number(),
    budgetMax: z.number(),
    budgetLabel: z.string().nullable().optional(),
    preferredSessionType: z.string(),
    status: z.string(),
    city: z.string().nullable().optional(),
    assessmentResult: EmbeddedAssessmentResultSchema,
  })
  .nullable()
  .optional()

const EmbeddedOfferSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().nullable().optional(),
    price: z.number(),
    description: z.string().default(''),
    sessionType: z.enum(['online', 'yüz_yüze', 'yüz_yüze_online']),
    status: z.string(),
  })
  .nullable()
  .optional()

export const MatchDetailSchema = MatchSchema.extend({
  client: z.object({
    id: z.string().uuid(),
    fullName: z.string(),
    initials: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    createdAt: z.string().datetime().nullable().optional(),
  }),
  listing: EmbeddedListingSchema,
  offer: EmbeddedOfferSchema,
})
