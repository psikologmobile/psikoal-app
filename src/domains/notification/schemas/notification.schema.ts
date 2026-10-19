import { z } from 'zod'

/** Backend NotificationTypes.All ile birebir (Revize 2 §8 dahil). */
export const NOTIFICATION_TYPES = [
  'OFFER_RECEIVED',
  // Revize 2: artık ÜRETİLMİYOR (yerine MATCHED); eski kayıtlar için duruyor.
  'OFFER_ACCEPTED',
  'LISTING_EXPIRING',
  'LISTING_APPROVED',
  'LISTING_REJECTED',
  'EXPERT_APPROVED',
  'EXPERT_REJECTED',
  'REVIEW_APPROVED',
  'REVIEW_REJECTED',
  'MATCHED',
  'LISTING_MATCHED_OTHER',
  'CLAIM_REMINDER',
  'INVITED_CLIENT_LISTING',
  'BALANCE_TOPUP',
  'ADMIN_GIFT',
  'WELCOME_RIGHTS',
  'REFERRAL_REWARD',
  'INVOICE_READY',
  'SYSTEM',
] as const

export const NotificationTypeSchema = z.enum(NOTIFICATION_TYPES)

export const NotificationSchema = z.object({
  id: z.string(),
  // Uygulamanın tanımadığı yeni bir tür TÜM listeyi düşürmesin: SYSTEM gibi gösterilir.
  type: NotificationTypeSchema.catch('SYSTEM'),
  title: z.string(),
  body: z.string(),
  createdAt: z.string().datetime(),
  timeLabel: z.string(),
  read: z.boolean(),
  /** İlgili kayıt (ilan/eşleşme) kimliği; yoksa null. Yönlendirme resolveNotificationRoute'ta. */
  entityId: z.string().nullable().optional(),
})

export const NotificationListResponseSchema = z.object({
  data: z.array(NotificationSchema),
  meta: z.object({
    page: z.number(),
    total: z.number(),
    perPage: z.number(),
    unreadCount: z.number().int().min(0),
  }),
})
