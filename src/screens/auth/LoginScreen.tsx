import { View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { useRouter } from 'expo-router'

import { AuthBlob, AuthBrand, Wave } from './components/AuthDecor'

import type { LoginRequest } from '@/domains/auth'

import { Button } from '@/core/components/atoms/Button'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { TextField } from '@/core/components/molecules/TextField'
import { Screen } from '@/core/components/templates/Screen'
import { EnterUp, PressableScale } from '@/core/motion'
import { LoginRequestSchema, loginErrorMessage, useLoginMutation } from '@/domains/auth'

/**
 * Giriş (b0/b4 · Giriş). Durumlar: normal · gönderiliyor · yanlış · onaysız ·
 * dondurulmuş · bağlantı · çok deneme (hata kodu → metin: `loginErrorMessage`).
 */
export function LoginScreen() {
  const router = useRouter()
  const { mutate: login, isPending, error, reset } = useLoginMutation()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (data: LoginRequest) => {
    reset()
    login(data, { onSuccess: () => router.replace('/(tabs)') })
  }

  const apiError = error ? loginErrorMessage(error) : null

  return (
    <Screen testID="screen-login" keyboard contentClassName="flex-1 gap-[22px] px-6">
      <AuthBlob />
      <EnterUp>
        <AuthBrand />
      </EnterUp>

      <View className="mt-10 gap-2">
        <EnterUp delay={60}>
          <View className="flex-row flex-wrap items-end">
            <Text accessibilityRole="header" className="font-display text-hero text-fg">
              Tekrar{' '}
            </Text>
            <Wave>
              <Text className="font-display text-hero text-link">hoş geldin.</Text>
            </Wave>
          </View>
        </EnterUp>
        <EnterUp delay={120}>
          <Text className="text-body-lg text-fg-muted">E-posta ve şifrenle giriş yap.</Text>
        </EnterUp>
      </View>

      {apiError ? <ErrorBanner message={apiError} showIcon /> : null}

      <EnterUp delay={180}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              testID="login-email"
              type="email"
              label="E-posta"
              placeholder="ornek@mail.com"
              size="lg"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
            />
          )}
        />
      </EnterUp>

      <EnterUp delay={240} className="gap-2">
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              testID="login-password"
              type="password"
              label="Şifre"
              placeholder="••••••••"
              size="lg"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
            />
          )}
        />
        <PressableScale
          onPress={() => router.push('/(auth)/forgot-password')}
          accessibilityRole="link"
          accessibilityLabel="Şifremi unuttum"
          wrapperClassName="self-end"
          className="min-h-11 justify-center py-2"
        >
          <Text className="font-body-semibold text-body-sm text-link">Şifremi unuttum</Text>
        </PressableScale>
      </EnterUp>

      <EnterUp delay={300} className="mt-auto gap-3">
        <Button
          testID="login-submit"
          label="Giriş yap"
          loadingLabel="Giriş yapılıyor"
          onPress={handleSubmit(onSubmit)}
          isLoading={isPending}
          size="xl"
          fullWidth
        />
        <View className="flex-row items-center justify-center">
          <Text className="text-body text-fg-muted">Hesabın yok mu? </Text>
          <PressableScale
            onPress={() => router.push('/(auth)/register')}
            accessibilityRole="link"
            accessibilityLabel="Kayıt ol"
            className="min-h-11 justify-center"
          >
            <Text className="font-body-bold text-body text-link">Kayıt ol</Text>
          </PressableScale>
        </View>
      </EnterUp>
    </Screen>
  )
}
