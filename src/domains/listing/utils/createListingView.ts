import type { ListingRules } from '../types/listing.types'

import { formatTry } from '@/core/utils/formatTry'

/** Kalite puanında açıklamanın tam puan aldığı uzunluk (Revize 2 §1.1 `descriptionFullChars`). */
export const DESCRIPTION_FULL_CHARS = 400

/** "Anlatım gücü" göstergesi: uzun açıklamayı teşvik eder (0..1 + etiket). */
export function descriptionStrength(length: number): { value: number; label: string } {
  const value = Math.min(1, Math.max(0, length) / DESCRIPTION_FULL_CHARS)
  if (length < 100) return { value, label: 'Zayıf' }
  if (length < 200) return { value, label: 'Orta' }
  if (length < DESCRIPTION_FULL_CHARS) return { value, label: 'İyi' }
  return { value, label: 'Çok iyi' }
}

export const BUDGET_CELL_COUNT = 8

/** Hazır bütçe aralıkları (hücre indeksleri, dahil). */
export const BUDGET_PRESETS: ReadonlyArray<readonly [number, number]> = [
  [0, 3],
  [2, 5],
  [4, 7],
  [0, 7],
]

const FALLBACK_MIN_TRY = 500

function roundTo(value: number, step: number) {
  return Math.max(step, Math.round(value / step) * step)
}

/**
 * Bütçe ölçeği: alt sınır dönemin `budgetMinTry`'si; üst sınır `budgetMaxTry`
 * (null = sınırsız → alt sınırın 5 katı gösterilir, seçim yine serbesttir).
 */
export function budgetScale(rules: Pick<ListingRules, 'budgetMinTry' | 'budgetMaxTry'>) {
  const min = rules.budgetMinTry > 0 ? rules.budgetMinTry : FALLBACK_MIN_TRY
  const top = rules.budgetMaxTry !== null && rules.budgetMaxTry > min ? rules.budgetMaxTry : min * 5
  const step = roundTo((top - min) / BUDGET_CELL_COUNT, 50)
  const cellStart = (index: number) => min + index * step
  /** Hücre aralığının TL karşılığı; üst uç dönemin tavanını aşmaz. */
  const range = (from: number, to: number) => {
    const high = cellStart(to) + step
    return {
      budgetMin: cellStart(from),
      budgetMax: rules.budgetMaxTry !== null ? Math.min(high, rules.budgetMaxTry) : high,
    }
  }
  return { min, top, step, range }
}

export function budgetRangeLabel(budgetMin: number, budgetMax: number): string {
  return `${formatTry(budgetMin * 100)}–${formatTry(budgetMax * 100)}`
}

/** Bütçe adımının bilgi metni (dönem kuralı). */
export function budgetRuleText(rules: Pick<ListingRules, 'budgetMinTry' | 'budgetMaxTry'>): string {
  const min = formatTry(rules.budgetMinTry * 100)
  return rules.budgetMaxTry === null
    ? `Seans başı bütçen en az ${min} olmalı; üst sınır yok.`
    : `Seans başı bütçen ${min} ile ${formatTry(rules.budgetMaxTry * 100)} arasında olmalı.`
}

/** Önizlemede danışanın kısaltılmış adı ("Zeynep Y."). */
export function shortClientName(firstName?: string | null, lastName?: string | null): string {
  const first = (firstName ?? '').trim()
  const initial = (lastName ?? '').trim().charAt(0)
  if (!first) return 'Danışan'
  return initial ? `${first} ${initial.toLocaleUpperCase('tr-TR')}.` : first
}
