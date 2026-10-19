import { View } from 'react-native'

import Animated, { useAnimatedStyle } from 'react-native-reanimated'

import { useRouter } from 'expo-router'

import type { NotificationTone } from '@/domains/notification'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { NotificationItem } from '@/core/components/molecules/NotificationItem'
import { ScreenHeader } from '@/core/components/molecules/ScreenHeader'
import { Screen } from '@/core/components/templates/Screen'
import { useRefresh } from '@/core/hooks'
import { EnterRight, EnterUp, PressableScale, useLoopProgress } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import {
  groupNotificationsByDay,
  NOTIFICATION_TYPE_CONFIG,
  NOTIFICATIONS_ROUTE,
  resolveNotificationRoute,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  usePushTokenRegistration,
} from '@/domains/notification'

const PRIORITY: Record<NotificationTone, 'high' | 'normal' | 'low'> = {
  primary: 'high',
  accent: 'normal',
  danger: 'low',
  neutral: 'low',
}

/** Boş durumda zilin üstünden süzülen "z" (`zz`, 2,4 sn ∞). */
function Zz({ delay, small = false }: { delay: number; small?: boolean }) {
  const { t, active } = useLoopProgress({ duration: 2400, delay, linear: true })
  const style = useAnimatedStyle(() => {
    const p = t.value
    return {
      opacity: active ? (p < 0.3 ? p / 0.3 : 1 - (p - 0.3) / 0.7) : 0,
      transform: [{ translateX: 16 * p }, { translateY: -28 * p }],
    }
  })
  return (
    <Animated.View style={[{ position: 'absolute', right: 18, top: 16 }, style]}>
      <Text
        className={
          small
            ? 'font-body-heavy text-[11px] text-accent-soft-fg'
            : 'font-body-heavy text-body-sm text-accent-soft-fg'
        }
      >
        z
      </Text>
    </Animated.View>
  )
}

function EmptyNotifications() {
  const colors = useThemeColors()
  return (
    <EnterUp className="items-center gap-3.5 px-5 py-20">
      <View
        className="h-[110px] w-[110px] items-center justify-center rounded-[34px] bg-accent-soft"
        accessibilityElementsHidden
      >
        <Icon name="Bell" size={46} color={colors.onAccentSoft} strokeWidth={1.8} />
        <Zz delay={0} />
        <Zz delay={800} small />
      </View>
      <Text className="font-body-bold text-lg text-fg">Her şey sakin</Text>
      <Text className="text-center text-body-sm text-fg-muted">
        Yeni bir gelişme olduğunda burada göreceksin.
      </Text>
    </EnterUp>
  )
}

/** Bildirimler (b0 / b5 · Bildirimler): gün başlıkları, okunmamış nabız, tümünü okundu yap. */
export function NotificationsScreen() {
  const router = useRouter()
  const query = useNotificationsQuery()
  const { data, isLoading, isError, refetch } = query
  const { isRefreshing, onRefresh } = useRefresh(query)
  const notifications = data?.data ?? []
  const unreadCount = data?.meta.unreadCount ?? 0
  const groups = groupNotificationsByDay(notifications)

  // Push izni ilk girişte değil, kullanıcı ilk bildirimiyle karşılaşınca istenir.
  usePushTokenRegistration(!isLoading && notifications.length > 0)
  const { mutate: markRead } = useMarkNotificationReadMutation()
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsReadMutation()

  return (
    <Screen
      testID="screen-notifications"
      contentClassName="gap-3 px-4"
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      <EnterUp className="px-1">
        <ScreenHeader
          title="Bildirimler"
          right={
            unreadCount > 0 ? (
              <PressableScale
                onPress={() => markAllRead()}
                disabled={isMarkingAll}
                accessibilityRole="button"
                accessibilityLabel="Tümünü okundu yap"
                className="h-11 justify-center rounded-sm px-2.5"
              >
                <Text className="font-body-bold text-body-sm text-link">Tümünü okundu yap</Text>
              </PressableScale>
            ) : null
          }
        />
      </EnterUp>

      {isLoading ? (
        <View className="gap-2 px-1" accessibilityLabel="Yükleniyor">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={76} borderRadius="xl" delay={i * 100} />
          ))}
        </View>
      ) : isError ? (
        <ErrorBanner
          title="Bildirimler yüklenemedi"
          description="Bağlantını kontrol edip tekrar dene."
          onRetry={() => void refetch()}
        />
      ) : groups.length === 0 ? (
        <EmptyNotifications />
      ) : (
        groups.map((group) => (
          <View key={group.key} className="gap-1">
            <Text
              variant="overline"
              color="muted"
              accessibilityRole="header"
              className="mt-1.5 px-2"
            >
              {group.label}
            </Text>
            {group.items.map((n, i) => {
              const cfg = NOTIFICATION_TYPE_CONFIG[n.type]
              return (
                <EnterRight key={n.id} index={i}>
                  <NotificationItem
                    testID={`notification-${n.id}`}
                    title={n.title}
                    body={n.body}
                    time={n.timeLabel}
                    icon={cfg.icon}
                    priority={PRIORITY[cfg.tone]}
                    unread={!n.read}
                    onPress={() => {
                      if (!n.read) markRead(n.id)
                      const route = resolveNotificationRoute(n)
                      // REASON: typed routes dinamik string'i tanımaz; değer resolveNotificationRoute'un sınırlı kümesinden
                      if (route !== NOTIFICATIONS_ROUTE) router.push(route as never)
                    }}
                  />
                </EnterRight>
              )
            })}
          </View>
        ))
      )}
    </Screen>
  )
}
