import Animated from 'react-native-reanimated'
import { Circle, Path } from 'react-native-svg'

/** react-native-svg'nin Reanimated ile canlandırılabilir sürümleri (useAnimatedProps). */
export const AnimatedPath = Animated.createAnimatedComponent(Path)
export const AnimatedCircle = Animated.createAnimatedComponent(Circle)
