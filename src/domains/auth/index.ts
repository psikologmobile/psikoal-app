export { useAuthStore } from './store/authStore'
export { useReferralStore } from './store/referralStore'
export { normalizeReferralCode, REFERRAL_CODE_MAX_LENGTH } from './utils/referralCode'
export {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useFreezeAccountMutation,
  useDeleteAccountMutation,
  useUploadAvatarMutation,
  useMeQuery,
  useResetPasswordMutation,
  useReferrerQuery,
  RESET_TOKEN_INVALID,
} from './api'
export { parseRecoveryLink } from './utils/parseRecoveryLink'
export type { RecoveryLink } from './utils/parseRecoveryLink'
export { authKeys } from './auth.constants'
export { useChangeAvatar } from './hooks/useChangeAvatar'
export {
  pickAvatarImage,
  resolveImageContentType,
  AVATAR_CONTENT_TYPES,
  AVATAR_MAX_BYTES,
} from './utils/pickAvatarImage'
export type { PickedImage, PickImageResult } from './utils/pickAvatarImage'
export {
  LoginRequestSchema,
  RegisterRequestSchema,
  AuthUserSchema,
  UserRoleSchema,
  LoginResponseSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  ResetPasswordFormSchema,
  ResetPasswordRequestSchema,
  ReferrerSchema,
  ReferrerResponseSchema,
} from './schemas/auth.schema'
export type {
  UserRole,
  AuthUser,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordForm,
  ResetPasswordRequest,
  Referrer,
} from './types/auth.types'
export {
  AUTH_ERROR_CODES,
  LOGIN_ERROR_MESSAGES,
  REGISTER_ERROR_MESSAGES,
  loginErrorKind,
  loginErrorMessage,
  registerErrorKind,
  registerErrorMessage,
} from './utils/authErrors'
export type { LoginErrorKind, RegisterErrorKind } from './utils/authErrors'
export { passwordStrength, PASSWORD_MIN_LENGTH } from './utils/passwordStrength'
export type { PasswordStrength } from './utils/passwordStrength'
