import { useState } from 'react'

import { View } from 'react-native'

import { useRouter } from 'expo-router'

import { WelcomeOffersArt, WelcomeTestsArt, WelcomeTrustArt } from './welcome/WelcomeIllustrations'

import { ProgressSegments } from '@/core/components/atoms/ProgressSegments'
import { Text } from '@/core/components/atoms/Text'
import { Screen } from '@/core/components/templates/Screen'
import { EnterUp, PressableScale } from '@/core/motion'
import { useOnboardingStore } from '@/store/onboardingStore'

const SLIDES = [
  {
    key: 'offers',
    Art: WelcomeOffersArt,
    title: 'İhtiyacını anlat, uzmanlar sana gelsin.',
    body: 'Bir ilan aç. Lisanslı uzmanlar tekliflerini göndersin, sen seç.',
  },
  {
    key: 'tests',
    Art: WelcomeTestsArt,
    title: 'Kendini ücretsiz testlerle tanı.',
    body: 'Kısa testler çöz, sonucunu gör; dilersen ilanına ekle, uzman seni daha iyi anlasın.',
  },
  {
    key: 'trust',
    Art: WelcomeTrustArt,
    title: 'Güvenle başla.',
    body: 'Uzmanların lisansı doğrulanır. İletişim bilgilerin yalnız senin izninle, teklif veren uzmanlara açılır.',
  },
] as const

/** Karşılama (b0 · Karşılama) — 3 slayt; her slaytın illüstrasyonu kendi girişini oynar. */
export function WelcomeScreen() {
  const router = useRouter()
  const setSeenWelcome = useOnboardingStore((s) => s.setSeenWelcome)
  const [index, setIndex] = useState(0)
  const isLast = index === SLIDES.length - 1
  const slide = SLIDES[index] ?? SLIDES[0]
  const { Art } = slide

  const finish = (target: '/(auth)/register' | '/(auth)/login') => {
    setSeenWelcome()
    router.replace(target)
  }

  return (
    <Screen testID="screen-welcome" contentClassName="flex-1 gap-7 px-6">
      <View className="h-11 flex-row items-center justify-between">
        <ProgressSegments
          total={SLIDES.length}
          current={index + 1}
          className="max-w-[180px] flex-1"
          accessibilityLabel={`Slayt ${index + 1} / ${SLIDES.length}`}
        />
        {isLast ? null : (
          <PressableScale
            testID="welcome-skip"
            onPress={() => finish('/(auth)/login')}
            accessibilityRole="button"
            accessibilityLabel="Karşılamayı atla"
            className="h-11 justify-center px-4"
          >
            <Text className="font-body-semibold text-base text-link">Atla</Text>
          </PressableScale>
        )}
      </View>

      <View key={slide.key} className="flex-1 gap-7">
        <EnterUp className="max-h-[420px] min-h-[300px] flex-1" fill>
          <Art />
        </EnterUp>
        <View className="gap-3">
          <EnterUp delay={120}>
            <Text accessibilityRole="header" className="font-display text-h1 text-fg">
              {slide.title}
            </Text>
          </EnterUp>
          <EnterUp delay={240}>
            <Text className="text-body-lg text-fg-muted">{slide.body}</Text>
          </EnterUp>
        </View>
      </View>

      <View className="gap-2.5">
        {isLast ? (
          <>
            <EnterUp>
              <PressableScale
                onPress={() => finish('/(auth)/register')}
                haptics="medium"
                accessibilityRole="button"
                accessibilityLabel="Hemen başla"
                className="h-btn-lg items-center justify-center rounded-lg bg-primary"
              >
                <Text className="font-body-bold text-button text-primary-fg">Hemen başla</Text>
              </PressableScale>
            </EnterUp>
            <EnterUp delay={120}>
              <PressableScale
                testID="welcome-login"
                onPress={() => finish('/(auth)/login')}
                accessibilityRole="button"
                accessibilityLabel="Giriş yap"
                className="h-btn-lg items-center justify-center rounded-lg border border-border-strong"
              >
                <Text className="font-body-semibold text-button text-fg">Giriş yap</Text>
              </PressableScale>
            </EnterUp>
          </>
        ) : (
          <PressableScale
            testID="welcome-next"
            onPress={() => setIndex((i) => Math.min(SLIDES.length - 1, i + 1))}
            accessibilityRole="button"
            accessibilityLabel="Devam"
            className="h-btn-lg items-center justify-center rounded-lg bg-accent"
          >
            <Text className="font-body-bold text-button text-accent-fg">Devam</Text>
          </PressableScale>
        )}
      </View>
    </Screen>
  )
}
