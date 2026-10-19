import type { AuthUser, UserRole } from '@/domains/auth'

import { useAuthStore } from '@/domains/auth'
import { useAppHydrated } from '@/screens/splash'

export type SiteSession = {
  /** Oturum deposu diskten okundu mu? (statik HTML'de ve ilk boyamada false) */
  hydrated: boolean
  isAuthenticated: boolean
  role: UserRole | null
  user: AuthUser | null
}

/** Site sayfalarının oturum görünümü; yalnız okuma. */
export function useSiteSession(): SiteSession {
  const hydrated = useAppHydrated()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.role)
  const user = useAuthStore((s) => s.user)
  return { hydrated, isAuthenticated, role, user }
}
