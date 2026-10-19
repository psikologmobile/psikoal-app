import { useInfiniteQuery } from '@tanstack/react-query'

import { WalletPaymentPageSchema } from '../schemas/wallet.schema'
import { getNextWalletPage } from '../utils/walletUtils'
import { walletKeys, WALLET_PAYMENTS_PER_PAGE, WALLET_STALE_TIME } from '../wallet.constants'

import { useAuthStore } from '@/domains/auth'
import { get } from '@/lib/api'

/** GET /wallet/payments?page&perPage — uzmanın bakiye yüklemeleri ve fatura durumu ("Faturalarım"). */
export function useWalletPaymentsInfiniteQuery() {
  const isExpert = useAuthStore((s) => s.role === 'expert')

  return useInfiniteQuery({
    queryKey: walletKeys.payments(),
    queryFn: async ({ pageParam }) =>
      WalletPaymentPageSchema.parse(
        await get('/wallet/payments', {
          params: { page: pageParam, perPage: WALLET_PAYMENTS_PER_PAGE },
        })
      ),
    initialPageParam: 1,
    getNextPageParam: getNextWalletPage,
    staleTime: WALLET_STALE_TIME,
    enabled: isExpert,
  })
}
