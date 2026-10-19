import type { ReactNode } from 'react'

import { ScrollView, View } from 'react-native'

import type { Wallet, WalletTransaction, WalletTransactionFilterKey } from '@/domains/wallet'

import { Button } from '@/core/components/atoms/Button'
import { FilterChip } from '@/core/components/atoms/FilterChip'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { EmptyState } from '@/core/components/molecules/EmptyState'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { SettingsGroup, SettingsRow } from '@/core/components/molecules/SettingsRow'
import { WebPageHeader } from '@/core/components/molecules/WebPageHeader'
import { WebGrid } from '@/core/components/templates'
import { Coin, CountRoll, EnterUp, Orbit } from '@/core/motion'
import { hoverSurface } from '@/core/theme'
import { cn } from '@/core/utils/cn'
import { WALLET_TRANSACTION_FILTERS, toTransactionView } from '@/domains/wallet'

/** Tablo sütunları (Tür · Açıklama · Tarih · Tutar · Sonra); dar pencerede yatay kayar. */
const COLUMNS = [
  { key: 'kind', label: 'Tür', className: 'w-[200px]' },
  { key: 'desc', label: 'Açıklama', className: 'min-w-[240px] flex-1' },
  { key: 'date', label: 'Tarih', className: 'w-[140px]' },
  { key: 'amount', label: 'Tutar', className: 'w-[110px] items-end' },
  { key: 'after', label: 'Sonra', className: 'w-[110px] items-end' },
] as const
const TABLE_MIN_WIDTH = 'min-w-[800px]'

function Cell({ className, children }: { className: string; children: ReactNode }) {
  return <View className={cn('justify-center px-3.5', className)}>{children}</View>
}

