import type { ReactNode } from 'react'

import { View } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Text } from '@/core/components/atoms/Text'
import { cn } from '@/core/utils/cn'

export type ScreenTitleProps = {
  title: string
  topInset?: boolean
  children?: ReactNode
  className?: string
  titleClassName?: string
}

export function ScreenTitle({
  title,
  topInset = false,
  children,
  className,
  titleClassName,
}: ScreenTitleProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={topInset ? { paddingTop: insets.top + 8 } : undefined}
      className={cn('items-center pb-3 pt-2', className)}
    >
      <Text variant="title" className={titleClassName}>
        {title}
      </Text>
      {children}
    </View>
  )
}
