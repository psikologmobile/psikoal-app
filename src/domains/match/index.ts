// Revize 2 §5: kullanıcı tarafında eşleşme sonlandırma (release) YOK; yalnız admin.
export { useMatchesQuery, useMatchDetailQuery } from './api'

export { matchKeys, MATCH_STATUS_CONFIG } from './match.constants'

export { MatchStatusSchema, MatchSchema, MatchDetailSchema } from './schemas/match.schema'

export type { MatchStatus, Match, MatchDetail } from './types/match.types'

export { MatchRow } from './components/MatchRow'
export type { MatchRowProps } from './components/MatchRow'
