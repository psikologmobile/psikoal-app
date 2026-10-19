import type { ComponentType } from 'react'

import type { ColorValue } from 'react-native'

import * as LucideIcons from 'lucide-react-native'

import type { SvgProps } from 'react-native-svg'

import { useThemeColors } from '@/core/theme'

type LucideIconProps = Pick<SvgProps, 'stroke'> & { size?: number; strokeWidth?: number }

export type IconName = keyof typeof LucideIcons

export type IconProps = {
  name: IconName
  size?: number
  color?: ColorValue
  strokeWidth?: number
  className?: string
}

/** Lucide ikon sarmalayıcı. Renk verilmezse temanın ana yazı rengi (text) kullanılır. */
export function Icon({ name, size = 20, color, strokeWidth = 2 }: IconProps) {
  const colors = useThemeColors()
  const LucideIcon = (LucideIcons as unknown as Record<string, ComponentType<LucideIconProps>>)[
    name as string
  ]

  if (!LucideIcon) return null

  return <LucideIcon size={size} stroke={color ?? colors.text} strokeWidth={strokeWidth} />
}

/** Sunucudan düz metin gelen ikon adının (kategori ikonu) Lucide'de karşılığı var mı? */
export function isIconName(name: string): name is IconName {
  return Object.prototype.hasOwnProperty.call(LucideIcons, name)
}