export type WalletWebProps = {
  wallet: Wallet | undefined
  isWalletLoading: boolean
  isWide: boolean
  filter: WalletTransactionFilterKey
  onFilter: (key: WalletTransactionFilterKey) => void
  transactions: WalletTransaction[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onNextPage: () => void
  onTopup: () => void
  onInvoices: () => void
  onReferral: () => void
}

/**
 * Bakiyem — web/tablet yerleşimi (tasarım: b1_Web_Bakiyem): bakiye kahramanı +
 * "Bakiye yükle" (/bakiye), ücretsiz hak döşemesi, hareketler tablosu (yatay kayar).
 */
export function WalletWeb(props: WalletWebProps) {
  const { wallet, transactions } = props

  const hero = (
    <View className="relative gap-2.5 overflow-hidden rounded-4xl bg-accent p-7">
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        className="absolute -right-[70px] -top-[70px]"
      >
        <Orbit duration={14000}>
          <View className="h-[220px] w-[220px] rounded-full border border-dashed border-accent-line" />
        </Orbit>
      </View>
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        className="absolute right-[30px] top-[30px]"
      >
        <Coin>
          <View className="h-14 w-14 items-center justify-center rounded-full bg-primary">
            <Text className="font-display text-[26px] text-primary-fg">₺</Text>
          </View>
        </Coin>
      </View>
      <Text className="font-body-semibold text-body-sm text-accent-muted">
        Kullanılabilir bakiye
      </Text>
      {props.isWalletLoading ? (
        <Skeleton variant="line" width="45%" height={60} />
      ) : (
        <CountRoll
          value={wallet?.balanceLabel ?? '—'}
          delay={300}
          charDelay={80}
          offset={40}
          accessibilityLabel={`Bakiye ${wallet?.balanceLabel ?? 'bilinmiyor'}`}
          className="font-display text-[60px] leading-[62px] text-accent-fg"
        />
      )}
      <View className="mt-2 flex-row">
        <Button label="Bakiye yükle" icon="Wallet" size="lg" onPress={props.onTopup} />
      </View>
    </View>
  )

  const rights = (
    <View className="flex-1 gap-1.5 rounded-3xl bg-accent-soft p-[22px]">
      <Text className="text-label text-accent-soft-fg">Ücretsiz teklif hakkı</Text>
      <Text className="font-display text-[44px] leading-[48px] text-accent-soft-fg">
        {String(wallet?.freeOfferRights ?? 0)}
      </Text>
      <Text className="text-label text-accent-soft-fg">
        Teklif gönderirken önce ücretsiz hakkın kullanılır.
      </Text>
    </View>
  )

  const links = (
    <SettingsGroup className="flex-1">
      <SettingsRow icon="FileText" label="Faturalarım" onPress={props.onInvoices} />
      <SettingsRow
        icon="Gift"
        label="Davet linkim"
        hint={wallet ? `Kod ${wallet.referralCode}` : undefined}
        onPress={props.onReferral}
        isLast
      />
    </SettingsGroup>
  )

  return (
    <>
      <WebPageHeader title="Bakiyem" />
      <EnterUp index={1}>
        {props.isWide ? (
          <View className="flex-row items-stretch gap-4">
            <View className="flex-[1.4]">{hero}</View>
            <View className="flex-1">{rights}</View>
            <View className="flex-1">{links}</View>
          </View>
        ) : (
          <View className="gap-4">
            {hero}
            <WebGrid columns={2}>
              {rights}
              {links}
            </WebGrid>
          </View>
        )}
      </EnterUp>

      <EnterUp index={2}>
        <View className="overflow-hidden rounded-3xl border border-border" testID="wallet-table">
          <View className="flex-row flex-wrap items-center justify-between gap-3 px-[18px] py-4">
            <Text variant="title" accessibilityRole="header">
              Hareketler
            </Text>
            <View className="flex-row flex-wrap gap-1.5">
              {WALLET_TRANSACTION_FILTERS.map((f) => (
                <FilterChip
                  key={f.key}
                  label={f.label}
                  size="sm"
                  selected={props.filter === f.key}
                  onPress={() => props.onFilter(f.key)}
                />
              ))}
            </View>
          </View>

          {props.isLoading ? (
            <View className="gap-2 p-4" testID="wallet-loading">
              {[0, 100, 200].map((delay) => (
                <Skeleton key={delay} variant="rect" height={48} borderRadius="sm" delay={delay} />
              ))}
            </View>
          ) : props.isError ? (
            <View className="p-4">
              <ErrorBanner
                title="Hareketler alınamadı"
                description="Bağlantını kontrol edip tekrar dene."
                onRetry={props.onRetry}
              />
            </View>
          ) : transactions.length === 0 ? (
            <EmptyState
              variant="compact"
              icon="Wallet"
              title={props.filter === 'all' ? 'Henüz hareket yok' : 'Bu süzgeçte hareket yok'}
              description={
                props.filter === 'all'
                  ? 'Bakiye yüklediğinde ya da teklif gönderdiğinde burada görünür.'
                  : 'Başka bir süzgeç seçebilirsin.'
              }
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              contentContainerClassName="flex-grow"
            >
              <View className={cn('flex-1', TABLE_MIN_WIDTH)} accessibilityRole="list">
                <View className="h-11 flex-row border-b border-border">
                  {COLUMNS.map((c) => (
                    <Cell key={c.key} className={c.className}>
                      <Text variant="overline" color="muted">
                        {c.label}
                      </Text>
                    </Cell>
                  ))}
                </View>
                {transactions.map((transaction, index) => {
                  const view = toTransactionView(transaction)
                  return (
                    <View
                      key={transaction.id}
                      accessible
                      accessibilityLabel={`${view.title}, ${view.description}, ${transaction.timeLabel}, ${view.amount}`}
                      className={cn(
                        'min-h-[52px] flex-row py-3.5',
                        index < transactions.length - 1 && 'border-b border-border',
                        hoverSurface
                      )}
                    >
                      <Cell className={COLUMNS[0].className}>
                        <Text className="font-body-bold text-body-sm text-fg">{view.title}</Text>
                      </Cell>
                      <Cell className={COLUMNS[1].className}>
                        <Text numberOfLines={1} className="text-body-sm text-fg-muted">
                          {view.description}
                        </Text>
                      </Cell>
                      <Cell className={COLUMNS[2].className}>
                        <Text className="text-body-sm text-fg-muted">{transaction.timeLabel}</Text>
                      </Cell>
                      <Cell className={COLUMNS[3].className}>
                        <Text
                          className={cn(
                            'font-body-heavy text-body-sm',
                            view.direction === 'in' ? 'text-primary-text' : 'text-fg'
                          )}
                        >
                          {view.amount}
                        </Text>
                      </Cell>
                      <Cell className={COLUMNS[4].className}>
                        <Text className="text-body-sm text-fg-muted">{view.after}</Text>
                      </Cell>
                    </View>
                  )
                })}
              </View>
            </ScrollView>
          )}
        </View>
      </EnterUp>

      {props.hasNextPage ? (
        <Button
          label="Daha fazla göster"
          variant="link"
          isLoading={props.isFetchingNextPage}
          onPress={props.onNextPage}
        />
      ) : null}
    </>
  )
}
