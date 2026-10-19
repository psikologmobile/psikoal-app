import { normalizeTr, TURKEY_PROVINCE_NAMES, TURKEY_PROVINCES } from './provinces.constants'

describe('Türkiye illeri', () => {
  it('contains all 81 provinces with unique plate codes 1–81', () => {
    expect(TURKEY_PROVINCES).toHaveLength(81)
    const codes = TURKEY_PROVINCES.map((p) => p.code)
    expect(new Set(codes).size).toBe(81)
    expect(Math.min(...codes)).toBe(1)
    expect(Math.max(...codes)).toBe(81)
    expect(new Set(TURKEY_PROVINCES.map((p) => p.name)).size).toBe(81)
  })

  it('sorts names in Turkish alphabetical order', () => {
    expect(TURKEY_PROVINCE_NAMES[0]).toBe('Adana')
    const ci = TURKEY_PROVINCE_NAMES.indexOf('Çanakkale')
    const c = TURKEY_PROVINCE_NAMES.indexOf('Bursa')
    expect(ci).toBeGreaterThan(c)
    expect(TURKEY_PROVINCE_NAMES[TURKEY_PROVINCE_NAMES.length - 1]).toBe('Zonguldak')
  })

  it('normalizes Turkish characters for search', () => {
    expect(normalizeTr('İzmir')).toBe('izmir')
    expect(normalizeTr(' Şanlıurfa ')).toBe('sanliurfa')
    expect(normalizeTr('Hakkâri')).toBe('hakkari')
    expect(normalizeTr('ÇORUM')).toBe('corum')
    expect(normalizeTr('Muğla Ödemiş Üsküdar')).toBe('mugla odemis uskudar')
  })
})
