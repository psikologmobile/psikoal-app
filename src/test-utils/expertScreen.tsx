import type { ReactElement } from 'react'

import { render } from '@testing-library/react-native'
import MockAdapter from 'axios-mock-adapter'

import { createTestQueryClient, createWrapper, TEST_EXPERT } from './query'

import { ToastProvider } from '@/core/components/organisms/Toast'
import { useAuthStore } from '@/domains/auth'
import { axiosInstance } from '@/lib/api'

/**
 * Uzman ekranı smoke testleri için ortak kurulum: uzman oturumu, izole
 * QueryClient, axios sahte sunucu ve Toast sağlayıcısı. Test dosyası kendi
 * jest.mock'larını (expo-router, safe-area, storage) yapar.
 */
export function setupExpertScreen() {
  const mock = new MockAdapter(axiosInstance)
  const queryClient = createTestQueryClient()
  useAuthStore.setState({
    user: { ...TEST_EXPERT, city: 'Konya' },
    userId: TEST_EXPERT.id,
    role: 'expert',
    isAuthenticated: true,
  })
  const Wrapper = createWrapper(queryClient)

  return {
    mock,
    queryClient,
    renderScreen: (ui: ReactElement) =>
      render(
        <Wrapper>
          <ToastProvider>{ui}</ToastProvider>
        </Wrapper>
      ),
    cleanup: () => {
      mock.restore()
      queryClient.clear()
    },
  }
}

export const EXPERT_PROFILE = {
  id: TEST_EXPERT.id,
  firstName: 'Ayşe',
  lastName: 'Demir',
  title: 'Klinik Psikolog',
  specializations: ['Kaygı'],
  experienceYears: 8,
  bio: 'Bilişsel davranışçı terapi ile kaygı ve sınav stresi yaşayan gençlerle çalışıyorum.',
  avatarUrl: null,
  rating: 4.8,
  reviewCount: 3,
  isVerified: true,
  status: 'approved',
  initials: 'AD',
  acceptsOffers: true,
  education: 'Hacettepe',
  cvUrl: 'id/cv/a.pdf',
  certificates: ['id/certificates/b.pdf'],
  personalWebsite: null,
}

export const WALLET = {
  balanceKurus: 125000,
  balanceLabel: '₺1.250',
  freeOfferRights: 1,
  referralCode: 'K7M2PX9Q',
  referralLink: 'https://psikoal.com/davet/K7M2PX9Q',
}

export const QUOTE = {
  feeKurus: 62500,
  feeLabel: '₺625',
  balanceKurus: 125000,
  balanceLabel: '₺1.250',
  freeOfferRights: 0,
  willUseFreeRight: false,
  balanceAfterKurus: 62500,
  balanceAfterLabel: '₺625',
  sufficient: true,
}
