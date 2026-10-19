import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/** Testlerde yeniden denemesiz, izole QueryClient. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

export function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

export const TEST_EXPERT = {
  id: '3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
  email: 'uzman@psikoal.test',
  firstName: 'Ayşe',
  lastName: 'Demir',
  role: 'expert' as const,
  isVerified: true,
  avatarUrl: null,
  createdAt: '2026-08-21T22:22:14.704Z',
}

export const TEST_CLIENT = {
  ...TEST_EXPERT,
  id: '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d',
  email: 'danisan@psikoal.test',
  firstName: 'Zeynep',
  lastName: 'Yılmaz',
  role: 'client' as const,
}
