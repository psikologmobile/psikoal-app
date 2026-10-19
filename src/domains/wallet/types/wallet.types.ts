import type {
  PayTrInitRequestSchema,
  PayTrInitResultSchema,
  TopupOptionsSchema,
  WalletPaymentPageSchema,
  WalletPaymentSchema,
  WalletPaymentStatusSchema,
  WalletSchema,
  WalletTransactionPageSchema,
  WalletTransactionSchema,
  WalletTransactionTypeSchema,
} from '../schemas/wallet.schema'
import type { z } from 'zod'

export type Wallet = z.infer<typeof WalletSchema>
export type WalletTransactionType = z.infer<typeof WalletTransactionTypeSchema>
export type WalletTransaction = z.infer<typeof WalletTransactionSchema>
export type WalletTransactionPage = z.infer<typeof WalletTransactionPageSchema>
export type WalletPaymentStatus = z.infer<typeof WalletPaymentStatusSchema>
export type WalletPayment = z.infer<typeof WalletPaymentSchema>
export type WalletPaymentPage = z.infer<typeof WalletPaymentPageSchema>
export type TopupOptions = z.infer<typeof TopupOptionsSchema>
export type PayTrInitRequest = z.infer<typeof PayTrInitRequestSchema>
export type PayTrInitResult = z.infer<typeof PayTrInitResultSchema>

/** Sayfalı uçların ortak meta'sı ({ page, perPage, total }). */
export type WalletPageMeta = WalletTransactionPage['meta']
