import { useExpertProfileQuery } from '../api/useExpertProfileQuery'
import { isExpertNotVisibleError } from '../utils/expertVisibility'

import type { Expert } from '../schemas/expert.schema'

export type ExpertProfileAccessState = 'loading' | 'visible' | 'notVisible' | 'error'

type UseExpertProfileAccessReturn = {
  state: ExpertProfileAccessState
  expert: Expert | undefined
  refetch: () => void
}

/**
 * Uzman profili + görünürlük durumu. `notVisible`: 404 EXPERT_NOT_FOUND (profil
 * yok ya da danışana açık değil) — tekrar denemek anlamsız. `error`: ağ/sunucu.
 */
export function useExpertProfileAccess(expertId: string): UseExpertProfileAccessReturn {
  const { data, error, isLoading, refetch } = useExpertProfileQuery(expertId)

  let state: ExpertProfileAccessState = 'loading'
  if (data) state = 'visible'
  else if (isExpertNotVisibleError(error)) state = 'notVisible'
  else if (error) state = 'error'
  else if (!isLoading && !expertId) state = 'notVisible'

  return {
    state,
    expert: data,
    refetch: () => {
      void refetch()
    },
  }
}
