import { toExpertOnboardingPayload, validateExpertOnboardingStep } from './useExpertOnboarding'

import type { ExpertOnboardingValues } from './useExpertOnboarding'

const base: ExpertOnboardingValues = {
  title: 'Klinik Psikolog',
  experienceYears: 8,
  specializations: ['Kaygı'],
  phone: '',
  city: null,
  bio: 'a'.repeat(60),
  education: '',
  personalWebsite: '',
  cv: null,
  certificates: [],
}

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
}))
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}))

describe('validateExpertOnboardingStep', () => {
  it('geçerli değerlerde hata yok', () => {
    for (const step of [0, 1, 2, 3]) expect(validateExpertOnboardingStep(step, base)).toEqual({})
  })
  it('ünvan', () => {
    expect(validateExpertOnboardingStep(0, { ...base, title: ' a ' }).title).toBeDefined()
  })
  it('alan', () => {
    expect(validateExpertOnboardingStep(1, { ...base, specializations: [] }).specializations).toBe(
      'En az bir uzmanlık alanı seç'
    )
  })
  it('biyografi 50–1000', () => {
    expect(validateExpertOnboardingStep(2, { ...base, bio: 'kısa' }).bio).toContain('en az 50')
    expect(validateExpertOnboardingStep(2, { ...base, bio: 'a'.repeat(1001) }).bio).toContain(
      'en çok 1000'
    )
  })
  it('kişisel site adres olmalı', () => {
    expect(
      validateExpertOnboardingStep(3, { ...base, personalWebsite: 'site' }).personalWebsite
    ).toBeDefined()
    expect(validateExpertOnboardingStep(3, { ...base, personalWebsite: 'https://a.com' })).toEqual(
      {}
    )
  })
})

describe('toExpertOnboardingPayload', () => {
  it('boş isteğe bağlı alanları null yapar', () => {
    expect(toExpertOnboardingPayload({ ...base, title: ' X ' })).toEqual({
      title: 'X',
      specializations: ['Kaygı'],
      experienceYears: 8,
      bio: 'a'.repeat(60),
      education: null,
      personalWebsite: null,
    })
  })
})
