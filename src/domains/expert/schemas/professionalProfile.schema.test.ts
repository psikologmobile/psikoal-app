import { ProfessionalProfileFormSchema } from './expert.schema'

const VALID = {
  title: 'Klinik Psikolog',
  specializations: ['Kaygı'],
  experienceYears: 8,
  education: '',
  bio: 'Bilişsel davranışçı terapi ile kaygı ve sınav stresi yaşayan gençlerle çalışıyorum.',
  personalWebsite: '',
}

describe('ProfessionalProfileFormSchema', () => {
  it('accepts an empty or http(s) personal website', () => {
    expect(ProfessionalProfileFormSchema.safeParse(VALID).success).toBe(true)
    expect(
      ProfessionalProfileFormSchema.safeParse({ ...VALID, personalWebsite: 'https://elif.com.tr' })
        .success
    ).toBe(true)
  })

  it('rejects malformed website, short bio and missing specialization', () => {
    const result = ProfessionalProfileFormSchema.safeParse({
      ...VALID,
      personalWebsite: 'elifkaya',
      bio: 'kısa',
      specializations: [],
    })
    expect(result.success).toBe(false)
    const fields = result.error?.issues.map((issue) => issue.path[0])
    expect(fields).toEqual(expect.arrayContaining(['personalWebsite', 'bio', 'specializations']))
  })
})
