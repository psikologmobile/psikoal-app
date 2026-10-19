import { View } from 'react-native'

import { useRouter } from 'expo-router'

import {
  StepAbout,
  StepDocuments,
  StepIdentity,
  StepSpecializations,
} from './expert-onboarding/ExpertOnboardingSteps'

import { Button } from '@/core/components/atoms/Button'
import { Icon } from '@/core/components/atoms/Icon'
import { IconButton } from '@/core/components/atoms/IconButton'
import { ProgressSegments } from '@/core/components/atoms/ProgressSegments'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { useToast } from '@/core/components/organisms/Toast'
import { Screen } from '@/core/components/templates/Screen'
import { EnterUp, Pop, Ring } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { getInitials } from '@/core/utils/personName'
import { useAuthStore, useChangeAvatar } from '@/domains/auth'
import { EXPERT_ONBOARDING_STEPS, useExpertOnboarding } from '@/domains/expert'

/** "Profilin incelemede" — ilk onayda hoş geldin hakkı tanımlanacağını söyler. */
function UnderReview({ documentsFailed }: { documentsFailed: boolean }) {
  const router = useRouter()
  const colors = useThemeColors()
  return (
    <View className="flex-1 items-center gap-4 ">
      <View className="h-[70px]" />
      <View className="h-[130px] w-[130px]" accessibilityElementsHidden>
        <View className="absolute inset-0">
          <Ring size={130} from={0.7} to={2} delay={300} duration={1600} />
        </View>
        <Pop className="absolute inset-0">
          <View className="h-[130px] w-[130px] items-center justify-center rounded-full bg-accent">
            <Icon name="Search" size={56} color={colors.onAccent} strokeWidth={1.8} />
          </View>
        </Pop>
      </View>
      <EnterUp delay={60}>
        <Text accessibilityRole="header" align="center" className="font-display text-h2 text-fg">
          Profilin incelemede
        </Text>
      </EnterUp>
      <EnterUp delay={120}>
        <Text align="center" className="max-w-[330px] text-base text-fg-muted">
          Admin onaylayana kadar teklif gönderemezsin, ama ilanları şimdiden görebilirsin.
        </Text>
      </EnterUp>
      <EnterUp delay={180}>
        <View className="flex-row items-center gap-3 rounded-xl bg-accent-soft px-4 py-3.5">
          <Pop delay={600}>
            <View className="h-10 w-10 items-center justify-center rounded-sm bg-primary">
              <Icon name="Gift" size={20} color={colors.onPrimary} strokeWidth={2.2} />
            </View>
          </Pop>
          <Text className="flex-1 text-body-sm text-accent-soft-fg">
            Profilin onaylanınca hoş geldin hediyesi olarak ücretsiz teklif hakkı tanımlanacak.
          </Text>
        </View>
      </EnterUp>
      {documentsFailed ? (
        <ErrorBanner message="Belgeler yüklenemedi, Ayarlar → Belgeler'den tekrar deneyebilirsin." />
      ) : null}
      <EnterUp delay={240} className="mt-auto w-full">
        <Button
          label="İlanlara göz at"
          onPress={() => router.replace('/(tabs)')}
          size="xl"
          fullWidth
        />
      </EnterUp>
    </View>
  )
}

/**
 * Uzman onboarding (b4 · Uzman onboarding): 4 adım (ünvan+deneyim · alanlar ·
 * iletişim+biyografi+eğitim · fotoğraf+belgeler+site) + "incelemede".
 */
export function ExpertOnboardingScreen() {
  const toast = useToast()
  const user = useAuthStore((s) => s.user)
  const flow = useExpertOnboarding()
  const { changeAvatar, isUploading } = useChangeAvatar()
  const { step, status, isSubmitting, submitError } = flow
  const isLast = step === EXPERT_ONBOARDING_STEPS - 1

  const pickWith = async (picker: () => Promise<string | null>) => {
    const rejected = await picker()
    if (rejected) toast.show(rejected, { kind: 'error' })
  }

  if (status === 'done') {
    return (
      <Screen testID="screen-onboarding-expert-done" contentClassName="flex-1 px-5">
        <UnderReview documentsFailed={flow.documentsFailed} />
      </Screen>
    )
  }

  return (
    <Screen
      testID="screen-onboarding-expert"
      keyboard
      contentClassName="flex-1 gap-4 px-5"
      footer={
        <Button
          testID="onboarding-expert-next"
          label={isLast ? 'Profili gönder' : 'Devam'}
          loadingLabel="Gönderiliyor"
          onPress={flow.next}
          isLoading={isSubmitting}
          size="xl"
          fullWidth
        />
      }
    >
      <View className="flex-row items-center gap-3">
        {step > 0 ? (
          <IconButton icon="ChevronLeft" accessibilityLabel="Geri" onPress={() => flow.back()} />
        ) : null}
        <ProgressSegments
          total={EXPERT_ONBOARDING_STEPS}
          current={step + 1}
          className="flex-1"
          accessibilityLabel={`Adım ${step + 1} / ${EXPERT_ONBOARDING_STEPS}`}
        />
        <Text className="font-body-bold text-body-sm text-fg-muted">
          {step + 1}/{EXPERT_ONBOARDING_STEPS}
        </Text>
      </View>

      {submitError ? <ErrorBanner message={submitError} /> : null}

      <View key={step}>
        {step === 0 ? <StepIdentity flow={flow} firstName={user?.firstName ?? ''} /> : null}
        {step === 1 ? <StepSpecializations flow={flow} /> : null}
        {step === 2 ? <StepAbout flow={flow} /> : null}
        {step === 3 ? (
          <StepDocuments
            flow={flow}
            initials={getInitials(user)}
            avatarUrl={user?.avatarUrl ?? null}
            isUploadingAvatar={isUploading}
            onPickAvatar={() => void changeAvatar()}
            onPickCv={() => void pickWith(flow.pickCv)}
            onPickCertificate={() => void pickWith(flow.pickCertificate)}
          />
        ) : null}
      </View>
    </Screen>
  )
}
