import { useSyncExternalStore } from 'react'

import { AccessibilityInfo } from 'react-native'

/**
 * Sistemin "Hareketi azalt" ayarı (iOS/Android erişilebilirlik, web
 * prefers-reduced-motion). Tek bir abonelik paylaşılır; değer değişince tüm
 * bileşenler yeniden çizilir.
 *
 * Açıkken: döngüler (pulse, ring, bell, float, orbit, skeleton) durur, girişler
 * (enter-up, pop, draw-check …) son karede başlar, durum değişimleri anlık olur.
 */
let current = false
let initialised = false
const listeners = new Set<() => void>()
let forced: boolean | null = null

function emit() {
  listeners.forEach((l) => l())
}

function init() {
  if (initialised) return
  initialised = true
  AccessibilityInfo.isReduceMotionEnabled?.()
    .then((v) => {
      if (v !== current) {
        current = Boolean(v)
        emit()
      }
    })
    .catch(() => undefined)
  AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v: boolean) => {
    current = Boolean(v)
    emit()
  })
}

function subscribe(listener: () => void) {
  init()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return forced ?? current
}

export function useReduceMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

/** Anlık değer (hook dışı kullanım: imperatif animasyonlar). */
export function isReduceMotionEnabled(): boolean {
  init()
  return forced ?? current
}

/**
 * Test ve geliştirici galerisi için zorla aç/kapat. `null` sistem ayarına döner.
 */
export function setReduceMotionOverride(value: boolean | null) {
  forced = value
  emit()
}
