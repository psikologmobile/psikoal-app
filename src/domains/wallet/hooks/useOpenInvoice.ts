import { useCallback } from 'react'

import { useInvoiceUrlMutation } from '../api/useInvoiceUrlMutation'
import { isInvoiceUnavailableError } from '../utils/walletUtils'

import { getErrorMessage } from '@/lib/api'
import { openWebUrl } from '@/lib/externalLinks'

export const INVOICE_NOT_READY_MESSAGE = 'Bu ödemenin faturası henüz hazır değil.'

type UseOpenInvoiceReturn = {
  /** Taze imzalı adresi alır ve uygulama içi tarayıcıda açar. */
  openInvoice: (paymentId: string) => void
  /** Şu an adresi alınan ödeme (satırda spinner için). */
  pendingPaymentId: string | undefined
  /** Son denemenin kullanıcıya gösterilecek hatası. */
  errorMessage: string | undefined
}

/** "Faturalarım" satırının "Faturayı aç" eylemi. */
export function useOpenInvoice(): UseOpenInvoiceReturn {
  const { mutate, isPending, variables, error } = useInvoiceUrlMutation()

  const openInvoice = useCallback(
    (paymentId: string) => {
      mutate(paymentId, { onSuccess: (url) => void openWebUrl(url) })
    },
    [mutate]
  )

  const errorMessage = error
    ? isInvoiceUnavailableError(error)
      ? INVOICE_NOT_READY_MESSAGE
      : getErrorMessage(error)
    : undefined

  return { openInvoice, pendingPaymentId: isPending ? variables : undefined, errorMessage }
}
