import { useMemo, useState } from 'react'

import { useCreateListingMutation } from '../api/useCreateListingMutation'
import { LISTING_ERROR_CODES } from '../listing.constants'
import { createListingSchemaFor, DEFAULT_LISTING_RULES } from '../schemas/listing.schema'
import { BUDGET_PRESETS, budgetScale } from '../utils/createListingView'

import type { ListingRules, SessionType } from '../types/listing.types'

import { getErrorMessage, isApiErrorCode } from '@/lib/api'

/** 0 konu · 1 alanlar · 2 görüşme şekli (+ şehir) · 3 bütçe · 4 test · 5 iletişim izni · 6 önizleme */
export const CREATE_LISTING_STEPS = 7

type FieldName =
  | 'title'
  | 'description'
  | 'specialization'
  | 'preferredSessionType'
  | 'city'
  | 'budgetMin'
  | 'budgetMax'
  | 'contactConsent'
  | 'phone'

const STEP_FIELDS: Record<number, FieldName[]> = {
  0: ['title', 'description'],
  1: ['specialization'],
  2: ['preferredSessionType', 'city'],
  3: ['budgetMin', 'budgetMax'],
  4: [],
  5: ['contactConsent', 'phone'],
  6: [],
}

const ALL_FIELDS: FieldName[] = Object.values(STEP_FIELDS).flat()

export type CreateListingValues = {
  title: string
  description: string
  specialization: string[]
  preferredSessionType: SessionType
  city: string | null
  budgetPreset: number
  assessmentResultId: string | undefined
  contactConsent: boolean
  phone: string
}

type UseCreateListingWizardParams = {
  rules: ListingRules | undefined
  initialSpecialization?: string
  initialCity?: string | null
  /** Profildeki telefon; yoksa iletişim adımında telefon zorunlu. */
  profilePhone?: string | null
}

export type CreateListingErrors = Partial<Record<FieldName | 'form', string>>

/**
 * İlan oluşturma sihirbazı (7 adım). Doğrulama sunucu kurallarıyla kurulan
 * `createListingSchemaFor(rules)` ile adım adım yapılır; yayınlama hataları ilgili
 * adıma döndürülür (rıza, telefon, bütçe aralığı, aktif ilan sınırı).
 */
