import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { Pressable, View } from 'react-native'

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { DURATION, EASE_OUT, EnterUp, haptic, useReduceMotion } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type AccordionItemProps = {
  title: string
  children: ReactNode
  /** Kontrollü kullanım için. */
  open?: boolean
  onToggle?: (open: boolean) => void
  defaultOpen?: boolean
  className?: string
}

/**
 * Accordion (SSS) — + ikonu 45° döner ve primary'ye boyanır, içerik aşağı
 * açılır (Y −6→0, 300 ms). Site, Destek.
 */
export function AccordionItem({
  title,
  children,
  open,
  onToggle,
  defaultOpen = false,
  className,
}: AccordionItemProps) {
  const colors = useThemeColors()
  const reduce = useReduceMotion()
  const [inner, setInner] = useState(defaultOpen)
  const isOpen = open ?? inner
  const r = useSharedValue(isOpen ? 45 : 0)

  useEffect(() => {
    r.value = reduce
      ? isOpen
        ? 45
        : 0
      : withTiming(isOpen ? 45 : 0, { duration: DURATION.tab, easing: EASE_OUT })
  }, [isOpen, reduce, r])

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }))

  const toggle = () => {
    haptic.light()
    const next = !isOpen
    setInner(next)
    onToggle?.(next)
  }

  return (
    <View className={cn('border-b border-border', className)}>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: isOpen }}
        className="min-h-14 flex-row items-center gap-3 py-4"
      >
        <Text className="flex-1 font-body-bold text-body-lg text-fg">{title}</Text>
        <Animated.View style={iconStyle}>
          <Icon
            name="Plus"
            size={20}
            color={isOpen ? colors.primary : colors.text}
            strokeWidth={2.4}
          />
        </Animated.View>
      </Pressable>
      {isOpen ? (
        <EnterUp offset={-6} duration={DURATION.tab} className="pb-4">
          {typeof children === 'string' ? (
            <Text className="text-body leading-6 text-fg-muted">{children}</Text>
          ) : (
            children
          )}
        </EnterUp>
      ) : null}
    </View>
  )
}

export type AccordionProps = {
  items: Array<{ id: string; title: string; content: ReactNode }>
  /** Aynı anda tek öğe açık kalsın. */
  single?: boolean
  className?: string
}

/** Accordion — AccordionItem listesi; `single` ile tek açık öğe. */
export function Accordion({ items, single = true, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  return (
    <View className={cn('border-t border-border', className)}>
      {items.map((it) =>
        single ? (
          <AccordionItem
            key={it.id}
            title={it.title}
            open={openId === it.id}
            onToggle={(o) => setOpenId(o ? it.id : null)}
          >
            {it.content}
          </AccordionItem>
        ) : (
          <AccordionItem key={it.id} title={it.title}>
            {it.content}
          </AccordionItem>
        )
      )}
    </View>
  )
}
