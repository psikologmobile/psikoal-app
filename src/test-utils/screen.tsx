import type { ReactElement, ReactNode } from 'react'

import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { createTestQueryClient, createWrapper } from './query'

/**
 * Ekran smoke testleri için ortak yardımcılar.
 *
 * - `renderScreen(ui)`: güvenli alan (eşzamanlı ölçü) + yeniden denemesiz,
 *   izole QueryClient ile çizer; `rerender` sağlayıcıları korur.
 * - Modül sahteleri: `jest.mock('expo-router', () => require('@/test-utils/screen').expoRouterMock)`
 *   (aynı kalıp `asyncStorageMock`, `secureStoreMock` için).
 * - Sorgu sahteleri: `queryResult`, `loadingQuery`, `errorQuery`.
 */

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
}

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  navigate: jest.fn(),
}

export const mockPathname: { current: string } = { current: '/' }

export const mockSearchParams: { current: Record<string, string> } = { current: {} }

export const expoRouterMock = {
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockSearchParams.current,
  usePathname: () => mockPathname.current,
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

/** Ekranı güvenli alan + izole QueryClient sağlayıcılarıyla çizer. */
export function renderScreen(ui: ReactElement) {
  const QueryWrapper = createWrapper(createTestQueryClient())
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SafeAreaProvider initialMetrics={METRICS}>
        <QueryWrapper>{children}</QueryWrapper>
      </SafeAreaProvider>
    )
  }
  return render(ui, { wrapper: Wrapper })
}

type BreakpointState = {
  breakpoint: 'compact' | 'medium' | 'wide'
  width: number
  isWeb: boolean
  isWebLayout: boolean
  isWide: boolean
}

export const COMPACT_LAYOUT: BreakpointState = {
  breakpoint: 'compact',
  width: 390,
  isWeb: false,
  isWebLayout: false,
  isWide: false,
}
export const WIDE_LAYOUT: BreakpointState = {
  breakpoint: 'wide',
  width: 1440,
  isWeb: true,
  isWebLayout: true,
  isWide: true,
}
export const MEDIUM_LAYOUT: BreakpointState = {
  breakpoint: 'medium',
  width: 1024,
  isWeb: true,
  isWebLayout: true,
  isWide: false,
}

/** Web yerleşim testleri: `mockLayout.current = WIDE_LAYOUT`. Her testten sonra COMPACT'a döndür. */
export const mockLayout: { current: BreakpointState } = { current: COMPACT_LAYOUT }

/** `jest.mock('@/core/hooks/useBreakpoint', () => require('@/test-utils/screen').breakpointMock)` */
export const breakpointMock = {
  getBreakpoint: () => mockLayout.current.breakpoint,
  useBreakpoint: () => mockLayout.current,
}
