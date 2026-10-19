import { View } from 'react-native'

import { DrawCheck, Pop } from '@/core/motion'
import { useThemeColors } from '@/core/theme'

export type VerifiedBadgeProps = {
  /** Çap (px) 16–32. */
  size?: number
  /** Pop gecikmesi (ms). */
  delay?: number
  accessibilityLabel?: string
}

/** VerifiedBadge — primary daire + çizilen tik, pop ile gelir. Uzman adları, profil. */
export function VerifiedBadge({
  size = 16,
  delay = 400,
  accessibilityLabel = 'Doğrulanmış',
}: VerifiedBadgeProps) {
  const colors = useThemeColors()
  return (
    <Pop delay={delay}>
      {/* REASON: çap prop'tan gelir */}
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
        style={{ width: size, height: size }}
        className="items-center justify-center rounded-full bg-primary"
      >
        <DrawCheck
          size={size * 0.7}
          color={colors.onPrimary}
          strokeWidth={3.2}
          d="m6 12 4 4 8-9"
          delay={delay + 200}
        />
      </View>
    </Pop>
  )
}
