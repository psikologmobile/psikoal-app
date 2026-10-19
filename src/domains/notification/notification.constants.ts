import type { NotificationType } from './types/notification.types'
import type { IconName } from '@/core/components/atoms/Icon'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
} as const

export const NOTIFICATION_STALE_TIME = 60 * 1000

/**
 * v2 semantik tonları (docs/design-v2): renk kodu değil, temanın token adı.
 *  primary → `bg-primary` / `text-primary-fg` (olumlu, eylem gerektiren)
 *  accent  → `bg-accent-soft` / `text-accent-soft-fg` (bilgi, para/hak)
 *  danger  → `bg-danger-soft` / `text-danger-soft-fg` (red, kapanış)
 *  neutral → `bg-surface` / `text-fg-muted` (sistem)
 */
export type NotificationTone = 'primary' | 'accent' | 'danger' | 'neutral'

export type NotificationTypeConfig = {
  icon: IconName
  tone: NotificationTone
  /** NotificationItem `priority`: high → ikon kutusu primary dolgu. */
  priority: 'high' | 'normal'
}

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
  OFFER_RECEIVED: { icon: 'SendHorizonal', tone: 'primary', priority: 'high' },
  OFFER_ACCEPTED: { icon: 'CheckCircle', tone: 'primary', priority: 'high' },
  LISTING_EXPIRING: { icon: 'Hourglass', tone: 'accent', priority: 'normal' },
  LISTING_APPROVED: { icon: 'CheckCircle2', tone: 'accent', priority: 'normal' },
  LISTING_REJECTED: { icon: 'XCircle', tone: 'danger', priority: 'normal' },
  EXPERT_APPROVED: { icon: 'BadgeCheck', tone: 'primary', priority: 'high' },
  EXPERT_REJECTED: { icon: 'XCircle', tone: 'danger', priority: 'normal' },
  REVIEW_APPROVED: { icon: 'MessageSquareText', tone: 'accent', priority: 'normal' },
  REVIEW_REJECTED: { icon: 'MessageSquareText', tone: 'danger', priority: 'normal' },
  MATCHED: { icon: 'Handshake', tone: 'primary', priority: 'high' },
  LISTING_MATCHED_OTHER: { icon: 'UserX', tone: 'neutral', priority: 'normal' },
  CLAIM_REMINDER: { icon: 'MessageCircleQuestion', tone: 'primary', priority: 'high' },
  INVITED_CLIENT_LISTING: { icon: 'UserPlus', tone: 'primary', priority: 'high' },
  BALANCE_TOPUP: { icon: 'Wallet', tone: 'accent', priority: 'normal' },
  ADMIN_GIFT: { icon: 'Gift', tone: 'accent', priority: 'normal' },
  WELCOME_RIGHTS: { icon: 'Sparkles', tone: 'accent', priority: 'normal' },
  REFERRAL_REWARD: { icon: 'Gift', tone: 'accent', priority: 'normal' },
  INVOICE_READY: { icon: 'FileText', tone: 'accent', priority: 'normal' },
  SYSTEM: { icon: 'Bell', tone: 'neutral', priority: 'normal' },
}
