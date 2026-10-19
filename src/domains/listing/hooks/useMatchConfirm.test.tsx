import { act, renderHook } from '@testing-library/react-native'

import { useMatchConfirm } from './useMatchConfirm'

const mockMutate = jest.fn()
const mockReset = jest.fn()
let mockError: unknown = null

jest.mock('../api/useMarkMatchedMutation', () => ({
  useMarkMatchedMutation: () => ({
    mutate: mockMutate,
    reset: mockReset,
    isPending: false,
    error: mockError,
  }),
}))
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
}))
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}))

const TARGET = { offerId: 'o1', expertName: 'Elif Kaya', expertInitials: 'EK' }

beforeEach(() => {
  mockMutate.mockReset()
  mockError = null
})

describe('useMatchConfirm', () => {
  it('sorar, onaylar ve eşleşme kimliğiyle geri çağırır', () => {
    const onMatched = jest.fn()
    const { result } = renderHook(() => useMatchConfirm({ listingId: 'l1', onMatched }))
    act(() => result.current.ask(TARGET))
    expect(result.current.target).toEqual(TARGET)
    expect(mockReset).toHaveBeenCalled()
    act(() => result.current.confirm())
    expect(mockMutate).toHaveBeenCalledWith({ listingId: 'l1', offerId: 'o1' }, expect.any(Object))
    const { onSuccess } = mockMutate.mock.calls[0]?.[1] as {
      onSuccess: (r: { matchId: string }) => void
    }
    act(() => onSuccess({ matchId: 'm1' }))
    expect(onMatched).toHaveBeenCalledWith('m1')
    expect(result.current.target).toBeNull()
  })

  it('vazgeçer; ilan yoksa göndermez; hata metnini verir', () => {
    mockError = new Error('İlan artık açık değil')
    const { result } = renderHook(() =>
      useMatchConfirm({ listingId: undefined, onMatched: jest.fn() })
    )
    act(() => result.current.confirm())
    act(() => result.current.ask(TARGET))
    act(() => result.current.confirm())
    expect(mockMutate).not.toHaveBeenCalled()
    expect(result.current.errorMessage).toBeTruthy()
    act(() => result.current.cancel())
    expect(result.current.target).toBeNull()
  })
})
