import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { normalizeReferralCode } from '../utils/referralCode'

import { zustandStorage } from '@/lib/storage'

type ReferralState = {
  /** `/davet/{code}` bağlantısından yakalanan, henüz kayıtta kullanılmamış kod. */
  pendingCode: string | null
}

type ReferralActions = {
  /** Kodu normalize edip saklar; bozuk kodu yok sayar. Saklandıysa true. */
  capture: (raw: string | null | undefined) => boolean
  clear: () => void
}

/**
 * Davet kodu kayıt anına kadar diskte bekler: kullanıcı bağlantıya dokunup
 * uygulamayı kapatsa bile kayıtta gönderilir (useRegisterMutation okur ve temizler).
 */
export const useReferralStore = create<ReferralState & ReferralActions>()(
  persist(
    (set) => ({
      pendingCode: null,
      capture: (raw) => {
        const code = normalizeReferralCode(raw)
        if (!code) return false
        set({ pendingCode: code })
        return true
      },
      clear: () => set({ pendingCode: null }),
    }),
    {
      name: 'referral-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ pendingCode: state.pendingCode }),
    }
  )
)
