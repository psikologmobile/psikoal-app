import { View } from 'react-native'

import type { WalletPayment } from '@/domains/wallet'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Button } from '@/core/components/atoms/Button'
import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { ScreenHeader } from '@/core/components/molecules/ScreenHeader'
import { Screen } from '@/core/components/templates'
import { useRefresh } from '@/core/hooks'
import { EnterUp } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { formatDate } from '@/core/utils/formatDate'
import { useOpenInvoice, useWalletPaymentsInfiniteQuery } from '@/domains/wallet'

type PaymentRowProps = {
  payment: WalletPayment
  isOpening: boolean
  onOpen: () => void
}

function PaymentRow({ payment, isOpening, onOpen }: PaymentRowProps) {
  const colors = useThemeColors()
  const paid = payment.status === 'PAID'
  return (
    <View
      testID={`payment-${payment.id}`}
      className="flex-row items-center gap-3 rounded-xl border border-border bg-surface p-3.5"
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-sm ${paid ? 'bg-accent-soft' : 'bg-bg'}`}
      >
        <Icon name="Receipt" size={18} color={paid ? colors.onAccentSoft : colors.textMuted} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="font-body-bold text-body">{payment.amountLabel}</Text>
        <Text className="text-badge text-fg-muted">
          {payment.statusLabel} · {formatDate(payment.completedAt ?? payment.createdAt, 'long')}
        </Text>
      </View>
      {payment.invoice ? (
        <Button
          label="Faturayı aç"
          size="sm"
          variant="secondary"
          isLoading={isOpening}
          loadingLabel="Açılıyor…"
          onPress={onOpen}
        />
      ) : paid ? (
        <View
          accessible
          accessibilityLabel="Fatura hazırlanıyor"
          className="rounded-full border border-dashed border-border-strong px-2.5 py-1"
        >
          <Text className="font-body-bold text-badge text-fg-muted">Hazırlanıyor</Text>
        </View>
      ) : null}
    </View>
  )
}

/**
 * Faturalarım — bakiye yükleme ödemeleri ve admin'in yüklediği PDF faturalar.
 * Tasarım çizimi yok; Bakiyem'in bileşen ve stiliyle kuruldu.
 */
export function WalletInvoicesScreen() {
  const paymentsQuery = useWalletPaymentsInfiniteQuery()
  const { openInvoice, pendingPaymentId, errorMessage } = useOpenInvoice()
  const { isRefreshing, onRefresh } = useRefresh(paymentsQuery)
  const payments = paymentsQuery.data?.pages.flatMap((page) => page.data) ?? []

  return (
    <Screen
      testID="screen-wallet-invoices"
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      <EnterUp>
        <ScreenHeader title="Faturalarım" />
      </EnterUp>
      <EnterUp index={1}>
        <Text className="text-body-sm text-fg-muted">
          Her bakiye yüklemesinin faturası hazır olduğunda buradan açabilirsin.
        </Text>
      </EnterUp>

      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

      {paymentsQuery.isLoading ? (
        <View className="gap-2" testID="invoices-loading">
          {[0, 100, 200].map((delay) => (
            <Skeleton key={delay} variant="rect" height={68} borderRadius="xl" delay={delay} />
          ))}
        </View>
      ) : paymentsQuery.isError ? (
        <ErrorBanner
          title="Ödemeler alınamadı"
          description="Bağlantını kontrol edip tekrar dene."
          onRetry={() => void paymentsQuery.refetch()}
        />
      ) : payments.length === 0 ? (
        <EmptyState
          icon="Receipt"
          title="Henüz ödeme yok"
          description="Bakiye yüklemelerin ve faturaları burada listelenir."
        />
      ) : (
        <View className="gap-2">
          {payments.map((payment, index) => (
            <EnterUp key={payment.id} index={Math.min(8, index + 2)}>
              <PaymentRow
                payment={payment}
                isOpening={pendingPaymentId === payment.id}
                onOpen={() => openInvoice(payment.id)}
              />
            </EnterUp>
          ))}
        </View>
      )}

      {paymentsQuery.hasNextPage ? (
        <Button
          label="Daha fazla göster"
          variant="link"
          isLoading={paymentsQuery.isFetchingNextPage}
          onPress={() => void paymentsQuery.fetchNextPage()}
        />
      ) : null}
    </Screen>
  )
}
