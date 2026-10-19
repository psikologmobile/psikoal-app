import { View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { Pop } from '@/core/motion'

export type InvitedBadgeProps = {
  /** "Davet" (kart) · "Davet edildin" (ilan detayı). */
  label?: string
  /** Pop gecikmesi (ms). */
  delay?: number
}

/**
 * InvitedBadge — primary dolgu rozet: ilan sahibi bu uzmanın davet linkiyle
 * geldi (`invitedByViewer`). Fırsatlar kartı, ilan detayı.
 */
export function InvitedBadge({ label = 'Davet', delay = 600 }: InvitedBadgeProps) {
  return (
    <Pop delay={delay}>
      <View
        accessible
        accessibilityLabel={`${label} rozeti: danışan senin davet linkinle geldi`}
        className="rounded-full bg-primary px-2.5 py-1"
      >
        <Text variant="badge" color="onPrimary">
          {label}
        </Text>
      </View>
    </Pop>
  )
}
