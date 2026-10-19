import { useState } from 'react'

import { View } from 'react-native'

import { useRouter } from 'expo-router'

import { Button } from '@/core/components/atoms/Button'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { InfoBanner } from '@/core/components/molecules/InfoBanner'
import { TextField } from '@/core/components/molecules/TextField'
import { CityPicker } from '@/core/components/organisms/CityPicker'
import { Screen } from '@/core/components/templates/Screen'
import { EnterUp, Orbit, Pop } from '@/core/motion'
import { useAuthStore, useUpdateProfileMutation } from '@/domains/auth'
import { getErrorMessage } from '@/lib/api'

type Target = '/(tabs)' | '/listing/new' | '/assessment'

/** Baş harf dairesi + dönen kesikli halka ve uydu nokta. */
function WelcomeAvatar({ initial }: { initial: string }) {
  return (
    <View className="h-24 w-24" accessibilityElementsHidden>
      <View className="absolute -inset-3.5">
        <Orbit duration={10000}>
          <View className="h-[124px] w-[124px] rounded-full border border-dashed border-accent-line">
            <View className="absolute -top-[5px] left-[57px] h-2.5 w-2.5 rounded-full bg-primary" />
          </View>
        </Orbit>
      </View>
      <Pop duration={500} className="absolute inset-0">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-accent">
          <Text className="font-display text-h1 text-accent-fg">{initial}</Text>
        </View>
      </Pop>
    </View>
  )
}

/**
 * Danışan onboarding (b0 · Danışan onboarding): isteğe bağlı telefon ve şehir;
 * "Devam et", "İlk ilanını aç" ya da "Bir test çöz" ile çıkar.
 */
export function ClientOnboardingScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { mutate: updateProfile, isPending, error } = useUpdateProfileMutation()
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [city, setCity] = useState<string | null>(user?.city ?? null)
  const [pendingTarget, setPendingTarget] = useState<Target | null>(null)

  const go = (target: Target) => {
    const trimmed = phone.trim()
    if (!trimmed && !city) {
      router.replace(target)
      return
    }
    setPendingTarget(target)
    updateProfile(
      { phone: trimmed || null, city },
      {
        onSuccess: () => router.replace(target),
        onSettled: () => setPendingTarget(null),
      }
    )
  }

  const firstName = user?.firstName ?? ''

  return (
    <Screen testID="screen-onboarding-client" keyboard contentClassName="flex-1 gap-[18px] px-6">
      <View className="h-6" />
      <WelcomeAvatar initial={(firstName[0] ?? 'P').toLocaleUpperCase('tr-TR')} />
      <View className="mt-2 gap-2">
        <EnterUp delay={60}>
          <Text accessibilityRole="header" className="font-display text-h1 text-fg">
            {firstName ? `Hoş geldin, ${firstName}.` : 'Hoş geldin.'}
          </Text>
        </EnterUp>
        <EnterUp delay={120}>
          <Text className="text-base text-fg-muted">
            İletişim bilgilerini şimdi ekleyebilir ya da ilk ilanını açarken girebilirsin.
          </Text>
        </EnterUp>
      </View>

      {error ? <ErrorBanner message={getErrorMessage(error)} /> : null}

      <EnterUp delay={180}>
        <TextField
          testID="onboarding-phone"
          type="tel"
          label="Telefon"
          optional
          placeholder="0500 000 00 00"
          size="lg"
          value={phone}
          onChangeText={setPhone}
        />
      </EnterUp>
      <EnterUp delay={240}>
        <CityPicker optional value={city} onChange={setCity} size="lg" testID="onboarding-city" />
      </EnterUp>
      <EnterUp delay={300}>
        <InfoBanner className="rounded-card p-4">
          <Text className="text-body-sm text-accent-soft-fg">
            Telefon ve e-postan,{' '}
            <Text className="font-body-bold text-body-sm text-accent-soft-fg">
              ilan açarken vereceğin izinle
            </Text>{' '}
            yalnız ilanına teklif gönderen uzmanlara açılır.
          </Text>
        </InfoBanner>
      </EnterUp>

      <EnterUp delay={360} className="mt-auto gap-3">
        <Button
          testID="onboarding-continue"
          label="Devam et"
          loadingLabel="Kaydediliyor"
          onPress={() => go('/(tabs)')}
          isLoading={isPending && pendingTarget === '/(tabs)'}
          isDisabled={isPending && pendingTarget !== '/(tabs)'}
          size="xl"
          fullWidth
        />
        <View className="flex-row gap-2.5">
          <View className="flex-1">
            <Button
              label="İlk ilanını aç"
              icon="Plus"
              variant="outline"
              onPress={() => go('/listing/new')}
              isLoading={isPending && pendingTarget === '/listing/new'}
              fullWidth
            />
          </View>
          <View className="flex-1">
            <Button
              label="Bir test çöz"
              icon="ClipboardList"
              variant="outline"
              onPress={() => go('/assessment')}
              isLoading={isPending && pendingTarget === '/assessment'}
              fullWidth
            />
          </View>
        </View>
      </EnterUp>
    </Screen>
  )
}
