import { useMutation } from '@tanstack/react-query'

import { InvoiceUrlResponseSchema } from '../schemas/wallet.schema'

import { get } from '@/lib/api'

/**
 * GET /wallet/payments/{id}/invoice → 5 dakika geçerli imzalı PDF adresi.
 *
 * Sorgu değil mutation: adres kısa ömürlü, önbelleğe alınmamalı; her "Faturayı aç"
 * dokunuşu taze adres ister. Fatura yoksa 404 INVOICE_NOT_FOUND
 * (bkz. isInvoiceUnavailableError). Açma işi useOpenInvoice'ta.
 */
export function useInvoiceUrlMutation() {
  return useMutation({
    meta: { suppressErrorAlert: true },
    mutationFn: async (paymentId: string) =>
      InvoiceUrlResponseSchema.parse(await get(`/wallet/payments/${paymentId}/invoice`)).data.url,
  })
}
