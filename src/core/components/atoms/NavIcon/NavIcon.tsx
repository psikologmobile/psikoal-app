import type { ColorValue } from 'react-native'

import Svg, { Circle, Path, Rect } from 'react-native-svg'

/**
 * Gezinme ikonları — tasarımdaki SVG'lerin birebir karşılığı (24'lük ızgara,
 * 2 px çizgi). Sekme çubuğu ve web kenar çubuğu kullanır.
 */
export type NavIconName =
  | 'discover'
  | 'listings'
  | 'matches'
  | 'settings'
  | 'opportunities'
  | 'offers'
  | 'notifications'
  | 'balance'
  | 'plus'

export type NavIconProps = {
  name: NavIconName
  color: ColorValue
  size?: number
  strokeWidth?: number
}

export function NavIcon({ name, color, size = 20, strokeWidth = 2 }: NavIconProps) {
  const common = {
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'discover':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...common}>
          <Circle cx={12} cy={12} r={9} />
          <Path d="m15.5 8.5-2 5-5 2 2-5z" />
        </Svg>
      )
    case 'listings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...common}>
          <Rect x={4} y={4} width={16} height={16} rx={3} />
          <Path d="M8 9h8M8 13h8M8 17h5" />
        </Svg>
      )
    case 'matches':
      return (
        <Svg width={size * 1.1} height={size} viewBox="0 0 26 24" {...common}>
          <Circle cx={9} cy={12} r={6} />
          <Circle cx={17} cy={12} r={6} />
        </Svg>
      )
    case 'settings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...common}>
          <Circle cx={12} cy={8} r={4} />
          <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
        </Svg>
      )
    case 'opportunities':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...common}>
          <Path d="M13 2 4 14h7l-1 8 9-12h-7z" />
        </Svg>
      )
    case 'offers':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...common}>
          <Path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
        </Svg>
      )
    case 'notifications':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...common}>
          <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </Svg>
      )
    case 'balance':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...common}>
          <Circle cx={12} cy={12} r={9} />
          <Path d="M9 9h4.5a2 2 0 0 1 0 4H9V9zm0 4h5a2 2 0 0 1 0 4H9" />
        </Svg>
      )
    case 'plus':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...common} strokeWidth={2.6}>
          <Path d="M12 5v14M5 12h14" />
        </Svg>
      )
  }
}
