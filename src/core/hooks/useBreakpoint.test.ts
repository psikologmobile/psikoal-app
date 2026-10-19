import { Platform } from 'react-native'

import { renderHook } from '@testing-library/react-native'

import { getBreakpoint, useBreakpoint } from './useBreakpoint'

const mockUseWindowDimensions = jest.fn()
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => mockUseWindowDimensions(),
}))

describe('getBreakpoint', () => {
  it('native her genişlikte compact', () => {
    expect(getBreakpoint(1440, false)).toBe('compact')
    expect(getBreakpoint(390, false)).toBe('compact')
  })

  it('web: ≤640 compact · 641–1100 medium · >1100 wide', () => {
    expect(getBreakpoint(640, true)).toBe('compact')
    expect(getBreakpoint(641, true)).toBe('medium')
    expect(getBreakpoint(1024, true)).toBe('medium')
    expect(getBreakpoint(1100, true)).toBe('medium')
    expect(getBreakpoint(1101, true)).toBe('wide')
    expect(getBreakpoint(1440, true)).toBe('wide')
  })
})

describe('useBreakpoint', () => {
  const originalOS = Platform.OS
  afterEach(() => {
    Platform.OS = originalOS
  })

  function mockWidth(width: number) {
    mockUseWindowDimensions.mockReturnValue({ width, height: 900, scale: 1, fontScale: 1 })
  }

  it('native: mobil yerleşim', () => {
    Platform.OS = 'ios'
    mockWidth(1440)
    const { result } = renderHook(() => useBreakpoint())
    expect(result.current).toEqual({
      breakpoint: 'compact',
      width: 1440,
      isWeb: false,
      isWebLayout: false,
      isWide: false,
    })
  })

  it('web masaüstü: wide', () => {
    Platform.OS = 'web'
    mockWidth(1440)
    const { result } = renderHook(() => useBreakpoint())
    expect(result.current.breakpoint).toBe('wide')
    expect(result.current.isWebLayout).toBe(true)
    expect(result.current.isWide).toBe(true)
  })

  it('web tablet: medium', () => {
    Platform.OS = 'web'
    mockWidth(1024)
    const { result } = renderHook(() => useBreakpoint())
    expect(result.current.breakpoint).toBe('medium')
    expect(result.current.isWebLayout).toBe(true)
    expect(result.current.isWide).toBe(false)
  })
})
