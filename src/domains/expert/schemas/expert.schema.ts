import { z } from 'zod'

export const ExpertOnboardingSchema = z.object({
  title: z.string().min(2, 'Ünvan en az 2 karakter olmalı'),
  specializations: z.array(z.string()).min(1, 'En az bir uzmanlık alanı seçiniz'),
  experienceYears: z.number().min(0).max(50),
  bio: z.string().min(50, 'Biyografi en az 50 karakter olmalı').max(1000),
  avatarUrl: z.string().url().nullable().optional(),
  education: z.string().nullable().optional(),
  // cvUrl / certificates burada YOK: backend profil POST/PATCH'te yok sayıyor;
  // belgeler yalnız /experts/profile/cv ve /certificates uçlarıyla yüklenir.
  personalWebsite: z
    .string()
    .url('Geçerli bir URL giriniz')
    .nullable()
    .optional()
    .or(z.literal('')),
})

export const ExpertSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  title: z.string(),
  specializations: z.array(z.string()),
  experienceYears: z.number(),
  bio: z.string(),
  avatarUrl: z.string().url().nullable(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().min(0),
  isVerified: z.boolean(),
  status: z.enum(['pending', 'approved', 'rejected']),
  /** Admin red gerekçesi — yalnız uzmanın KENDİ profilinde ve reddedildiyse gelir. */
  rejectionReason: z.string().nullable().optional(),
  initials: z.string().optional(),
  acceptsOffers: z.boolean(),
  education: z.string().nullable().optional(),
  cvUrl: z.string().nullable().optional(),
  certificates: z.array(z.string()).optional(),
  personalWebsite: z.string().url().nullable().optional(),
})

export type ExpertOnboarding = z.infer<typeof ExpertOnboardingSchema>
export type Expert = z.infer<typeof ExpertSchema>

/**
 * "Mesleki bilgiler ve belgeler" formu (PATCH /experts/profile). Kişisel site boş
 * bırakılabilir; doluysa http(s) adresi olmalı.
 */
export const ProfessionalProfileFormSchema = z.object({
  title: z.string().trim().min(2, 'Ünvan en az 2 karakter olmalı'),
  specializations: z.array(z.string()).min(1, 'En az bir uzmanlık alanı seç'),
  experienceYears: z.number().int().min(0).max(50),
  education: z.string().trim().max(200, 'En fazla 200 karakter'),
  bio: z
    .string()
    .trim()
    .min(50, 'Biyografi en az 50 karakter olmalı')
    .max(1000, 'Biyografi en fazla 1000 karakter olabilir'),
  personalWebsite: z
    .string()
    .trim()
    .refine((value) => value === '' || /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(value), {
      message: 'Geçerli bir adres yaz (https://ornek.com)',
    }),
})

export type ProfessionalProfileForm = z.infer<typeof ProfessionalProfileFormSchema>
