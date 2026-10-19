import topupResponse from './__fixtures__/topup-options.response.json'
import walletResponse from './__fixtures__/wallet-me.response.json'
import paymentsResponse from './__fixtures__/wallet-payments.response.json'
import transactionsResponse from './__fixtures__/wallet-transactions.response.json'
import {
  InvoiceUrlResponseSchema,
  PayTrInitRequestSchema,
  PayTrInitResponseSchema,
  TopupOptionsResponseSchema,
  WalletPaymentPageSchema,
  WalletResponseSchema,
  WalletTransactionPageSchema,
} from './wallet.schema'

describe('wallet şemaları (Revize 2 §2.2)', () => {
  it('GET /wallet/me yanıtını okur', () => {
    expect(WalletResponseSchema.parse(walletResponse).data.balanceLabel).toBe('₺1.250')
  })

  it('GET /wallet/transactions: null ilan/teklif/ödeme alanlarını kabul eder', () => {
    const page = WalletTransactionPageSchema.parse(transactionsResponse)
    expect(page.data).toHaveLength(3)
    expect(page.data[1]?.listingId).toBeNull()
  })

  it('bilinmeyen hareket türünü reddeder', () => {
    const broken = {
      ...transactionsResponse,
      data: [{ ...transactionsResponse.data[0], type: 'PURCHASE' }],
    }
    expect(WalletTransactionPageSchema.safeParse(broken).success).toBe(false)
  })

  it('GET /wallet/payments: fatura null ya da nesne olabilir', () => {
    const page = WalletPaymentPageSchema.parse(paymentsResponse)
    expect(page.data[0]?.invoice?.fileName).toBe('fatura-2026-0012.pdf')
    expect(page.data[1]?.invoice).toBeNull()
  })

  it('fatura adresi ve topup seçenekleri', () => {
    expect(
      InvoiceUrlResponseSchema.parse({ data: { url: 'https://s.test/f.pdf?sig=1' } }).data.url
    ).toContain('https://')
    expect(TopupOptionsResponseSchema.parse(topupResponse).data.presets).toHaveLength(4)
  })

  it('PayTR init gövdesi kuruş tam sayı ister', () => {
    expect(PayTrInitRequestSchema.safeParse({ amountKurus: 100000 }).success).toBe(true)
    expect(PayTrInitRequestSchema.safeParse({ amountKurus: 10.5 }).success).toBe(false)
    expect(PayTrInitRequestSchema.safeParse({ amountKurus: 0 }).success).toBe(false)
    expect(
      PayTrInitResponseSchema.parse({
        data: {
          iframeToken: 't',
          merchantOid: 'PA1',
          iframeUrl: 'https://www.paytr.com/odeme/guvenli/t',
        },
      }).data.merchantOid
    ).toBe('PA1')
  })
})
