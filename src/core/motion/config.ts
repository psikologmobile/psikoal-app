import { Platform } from 'react-native'

import { Easing } from 'react-native-reanimated'

import { motion } from '@/core/theme/tokens'

/** Standart giriş/çıkış eğrisi — cubic-bezier(.2,.8,.2,1) */
export const EASE_OUT = Easing.bezier(...motion.easing.out)
/** Hafif taşmalı eğri — cubic-bezier(.3,1.3,.5,1) (eşleşme, halka) */
export const EASE_SPRING = Easing.bezier(...motion.easing.spring)
/** Döngülerde yumuşak gidiş-dönüş */
export const EASE_IN_OUT = Easing.inOut(Easing.ease)

/** withSpring yapılandırması: taşmalı hareketler için. */
export const SPRING = motion.spring

export const DURATION = motion.duration

/** Sıralı giriş gecikmesi: mobil 60 ms, web 80 ms. */
export const STAGGER = Platform.OS === 'web' ? motion.staggerWeb : motion.stagger

export const PRESS_SCALE = motion.pressScale
export const ENTER_OFFSET_Y = motion.enterOffsetY
export const ENTER_OFFSET_X = motion.enterOffsetX

/** i. öğenin sıralı giriş gecikmesi (ms). */
export function staggerDelay(index: number, base = 0): number {
  return base + Math.max(0, index) * STAGGER
}
