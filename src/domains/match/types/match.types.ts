import type { MatchStatusSchema, MatchSchema, MatchDetailSchema } from '../schemas/match.schema'
import type { z } from 'zod'

export type MatchStatus = z.infer<typeof MatchStatusSchema>
export type Match = z.infer<typeof MatchSchema>
export type MatchDetail = z.infer<typeof MatchDetailSchema>
