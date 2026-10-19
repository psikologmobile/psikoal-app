export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  referrer: () => [...authKeys.all, 'referrer'] as const,
} as const

export const ME_STALE_TIME = 60 * 1000
export const REFERRER_STALE_TIME = 10 * 60 * 1000
