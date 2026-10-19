import type { WalletTransactionType } from './types/wallet.types'

export const walletKeys = {
  all: ['wallet'] as const,
  me: () => [...walletKeys.all, 'me'] as const,
  transactionLists: () => [...walletKeys.all, 'transactions'] as const,
  transactions: (type?: WalletTransactionType) =>
    [...walletKeys.transactionLists(), type ?? 'all'] as const,
  payments: () => [...walletKeys.all, 'payments'] as const,
  // Anonim ve uzun ömürlü: bakiye invalidation'ı bunu boşa tazelemesin diye ayrı kök.
  topupOptions: () => ['wallet-topup-options'] as const,
} as const

export const WALLET_STALE_TIME = 30 * 1000
export const TOPUP_OPTIONS_STALE_TIME = 10 * 60 * 1000

/** Backend varsayılanı 20, üst sınırı 50 (WalletFieldLimits). */
export const WALLET_TRANSACTIONS_PER_PAGE = 20
export const WALLET_PAYMENTS_PER_PAGE = 20

/** Sunucunun cüzdan/ödeme hata kodları (ErrorKeys). */
export const WALLET_ERROR_CODES = {
  /** POST /offers → 422: bakiye teklif ücretine yetmiyor ve ücretsiz hak yok. */
  insufficientBalance: 'INSUFFICIENT_BALANCE',
  /** POST /payments/paytr/init → 422: tutar topup-options aralığı dışında. */
  topupAmountOutOfRange: 'TOPUP_AMOUNT_OUT_OF_RANGE',
  /** POST /payments/paytr/init → 403: uzman profili henüz onaylanmadı. */
  topupExpertNotApproved: 'TOPUP_EXPERT_NOT_APPROVED',
  /** GET /wallet/payments/{id}/invoice → 404: fatura henüz yüklenmedi. */
  invoiceNotFound: 'INVOICE_NOT_FOUND',
  /** Fatura yalnız ödenmiş ödeme için var. */
  invoicePaymentNotPaid: 'INVOICE_PAYMENT_NOT_PAID',
  /** Danışan token'ı cüzdan uçlarında. */
  expertRoleRequired: 'EXPERT_ROLE_REQUIRED',
} as const

/**
 * App Store 3.1.1 / Google Play ödeme politikası: MOBİL uygulamada bakiye yükleme
 * düğmesi, bağlantı, adres ya da fiyat listesi YOKTUR. Yalnız bu düz metin gösterilir.
 * Web uygulamasında `/bakiye` sayfası yükleme yoludur.
 */
export const INSUFFICIENT_BALANCE_MESSAGE =
  'Teklif göndermek için bakiyeniz yetersiz. Bakiye yüklemek için web sitemizi ziyaret edin.'

/**
 * Web uygulamasındaki bakiye yükleme sayfası (PayTR). YALNIZ `Platform.OS === 'web'`
 * iken bağlantı verilir; mobil uygulamada düz metin gösterilir (mağaza kuralı).
 */
export const TOPUP_WEB_PATH = '/bakiye'

/** Bakiyem süzgeçleri. `type` sunucu süzgecidir; "Haklar" hak hareketi olan satırlardır. */
export const WALLET_TRANSACTION_FILTERS = [
  { key: 'all', label: 'Tümü' },
  { key: 'topup', label: 'Yüklemeler', type: 'TOPUP' },
  { key: 'fee', label: 'Teklif ücretleri', type: 'OFFER_FEE' },
  { key: 'rights', label: 'Haklar' },
] as const satisfies ReadonlyArray<{ key: string; label: string; type?: WalletTransactionType }>

export type WalletTransactionFilterKey = (typeof WALLET_TRANSACTION_FILTERS)[number]['key']
