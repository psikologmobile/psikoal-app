import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { Pop } from '@/core/motion'

export type ClaimBadgeProps = {
  /** Pop gecikmesi (ms), tasarımda 700. */
  delay?: number
}

/** ClaimBadge — primary çizgili "Anlaştık dedi" rozeti (uzmanın anlaşma bildirimi). */
export function ClaimBadge({ delay = 700 }: ClaimBadgeProps) {
  return (
    <Pop delay={delay}>
      <View
        accessible
        accessibilityLabel="Uzman seninle anlaştığını bildirdi"
        className="rounded-full border border-primary px-2.5 py-1"
      >
        <Text variant="badge" className="text-primary-text">
          Anlaştık dedi
        </Text>
      </View>
    </Pop>
  )
}
