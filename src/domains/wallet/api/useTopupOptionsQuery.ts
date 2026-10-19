import { useQuery } from '@tanstack/react-query'

import { TopupOptionsResponseSchema } from '../schemas/wallet.schema'
import { walletKeys, TOPUP_OPTIONS_STALE_TIME } from '../wallet.constants'

import { get } from '@/lib/api'

/**
 * GET /wallet/topup-options (anonim) — hazır tutarlar, alt/üst sınır, KDV notu.
 * Yalnız web bakiye yükleme sayfası kullanır (mobilde yükleme yolu yok — mağaza kuralı).
 */
export function useTopupOptionsQuery() {
  return useQuery({
    queryKey: walletKeys.topupOptions(),
    queryFn: async () => TopupOptionsResponseSchema.parse(await get('/wallet/topup-options')).data,
    staleTime: TOPUP_OPTIONS_STALE_TIME,
  })
}
