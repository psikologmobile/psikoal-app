import type {
  AuthTokensSchema,
  AuthUserSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  RegisterRequestSchema,
  ReferrerSchema,
  ResetPasswordFormSchema,
  ResetPasswordRequestSchema,
  UpdateProfileSchema,
  UserRoleSchema,
} from '../schemas/auth.schema'
import type { z } from 'zod'

export type UserRole = z.infer<typeof UserRoleSchema>
export type AuthUser = z.infer<typeof AuthUserSchema>
export type AuthTokens = z.infer<typeof AuthTokensSchema>
export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>
export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordForm = z.infer<typeof ResetPasswordFormSchema>
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>
export type Referrer = z.infer<typeof ReferrerSchema>
