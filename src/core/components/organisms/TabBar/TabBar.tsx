import type { ReactNode } from 'react'

import { View } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { BottomTabBarProps } from 'expo-router/js-tabs'

import { CountBadge } from '@/core/components/atoms/CountBadge'
import { Text } from '@/core/components/atoms/Text'
import { Pop, PressableScale } from '@/core/motion'
import { size, useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

type TabItemProps = {
  label: string
  focused: boolean
  icon: ReactNode
  badge?: number | string
  onPress: () => void
  onLongPress: () => void
  testID?: string
}

function TabItem({ label, focused, icon, badge, onPress, onLongPress, testID }: TabItemProps) {
  const badgeCount = typeof badge === 'number' ? badge : badge ? Number(badge) || 0 : 0
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      haptics="selection"
      accessibilityRole="tab"
      accessibilityLabel={badgeCount > 0 ? `${label}, ${badgeCount} yeni` : label}
      accessibilityState={{ selected: focused }}
      wrapperClassName="flex-1 items-center"
      className="min-w-16 items-center gap-1"
    >
      <View className="relative h-[30px] items-center justify-center">
        {focused ? (
          <Pop duration={300} overshoot={1.08} replayKey={label}>
            <View className="h-[30px] w-12 items-center justify-center rounded-full bg-primary">
              {icon}
            </View>
          </Pop>
        ) : (
          <View className="h-[30px] w-12 items-center justify-center">{icon}</View>
        )}
        {badgeCount > 0 ? (
          <View className="absolute -right-1 -top-1.5">
            <CountBadge count={badgeCount} max={9} />
          </View>
        ) : null}
      </View>
      <Text
        numberOfLines={1}
        className={cn(
          'text-xs',
          focused ? 'font-body-bold text-fg' : 'font-body-semibold text-fg-muted'
        )}
      >
        {label}
      </Text>
    </PressableScale>
  )
}

/**
 * TabBar (mobil) — yüzen çubuk: surface zemin, 1,5 px border, alttan 20 px,
 * kenarlardan 12 px, radius 24, h 72. Aktif sekme: 48×30 primary hap + 700
 * etiket. Sekme ikonları `tabBarIcon` seçeneğinden ({ focused, color })
 * alınır; `href: null` olan rotalar gösterilmez. (tabs)/_layout sahneye alt
 * boşluk verir; ekranların ayrıca boşluk bırakması gerekmez.
 *
 *   <Tabs tabBar={(props) => <TabBar {...props} />} …>
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
  const t = size.tabBar
  return (
    <View
      accessibilityRole="tablist"
      // REASON: yüzen konum güvenli alana göre hesaplanır
      style={{
        position: 'absolute',
        left: t.inset,
        right: t.inset,
        bottom: Math.max(t.bottom, insets.bottom),
        height: t.height,
      }}
      className="flex-row items-center justify-around rounded-3xl border border-border bg-surface px-2"
    >
      {state.routes.map((route, index) => {
        const descriptor = descriptors[route.key]
        if (!descriptor) return null
        const { options } = descriptor
        // expo-router `href: null` → sekme gizli
        const hidden = (options as { href?: unknown }).href === null
        if (hidden) return null
        const focused = state.index === index
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : (options.title ?? route.name)
        const color = focused ? colors.onPrimary : colors.textMuted
        const icon = options.tabBarIcon?.({ focused, color, size: 20 }) ?? null
        return (
          <TabItem
            key={route.key}
            label={label}
            focused={focused}
            icon={icon}
            badge={options.tabBarBadge}
            testID={options.tabBarButtonTestID}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              })
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params)
            }}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
          />
        )
      })}
    </View>
  )
}
