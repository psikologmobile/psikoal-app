import { z } from 'zod'

// Sözleşme: docs/design-v2/API-REVIZE-2.md §2.2 + backend Dtos/Wallet/*, Dtos/Payment/*.
// Para her yerde KURUŞ (`*Kurus`, tam sayı) ve hazır Türkçe etiket (`*Label`, "₺1.250").
// Uygulama etiketleri yalnız gösterir; tutar hesaplamaz.

const kurus = z.number().int()
// Backend tüm zaman damgalarını "Z" sonekiyle yazar; ofsetli değer de kabul edilir.
const timestamp = z.string().datetime({ offset: true })

const pageMeta = z.object({
  page: z.number().int().min(1),
  total: z.number().int().min(0),
  perPage: z.number().int().min(1),
})

/** GET /wallet/me → data */
export const WalletSchema = z.object({
  balanceKurus: kurus.min(0),
  balanceLabel: z.string(),
  freeOfferRights: z.number().int().min(0),
  referralCode: z.string(),
  referralLink: z.string(),
})

export const WalletResponseSchema = z.object({ data: WalletSchema })

export const WalletTransactionTypeSchema = z.enum([
  'TOPUP',
  'OFFER_FEE',
  'OFFER_FREE_RIGHT',
  'WELCOME_RIGHT',
  'REFERRAL_RIGHT',
  'ADMIN_GIFT',
  'ADMIN_ADJUST',
])

/** GET /wallet/transactions → data[] */
export const WalletTransactionSchema = z.object({
  id: z.string().uuid(),
  type: WalletTransactionTypeSchema,
  typeLabel: z.string(),
  amountKurus: kurus,
  /** "+₺500" / "−₺625" / "" (hak hareketinde tutar yok). */
  amountLabel: z.string(),
  freeRightsDelta: z.number().int(),
  /** "+1 hak" / "−1 hak" / "". */
  freeRightsLabel: z.string(),
  balanceAfterKurus: kurus,
  balanceAfterLabel: z.string(),
  description: z.string(),
  listingId: z.string().uuid().nullable(),
  listingTitle: z.string().nullable(),
  offerId: z.string().uuid().nullable(),
  paymentId: z.string().uuid().nullable(),
  createdAt: timestamp,
  timeLabel: z.string(),
})

export const WalletTransactionPageSchema = z.object({
  data: z.array(WalletTransactionSchema),
  meta: pageMeta,
})

export const WalletPaymentStatusSchema = z.enum(['PENDING', 'PAID', 'FAILED'])

export const WalletInvoiceSchema = z.object({
  fileName: z.string(),
  uploadedAt: timestamp,
})

/** GET /wallet/payments → data[] */
export const WalletPaymentSchema = z.object({
  id: z.string().uuid(),
  amountKurus: kurus,
  amountLabel: z.string(),
  status: WalletPaymentStatusSchema,
  statusLabel: z.string(),
  createdAt: timestamp,
  completedAt: timestamp.nullable(),
  /** Admin PDF yüklediyse dolu; yoksa fatura henüz hazır değil. */
  invoice: WalletInvoiceSchema.nullable(),
})

export const WalletPaymentPageSchema = z.object({
  data: z.array(WalletPaymentSchema),
  meta: pageMeta,
})

/** GET /wallet/payments/{id}/invoice → data: 5 dk geçerli imzalı adres. */
export const InvoiceUrlResponseSchema = z.object({
  data: z.object({ url: z.string().url() }),
})

/** GET /wallet/topup-options (anonim) → data */
export const TopupOptionsSchema = z.object({
  presets: z.array(z.object({ amountKurus: kurus.min(1), label: z.string() })),
  minKurus: kurus.min(0),
  maxKurus: kurus.min(0),
  vatNote: z.string(),
})

export const TopupOptionsResponseSchema = z.object({ data: TopupOptionsSchema })

/** POST /payments/paytr/init gövdesi. Aralık kontrolünün son sözü sunucuda. */
export const PayTrInitRequestSchema = z.object({
  amountKurus: kurus.min(1),
})

export const PayTrInitResultSchema = z.object({
  iframeToken: z.string(),
  merchantOid: z.string(),
  iframeUrl: z.string().url(),
})

export const PayTrInitResponseSchema = z.object({ data: PayTrInitResultSchema })
