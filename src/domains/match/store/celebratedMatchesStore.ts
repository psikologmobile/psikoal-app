import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { zustandStorage } from '@/lib/storage'

const MAX_REMEMBERED = 200

type CelebratedState = {
  /** Kutlaması gösterilmiş eşleşme kimlikleri (en yeni sonda). */
  ids: string[]
  markCelebrated: (id: string) => void
}

/**
 * "Eşleşti" kutlaması cihaz başına bir kez: danışan eşleşti işaretleyince ve
 * uzman MATCHED bildirimini ilk açtığında. Sonraki açılışlarda detaya gidilir.
 */
export const useCelebratedMatchesStore = create<CelebratedState>()(
  persist(
    (set, get) => ({
      ids: [],
      markCelebrated: (id) => {
        if (get().ids.includes(id)) return
        set({ ids: [...get().ids, id].slice(-MAX_REMEMBERED) })
      },
    }),
    {
      name: 'celebrated-matches',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ ids: state.ids }),
    }
  )
)
