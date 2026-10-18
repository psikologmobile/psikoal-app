import type { ReactNode } from 'react'

import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { NavIconName } from '@/core/components/atoms/NavIcon'
import type { BottomTabBarProps } from 'expo-router/js-tabs'

import { BrandMark } from '@/core/components/atoms/BrandMark'
import { CountBadge } from '@/core/components/atoms/CountBadge'
import { NavIcon } from '@/core/components/atoms/NavIcon'
import { Text } from '@/core/components/atoms/Text'
import { Bell, haptic, PressableScale } from '@/core/motion'
import { size as sizes, useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type SidebarMode = 'full' | 'rail' | 'top'

/** Pencere genişliğine göre kenar çubuğu biçimi: >1100 tam · 641–1100 ikon rayı · ≤640 üst menü. */
export function useSidebarMode(): SidebarMode {
  const { width } = useWindowDimensions()
  if (width <= sizes.web.topMenuBreakpoint) return 'top'
  if (width <= sizes.web.railBreakpoint) return 'rail'
  return 'full'
}

export type SidebarExtraItem = {
  key: string
  label: string
  icon: NavIconName
  onPress: () => void
  badge?: number
  active?: boolean
  /** Bu rota adından SONRA listelenir; verilmezse sona eklenir. */
  after?: string
}

export type SidebarProps = BottomTabBarProps & {
  /** Logo altındaki birincil düğme (Danışan: "Yeni ilan"). */
  primaryAction?: { label: string; icon?: NavIconName; onPress: () => void }
  /** Sekme olmayan bağlantılar (Bildirimler, Bakiyem). */
  extraItems?: SidebarExtraItem[]
  /** Alt kart: uzmanda bakiye kartı + "Bakiye yükle", danışanda kullanıcı kartı. Yalnız tam modda. */
  footer?: ReactNode
  /** Rota adı → ikon. Verilmezse `tabBarIcon` kullanılır. */
  icons?: Record<string, NavIconName>
}

type NavItemProps = {
  label: string
  icon: ReactNode
  active: boolean
  mode: SidebarMode
  badge?: number
  onPress: () => void
}

function NavItem({ label, icon, active, mode, badge = 0, onPress }: NavItemProps) {
  const showLabel = mode === 'full'
  return (
    <Pressable
      onPress={() => {
        haptic.light()
        onPress()
      }}
      accessibilityRole="link"
      accessibilityLabel={badge > 0 ? `${label}, ${badge} yeni` : label}
      accessibilityState={{ selected: active }}
      className={cn(
        'relative h-[46px] flex-row items-center gap-3 rounded-md',
        showLabel ? 'px-3' : 'w-13 justify-center',
        active ? 'bg-accent-soft' : 'hover:bg-surface'
      )}
    >
      {icon}
      {showLabel ? (
        <Text
          className={cn(
            'flex-1 text-body',
            active ? 'font-body-bold text-accent-soft-fg' : 'font-body-semibold text-fg-muted'
          )}
        >
          {label}
        </Text>
      ) : null}
      {badge > 0 ? (
        showLabel ? (
          <CountBadge count={badge} ring={false} />
        ) : (
          <View className="absolute right-0.5 top-0.5">
            <CountBadge count={badge} max={9} />
          </View>
        )
      ) : null}
    </Pressable>
  )
}

/**
 * Sidebar (web) — 248 px; ≤1100 px 84 px ikon rayı; ≤640 px üst yatay menü.
 * Aktif öğe accent-soft. Uzmanda altta bakiye kartı + "Bakiye yükle" (`footer`).
 * Expo Router Tabs'ta `tabBarPosition: 'left' | 'top'` ile kullanılır.
 */
export function Sidebar({
  state,
  descriptors,
  navigation,
  primaryAction,
  extraItems = [],
  footer,
  icons,
}: SidebarProps) {
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
  const mode = useSidebarMode()

  type Entry = { key: string; node: ReactNode }
  const entries: Entry[] = []

  state.routes.forEach((route, index) => {
    const descriptor = descriptors[route.key]
    if (!descriptor) return
    const { options } = descriptor
    if ((options as { href?: unknown }).href === null) return
    const focused = state.index === index
    const label =
      typeof options.tabBarLabel === 'string' ? options.tabBarLabel : (options.title ?? route.name)
    const iconColor = focused ? colors.onAccentSoft : colors.textMuted
    const iconName = icons?.[route.name]
    const icon = iconName ? (
      <NavIcon name={iconName} color={iconColor} />
    ) : (
      (options.tabBarIcon?.({ focused, color: iconColor, size: 20 }) ?? null)
    )
    const badge = typeof options.tabBarBadge === 'number' ? options.tabBarBadge : 0
    entries.push({
      key: route.key,
      node: (
        <NavItem
          key={route.key}
          label={label}
          icon={icon}
          active={focused}
          mode={mode}
          badge={badge}
          onPress={() => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params)
          }}
        />
      ),
    })
    extraItems
      .filter((x) => x.after === route.name)
      .forEach((x) => entries.push({ key: x.key, node: renderExtra(x) }))
  })
  extraItems
    .filter((x) => !x.after || !state.routes.some((r) => r.name === x.after))
    .forEach((x) => entries.push({ key: x.key, node: renderExtra(x) }))

  function renderExtra(x: SidebarExtraItem) {
    const color = x.active ? colors.onAccentSoft : colors.textMuted
    const icon =
      x.icon === 'notifications' ? (
        <Bell>
          <NavIcon name="notifications" color={color} />
        </Bell>
      ) : (
        <NavIcon name={x.icon} color={color} />
      )
    return (
      <NavItem
        key={x.key}
        label={x.label}
        icon={icon}
        active={Boolean(x.active)}
        mode={mode}
        badge={x.badge}
        onPress={x.onPress}
      />
    )
  }

  if (mode === 'top') {
    return (
      <View
        accessibilityRole="menubar"
        // REASON: üst güvenli alan cihazdan gelir
        style={{ paddingTop: insets.top + 10 }}
        className="w-full flex-row items-center justify-around border-b border-border bg-bg px-2.5 pb-2.5"
      >
        {entries.map((e) => e.node)}
      </View>
    )
  }

  const rail = mode === 'rail'
  return (
    <View
      accessibilityRole="menu"
      accessibilityLabel="Ana menü"
      className={cn(
        'h-full border-r border-border bg-bg',
        rail ? 'w-rail items-center px-2.5 py-6' : 'w-sidebar px-4 py-6'
      )}
    >
      <ScrollView
        contentContainerClassName={cn('flex-grow gap-1.5', rail && 'items-center')}
        showsVerticalScrollIndicator={false}
      >
        <View className={cn('pb-4.5', rail ? 'items-center' : 'px-2 pt-1')}>
          <BrandMark size="md" iconOnly={rail} className="self-start" />
        </View>
        {primaryAction ? (
          <PressableScale
            onPress={primaryAction.onPress}
            haptics="medium"
            accessibilityRole="button"
            accessibilityLabel={primaryAction.label}
            className={cn(
              'mb-2.5 h-12 flex-row items-center justify-center gap-2 rounded-md bg-primary',
              rail ? 'w-13' : 'w-full'
            )}
          >
            <NavIcon name={primaryAction.icon ?? 'plus'} color={colors.onPrimary} size={18} />
            {rail ? null : (
              <Text className="font-body-heavy text-body text-primary-fg">
                {primaryAction.label}
              </Text>
            )}
          </PressableScale>
        ) : null}
        {entries.map((e) => e.node)}
        {!rail && footer ? <View className="mt-auto pt-4">{footer}</View> : null}
      </ScrollView>
    </View>
  )
}

