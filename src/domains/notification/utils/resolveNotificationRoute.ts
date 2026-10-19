import { z } from 'zod'

import { NotificationTypeSchema } from '../schemas/notification.schema'

import type { NotificationType } from '../types/notification.types'

/**
 * Push `data` alanı (sözleşme §7): { type, entityId }. entityId, backend'in
 * bildirim verisindeki kayıt kimliğidir:
 *   OFFER_RECEIVED → listingId     MATCHED / OFFER_ACCEPTED → matchId
 *   LISTING_* / CLAIM_REMINDER / INVITED_CLIENT_LISTING → listingId
 *   cüzdan türleri, EXPERT_* / REVIEW_* → yok
 * Bilinmeyen tür yönlendirmeyi bozmaz: bildirim listesine düşer.
 */
export const NotificationTapDataSchema = z.object({
  type: z.string(),
  entityId: z.string().nullable().optional(),
})

export type NotificationTapData = z.infer<typeof NotificationTapDataSchema>

export const NOTIFICATIONS_ROUTE = '/notifications'
export const WALLET_ROUTE = '/wallet'
export const WALLET_INVOICES_ROUTE = '/wallet/invoices'

function isKnownType(type: string): type is NotificationType {
  return NotificationTypeSchema.safeParse(type).success
}

export function resolveNotificationRoute(data: unknown): string {
  const parsed = NotificationTapDataSchema.safeParse(data)
  if (!parsed.success || !isKnownType(parsed.data.type)) return NOTIFICATIONS_ROUTE

  const { type } = parsed.data
  const entityId = parsed.data.entityId || null
  const listing = entityId ? `/listing/${entityId}` : '/(tabs)/offers'
  const match = entityId ? `/match/${entityId}` : '/(tabs)/matches'

  switch (type) {
    case 'OFFER_RECEIVED':
      return listing
    case 'MATCHED':
      // Uzman eşleşme bildirimini açınca önce kutlama; kutlama cihazda bir kez
      // gösterilir, sonrakilerde ekran kendisi detaya yönlendirir.
      return entityId ? `/match/${entityId}/celebrate` : match
    case 'OFFER_ACCEPTED':
      return match
    case 'LISTING_EXPIRING':
    case 'LISTING_APPROVED':
    case 'LISTING_REJECTED':
    case 'LISTING_MATCHED_OTHER':
    case 'CLAIM_REMINDER':
      return listing
    case 'INVITED_CLIENT_LISTING':
      // Uzmana: davetiyle gelen danışanın ilanı; kimlik yoksa fırsat akışı.
      return entityId ? `/listing/${entityId}` : '/(tabs)'
    case 'BALANCE_TOPUP':
    case 'ADMIN_GIFT':
    case 'WELCOME_RIGHTS':
    case 'REFERRAL_REWARD':
      return WALLET_ROUTE
    case 'INVOICE_READY':
      return WALLET_INVOICES_ROUTE
    case 'EXPERT_APPROVED':
      return '/(tabs)'
    case 'EXPERT_REJECTED':
      return '/profile/professional'
    case 'REVIEW_APPROVED':
    case 'REVIEW_REJECTED':
    case 'SYSTEM':
      return NOTIFICATIONS_ROUTE
  }
}
