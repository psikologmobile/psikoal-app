import { useMutation } from '@tanstack/react-query'

import { PayTrInitRequestSchema, PayTrInitResponseSchema } from '../schemas/wallet.schema'

import type { PayTrInitRequest } from '../types/wallet.types'

import { post } from '@/lib/api'

/**
 * POST /payments/paytr/init { amountKurus } → PayTR iFrame token'ı ve adresi.
 * YALNIZ web bakiye yükleme sayfası çağırır. Hatalar ekranda satır içinde:
 * 422 TOPUP_AMOUNT_OUT_OF_RANGE, 403 TOPUP_EXPERT_NOT_APPROVED (bkz. walletUtils).
 * Bakiye ödeme sonrası PayTR callback'iyle yüklenir; buradan invalidation yapılmaz.
 */
export function usePayTrInitMutation() {
  return useMutation({
    meta: { suppressErrorAlert: true },
    mutationFn: async (request: PayTrInitRequest) => {
      const body = PayTrInitRequestSchema.parse(request)
      return PayTrInitResponseSchema.parse(await post('/payments/paytr/init', body)).data
    },
  })
}
