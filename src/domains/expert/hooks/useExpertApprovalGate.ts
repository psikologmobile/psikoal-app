import { useExpertProfileQuery } from '../api/useExpertProfileQuery'

import { useAuthStore } from '@/domains/auth'
import { ApiError } from '@/lib/api'

type UseExpertApprovalGateReturn = {
  /** Uzman profili admin onayı bekliyor mu? (yalnızca expert rolünde anlamlı) */
  isPendingApproval: boolean
  /** Uzman profili reddedilmiş mi? */
  isRejected: boolean
  /** Reddedildiyse admin gerekçesi (yoksa null). */
  rejectionReason: string | null
  /** Uzman rolünde ama uzman profili hiç oluşturulmamış (onboarding yarım kalmış). */
  needsOnboarding: boolean
  /** Teklif gönderme gibi onay gerektiren aksiyonlar serbest mi? */
  canAct: boolean
  isLoading: boolean
}

/** Backend profili olmayan uzman için 404 (eskiden 422 EXPERT_NOT_FOUND) döner. */
export function isExpertProfileMissing(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.code === 'EXPERT_NOT_FOUND')
}

export function useExpertApprovalGate(): UseExpertApprovalGateReturn {
  const role = useAuthStore((s) => s.role)
  const userId = useAuthStore((s) => s.userId)

  const {
    data: expert,
    error,
    isLoading,
  } = useExpertProfileQuery(role === 'expert' ? (userId ?? '') : '')

  if (role !== 'expert') {
    return {
      isPendingApproval: false,
      isRejected: false,
      rejectionReason: null,
      needsOnboarding: false,
      canAct: true,
      isLoading: false,
    }
  }

  const status = expert?.status
  const isPendingApproval = status === 'pending'
  const isRejected = status === 'rejected'
  const needsOnboarding = isExpertProfileMissing(error)

  return {
    isPendingApproval,
    isRejected,
    rejectionReason: isRejected ? expert?.rejectionReason?.trim() || null : null,
    needsOnboarding,
    // Profil başka bir nedenle yüklenemediyse (ağ vb.) aksiyonu engellemiyoruz;
    // backend son sözü söyler. Profil HİÇ yoksa ise teklif gönderilemez.
    canAct: !isPendingApproval && !isRejected && !needsOnboarding,
    isLoading,
  }
}
