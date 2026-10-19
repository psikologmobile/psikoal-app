import type { Assessment, AssessmentResult } from '../types/assessment.types'

type Level = AssessmentResult['level']

export const RESULT_LEVEL_LABELS: Record<Level, string> = {
  low: 'Düşük',
  moderate: 'Orta',
  high: 'Yüksek',
}

/** Seviye çubuğunun dolu parça sayısı (3 parça). */
export const RESULT_LEVEL_STEPS: Record<Level, number> = { low: 1, moderate: 2, high: 3 }

/** LevelBar işaretçisi (0..1): her bölgenin ortası. */
export const RESULT_LEVEL_POSITION: Record<Level, number> = {
  low: 1 / 6,
  moderate: 1 / 2,
  high: 5 / 6,
}

/** Testin alınabilecek en yüksek puanı (tek seçim/ölçek: en büyük; çoklu: pozitiflerin toplamı). */
export function assessmentMaxScore(assessment: Pick<Assessment, 'questions'>): number {
  return assessment.questions.reduce((total, question) => {
    const values = question.options.map((option) => option.value)
    if (values.length === 0) return total
    if (question.type === 'multiple_choice') {
      return total + values.filter((v) => v > 0).reduce((s, v) => s + v, 0)
    }
    return total + Math.max(...values)
  }, 0)
}

/** "7 soru · 3 dk" */
export function assessmentMeta(questionCount: number, minutes: number): string {
  return `${questionCount} soru · ${minutes} dk`
}

/** Test adının baş harfi (liste işareti). */
export function assessmentMark(title: string): string {
  return title.trim().charAt(0).toLocaleUpperCase('tr-TR')
}

/** Soru tipinin üst etiketi. */
export function questionTypeLabel(
  type: Assessment['questions'][number]['type'],
  options: Array<{ value: number }>
): string {
  if (type === 'multiple_choice') return 'Çoklu seçim'
  if (type === 'scale') {
    const values = options.map((o) => o.value)
    return values.length ? `Ölçek · ${Math.min(...values)}–${Math.max(...values)}` : 'Ölçek'
  }
  return 'Tek seçim'
}
