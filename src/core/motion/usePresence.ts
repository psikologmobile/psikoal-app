import { useEffect, useState } from 'react'

import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated'

import { EASE_OUT } from './config'
import { useReduceMotion } from './useReduceMotion'

/**
 * Açılır/kapanır katmanlar (sheet-up + scrim, dialog-in, toast, dropdown) için
 * mount yönetimi: `visible` true olunca bağlanır ve 0→1 oynar; false olunca 1→0
 * oynar, bitince ayrılır. Azaltılmış harekette anlık.
 *
 *   const { mounted, progress } = usePresence(open, { duration: 380 })
 */
export function usePresence(visible: boolean, { duration = 380 }: { duration?: number } = {}) {
  const reduce = useReduceMotion()
  const [mounted, setMounted] = useState(visible)
  const progress = useSharedValue(visible && reduce ? 1 : 0)

  useEffect(() => {
    if (visible) {
      setMounted(true)
      progress.value = reduce ? 1 : withTiming(1, { duration, easing: EASE_OUT })
      return
    }
    if (reduce) {
      progress.value = 0
      setMounted(false)
      return
    }
    progress.value = withTiming(0, { duration: duration * 0.8, easing: EASE_OUT }, (done) => {
      if (done) runOnJS(setMounted)(false)
    })
  }, [visible, reduce, duration, progress])

  return { mounted: mounted || visible, progress }
}
