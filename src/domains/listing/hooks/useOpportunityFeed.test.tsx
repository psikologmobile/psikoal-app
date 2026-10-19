import { act, renderHook, waitFor } from '@testing-library/react-native'
import MockAdapter from 'axios-mock-adapter'

import { withBudget } from '../components/expert/OpportunityFilterSheet'

import { countActiveFilters, toQueryFilters, useOpportunityFeed } from './useOpportunityFeed'

import { axiosInstance } from '@/lib/api'
import { createTestQueryClient, createWrapper } from '@/test-utils/query'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
}))
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => 'token'),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}))

describe('opportunity filter helpers', () => {
  it('drops the local budget key and counts active filters', () => {
    const filters = withBudget({ city: 'Konya', invitedOnly: true }, 'b2')
    expect(filters).toMatchObject({ budgetKey: 'b2', budgetMin: 1500, budgetMax: 3000 })
    expect(toQueryFilters(filters)).toEqual({
      city: 'Konya',
      invitedOnly: true,
      budgetMin: 1500,
      budgetMax: 3000,
    })
    expect(countActiveFilters(filters)).toBe(3)
    expect(withBudget(filters, undefined)).toMatchObject({
      budgetKey: undefined,
      budgetMin: undefined,
    })
  })
})

describe('useOpportunityFeed', () => {
  it('builds preset chips, applies them and cycles the sort', async () => {
    const mock = new MockAdapter(axiosInstance)
    mock.onGet('/listings').reply(200, { data: [], meta: { page: 1, total: 0, perPage: 20 } })
    const queryClient = createTestQueryClient()
    const { result } = renderHook(
      () => useOpportunityFeed({ city: 'Konya', specializations: ['Kaygı', 'Stres', 'Uyku'] }),
      { wrapper: createWrapper(queryClient) }
    )

    expect(result.current.chips.map((c) => c.label)).toEqual([
      'Tümü',
      'Davetler',
      'Online',
      'Konya',
      'Kaygı',
      'Stres',
    ])
    expect(result.current.chips[0]?.selected).toBe(true)

    act(() => result.current.chips[1]?.onPress())
    expect(result.current.filters).toEqual({ invitedOnly: true })
    expect(result.current.chips[1]?.selected).toBe(true)
    expect(result.current.activeFilterCount).toBe(1)

    expect(result.current.sortLabel).toBe('En yeni')
    act(() => result.current.cycleSort())
    expect(result.current.sortLabel).toBe('Yüksek bütçe')

    await waitFor(() =>
      expect(mock.history.get.some((r) => r.params?.invitedOnly === true)).toBe(true)
    )
    expect(mock.history.get.some((r) => r.params?.sort === 'budget_desc')).toBe(true)

    act(() => result.current.clearFilters())
    expect(result.current.filters).toEqual({})
    mock.restore()
    queryClient.clear()
  })
})
