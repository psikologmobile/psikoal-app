import { View } from 'react-native'

import { useRouter } from 'expo-router'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Button } from '@/core/components/atoms/Button'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState, ScreenHeader, TransactionRow } from '@/core/components/molecules'
import { Screen } from '@/core/components/templates'
import { useRefresh } from '@/core/hooks'
import {
  freeRightsCaption,
  toTransactionView,
  useWalletForegroundRefresh,
  useWalletQuery,
  useWalletTransactionsInfiniteQuery,
} from '@/domains/wallet'

/**
 * /wallet — uzmanın TL bakiyesi, ücretsiz teklif hakları ve hareketleri.
 * GEÇİCİ iskelet: tasarım ekranı ayrı işte kurulacak. Mobilde yükleme yolu YOK
 * (mağaza kuralı); bakiye web sitesinden yüklenir.
 */
export default function WalletScreen() {
  const router = useRouter()
  const walletQuery = useWalletQuery()
  const transactionsQuery = useWalletTransactionsInfiniteQuery()
  const { invalidateWallet } = useWalletForegroundRefresh()
  const { isRefreshing, onRefresh } = useRefresh(walletQuery, transactionsQuery, {
    refetch: invalidateWallet,
  })

  const wallet = walletQuery.data
  const transactions = transactionsQuery.data?.pages.flatMap((page) => page.data) ?? []

  return (
    <Screen
      testID="screen-wallet"
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      <ScreenHeader title="Bakiyem" onBack={() => router.back()} />

      <View className="gap-1 rounded-3xl border border-border bg-surface p-5">
        {walletQuery.isLoading ? (
          <Skeleton variant="line" width="40%" height={28} />
        ) : (
          <Text variant="h3">{wallet?.balanceLabel ?? '—'}</Text>
        )}
        {wallet && wallet.freeOfferRights > 0 ? (
          <Text variant="bodySm" color="muted">
            {freeRightsCaption(wallet.freeOfferRights)}
          </Text>
        ) : null}
      </View>

      <Button
        label="Faturalarım"
        variant="outline"
        icon="FileText"
        onPress={() => router.push('/wallet/invoices')}
      />

      <Text variant="overline" color="muted">
        Hareketler
      </Text>
      {transactionsQuery.isLoading ? (
        <Skeleton variant="rect" height={64} />
      ) : transactionsQuery.isError ? (
        <EmptyState
          variant="compact"
          icon="WifiOff"
          title="Hareketler alınamadı"
          ctaLabel="Tekrar dene"
          onCta={() => void transactionsQuery.refetch()}
        />
      ) : transactions.length === 0 ? (
        <EmptyState
          variant="compact"
          icon="Wallet"
          title="Henüz hareket yok"
          description="Teklif ücretleri, yüklemeler ve haklar burada listelenir."
        />
      ) : (
        <View>
          {transactions.map((transaction, index) => (
            <TransactionRow
              key={transaction.id}
              {...toTransactionView(transaction)}
              isLast={index === transactions.length - 1}
            />
          ))}
        </View>
      )}
      {transactionsQuery.hasNextPage ? (
        <Button
          label="Daha fazla"
          variant="link"
          isLoading={transactionsQuery.isFetchingNextPage}
          onPress={() => void transactionsQuery.fetchNextPage()}
        />
      ) : null}
    </Screen>
  )
}
