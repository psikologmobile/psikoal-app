import { WALLET_ERROR_CODES } from '../wallet.constants'

import type { WalletPageMeta, WalletTransaction } from '../types/wallet.types'

import { isApiErrorCode } from '@/lib/api'

/**
 * Sayfalı cüzdan uçlarında sonraki sayfa numarası (meta: page * perPage < total).
 * Sayfalama aritmetiği iş mantığı değil, istemcinin hangi sayfayı isteyeceğidir.
 */
export function getNextWalletPage(lastPage: { meta: WalletPageMeta }): number | undefined {
  const { page, perPage, total } = lastPage.meta
  return page * perPage < total ? page + 1 : undefined
}

/** POST /offers'ın 422 INSUFFICIENT_BALANCE yanıtı mı? */
export function isInsufficientBalanceError(error: unknown): boolean {
  return isApiErrorCode(error, WALLET_ERROR_CODES.insufficientBalance)
}

/** POST /payments/paytr/init'in 422 TOPUP_AMOUNT_OUT_OF_RANGE yanıtı mı? */
export function isTopupAmountOutOfRangeError(error: unknown): boolean {
  return isApiErrorCode(error, WALLET_ERROR_CODES.topupAmountOutOfRange)
}

/** POST /payments/paytr/init'in 403 TOPUP_EXPERT_NOT_APPROVED yanıtı mı? */
export function isTopupExpertNotApprovedError(error: unknown): boolean {
  return isApiErrorCode(error, WALLET_ERROR_CODES.topupExpertNotApproved)
}

/** Fatura henüz yüklenmemiş (404 INVOICE_NOT_FOUND) ya da ödeme tamamlanmamış mı? */
export function isInvoiceUnavailableError(error: unknown): boolean {
  return (
    isApiErrorCode(error, WALLET_ERROR_CODES.invoiceNotFound) ||
    isApiErrorCode(error, WALLET_ERROR_CODES.invoicePaymentNotPaid)
  )
}

/**
 * Ücretsiz teklif hakkı sayısı → "2 ücretsiz teklif hakkı"; sıfırsa boş metin.
 * Backend bu sayı için etiket döndürmüyor; yalnız sayı metne gömülür (hesap yok).
 */
export function freeRightsCaption(freeOfferRights: number): string {
  return freeOfferRights > 0 ? `${freeOfferRights} ücretsiz teklif hakkı` : ''
}

export type WalletTransactionView = {
  direction: 'in' | 'out'
  title: string
  description: string
  /** Tutar hareketi varsa "+₺500", yoksa hak hareketi "+1 hak". */
  amount: string
  after: string
}

/**
 * Defter satırını core `TransactionRow` prop'larına eşler. Etiketlerin hepsi
 * backend'den hazır gelir; burada yalnız hangisinin gösterileceği seçilir.
 */
export function toTransactionView(transaction: WalletTransaction): WalletTransactionView {
  const hasAmount = transaction.amountKurus !== 0
  const delta = hasAmount ? transaction.amountKurus : transaction.freeRightsDelta
  return {
    direction: delta > 0 ? 'in' : 'out',
    title: transaction.typeLabel,
    description: transaction.listingTitle ?? transaction.description,
    amount: hasAmount ? transaction.amountLabel : transaction.freeRightsLabel,
    after: transaction.balanceAfterLabel,
  }
}
