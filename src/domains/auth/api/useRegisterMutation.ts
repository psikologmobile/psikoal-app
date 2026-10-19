import { useMutation } from '@tanstack/react-query'

import { LoginResponseSchema } from '../schemas/auth.schema'
import { useAuthStore } from '../store/authStore'
import { useReferralStore } from '../store/referralStore'

import type { RegisterRequest } from '../types/auth.types'

import { post } from '@/lib/api'
import { tokenStorage } from '@/lib/storage'

/**
 * POST /auth/register. Formda davet kodu yoksa `/davet/{code}` bağlantısından
 * saklanan kod gönderilir (Revize 2 §7); başarılı kayıttan sonra saklanan kod silinir.
 */
export function useRegisterMutation() {
  const { setAuth } = useAuthStore()

  return useMutation({
    meta: { suppressErrorAlert: true },
    mutationFn: async (data: RegisterRequest) => {
      const referralCode = data.referralCode ?? useReferralStore.getState().pendingCode ?? undefined
      const raw = await post('/auth/register', { ...data, referralCode })
      return LoginResponseSchema.parse(raw)
    },
    onSuccess: async ({ user, tokens }) => {
      await tokenStorage.setAccessToken(tokens.accessToken)
      await tokenStorage.setRefreshToken(tokens.refreshToken)
      useReferralStore.getState().clear()
      setAuth(user, tokens.accessToken, tokens.refreshToken)
    },
  })
}
