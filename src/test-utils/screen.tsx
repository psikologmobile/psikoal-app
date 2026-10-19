import type { ReactElement, ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { createTestQueryClient } from './query'

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
}

/**
 * Ekran smoke testleri için sağlayıcılarla çizim: güvenli alan (eşzamanlı
 * ölçü) + yeniden denemesiz QueryClient. Router ve domain hook'ları testte
 * jest.mock ile verilir. `rerender` sağlayıcıları korur.
 */
export function renderScreen(ui: ReactElement) {
  const client = createTestQueryClient()
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SafeAreaProvider initialMetrics={METRICS}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </SafeAreaProvider>
    )
  }
  return render(ui, { wrapper: Wrapper })
}
