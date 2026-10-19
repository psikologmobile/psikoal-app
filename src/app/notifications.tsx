import { Pressable, ScrollView, View } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useRouter } from 'expo-router'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { BackButton } from '@/core/components/molecules/BackButton'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { NotificationItem } from '@/core/components/molecules/NotificationItem'
import { ScreenTitle } from '@/core/components/molecules/ScreenTitle'
import { useRefresh } from '@/core/hooks'
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  usePushTokenRegistration,
  resolveNotificationRoute,
  NOTIFICATION_TYPE_CONFIG,
} from '@/domains/notification'

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const notificationsQuery = useNotificationsQuery()
  const { data, isLoading, isError, refetch } = notificationsQuery
  const { isRefreshing, onRefresh } = useRefresh(notificationsQuery)
  const notifications = data?.data ?? []
  const unreadCount = data?.meta.unreadCount ?? 0

  // PsikoAl kuralı: push izni ilk login'de değil, kullanıcı ilk bildirimiyle
  // karşılaştığında istenir — bu yüzden liste dolu olduğunda tetiklenir.
  usePushTokenRegistration(!isLoading && notifications.length > 0)

  const { mutate: markRead } = useMarkNotificationReadMutation()
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsReadMutation()

  return (
    <View className="flex-1 bg-surface-base dark:bg-dark-bg">
      <BackButton />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
        contentContainerStyle={{ paddingTop: insets.top + 8 }}
        refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <ScreenTitle title="Bildirimler" />

        {unreadCount > 0 && !isLoading && !isError && (
          <Pressable
            onPress={() => markAllRead()}
            disabled={isMarkingAll}
            className="flex-row items-center justify-end gap-1.5 px-4 pb-2 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Tümünü okundu işaretle"
          >
            <Icon name="CheckCheck" size={14} color="#0EA5E9" />
            <Text variant="caption" className="font-semibold text-sky-600 dark:text-sky-400">
              Tümünü okundu işaretle
            </Text>
          </Pressable>
        )}

        {isLoading ? (
          <View>
            {[1, 2, 3].map((i) => (
              <View key={i} className="flex-row items-start gap-3 px-4 py-4">
                <Skeleton variant="circle" width={40} height={40} />
                <View className="flex-1 gap-2">
                  <Skeleton variant="line" width="55%" height={13} />
                  <Skeleton variant="line" width="85%" height={12} />
                </View>
              </View>
            ))}
          </View>
        ) : isError ? (
          <EmptyState icon="WifiOff" title="Yüklenemedi" ctaLabel="Tekrar Dene" onCta={refetch} />
        ) : notifications.length === 0 ? (
          <EmptyState icon="Bell" title="Henüz bildiriminiz yok" />
        ) : (
          notifications.map((notif) => {
            const cfg = NOTIFICATION_TYPE_CONFIG[notif.type]
            return (
              <NotificationItem
                key={notif.id}
                testID={`notification-${notif.id}`}
                title={notif.title}
                body={notif.body}
                time={notif.timeLabel}
                icon={cfg.icon}
                priority={cfg.priority}
                unread={!notif.read}
                onPress={() => {
                  if (!notif.read) markRead(notif.id)
                  const route = resolveNotificationRoute(notif)
                  // REASON: typed routes dinamik string'i tanımaz; değer resolveNotificationRoute'un sınırlı kümesinden
                  if (route !== '/notifications') router.push(route as never)
                }}
              />
            )
          })
        )}
      </ScrollView>
    </View>
  )
}
