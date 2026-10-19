import { useQuery } from '@tanstack/react-query'

import { authKeys, REFERRER_STALE_TIME } from '../auth.constants'
import { ReferrerResponseSchema } from '../schemas/auth.schema'
import { useAuthStore } from '../store/authStore'

import { get } from '@/lib/api'

/**
 * GET /me/referrer — danışanı davet eden uzman (yoksa `null`). Yalnız danışan
 * için anlamlı; uzman oturumunda istek atılmaz.
 */
export function useReferrerQuery() {
  const isClient = useAuthStore((s) => s.isAuthenticated && s.role === 'client')

  return useQuery({
    queryKey: authKeys.referrer(),
    queryFn: async () => ReferrerResponseSchema.parse(await get('/me/referrer')).data,
    staleTime: REFERRER_STALE_TIME,
    enabled: isClient,
  })
}
