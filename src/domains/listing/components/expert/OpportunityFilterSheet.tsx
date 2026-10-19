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
  const { data: categories } = useCategoriesQuery()
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
        <View className="gap-2">
          <Text variant="label">Alan</Text>
          <View className="flex-row flex-wrap gap-2">
            {(categories ?? []).map((category) => (
              <ChoiceChip
                key={category.id}
                label={category.name}
                selected={draft.specialization?.includes(category.name) ?? false}
                onPress={() =>
                  setDraft((d) => ({
                    ...d,
                    specialization: toggle(d.specialization, category.name),
                  }))
                }
              />
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text variant="label">Görüşme şekli</Text>
          <View className="flex-row flex-wrap gap-2">
            {SESSION_TYPES.map((type) => (
              <ChoiceChip
                key={type}
                label={SESSION_MODE_LABELS[type]}
                selected={draft.sessionType?.includes(type) ?? false}
                onPress={() =>
                  setDraft((d) => ({ ...d, sessionType: toggle(d.sessionType, type) }))
                }
              />
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text variant="label">Bütçe (seans başı)</Text>
          <View className="flex-row flex-wrap gap-2">
            {OPPORTUNITY_BUDGETS.map((budget) => (
              <FilterChip
                key={budget.key}
                label={budget.label}
                selected={draft.budgetKey === budget.key}
                onPress={() =>
                  setDraft((d) =>
                    withBudget(d, d.budgetKey === budget.key ? undefined : budget.key)
                  )
                }
              />
            ))}
          </View>
        </View>

        <CityPicker
          optional
          value={draft.city ?? null}
          onChange={(city) => setDraft((d) => ({ ...d, city }))}
        />
        {draft.city ? (
          <Button
            label="Şehri kaldır"
            variant="link"
            size="sm"
            className="self-start"
            onPress={() => setDraft((d) => ({ ...d, city: undefined }))}
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
            value={draft.invitedOnly ?? false}
            onValueChange={(invitedOnly) => setDraft((d) => ({ ...d, invitedOnly }))}
            accessibilityLabel="Yalnız davetler"
          />
        </View>
      </ScrollView>
    </BottomSheet>
  )
}
