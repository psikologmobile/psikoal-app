import { NOTIFICATION_TYPE_CONFIG } from '../notification.constants'
import { NOTIFICATION_TYPES, NotificationListResponseSchema } from '../schemas/notification.schema'

import {
  NOTIFICATIONS_ROUTE,
  resolveNotificationRoute,
  WALLET_INVOICES_ROUTE,
  WALLET_ROUTE,
} from './resolveNotificationRoute'

const ID = '0b8f3c6e-1d2a-4f5b-9c8d-7e6f5a4b3c2d'

describe('resolveNotificationRoute', () => {
  it.each([
    ['OFFER_RECEIVED', ID, `/listing/${ID}`],
    ['OFFER_ACCEPTED', ID, `/match/${ID}`],
    ['MATCHED', ID, `/match/${ID}/celebrate`],
    ['LISTING_EXPIRING', ID, `/listing/${ID}`],
    ['LISTING_APPROVED', ID, `/listing/${ID}`],
    ['LISTING_REJECTED', ID, `/listing/${ID}`],
    ['LISTING_MATCHED_OTHER', ID, `/listing/${ID}`],
    ['CLAIM_REMINDER', ID, `/listing/${ID}`],
    ['INVITED_CLIENT_LISTING', ID, `/listing/${ID}`],
    ['INVITED_CLIENT_LISTING', null, '/(tabs)'],
    ['BALANCE_TOPUP', null, WALLET_ROUTE],
    ['ADMIN_GIFT', null, WALLET_ROUTE],
    ['WELCOME_RIGHTS', null, WALLET_ROUTE],
    ['REFERRAL_REWARD', ID, WALLET_ROUTE],
    ['INVOICE_READY', ID, WALLET_INVOICES_ROUTE],
    ['EXPERT_APPROVED', null, '/(tabs)'],
    ['EXPERT_REJECTED', null, '/profile/professional'],
    ['REVIEW_APPROVED', null, NOTIFICATIONS_ROUTE],
    ['REVIEW_REJECTED', null, NOTIFICATIONS_ROUTE],
    ['SYSTEM', null, NOTIFICATIONS_ROUTE],
  ])('%s (%s) → route', (type, entityId, expected) => {
    expect(resolveNotificationRoute({ type, entityId })).toBe(expected)
  })

  it('falls back to the tab when the entity id is missing (in-app list rows)', () => {
    expect(resolveNotificationRoute({ type: 'OFFER_RECEIVED' })).toBe('/(tabs)/offers')
    expect(resolveNotificationRoute({ type: 'CLAIM_REMINDER', entityId: '' })).toBe(
      '/(tabs)/offers'
    )
    expect(resolveNotificationRoute({ type: 'MATCHED', entityId: null })).toBe('/(tabs)/matches')
  })

  it('opens the notification list for unknown or malformed data', () => {
    expect(resolveNotificationRoute({ type: 'SOMETHING_NEW', entityId: ID })).toBe(
      NOTIFICATIONS_ROUTE
    )
    expect(resolveNotificationRoute(undefined)).toBe(NOTIFICATIONS_ROUTE)
    expect(resolveNotificationRoute('x')).toBe(NOTIFICATIONS_ROUTE)
  })
})

describe('bildirim türleri', () => {
  it('her türün ikon/ton yapılandırması var', () => {
    for (const type of NOTIFICATION_TYPES) {
      expect(NOTIFICATION_TYPE_CONFIG[type]).toBeDefined()
    }
  })

  it('bilinmeyen tür listeyi düşürmez; SYSTEM olarak okunur', () => {
    const parsed = NotificationListResponseSchema.parse({
      data: [
        {
          id: '1',
          type: 'YENI_TUR',
          title: 'Başlık',
          body: 'Metin',
          createdAt: '2026-10-19T08:00:00.000000Z',
          timeLabel: 'şimdi',
          read: false,
          entityId: null,
        },
      ],
      meta: { page: 1, total: 1, perPage: 1, unreadCount: 1 },
    })
    expect(parsed.data[0]?.type).toBe('SYSTEM')
  })
})
