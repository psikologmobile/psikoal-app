import { useState } from 'react'

import { ScrollView, View } from 'react-native'

import { useRouter } from 'expo-router'

import { WalletWeb } from './WalletWeb'

import type { WalletTransactionFilterKey } from '@/domains/wallet'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Button } from '@/core/components/atoms/Button'
import { FilterChip } from '@/core/components/atoms/FilterChip'
import { Icon } from '@/core/components/atoms/Icon'
import { IconButton } from '@/core/components/atoms/IconButton'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { ScreenHeader } from '@/core/components/molecules/ScreenHeader'
import { SettingsGroup, SettingsRow } from '@/core/components/molecules/SettingsRow'
import { TransactionRow } from '@/core/components/molecules/TransactionRow'
import { HeroCard } from '@/core/components/organisms/HeroCard'
import { Screen } from '@/core/components/templates'
import { useBreakpoint, useRefresh } from '@/core/hooks'
import { Coin, CountRoll, EnterUp, Pop, Spin } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import {
  TOPUP_WEB_PATH,
  TopupNotice,
  WALLET_TRANSACTION_FILTERS,
  isRightsTransaction,
  toTransactionView,
  useWalletForegroundRefresh,
  useWalletQuery,
  useWalletTransactionsInfiniteQuery,
} from '@/domains/wallet'

/**
 * Bakiyem (tasarım: b4_Bakiyem). Bakiye (coin + count-roll), ücretsiz haklar,
 * tür süzgeçli hareketler. Durumlar: dolu · bakiyeSıfır · boş · yükleniyor.
 * Mobilde yükleme yolu YOK — yalnız düz metin; web'de "Bakiye yükle" → /bakiye.
 */
