import { z } from 'zod'

export const UserRoleSchema = z.enum(['expert', 'client'])

export const LoginRequestSchema = z.object({
  email: z.string().email('Geçerli bir e-posta giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
})

export const RegisterRequestSchema = z.object({
  email: z.string().email('Geçerli bir e-posta giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  role: UserRoleSchema,
  // KVKK: iki onay da zorunlu ve ayrı ayrı alınır (sözleşme §1). Backend ikisi
  // de true değilse 400 döner; burada da aynı kural, gönderimden önce.
  termsAccepted: z
    .boolean()
    .refine((value) => value, 'Kullanım Koşulları ve Gizlilik Politikası onayı zorunludur'),
  healthDataConsent: z
    .boolean()
    .refine((value) => value, 'Sağlık verilerinizin işlenmesine açık rıza zorunludur'),
  // Revize 2 §7: davet eden uzmanın kodu (isteğe bağlı). Geçersiz kod sunucuda
  // sessizce yok sayılır; boş bırakılan alan hiç gönderilmez.
  referralCode: z
    .string()
    .trim()
    .max(32, 'Davet kodu en fazla 32 karakter olabilir')
    .transform((value) => (value === '' ? undefined : value.toUpperCase()))
    .optional(),
})

/** GET /me/referrer → data: danışanı davet eden uzman ya da null (Revize 2 §6). */
export const ReferrerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  title: z.string(),
  avatarUrl: z.string().url().nullable(),
  initials: z.string().nullable(),
})

export const ReferrerResponseSchema = z.object({ data: ReferrerSchema.nullable() })

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
})

export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: UserRoleSchema,
  isVerified: z.boolean(),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
  phone: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  // Revize 2: share* tercihleri artık iletişim görünürlüğünü BELİRLEMİYOR —
  // danışan ilan açarken açık rıza verir, teklif veren uzman iletişimi görür;
  // eşleşmede iki taraf da karşı tarafın telefon/e-postasını görür.
  shareEmail: z.boolean().optional(),
  sharePhone: z.boolean().optional(),
  shareLocation: z.boolean().optional(),
})

export const AvatarUploadResponseSchema = z.object({
  avatarUrl: z.string().url(),
})

export const LoginResponseSchema = z.object({
  user: AuthUserSchema,
  tokens: AuthTokensSchema,
})

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı').optional(),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı').optional(),
  phone: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  shareEmail: z.boolean().optional(),
  sharePhone: z.boolean().optional(),
  shareLocation: z.boolean().optional(),
})

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mevcut şifrenizi giriniz'),
    newPassword: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
    confirmPassword: z.string().min(1, 'Şifreyi tekrar giriniz'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  })

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir e-posta giriniz'),
})

// Şifre sıfırlama formu — yeni şifre kuralı kayıtla aynı (≥ 8).
export const ResetPasswordFormSchema = z
  .object({
    newPassword: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
    confirmPassword: z.string().min(1, 'Şifreyi tekrar giriniz'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  })

// POST /auth/reset-password gövdesi (sözleşme §2).
export const ResetPasswordRequestSchema = z.object({
  accessToken: z.string().min(1),
  newPassword: z.string().min(8),
})
