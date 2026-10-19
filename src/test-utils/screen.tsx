import type { ReactElement } from 'react'

import { render } from '@testing-library/react-native'

import { createTestQueryClient, createWrapper } from './query'

/** expo-router yerine: `jest.mock('expo-router', () => require('@/test-utils/screen').expoRouterMock)` */
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
}

export const mockSearchParams: { current: Record<string, string> } = { current: {} }

export const expoRouterMock = {
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockSearchParams.current,
  useRootNavigationState: () => ({ key: 'test' }),
}

export const asyncStorageMock = {
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
  multiGet: jest.fn(async (keys: string[]) => keys.map((k) => [k, null])),
  multiRemove: jest.fn(async () => undefined),
}

export const secureStoreMock = {
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}

type QueryState<T> = {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  error: unknown
  refetch: jest.Mock
}

/** Sahte TanStack sorgu sonucu (ekran smoke testleri). */
export function queryResult<T>(
  data: T | undefined,
  state: Partial<Omit<QueryState<T>, 'data'>> = {}
): QueryState<T> {
  return {
    data,
    isLoading: false,
    isError: false,
    isSuccess: data !== undefined,
    error: null,
    refetch: jest.fn(async () => undefined),
    ...state,
  }
}

export const loadingQuery = () => queryResult(undefined, { isLoading: true })
export const errorQuery = () => queryResult(undefined, { isError: true, error: new Error('x') })

/** Ekranı izole QueryClient ile çizer (mutasyon kullanan alt bileşenler için). */
export function renderScreen(ui: ReactElement) {
  return render(ui, { wrapper: createWrapper(createTestQueryClient()) })
}
