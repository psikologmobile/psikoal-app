import { useCallback, useState } from 'react'

import { useCreateExpertProfileMutation } from '../api/useCreateExpertProfileMutation'
import { useUploadExpertDocumentMutation } from '../api/useUploadExpertDocumentMutation'
import { ExpertOnboardingSchema } from '../schemas/expert.schema'
import { pickExpertDocument } from '../utils/pickDocument'

import type { ExpertOnboarding } from '../schemas/expert.schema'
import type { PickedDocument } from '../utils/pickDocument'

import { useUpdateProfileMutation } from '@/domains/auth'
import { getErrorMessage } from '@/lib/api'

export const EXPERT_ONBOARDING_STEPS = 4
export const BIO_MIN = 50
export const BIO_MAX = 1000
export const EXPERIENCE_MAX = 50

export type ExpertOnboardingField = 'title' | 'specializations' | 'bio' | 'personalWebsite'
export type ExpertOnboardingErrors = Partial<Record<ExpertOnboardingField, string>>

export type ExpertOnboardingValues = {
  title: string
  experienceYears: number
  specializations: string[]
  phone: string
  city: string | null
  bio: string
  education: string
  personalWebsite: string
  cv: PickedDocument | null
  certificates: PickedDocument[]
}

const INITIAL: ExpertOnboardingValues = {
  title: '',
  experienceYears: 0,
  specializations: [],
  phone: '',
  city: null,
  bio: '',
  education: '',
  personalWebsite: '',
  cv: null,
  certificates: [],
}

/** Adım alanlarını doğrular; geçerliyse boş nesne döner. Saf — test edilir. */
export function validateExpertOnboardingStep(
  step: number,
  v: ExpertOnboardingValues
): ExpertOnboardingErrors {
  const errors: ExpertOnboardingErrors = {}
  if (step === 0 && v.title.trim().length < 2) errors.title = 'Ünvan en az 2 karakter olmalı'
  if (step === 1 && v.specializations.length === 0)
    errors.specializations = 'En az bir uzmanlık alanı seç'
  if (step === 2) {
    const len = v.bio.trim().length
    if (len < BIO_MIN) errors.bio = `Biyografi en az ${BIO_MIN} karakter olmalı`
    else if (len > BIO_MAX) errors.bio = `Biyografi en çok ${BIO_MAX} karakter olabilir`
  }
  if (step === 3 && v.personalWebsite.trim()) {
    const ok = ExpertOnboardingSchema.shape.personalWebsite.safeParse(v.personalWebsite.trim())
    if (!ok.success) errors.personalWebsite = 'Geçerli bir adres gir (https://…)'
  }
  return errors
}

export function toExpertOnboardingPayload(v: ExpertOnboardingValues): ExpertOnboarding {
  return {
    title: v.title.trim(),
    specializations: v.specializations,
    experienceYears: v.experienceYears,
    bio: v.bio.trim(),
    education: v.education.trim() || null,
    personalWebsite: v.personalWebsite.trim() || null,
  }
}

type Status = 'form' | 'done'

export type UseExpertOnboardingReturn = {
  step: number
  status: Status
  values: ExpertOnboardingValues
  errors: ExpertOnboardingErrors
  set: <K extends keyof ExpertOnboardingValues>(key: K, value: ExpertOnboardingValues[K]) => void
  toggleSpecialization: (name: string) => void
  next: () => void
  back: () => boolean
  pickCv: () => Promise<string | null>
  pickCertificate: () => Promise<string | null>
  removeCertificate: (index: number) => void
  isSubmitting: boolean
  submitError: string | null
  /** Profil oluştu ama bazı belgeler yüklenemedi. */
  documentsFailed: boolean
}

/**
 * Uzman onboarding akışı (4 adım + incelemede). Belgeler profil oluşturulduktan
 * SONRA yüklenir: yükleme uçları `experts` satırını arar, satır ancak profil
 * POST'u ile oluşur. Yükleme hatası profili geri almaz; "incelemede" ekranında
 * bilgi verilir (Ayarlar → Belgeler'den tekrar denenir).
 */
export function useExpertOnboarding(): UseExpertOnboardingReturn {
  const [step, setStep] = useState(0)
  const [status, setStatus] = useState<Status>('form')
  const [values, setValues] = useState<ExpertOnboardingValues>(INITIAL)
  const [errors, setErrors] = useState<ExpertOnboardingErrors>({})
  const [isSubmitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [documentsFailed, setDocumentsFailed] = useState(false)

  const { mutateAsync: updateProfile } = useUpdateProfileMutation()
  const { mutateAsync: createProfile } = useCreateExpertProfileMutation()
  const { mutateAsync: uploadCv } = useUploadExpertDocumentMutation('cv')
  const { mutateAsync: uploadCertificate } = useUploadExpertDocumentMutation('certificate')

  const set = useCallback<UseExpertOnboardingReturn['set']>((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }, [])

  const toggleSpecialization = useCallback((name: string) => {
    setValues((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(name)
        ? prev.specializations.filter((s) => s !== name)
        : [...prev.specializations, name],
    }))
    setErrors((prev) => ({ ...prev, specializations: undefined }))
  }, [])

  const submit = async (v: ExpertOnboardingValues) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await updateProfile({ phone: v.phone.trim() || null, city: v.city })
      await createProfile(toExpertOnboardingPayload(v))
    } catch (error) {
      setSubmitError(getErrorMessage(error))
      setSubmitting(false)
      return
    }
    let failed = false
    const { cv } = v
    const uploads: Array<() => Promise<unknown>> = [
      ...(cv ? [() => uploadCv(cv)] : []),
      ...v.certificates.map((doc) => () => uploadCertificate(doc)),
    ]
    for (const upload of uploads) {
      try {
        await upload()
      } catch {
        failed = true
      }
    }
    setDocumentsFailed(failed)
    setSubmitting(false)
    setStatus('done')
  }

  const next = () => {
    const stepErrors = validateExpertOnboardingStep(step, values)
    if (Object.values(stepErrors).some(Boolean)) {
      setErrors(stepErrors)
      return
    }
    if (step < EXPERT_ONBOARDING_STEPS - 1) setStep(step + 1)
    else void submit(values)
  }

  const back = () => {
    if (step === 0) return false
    setStep(step - 1)
    return true
  }

  const pick = async (keep: (doc: PickedDocument) => void): Promise<string | null> => {
    const picked = await pickExpertDocument()
    if (picked.status === 'canceled') return null
    if (picked.status === 'rejected') return picked.message
    keep(picked.document)
    return null
  }

  return {
    step,
    status,
    values,
    errors,
    set,
    toggleSpecialization,
    next,
    back,
    pickCv: () => pick((doc) => set('cv', doc)),
    pickCertificate: () =>
      pick((doc) => setValues((prev) => ({ ...prev, certificates: [...prev.certificates, doc] }))),
    removeCertificate: (index) =>
      setValues((prev) => ({
        ...prev,
        certificates: prev.certificates.filter((_, i) => i !== index),
      })),
    isSubmitting,
    submitError,
    documentsFailed,
  }
}
