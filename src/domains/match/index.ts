// Revize 2 §5: kullanıcı tarafında eşleşme sonlandırma (release) YOK; yalnız admin.
export { useMatchesQuery, useMatchDetailQuery } from './api'

export {
  matchKeys,
  MATCH_TAB_STATUSES,
  MATCH_STATUS_LABELS,
  matchCelebrateRoute,
} from './match.constants'
export type { MatchTab } from './match.constants'

export { MatchStatusSchema, MatchSchema, MatchDetailSchema } from './schemas/match.schema'

export type { MatchStatus, Match, MatchDetail } from './types/match.types'

export {
  toMatchCounterpart,
  matchTags,
  sessionLabel,
  offerPriceLabel,
  memberSinceLabel,
} from './utils/matchView'
export type { MatchCounterpart, MatchViewerRole } from './utils/matchView'

export { useCelebratedMatchesStore } from './store/celebratedMatchesStore'

export { MatchCard } from './components/MatchCard'
export type { MatchCardProps } from './components/MatchCard'
