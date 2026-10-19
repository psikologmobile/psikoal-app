import { renderHook } from '@testing-library/react-native'

import { useExpertApprovalGate } from './useExpertApprovalGate'

import { useAuthStore } from '@/domains/auth'

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@/test-utils/screen').asyncStorageMock
)
jest.mock('expo-secure-store', () => require('@/test-utils/screen').secureStoreMock)

const mockProfile = jest.fn()
jest.mock('../api/useExpertProfileQuery', () => ({
  useExpertProfileQuery: () => mockProfile(),
}))

describe('useExpertApprovalGate', () => {
  beforeEach(() => {
    useAuthStore.setState({ role: 'expert', userId: 'u1' })
  })

  it('reddedilen profilde gerekçeyi verir', () => {
    mockProfile.mockReturnValue({
      data: { status: 'rejected', rejectionReason: '  Diploma okunmuyor.  ' },
      error: null,
      isLoading: false,
    })
    const { result } = renderHook(() => useExpertApprovalGate())
    expect(result.current.isRejected).toBe(true)
    expect(result.current.rejectionReason).toBe('Diploma okunmuyor.')
    expect(result.current.canAct).toBe(false)
  })

  it('gerekçe boşsa ya da profil onaylıysa null', () => {
    mockProfile.mockReturnValue({
      data: { status: 'rejected', rejectionReason: null },
      error: null,
      isLoading: false,
    })
    expect(renderHook(() => useExpertApprovalGate()).result.current.rejectionReason).toBeNull()
    mockProfile.mockReturnValue({
      data: { status: 'approved', rejectionReason: 'eski' },
      error: null,
      isLoading: false,
    })
    const { result } = renderHook(() => useExpertApprovalGate())
    expect(result.current.rejectionReason).toBeNull()
    expect(result.current.canAct).toBe(true)
  })

  it('danışan rolünde her zaman serbest', () => {
    useAuthStore.setState({ role: 'client' })
    mockProfile.mockReturnValue({ data: undefined, error: null, isLoading: false })
    expect(renderHook(() => useExpertApprovalGate()).result.current).toMatchObject({
      canAct: true,
      rejectionReason: null,
    })
  })
})