export function useCreateListingWizard({
  rules = DEFAULT_LISTING_RULES,
  initialSpecialization,
  initialCity,
  profilePhone,
}: UseCreateListingWizardParams) {
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<CreateListingErrors>({})
  const [limitReached, setLimitReached] = useState(false)
  const [values, setValues] = useState<CreateListingValues>(() => ({
    title: '',
    description: '',
    specialization: initialSpecialization ? [initialSpecialization] : [],
    preferredSessionType: 'online',
    city: initialCity ?? null,
    budgetPreset: 1,
    assessmentResultId: undefined,
    contactConsent: false,
    phone: '',
  }))
  const mutation = useCreateListingMutation()

  const schema = useMemo(() => createListingSchemaFor(rules), [rules])
  const scale = useMemo(() => budgetScale(rules), [rules])
  const needsPhone = !profilePhone
  const needsCity = rules.cityRequiredFor.includes(values.preferredSessionType)
  const [fromCell, toCell] = BUDGET_PRESETS[values.budgetPreset] ?? [0, 3]
  const budget = scale.range(fromCell, toCell)

  const update = <K extends keyof CreateListingValues>(key: K, value: CreateListingValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined, form: undefined }))
  }

  const toggleSpecialization = (name: string) =>
    update(
      'specialization',
      values.specialization.includes(name)
        ? values.specialization.filter((s) => s !== name)
        : [...values.specialization, name]
    )

  const payload = () => ({
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    specialization: values.specialization,
    budgetMin: budget.budgetMin,
    budgetMax: budget.budgetMax,
    preferredSessionType: values.preferredSessionType,
    city: needsCity && values.city ? values.city : undefined,
    assessmentResultId: values.assessmentResultId,
    contactConsent: values.contactConsent,
    phone: needsPhone ? values.phone.trim() || undefined : undefined,
  })

  /** Adımın alanlarını doğrular; hata varsa yazar ve false döner. */
  const validateStep = (index: number): boolean => {
    const fields = STEP_FIELDS[index] ?? []
    const result = schema.safeParse(payload())
    const next: CreateListingErrors = {}
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = fields.find((name) => name === issue.path[0])
        if (field && !next[field]) next[field] = issue.message
      }
    }
    if (index === 5 && needsPhone && !values.phone.trim()) {
      next.phone = 'Telefon numaranı yaz'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  /** Devam düğmesinin kilitli olduğu adımlar (tasarım: kesikli düğme). */
  const blockedLabel =
    step === 1 && values.specialization.length === 0
      ? 'En az bir alan seç'
      : step === 5 && !values.contactConsent
        ? 'Devam etmek için izni işaretle'
        : undefined

  const submit = () => {
    mutation.mutate(schema.parse(payload()), {
      onError: (error) => {
        if (isApiErrorCode(error, LISTING_ERROR_CODES.maxActiveExceeded)) {
          setLimitReached(true)
        } else if (isApiErrorCode(error, LISTING_ERROR_CODES.phoneRequired)) {
          setStep(5)
          setErrors({ phone: getErrorMessage(error) })
        } else if (isApiErrorCode(error, LISTING_ERROR_CODES.contactConsentRequired)) {
          setStep(5)
          setErrors({ contactConsent: getErrorMessage(error) })
        } else if (isApiErrorCode(error, LISTING_ERROR_CODES.budgetOutOfRange)) {
          setStep(3)
          setErrors({ budgetMin: getErrorMessage(error) })
        } else {
          setErrors({ form: getErrorMessage(error) })
        }
      },
    })
  }

  const next = () => {
    if (blockedLabel || !validateStep(step)) return
    if (step < CREATE_LISTING_STEPS - 1) {
      setStep(step + 1)
      return
    }
    // Önizleme: bütün adımlar bir kez daha; hatalı ilk adıma dön.
    for (let i = 0; i < CREATE_LISTING_STEPS; i++) {
      if (!validateStep(i)) {
        setStep(i)
        return
      }
    }
    submit()
  }

  /** Adımın alanları şu an geçerli mi (web adım listesindeki tik). Önizleme hiç "bitmiş" sayılmaz. */
  const stepDone = (index: number): boolean => {
    if (index >= CREATE_LISTING_STEPS - 1) return false
    if (index === 5 && needsPhone && !values.phone.trim()) return false
    const fields = STEP_FIELDS[index] ?? []
    const result = schema.safeParse(payload())
    return result.success || !result.error.issues.some((i) => fields.some((f) => f === i.path[0]))
  }

  /**
   * Web tek sayfa formu: bütün alanları birlikte doğrular, hataları ilgili bölümlere
   * yazar; eksik yoksa yayınlar. Sunucu hataları mobil akıştaki gibi işlenir.
   */
  const publishAll = (): boolean => {
    const result = schema.safeParse(payload())
    const next: CreateListingErrors = {}
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = ALL_FIELDS.find((name) => name === issue.path[0])
        if (field && !next[field]) next[field] = issue.message
      }
    }
    if (needsPhone && !values.phone.trim()) next.phone = 'Telefon numaranı yaz'
    if (!values.contactConsent)
      next.contactConsent = 'Yayınlamak için iletişim iznini işaretlemelisin.'
    setErrors(next)
    if (Object.keys(next).length > 0) return false
    submit()
    return true
  }

  const back = () => {
    setErrors({})
    setStep((s) => Math.max(0, s - 1))
  }

  return {
    step,
    values,
    errors,
    update,
    toggleSpecialization,
    needsCity,
    needsPhone,
    budget,
    scale,
    blockedLabel,
    next,
    back,
    stepDone,
    publishAll,
    isFirst: step === 0,
    isLast: step === CREATE_LISTING_STEPS - 1,
    isSubmitting: mutation.isPending,
    created: mutation.data,
    limitReached,
  }
}
