import { useQuery } from '@tanstack/react-query'

import { WalletResponseSchema } from '../schemas/wallet.schema'
import { walletKeys, WALLET_STALE_TIME } from '../wallet.constants'

import { useAuthStore } from '@/domains/auth'
import { get } from '@/lib/api'

/**
 * GET /wallet/me — TL bakiye, ücretsiz teklif hakkı, davet kodu ve linki.
 * Yalnız uzman: danışan token'ı 403 alır, bu yüzden rol uzman değilse istek atılmaz.
 */
export function useWalletQuery() {
  const isExpert = useAuthStore((s) => s.role === 'expert')

  return useQuery({
    queryKey: walletKeys.me(),
    queryFn: async () => WalletResponseSchema.parse(await get('/wallet/me')).data,
    staleTime: WALLET_STALE_TIME,
    enabled: isExpert,
  })
}
