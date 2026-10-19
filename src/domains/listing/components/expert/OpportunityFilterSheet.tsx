import { useEffect, useState } from 'react'

import { ScrollView, View } from 'react-native'

import { OPPORTUNITY_BUDGETS, SESSION_MODE_LABELS } from '../../listing.constants'

import type { ListingListFilters, SessionType } from '../../types/listing.types'

import { Button } from '@/core/components/atoms/Button'
import { ChoiceChip } from '@/core/components/atoms/ChoiceChip'
import { FilterChip } from '@/core/components/atoms/FilterChip'
import { Switch } from '@/core/components/atoms/Switch'
import { Text } from '@/core/components/atoms/Text'
import { BottomSheet } from '@/core/components/organisms/BottomSheet'
import { CityPicker } from '@/core/components/organisms/CityPicker'
import { cn } from '@/core/utils/cn'
import { useCategoriesQuery } from '@/domains/category'

const SESSION_TYPES: SessionType[] = ['online', 'yüz_yüze', 'yüz_yüze_online']

export type OpportunityFilters = ListingListFilters & {
  /** OPPORTUNITY_BUDGETS anahtarı (bütçe aralığı tek seçim). */
  budgetKey?: string
}

export type OpportunityFilterSheetProps = {
  visible: boolean
  value: OpportunityFilters
  onApply: (filters: OpportunityFilters) => void
  onClose: () => void
}

function toggle(list: string[] | undefined, item: string): string[] {
  const current = list ?? []
  return current.includes(item) ? current.filter((x) => x !== item) : [...current, item]
}

/** Bütçe anahtarını sorgu alanlarına çevirir (budgetMin / budgetMax). */
export function withBudget(filters: OpportunityFilters, budgetKey?: string): OpportunityFilters {
  const budget = OPPORTUNITY_BUDGETS.find((b) => b.key === budgetKey)
  return {
    ...filters,
    budgetKey: budget?.key,
    budgetMin: budget?.budgetMin,
    budgetMax: budget?.budgetMax,
  }
}

type FieldsProps = {
  value: OpportunityFilters
  /** Güncelleyici alır (mobilde taslağın setState'i, web'de akışın süzgeçleri). */
  onChange: (update: (prev: OpportunityFilters) => OpportunityFilters) => void
  /** panel: web yan süzgeç paneli (büyük harf grup başlıkları, ayraçlar). */
  panel?: boolean
}

function GroupLabel({ children, panel }: { children: string; panel: boolean }) {
  return panel ? (
    <Text variant="overline" color="muted">
      {children}
    </Text>
  ) : (
    <Text variant="label">{children}</Text>
  )
}

/**
 * Süzgeç alanları: alan, görüşme şekli, bütçe, şehir, yalnız davetler. Mobilde
 * sayfa içinde taslağa, web'de (Fırsatlar yan paneli) doğrudan akışa bağlanır.
 */
export function OpportunityFilterFields({ value, onChange, panel = false }: FieldsProps) {
  const { data: categories } = useCategoriesQuery()
  return (
    <>
      <View className={cn('gap-2', panel && 'border-b border-border pb-4')}>
        <GroupLabel panel={panel}>Alan</GroupLabel>
        <View className="flex-row flex-wrap gap-2">
          {(categories ?? []).map((category) => (
            <ChoiceChip
              key={category.id}
              label={category.name}
              selected={value.specialization?.includes(category.name) ?? false}
              onPress={() =>
                onChange((d) => ({
                  ...d,
                  specialization: toggle(d.specialization, category.name),
                }))
              }
            />
          ))}
        </View>
      </View>

      <View className={cn('gap-2', panel && 'border-b border-border pb-4')}>
        <GroupLabel panel={panel}>Görüşme şekli</GroupLabel>
        <View className="flex-row flex-wrap gap-2">
          {SESSION_TYPES.map((type) => (
            <ChoiceChip
              key={type}
              label={SESSION_MODE_LABELS[type]}
              selected={value.sessionType?.includes(type) ?? false}
              onPress={() => onChange((d) => ({ ...d, sessionType: toggle(d.sessionType, type) }))}
            />
          ))}
        </View>
      </View>

      <View className={cn('gap-2', panel && 'border-b border-border pb-4')}>
        <GroupLabel panel={panel}>Bütçe (seans başı)</GroupLabel>
        <View className="flex-row flex-wrap gap-2">
          {OPPORTUNITY_BUDGETS.map((budget) => (
            <FilterChip
              key={budget.key}
              label={budget.label}
              selected={value.budgetKey === budget.key}
              onPress={() =>
                onChange((d) => withBudget(d, d.budgetKey === budget.key ? undefined : budget.key))
              }
            />
          ))}
        </View>
      </View>

      <CityPicker
        optional
        value={value.city ?? null}
        onChange={(city) => onChange((d) => ({ ...d, city }))}
      />
      {value.city ? (
        <Button
          label="Şehri kaldır"
          variant="link"
          size="sm"
          className="self-start"
          onPress={() => onChange((d) => ({ ...d, city: undefined }))}
        />
      ) : null}

      <View className="min-h-touch flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text variant="label">Yalnız davetler</Text>
          <Text className="text-body-sm text-fg-muted">
            Davet linkinle gelen danışanların ilanları
          </Text>
        </View>
        <Switch
          value={value.invitedOnly ?? false}
          onValueChange={(invitedOnly) => onChange((d) => ({ ...d, invitedOnly }))}
          accessibilityLabel="Yalnız davetler"
        />
      </View>
    </>
  )
}

/**
 * Fırsatlar süzgeç paneli: alan, görüşme şekli, bütçe, şehir, yalnız davetler.
 * Taslak panel içinde tutulur; "Uygula" ile ekrana geçer.
 */
export function OpportunityFilterSheet({
  visible,
  value,
  onApply,
  onClose,
}: OpportunityFilterSheetProps) {
  const [draft, setDraft] = useState<OpportunityFilters>(value)

  useEffect(() => {
    if (visible) setDraft(value)
  }, [visible, value])

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Süzgeçler"
      actions={
        <View className="flex-row gap-2.5">
          <View className="flex-1">
            <Button
              label="Temizle"
              variant="outline"
              size="lg"
              fullWidth
              onPress={() => onApply({})}
            />
          </View>
          <View className="flex-1">
            <Button label="Uygula" size="lg" fullWidth onPress={() => onApply(draft)} />
          </View>
        </View>
      }
    >
      <ScrollView className="max-h-[440px]" contentContainerClassName="gap-4 pb-1">
        <OpportunityFilterFields value={draft} onChange={setDraft} />
      </ScrollView>
    </BottomSheet>
  )
}
