import { forwardRef } from 'react'
import type { ReactNode } from 'react'

import { Pressable, View } from 'react-native'
import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  View as RNView,
  ViewStyle,
} from 'react-native'

import Animated from 'react-native-reanimated'

import { haptic } from './haptics'
import { usePressScale } from './usePressScale'

import type { HapticKind } from './haptics'

export type PressableScaleProps = Omit<PressableProps, 'children' | 'style'> & {
  children?: ReactNode
  /** Pressable stili (yalnız hesaplanan ölçüler için). */
  style?: StyleProp<ViewStyle>
  /** Pressable'ın kendisine (görünüm: zemin, çizgi, köşe, iç boşluk). */
  className?: string
  /** Dış yerleşim kutusu (flex-1, w-full, self-start …). Verilmezse sarmalayıcı çizilmez. */
  wrapperClassName?: string
  /** Basışta dokunsal geri bildirim. `false` kapatır. */
  haptics?: HapticKind | false
  /** Basma ölçeği, varsayılan .96 */
  scaleTo?: number
}

/**
 * Tasarımdaki her etkileşimli yüzeyin temeli: basınca .96'ya küçülür, isteğe
 * bağlı haptic verir, azaltılmış harekete uyar. NativeWind className'i
 * Animated.View'a verilmez (css-interop Reanimated bileşenlerini tanımıyor);
 * görünüm `className` ile Pressable'a, yerleşim `wrapperClassName` ile dış View'a gider.
 */
export const PressableScale = forwardRef<RNView, PressableScaleProps>(function PressableScale(
  {
    children,
    className,
    wrapperClassName,
    haptics = 'light',
    scaleTo,
    onPress,
    onPressIn,
    onPressOut,
    disabled,
    ...rest
  },
  ref
) {
  const press = usePressScale(scaleTo)

  const handlePress = (e: GestureResponderEvent) => {
    if (haptics) haptic[haptics]()
    onPress?.(e)
  }

  const body = (
    <Animated.View style={press.style}>
      <Pressable
        ref={ref}
        {...rest}
        disabled={disabled}
        onPress={handlePress}
        onPressIn={(e) => {
          press.onPressIn()
          onPressIn?.(e)
        }}
        onPressOut={(e) => {
          press.onPressOut()
          onPressOut?.(e)
        }}
        className={className}
      >
        {children}
      </Pressable>
    </Animated.View>
  )

  return wrapperClassName ? <View className={wrapperClassName}>{body}</View> : body
})
