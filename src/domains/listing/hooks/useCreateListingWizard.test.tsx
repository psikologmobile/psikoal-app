import { act, renderHook } from '@testing-library/react-native'

import { useCreateListingWizard } from './useCreateListingWizard'

import { ApiError } from '@/lib/api'

const mockMutate = jest.fn()
const mockMutation = { mutate: mockMutate, isPending: false, data: undefined as unknown }

jest.mock('../api/useCreateListingMutation', () => ({
  useCreateListingMutation: () => mockMutation,
}))

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

const RULES = {
  budgetMinTry: 500,
  budgetMaxTry: null,
  titleMin: 10,
  titleMax: 100,
  descriptionMax: 2000,
  cityRequiredFor: ['yüz_yüze', 'yüz_yüze_online'],
  maxActive: 3,
}

function setup(profilePhone: string | null = null) {
  return renderHook(() =>
    useCreateListingWizard({ rules: RULES, initialSpecialization: 'Kaygı', profilePhone })
  )
}

function apiError(code: string) {
  return new ApiError(code, 'Sunucu hatası', 422)
}

beforeEach(() => mockMutate.mockReset())

describe('useCreateListingWizard', () => {
  it('başlık kısa ise ilk adımda kalır, düzelince ilerler', () => {
    const { result } = setup()
    act(() => result.current.update('title', 'Kısa'))
    act(() => result.current.next())
    expect(result.current.step).toBe(0)
    expect(result.current.errors.title).toBe('En az 10 karakter giriniz')
    act(() => result.current.update('title', 'Sınav dönemlerinde kaygı'))
    expect(result.current.errors.title).toBeUndefined()
    act(() => result.current.next())
    expect(result.current.step).toBe(1)
  })

  it('alan seçilmezse düğme kilitli; yüz yüze görüşmede şehir zorunlu', () => {
    const { result } = setup()
    act(() => result.current.update('title', 'Sınav dönemlerinde kaygı'))
    act(() => result.current.next())
    act(() => result.current.toggleSpecialization('Kaygı'))
    expect(result.current.blockedLabel).toBe('En az bir alan seç')
    act(() => result.current.next())
    expect(result.current.step).toBe(1)
    act(() => result.current.toggleSpecialization('Stres'))
    act(() => result.current.next())
    act(() => result.current.update('preferredSessionType', 'yüz_yüze'))
    expect(result.current.needsCity).toBe(true)
    act(() => result.current.next())
    expect(result.current.errors.city).toBe('Yüz yüze görüşme için şehir seçiniz')
    act(() => result.current.update('city', 'Konya'))
    act(() => result.current.next())
    expect(result.current.step).toBe(3)
    act(() => result.current.back())
    expect(result.current.step).toBe(2)
  })

  it('rıza ve telefon olmadan yayınlanmaz; tamamsa gövdeyi gönderir', () => {
    const { result } = setup()
    act(() => result.current.update('title', 'Sınav dönemlerinde kaygı'))
    for (let i = 0; i < 5; i++) act(() => result.current.next())
    expect(result.current.step).toBe(5)
    expect(result.current.blockedLabel).toBe('Devam etmek için izni işaretle')
    act(() => result.current.update('contactConsent', true))
    act(() => result.current.next())
    expect(result.current.errors.phone).toBe('Telefon numaranı yaz')
    act(() => result.current.update('phone', '05000000000'))
    act(() => result.current.next())
    expect(result.current.isLast).toBe(true)
    act(() => result.current.next())
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Sınav dönemlerinde kaygı',
        specialization: ['Kaygı'],
        budgetMin: 1000,
        budgetMax: 2000,
        preferredSessionType: 'online',
        contactConsent: true,
        phone: '05000000000',
      }),
      expect.any(Object)
    )
  })

  it('profilde telefon varsa telefon istemez; sunucu hatalarını adıma döndürür', () => {
    const { result } = setup('05001112233')
    act(() => result.current.update('title', 'Sınav dönemlerinde kaygı'))
    act(() => result.current.update('contactConsent', true))
    for (let i = 0; i < 7; i++) act(() => result.current.next())
    expect(mockMutate).toHaveBeenCalledTimes(1)
    const onError = (mockMutate.mock.calls[0]?.[1] as { onError: (e: unknown) => void }).onError

    act(() => onError(apiError('LISTING_BUDGET_OUT_OF_RANGE')))
    expect(result.current.step).toBe(3)
    expect(result.current.errors.budgetMin).toBe('Sunucu hatası')
    act(() => onError(apiError('PHONE_REQUIRED')))
    expect(result.current.step).toBe(5)
    expect(result.current.errors.phone).toBeDefined()
    act(() => onError(apiError('CONTACT_CONSENT_REQUIRED')))
    expect(result.current.errors.contactConsent).toBeDefined()
    act(() => onError(apiError('LISTING_MAX_ACTIVE_EXCEEDED')))
    expect(result.current.limitReached).toBe(true)
    act(() => onError(new Error('ağ')))
    expect(result.current.errors.form).toBeDefined()
  })

  it('web tek sayfa: publishAll bütün hataları birlikte yazar; tamamsa yayınlar', () => {
    const { result } = setup()
    expect(result.current.stepDone(0)).toBe(false)
    expect(result.current.stepDone(4)).toBe(true)
    expect(result.current.stepDone(6)).toBe(false)
    let ok = true
    act(() => {
      ok = result.current.publishAll()
    })
    expect(ok).toBe(false)
    expect(result.current.errors.title).toBeDefined()
    expect(result.current.errors.phone).toBe('Telefon numaranı yaz')
    expect(result.current.errors.contactConsent).toBe(
      'Yayınlamak için iletişim iznini işaretlemelisin.'
    )
    expect(mockMutate).not.toHaveBeenCalled()

    act(() => result.current.update('title', 'Sınav dönemlerinde kaygı'))
    act(() => result.current.update('contactConsent', true))
    act(() => result.current.update('phone', '05000000000'))
    expect(result.current.stepDone(0)).toBe(true)
    expect(result.current.stepDone(5)).toBe(true)
    act(() => {
      ok = result.current.publishAll()
    })
    expect(ok).toBe(true)
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Sınav dönemlerinde kaygı', contactConsent: true }),
      expect.any(Object)
    )
  })

  it('önizlemede eksik alan varsa o adıma döner', () => {
    const { result } = setup()
    act(() => result.current.update('title', 'Sınav dönemlerinde kaygı'))
    for (let i = 0; i < 5; i++) act(() => result.current.next())
    act(() => result.current.update('contactConsent', true))
    act(() => result.current.update('phone', '0500'))
    act(() => result.current.next())
    act(() => result.current.update('title', 'kısa'))
    act(() => result.current.next())
    expect(result.current.step).toBe(0)
    expect(mockMutate).not.toHaveBeenCalled()
  })
})
