import {
  budgetRangeLabel,
  budgetRuleText,
  budgetScale,
  descriptionStrength,
  shortClientName,
} from './createListingView'

describe('createListingView', () => {
  it('anlatım gücü uzunlukla artar', () => {
    expect(descriptionStrength(0)).toEqual({ value: 0, label: 'Zayıf' })
    expect(descriptionStrength(150).label).toBe('Orta')
    expect(descriptionStrength(250).label).toBe('İyi')
    expect(descriptionStrength(800)).toEqual({ value: 1, label: 'Çok iyi' })
    expect(descriptionStrength(-5).value).toBe(0)
  })

  it('bütçe ölçeği: üst sınır varsa ona kırpar', () => {
    const scale = budgetScale({ budgetMinTry: 500, budgetMaxTry: 2500 })
    expect(scale).toMatchObject({ min: 500, top: 2500, step: 250 })
    expect(scale.range(0, 3)).toEqual({ budgetMin: 500, budgetMax: 1500 })
    expect(scale.range(0, 7)).toEqual({ budgetMin: 500, budgetMax: 2500 })
  })

  it('bütçe ölçeği: sınırsız ve alt sınırsız dönem', () => {
    const unlimited = budgetScale({ budgetMinTry: 500, budgetMaxTry: null })
    expect(unlimited.top).toBe(2500)
    expect(unlimited.range(4, 7).budgetMax).toBe(2500)
    expect(budgetScale({ budgetMinTry: 0, budgetMaxTry: null }).min).toBe(500)
    expect(budgetScale({ budgetMinTry: 1000, budgetMaxTry: 800 }).top).toBe(5000)
  })

  it('etiketler ve kural metni', () => {
    expect(budgetRangeLabel(2000, 3000)).toBe('₺2.000–₺3.000')
    expect(budgetRuleText({ budgetMinTry: 500, budgetMaxTry: null })).toBe(
      'Seans başı bütçen en az ₺500 olmalı; üst sınır yok.'
    )
    expect(budgetRuleText({ budgetMinTry: 500, budgetMaxTry: 5000 })).toBe(
      'Seans başı bütçen ₺500 ile ₺5.000 arasında olmalı.'
    )
  })

  it('kısa ad', () => {
    expect(shortClientName('Zeynep', 'yılmaz')).toBe('Zeynep Y.')
    expect(shortClientName('Zeynep', null)).toBe('Zeynep')
    expect(shortClientName(undefined, 'Y')).toBe('Danışan')
  })
})
