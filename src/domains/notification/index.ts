export {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useRegisterPushTokenMutation,
} from './api'
export { useUnreadNotificationCount } from './hooks/useUnreadNotificationCount'
export {
  usePushRegistration,
  usePushTokenRegistration,
  useSilentPushRegistration,
} from './hooks/usePushTokenRegistration'
export { useNotificationResponseRouting } from './hooks/useNotificationResponseRouting'
export {
  resolveNotificationRoute,
  NotificationTapDataSchema,
  NOTIFICATIONS_ROUTE,
  WALLET_ROUTE,
  WALLET_INVOICES_ROUTE,
} from './utils/resolveNotificationRoute'
export type { NotificationTapData } from './utils/resolveNotificationRoute'
export { notificationKeys, NOTIFICATION_TYPE_CONFIG } from './notification.constants'
export type { NotificationTone, NotificationTypeConfig } from './notification.constants'
export {
  NOTIFICATION_TYPES,
  NotificationSchema,
  NotificationTypeSchema,
  NotificationListResponseSchema,
} from './schemas/notification.schema'
export type {
  Notification,
  NotificationType,
  RegisterPushTokenBody,
} from './types/notification.types'
export { groupNotificationsByDay } from './utils/groupNotifications'
export type { NotificationGroup } from './utils/groupNotifications'
