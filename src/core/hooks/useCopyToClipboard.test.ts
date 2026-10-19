import { act, renderHook } from '@testing-library/react-native'

import * as Clipboard from 'expo-clipboard'

import { useCopyToClipboard } from './useCopyToClipboard'

jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(() => Promise.resolve(true)) }))

describe('useCopyToClipboard', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('copies, marks the key and resets after the delay', async () => {
    const { result } = renderHook(() => useCopyToClipboard(1000))
    await act(async () => {
      await result.current.copy('link', 'https://psikoal.com/davet/ABC')
    })
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('https://psikoal.com/davet/ABC')
    expect(result.current.copiedKey).toBe('link')

    await act(async () => {
      await result.current.copy('code', 'ABC')
    })
    expect(result.current.copiedKey).toBe('code')

    act(() => jest.advanceTimersByTime(1000))
    expect(result.current.copiedKey).toBeNull()
  })

  it('stays silent when the clipboard fails and clears timer on unmount', async () => {
    jest.mocked(Clipboard.setStringAsync).mockRejectedValueOnce(new Error('no clipboard'))
    const { result, unmount } = renderHook(() => useCopyToClipboard())
    await act(async () => {
      await result.current.copy('link', 'x')
    })
    expect(result.current.copiedKey).toBeNull()

    await act(async () => {
      await result.current.copy('link', 'y')
    })
    const clear = jest.spyOn(global, 'clearTimeout')
    unmount()
    expect(clear).toHaveBeenCalled()
    clear.mockRestore()
  })

  it('unmounts cleanly without a pending timer', () => {
    const { unmount } = renderHook(() => useCopyToClipboard())
    expect(() => unmount()).not.toThrow()
  })
})
