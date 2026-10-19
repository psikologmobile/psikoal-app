import { useInfiniteQuery } from '@tanstack/react-query'

import { WalletTransactionPageSchema } from '../schemas/wallet.schema'
import { getNextWalletPage } from '../utils/walletUtils'
import { walletKeys, WALLET_STALE_TIME, WALLET_TRANSACTIONS_PER_PAGE } from '../wallet.constants'

import type { WalletTransactionType } from '../types/wallet.types'

import { useAuthStore } from '@/domains/auth'
import { get } from '@/lib/api'

type UseWalletTransactionsParams = {
  /** Tür süzgeci (ör. yalnız TOPUP). Verilmezse bütün hareketler. */
  type?: WalletTransactionType
}

/** GET /wallet/transactions?page&perPage&type — yalnız uzman, en yeni önce. */
export function useWalletTransactionsInfiniteQuery({ type }: UseWalletTransactionsParams = {}) {
  const isExpert = useAuthStore((s) => s.role === 'expert')

  return useInfiniteQuery({
    queryKey: walletKeys.transactions(type),
    queryFn: async ({ pageParam }) =>
      WalletTransactionPageSchema.parse(
        await get('/wallet/transactions', {
          params: { page: pageParam, perPage: WALLET_TRANSACTIONS_PER_PAGE, type },
        })
      ),
    initialPageParam: 1,
    getNextPageParam: getNextWalletPage,
    staleTime: WALLET_STALE_TIME,
    enabled: isExpert,
  })
}
