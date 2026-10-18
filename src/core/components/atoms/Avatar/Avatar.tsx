import { useState } from 'react'
import type { ReactNode } from 'react'

import { Image, View } from 'react-native'

import { Text } from '@/core/components/atoms/Text'
import { VerifiedBadge } from '@/core/components/atoms/VerifiedBadge'
import { cn } from '@/core/utils/cn'

/** xs 30 · sm 34 · md 44 · lg 48 · xl 56 · 2xl 64 · hero 112 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero'
/** accent: kendi profilin / danışan · primary: karşı taraf (eşleşme) */
export type AvatarTone = 'accent' | 'primary' | 'surface'

export type AvatarProps = {
  size?: AvatarSize
  src?: string
  initials?: string
  tone?: AvatarTone
  isVerified?: boolean
  badge?: ReactNode
  /** 2 px bg halka (üst üste dizilimde). */
  ring?: boolean
  accessibilityLabel?: string
  className?: string
  /** @deprecated v1 — kullanılmaz, tone verin */
  fallbackColor?: string
  /** @deprecated v1 — kullanılmaz, ring verin */
  borderWidth?: number
  /** @deprecated v1 — kullanılmaz */
  borderColor?: string
}

export const AVATAR_SIZES: Record<AvatarSize, number> = {
  xs: 30,
  sm: 34,
  md: 44,
  lg: 48,
  xl: 56,
  '2xl': 64,
  hero: 112,
}

const fontRatio = 0.36

const toneStyles: Record<AvatarTone, { bg: string; fg: string }> = {
  accent: { bg: 'bg-accent', fg: 'text-accent-fg' },
  primary: { bg: 'bg-primary', fg: 'text-primary-fg' },
  surface: { bg: 'bg-surface', fg: 'text-fg' },
}

/** Avatar — baş harf (Bricolage 800) accent zeminde; fotoğraf varsa görsel. */
export function Avatar({
  size = 'md',
  src,
  initials,
  tone = 'accent',
  isVerified = false,
  badge,
  ring = false,
  accessibilityLabel,
  className,
}: AvatarProps) {
  const [hasError, setHasError] = useState(false)
  const px = AVATAR_SIZES[size]
  const showImg = Boolean(src) && !hasError
  const fontSize = Math.round(px * fontRatio)
  const t = toneStyles[tone]

  // REASON: çap ölçü tablosundan hesaplanır (7 boyut); className ile tek tek yazmak yerine.
  const box = { width: px, height: px }
  return (
    <View className={cn('relative self-start', className)} style={box}>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel ?? initials}
        style={box}
        className={cn(
          'items-center justify-center overflow-hidden rounded-full',
          !showImg && t.bg,
          ring && 'border-2 border-bg'
        )}
      >
        {showImg ? (
          <Image
            source={{ uri: src }}
            style={box}
            onError={() => setHasError(true)}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Text
            style={{ fontSize, lineHeight: Math.round(fontSize * 1.15) }}
            className={cn('font-display', t.fg)}
          >
            {(initials ?? '').slice(0, 2).toLocaleUpperCase('tr-TR')}
          </Text>
        )}
      </View>
      {isVerified ? (
        <View className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-bg">
          <VerifiedBadge size={Math.max(16, Math.round(px * 0.3))} delay={300} />
        </View>
      ) : null}
      {badge && !isVerified ? <View className="absolute bottom-0 right-0">{badge}</View> : null}
    </View>
  )
}

export type AvatarGroupProps = {
  avatars: Array<Pick<AvatarProps, 'src' | 'initials' | 'tone'>>
  max?: number
  size?: AvatarSize
  className?: string
}

/** @deprecated → molecules/AvatarStack */
export function AvatarGroup({ avatars, max = 5, size = 'xs', className }: AvatarGroupProps) {
  const visibleCount = avatars.length > max ? max - 1 : avatars.length
  const overflow = avatars.length - visibleCount
  return (
    <View className={cn('flex-row items-center', className)}>
      {avatars.slice(0, visibleCount).map((a, i) => (
        <View key={i} className={i === 0 ? '' : '-ml-2'}>
          <Avatar {...a} size={size} ring />
        </View>
      ))}
      {overflow > 0 ? (
        <View className="-ml-2 h-[30px] min-w-[30px] items-center justify-center rounded-full border-2 border-bg bg-surface px-1.5">
          <Text className="font-body-heavy text-badge text-fg">+{overflow}</Text>
        </View>
      ) : null}
    </View>
  )
}
