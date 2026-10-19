import { useCallback, useMemo, useState } from 'react'

import { useListingListQuery } from '../api/useListingListQuery'
import { OPPORTUNITY_SORTS } from '../listing.constants'

import type { OpportunityFilters } from '../components/expert/OpportunityFilterSheet'
import type { ListingListFilters } from '../types/listing.types'

export type OpportunityChip = {
  key: string
  label: string
  selected: boolean
  onPress: () => void
}

type UseOpportunityFeedParams = {
  /** Uzmanın şehri (hızlı çip). */
  city?: string | null
  /** Uzmanın alanları (ilk ikisi hızlı çip olur). */
  specializations?: string[]
}

type UseOpportunityFeedReturn = {
  query: ReturnType<typeof useListingListQuery>
  filters: OpportunityFilters
  applyFilters: (filters: OpportunityFilters) => void
  clearFilters: () => void
  /** Hızlı süzgeç çipleri (tek seçim ön ayarlar). */
  chips: OpportunityChip[]
  /** Süzgeç panelinde seçili alan sayısı. */
  activeFilterCount: number
  sortLabel: string
  cycleSort: () => void
}

/** Boş/yanlış değerleri atıp karşılaştırılabilir hale getirir. */
function normalize(filters: OpportunityFilters): string {
  const entries = Object.entries(filters)
    .filter(([key, v]) => {
      if (key === 'budgetMin' || key === 'budgetMax') return false
      if (v === undefined || v === null || v === false || v === '') return false
      return !(Array.isArray(v) && v.length === 0)
    })
    .sort(([a], [b]) => a.localeCompare(b))
  return JSON.stringify(entries)
}

/** Sunucuya gidecek süzgeçler: panelin yerel `budgetKey` alanı atılır. */
export function toQueryFilters({
  budgetKey: _budgetKey,
  ...rest
}: OpportunityFilters): ListingListFilters {
  return rest
}

export function countActiveFilters(filters: OpportunityFilters): number {
  return [
    (filters.specialization?.length ?? 0) > 0,
    (filters.sessionType?.length ?? 0) > 0,
    Boolean(filters.budgetKey),
    Boolean(filters.city),
    Boolean(filters.invitedOnly),
  ].filter(Boolean).length
}

/**
 * Fırsatlar akışının UI durumu: süzgeçler, hızlı çipler ve dönen sıralama.
 * Süzme ve sıralama sunucuda yapılır (GET /listings).
 */
export function useOpportunityFeed({
  city,
  specializations = [],
}: UseOpportunityFeedParams = {}): UseOpportunityFeedReturn {
  const [filters, setFilters] = useState<OpportunityFilters>({})
  const [sortIndex, setSortIndex] = useState(0)
  const sort = OPPORTUNITY_SORTS[sortIndex] ?? OPPORTUNITY_SORTS[0]

  const query = useListingListQuery(
    toQueryFilters(filters),
    sortIndex === 0 ? undefined : sort?.value
  )

  const clearFilters = useCallback(() => setFilters({}), [])

  const specKey = specializations.slice(0, 2).join('|')
  const chips = useMemo<OpportunityChip[]>(() => {
    const presets: Array<{ key: string; label: string; filters: OpportunityFilters }> = [
      { key: 'all', label: 'Tümü', filters: {} },
      { key: 'invited', label: 'Davetler', filters: { invitedOnly: true } },
      { key: 'online', label: 'Online', filters: { sessionType: ['online'] } },
    ]
    if (city) presets.push({ key: `city:${city}`, label: city, filters: { city } })
    specKey
      .split('|')
      .filter(Boolean)
      .forEach((spec) =>
        presets.push({ key: `spec:${spec}`, label: spec, filters: { specialization: [spec] } })
      )
    const current = normalize(filters)
    return presets.map((preset) => ({
      key: preset.key,
      label: preset.label,
      selected: normalize(preset.filters) === current,
      onPress: () => setFilters(preset.filters),
    }))
  }, [city, specKey, filters])

  return {
    query,
    filters,
    applyFilters: setFilters,
    clearFilters,
    chips,
    activeFilterCount: countActiveFilters(filters),
    sortLabel: sort?.label ?? '',
    cycleSort: () => setSortIndex((i) => (i + 1) % OPPORTUNITY_SORTS.length),
  }
}