export type SidebarBalanceCardProps = {
  balanceLabel: string
  note?: string
  actionLabel?: string
  onAction?: () => void
}

/** Uzman kenar çubuğu alt kartı: accent-soft, bakiye (display 26) + "Bakiye yükle". */
export function SidebarBalanceCard({
  balanceLabel,
  note,
  actionLabel = 'Bakiye yükle',
  onAction,
}: SidebarBalanceCardProps) {
  return (
    <View className="gap-2 rounded-xl bg-accent-soft p-4">
      <Text className="font-body-bold text-xs text-accent-soft-fg">Bakiye</Text>
      <Text className="font-display text-[26px] leading-[30px] text-accent-soft-fg">
        {balanceLabel}
      </Text>
      {note ? <Text className="text-xs text-accent-soft-fg">{note}</Text> : null}
      {onAction ? (
        <PressableScale
          onPress={onAction}
          accessibilityRole="link"
          accessibilityLabel={actionLabel}
          className="h-10 items-center justify-center rounded-sm bg-primary"
        >
          <Text className="font-body-heavy text-body-sm text-primary-fg">{actionLabel}</Text>
        </PressableScale>
      ) : null}
    </View>
  )
}

export type SidebarUserCardProps = { initials: string; name: string; roleLabel: string }

/** Danışan kenar çubuğu alt kartı: avatar + ad + rol. */
export function SidebarUserCard({ initials, name, roleLabel }: SidebarUserCardProps) {
  return (
    <View className="flex-row items-center gap-2.5 rounded-lg bg-surface p-3">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-accent">
        <Text className="font-body-heavy text-body text-accent-fg">{initials}</Text>
      </View>
      <View className="flex-1">
        <Text numberOfLines={1} className="font-body-bold text-body-sm text-fg">
          {name}
        </Text>
        <Text className="text-xs text-fg-muted">{roleLabel}</Text>
      </View>
    </View>
  )
}
