import { View } from 'react-native'

import { useRouter } from 'expo-router'

import { Button } from '@/core/components/atoms/Button'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState, ErrorBanner, ScreenHeader } from '@/core/components/molecules'
import { Screen } from '@/core/components/templates'
import { useOpenInvoice, useWalletPaymentsInfiniteQuery } from '@/domains/wallet'

/**
 * /wallet/invoices — "Faturalarım": bakiye yüklemeleri ve admin'in yüklediği
 * PDF faturalar. GEÇİCİ iskelet: tasarım ekranı ayrı işte kurulacak.
 */
export default function WalletInvoicesScreen() {
  const router = useRouter()
  const paymentsQuery = useWalletPaymentsInfiniteQuery()
  const { openInvoice, pendingPaymentId, errorMessage } = useOpenInvoice()
  const payments = paymentsQuery.data?.pages.flatMap((page) => page.data) ?? []

  return (
    <Screen testID="screen-wallet-invoices">
      <ScreenHeader title="Faturalarım" onBack={() => router.back()} />

      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

      {paymentsQuery.isLoading ? (
        <Skeleton variant="rect" height={64} />
      ) : paymentsQuery.isError ? (
        <EmptyState
          variant="compact"
          icon="WifiOff"
          title="Ödemeler alınamadı"
          ctaLabel="Tekrar dene"
          onCta={() => void paymentsQuery.refetch()}
        />
      ) : payments.length === 0 ? (
        <EmptyState
          variant="compact"
          icon="FileText"
          title="Henüz ödeme yok"
          description="Bakiye yüklemeleriniz ve faturaları burada listelenir."
        />
      ) : (
        payments.map((payment) => (
          <View
            key={payment.id}
            className="flex-row items-center gap-3 rounded-3xl border border-border bg-surface p-4"
          >
            <View className="flex-1 gap-0.5">
              <Text variant="title">{payment.amountLabel}</Text>
              <Text variant="bodySm" color="muted">
                {payment.statusLabel}
              </Text>
            </View>
            {payment.invoice ? (
              <Button
                label="Faturayı aç"
                size="sm"
                variant="secondary"
                isLoading={pendingPaymentId === payment.id}
                onPress={() => openInvoice(payment.id)}
              />
            ) : null}
          </View>
        ))
      )}
      {paymentsQuery.hasNextPage ? (
        <Button
          label="Daha fazla"
          variant="link"
          isLoading={paymentsQuery.isFetchingNextPage}
          onPress={() => void paymentsQuery.fetchNextPage()}
        />
      ) : null}
    </Screen>
  )
}
