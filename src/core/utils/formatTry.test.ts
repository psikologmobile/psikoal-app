import { formatTry } from './formatTry'

describe('formatTry', () => {
  it.each([
    [0, '₺0'],
    [100, '₺1'],
    [25000, '₺250'],
    [125000, '₺1.250'],
    [5000000, '₺50.000'],
    [123456789, '₺1.234.568'],
  ])('%i kuruş → %s', (kurus, expected) => {
    expect(formatTry(kurus)).toBe(expected)
  })

  it('kuruşu tam TL’ye sıfırdan uzağa yuvarlar', () => {
    expect(formatTry(149)).toBe('₺1')
    expect(formatTry(150)).toBe('₺2')
    expect(formatTry(-150)).toBe('−₺2')
  })

  it('negatif tutarda U+2212 eksi işareti kullanır', () => {
    expect(formatTry(-62500)).toBe('−₺625')
  })

  it('sıfıra yuvarlanan negatif tutarda işaret koymaz', () => {
    expect(formatTry(-10)).toBe('₺0')
  })
})
