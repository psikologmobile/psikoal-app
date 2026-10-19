import {
  assessmentMark,
  assessmentMaxScore,
  assessmentMeta,
  questionTypeLabel,
  RESULT_LEVEL_POSITION,
} from './assessmentView'

const opts = (...values: number[]) =>
  values.map((value, i) => ({ id: `${i}`, text: `${i}`, value }))

describe('assessmentView', () => {
  it('en yüksek puanı hesaplar', () => {
    expect(
      assessmentMaxScore({
        questions: [
          { id: 'a', text: 'a', type: 'single_choice', options: opts(0, 1, 3) },
          { id: 'b', text: 'b', type: 'scale', options: opts(0, 4) },
          { id: 'c', text: 'c', type: 'multiple_choice', options: opts(1, 1, -1) },
          { id: 'd', text: 'd', type: 'single_choice', options: [] },
        ],
      })
    ).toBe(9)
  })

  it('meta, işaret ve soru tipi', () => {
    expect(assessmentMeta(7, 3)).toBe('7 soru · 3 dk')
    expect(assessmentMark(' özgüven')).toBe('Ö')
    expect(questionTypeLabel('single_choice', [])).toBe('Tek seçim')
    expect(questionTypeLabel('multiple_choice', [])).toBe('Çoklu seçim')
    expect(questionTypeLabel('scale', opts(0, 4))).toBe('Ölçek · 0–4')
    expect(questionTypeLabel('scale', [])).toBe('Ölçek')
  })

  it('seviye konumları sıralı', () => {
    expect(RESULT_LEVEL_POSITION.low).toBeLessThan(RESULT_LEVEL_POSITION.moderate)
    expect(RESULT_LEVEL_POSITION.moderate).toBeLessThan(RESULT_LEVEL_POSITION.high)
  })
})
