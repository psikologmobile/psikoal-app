import { useEffect, useMemo, useState } from 'react'

import { Pressable, ScrollView, TextInput, View } from 'react-native'

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { normalizeTr } from '@/core/constants'
import { DURATION, EASE_OUT, EnterUp, haptic, useReduceMotion } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'

export type SelectOption = { value: string; label: string }

export type SelectProps = {
  label?: string
  optional?: boolean
  placeholder?: string
  value: string | null
  options: ReadonlyArray<SelectOption | string>
  onChange: (value: string) => void
  /** Listenin üstünde arama kutusu. */
  searchable?: boolean
  searchPlaceholder?: string
  emptyText?: string
  error?: string
  isDisabled?: boolean
  /** Açık listenin en çok yüksekliği (px). */
  maxListHeight?: number
  size?: 'md' | 'lg'
  className?: string
  testID?: string
}

function toOption(o: SelectOption | string): SelectOption {
  return typeof o === 'string' ? { value: o, label: o } : o
}

/**
 * Select — açılır liste (+ isteğe bağlı arama). Kapalı: surface alan +
 * chevron; açık: liste alanın altında açılır (Y −8→0 + fade 300 ms), chevron
 * 180° döner (250 ms). Satır 46, seçili satır accent-soft.
 *
 * Liste katman olarak değil akış içinde açılır: kaydırılabilir formlarda
 * kesilme / z-index sorunu yaşanmaz.
 */
export function Select({
  label,
  optional = false,
  placeholder = 'Seç',
  value,
  options,
  onChange,
  searchable = false,
  searchPlaceholder = 'Ara',
  emptyText = 'Sonuç yok',
  error,
  isDisabled = false,
  maxListHeight = 280,
  size = 'lg',
  className,
  testID,
}: SelectProps) {
  const colors = useThemeColors()
  const reduce = useReduceMotion()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const opts = useMemo(() => options.map(toOption), [options])
  const selected = opts.find((o) => o.value === value)

  const filtered = useMemo(() => {
    const q = normalizeTr(query)
    if (!q) return opts
    return opts.filter((o) => normalizeTr(o.label).includes(q))
  }, [opts, query])

  const rot = useSharedValue(0)
  useEffect(() => {
    rot.value = reduce
      ? open
        ? 180
        : 0
      : withTiming(open ? 180 : 0, { duration: DURATION.fast, easing: EASE_OUT })
  }, [open, reduce, rot])
  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }))

  const pick = (v: string) => {
    haptic.selection()
    onChange(v)
    setOpen(false)
    setQuery('')
  }

  return (
    <View className={cn('gap-2', className)}>
      {label ? (
        <Text className="font-body-bold text-body-sm text-fg">
          {label}
          {optional ? (
            <Text className="font-body text-body-sm text-fg-muted"> İsteğe bağlı</Text>
          ) : null}
        </Text>
      ) : null}
      <Pressable
        testID={testID}
        disabled={isDisabled}
        onPress={() => {
          haptic.light()
          setOpen((o) => !o)
        }}
        accessibilityRole="button"
        accessibilityLabel={label ? `${label}: ${selected?.label ?? placeholder}` : selected?.label}
        accessibilityState={{ expanded: open, disabled: isDisabled }}
        className={cn(
          'flex-row items-center justify-between border bg-surface px-4',
          size === 'lg' ? 'h-14 rounded-lg' : 'h-input rounded-md',
          error ? 'border-danger' : open ? 'border-primary' : 'border-border-strong',
          isDisabled && 'opacity-60'
        )}
      >
        <Text
          numberOfLines={1}
          className={cn(
            'flex-1 font-body-semibold',
            size === 'lg' ? 'text-base' : 'text-body',
            selected ? 'text-fg' : 'text-fg-muted'
          )}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Animated.View style={chevronStyle}>
          <Icon name="ChevronDown" size={18} color={colors.text} strokeWidth={2.4} />
        </Animated.View>
      </Pressable>

      {open ? (
        <EnterUp offset={-8} duration={300}>
          <View
            accessibilityRole="list"
            className="rounded-lg border border-border-strong bg-bg p-1.5"
          >
            {searchable ? (
              <View className="flex-row items-center gap-2 border-b border-border px-3 py-2.5">
                <Icon name="Search" size={16} color={colors.textMuted} strokeWidth={2.2} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  autoCorrect={false}
                  autoCapitalize="none"
                  accessibilityLabel={searchPlaceholder}
                  className="flex-1 p-0 font-body text-body text-fg"
                />
              </View>
            ) : null}
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              // REASON: liste yüksekliği prop'tan gelir
              style={{ maxHeight: maxListHeight }}
            >
              {filtered.length === 0 ? (
                <Text className="px-3 py-3 text-body text-fg-muted">{emptyText}</Text>
              ) : (
                filtered.map((o) => {
                  const on = o.value === value
                  return (
                    <Pressable
                      key={o.value}
                      onPress={() => pick(o.value)}
                      accessibilityRole="menuitem"
                      accessibilityLabel={o.label}
                      accessibilityState={{ selected: on }}
                      className={cn(
                        'h-[46px] flex-row items-center justify-between rounded-inner px-3 active:bg-accent-soft',
                        on && 'bg-accent-soft'
                      )}
                    >
                      <Text
                        className={cn(
                          'text-body',
                          on ? 'font-body-bold text-accent-soft-fg' : 'font-body text-fg'
                        )}
                      >
                        {o.label}
                      </Text>
                      {on ? (
                        <Icon
                          name="Check"
                          size={16}
                          color={colors.onAccentSoft}
                          strokeWidth={2.6}
                        />
                      ) : null}
                    </Pressable>
                  )
                })
              )}
            </ScrollView>
          </View>
        </EnterUp>
      ) : null}

      {error ? (
        <Text accessibilityRole="alert" className="text-xs text-danger-soft-fg">
          {error}
        </Text>
      ) : null}
    </View>
  )
}
