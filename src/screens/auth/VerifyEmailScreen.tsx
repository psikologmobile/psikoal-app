import { View } from 'react-native'

import Animated, { useAnimatedStyle } from 'react-native-reanimated'

import { useRouter } from 'expo-router'

import { Button } from '@/core/components/atoms/Button'
import { Text } from '@/core/components/atoms/Text'
import { Screen } from '@/core/components/templates/Screen'
import { EnterUp, Float, useOnceProgress } from '@/core/motion'
import { useAuthStore } from '@/domains/auth'
import { useOnboardingStore } from '@/store/onboardingStore'

/** Mektup zarftan yukarı kayar (`letter`, 900 ms, 300 ms gecikme); zarf yüzer. */
function Envelope() {
  const t = useOnceProgress({ duration: 900, delay: 300 })
  const letterStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: 60 * (1 - t.value) }],
  }))
  return (
    <Float>
      <View
        className="h-[150px] w-[200px]"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Animated.View style={[{ position: 'absolute', left: 30, top: 0 }, letterStyle]}>
          <View className="h-[110px] w-[140px] gap-2 rounded-sm border border-border-strong bg-surface p-[18px]">
            <View className="h-2 w-[70px] rounded-full bg-primary" />
            <View className="h-1.5 w-[90px] rounded-full bg-border-strong" />
            <View className="h-1.5 w-[60px] rounded-full bg-border-strong" />
          </View>
        </Animated.View>
        <View className="absolute bottom-0 left-0 h-24 w-[200px] rounded-b-xl bg-accent" />
        {/* Zarf kapağı: kenarlıkla çizilen üçgen */}
        <View className="absolute bottom-0 left-0 h-0 w-0 border-b-[60px] border-l-[100px] border-r-[100px] border-b-accent-line border-l-transparent border-r-transparent" />
      </View>
    </Float>
  )
}

/**
 * Kayıt sonu "E-postanı onayla" (b0 · Kayıt, done). Devam edince role göre
 * onboarding'e geçer.
 */
export function VerifyEmailScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const setOnboardIntent = useOnboardingStore((s) => s.setOnboardIntent)
  const target = user?.role === 'expert' ? '/(auth)/onboarding/expert' : '/(auth)/onboarding/client'

  const next = () => {
    setOnboardIntent(target)
    router.replace(target)
  }

  return (
    <Screen testID="screen-verify-email" contentClassName="flex-1 items-center gap-5 px-6">
      <View className="h-16" />
      <Envelope />
      <EnterUp delay={120}>
        <Text accessibilityRole="header" align="center" className="font-display text-4xl text-fg">
          E-postanı onayla
        </Text>
      </EnterUp>
      <EnterUp delay={180}>
        <Text align="center" className="max-w-[330px] text-base text-fg-muted">
          <Text className="font-body-bold text-base text-fg">{user?.email ?? ''}</Text> adresine bir
          onay bağlantısı gönderdik. Bağlantıya dokunduktan sonra giriş yapabilirsin.
        </Text>
      </EnterUp>
      <EnterUp delay={240} className="mt-auto w-full">
        <Button label="Onayladım, devam et" onPress={next} size="xl" fullWidth />
      </EnterUp>
    </Screen>
  )
}
