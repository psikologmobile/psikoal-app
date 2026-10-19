import type { MatchStatus } from './types/match.types'

export const matchKeys = {
  all: ['matches'] as const,
  list: (status?: string[]) => [...matchKeys.all, 'list', status ?? []] as const,
  active: () => [...matchKeys.all, 'active'] as const,
  detail: (id: string) => [...matchKeys.all, 'detail', id] as const,
} as const

/** Eşleşmelerim sekmeleri → backend durum süzgeci. */
export const MATCH_TAB_STATUSES = {
  active: ['ACTIVE'],
  past: ['COMPLETED', 'RELEASED'],
} as const satisfies Record<string, MatchStatus[]>

export type MatchTab = keyof typeof MATCH_TAB_STATUSES

/** Durum etiketi (b0 · Eşleşmelerim). RELEASED yalnız admin sonlandırmasıdır. */
export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  ACTIVE: 'Aktif',
  COMPLETED: 'Tamamlandı',
  RELEASED: 'Sonlandırıldı',
}

/** Eşleşti kutlaması rotası; kutlama cihaz başına bir kez gösterilir. */
export function matchCelebrateRoute(matchId: string): `/match/${string}/celebrate` {
  return `/match/${matchId}/celebrate`
}
