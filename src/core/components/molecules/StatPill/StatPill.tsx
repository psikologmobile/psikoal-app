import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'

export type StatPillProps = {
  value: string
  label: string
}

export function StatPill({ value, label }: StatPillProps) {
  return (
    <View className="flex-1 items-center gap-0.5">
      <Text variant="number" color="brand">
        {value}
      </Text>
      <Text variant="caption" color="muted">
        {label}
      </Text>
    </View>
  )
}