export function WalletScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const [filter, setFilter] = useState<WalletTransactionFilterKey>('all')
  const selected = WALLET_TRANSACTION_FILTERS.find((f) => f.key === filter)
  const serverType = selected && 'type' in selected ? selected.type : undefined

  const walletQuery = useWalletQuery()
  const transactionsQuery = useWalletTransactionsInfiniteQuery({ type: serverType })
  const { invalidateWallet } = useWalletForegroundRefresh()
  const { isRefreshing, onRefresh } = useRefresh(walletQuery, transactionsQuery, {
    refetch: invalidateWallet,
  })

  const wallet = walletQuery.data
  const loaded = transactionsQuery.data?.pages.flatMap((page) => page.data) ?? []
  const transactions = filter === 'rights' ? loaded.filter(isRightsTransaction) : loaded
  const isFetching = walletQuery.isFetching || transactionsQuery.isFetching
  const { isWebLayout, isWide } = useBreakpoint()

  if (isWebLayout) {
    return (
      <Screen
        testID="screen-wallet"
        refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentClassName="gap-[22px]"
      >
        <WalletWeb
          wallet={wallet}
          isWalletLoading={walletQuery.isLoading}
          isWide={isWide}
          filter={filter}
          onFilter={setFilter}
          transactions={transactions}
          isLoading={transactionsQuery.isLoading}
          isError={transactionsQuery.isError}
          onRetry={() => void transactionsQuery.refetch()}
          hasNextPage={Boolean(transactionsQuery.hasNextPage)}
          isFetchingNextPage={transactionsQuery.isFetchingNextPage}
          onNextPage={() => void transactionsQuery.fetchNextPage()}
          // REASON: /bakiye web yükleme sayfası; typed routes onu tanımıyor.
          onTopup={() => router.push(TOPUP_WEB_PATH as never)}
          onInvoices={() => router.push('/wallet/invoices')}
          onReferral={() => router.push('/referral')}
        />
      </Screen>
    )
  }

  return (
    <Screen
      testID="screen-wallet"
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      <EnterUp>
        <ScreenHeader
          title="Bakiyem"
          right={
            <IconButton accessibilityLabel="Yenile" onPress={onRefresh} isDisabled={isFetching}>
              <Spin enabled={isFetching} duration={1000}>
                <Icon name="RefreshCw" size={20} color={colors.text} strokeWidth={2.2} />
              </Spin>
            </IconButton>
          }
        />
      </EnterUp>

      <EnterUp index={1}>
        <HeroCard title="Kullanılabilir bakiye" decor="orbit" className="gap-1.5">
          <View pointerEvents="none" className="absolute right-6 top-6" accessibilityElementsHidden>
            <Coin>
              <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-primary">
                <Text className="font-display text-2xl text-primary-fg">₺</Text>
              </View>
            </Coin>
          </View>
          <Text className="font-body-semibold text-body-sm text-accent-muted">
            Kullanılabilir bakiye
          </Text>
          {walletQuery.isLoading ? (
            <Skeleton variant="line" width="45%" height={52} />
          ) : (
            <CountRoll
              value={wallet?.balanceLabel ?? '—'}
              delay={300}
              charDelay={80}
              offset={40}
              accessibilityLabel={`Bakiye ${wallet?.balanceLabel ?? 'bilinmiyor'}`}
              className="font-display text-[56px] leading-[60px] text-accent-fg"
            />
          )}
          <View className="mt-2.5 flex-row gap-2">
            <Pop delay={700}>
              <View className="rounded-full bg-bg px-3 py-1.5">
                <Text className="font-body-bold text-label">
                  Ücretsiz hak · {wallet?.freeOfferRights ?? 0}
                </Text>
              </View>
            </Pop>
          </View>
        </HeroCard>
      </EnterUp>

      <EnterUp index={2}>
        <TopupNotice
          message="Bakiye yükleme web sitemizden yapılır."
          testID="wallet-topup-notice"
        />
      </EnterUp>

      <EnterUp index={2}>
        <SettingsGroup>
          <SettingsRow
            icon="FileText"
            label="Faturalarım"
            onPress={() => router.push('/wallet/invoices')}
          />
          <SettingsRow
            icon="Gift"
            label="Davet linkim"
            hint={wallet ? `Kod ${wallet.referralCode}` : undefined}
            onPress={() => router.push('/referral')}
            isLast
          />
        </SettingsGroup>
      </EnterUp>

      <EnterUp index={3}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          {WALLET_TRANSACTION_FILTERS.map((f) => (
            <FilterChip
              key={f.key}
              label={f.label}
              size="sm"
              selected={filter === f.key}
              onPress={() => setFilter(f.key)}
            />
          ))}
        </ScrollView>
      </EnterUp>

      {transactionsQuery.isLoading ? (
        <View className="gap-2" testID="wallet-loading">
          {[0, 100, 200].map((delay) => (
            <Skeleton key={delay} variant="rect" height={64} borderRadius="lg" delay={delay} />
          ))}
        </View>
      ) : transactionsQuery.isError ? (
        <ErrorBanner
          title="Hareketler alınamadı"
          description="Bağlantını kontrol edip tekrar dene."
          onRetry={() => void transactionsQuery.refetch()}
        />
      ) : transactions.length === 0 ? (
        <EmptyState
          variant="compact"
          icon="Wallet"
          title={filter === 'all' ? 'Henüz hareket yok' : 'Bu süzgeçte hareket yok'}
          description={
            filter === 'all'
              ? 'Bakiye yüklediğinde ya da teklif gönderdiğinde burada görünür.'
              : 'Başka bir süzgeç seçebilirsin.'
          }
        />
      ) : (
        <View>
          {transactions.map((transaction, index) => {
            const view = toTransactionView(transaction)
            return (
              <EnterUp key={transaction.id} index={Math.min(8, index + 3)}>
                <TransactionRow
                  {...view}
                  description={`${view.description} · ${transaction.timeLabel}`}
                  isLast={index === transactions.length - 1}
                />
              </EnterUp>
            )
          })}
        </View>
      )}

      {transactionsQuery.hasNextPage ? (
        <Button
          label="Daha fazla göster"
          variant="link"
          isLoading={transactionsQuery.isFetchingNextPage}
          onPress={() => void transactionsQuery.fetchNextPage()}
        />
      ) : null}
    </Screen>
  )
}
