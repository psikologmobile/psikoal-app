import { useState } from 'react'

import { View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { useRouter } from 'expo-router'

import { PasswordFlowHeader } from './components/PasswordFlowHeader'

import type { ForgotPasswordRequest } from '@/domains/auth'

import { Button } from '@/core/components/atoms/Button'
import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { TextField } from '@/core/components/molecules/TextField'
import { Screen } from '@/core/components/templates/Screen'
import { EnterUp, Float, Jiggle, Pop, Ring } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { ForgotPasswordSchema, useForgotPasswordMutation } from '@/domains/auth'
import { getErrorMessage } from '@/lib/api'

/**
 * Şifremi unuttum (b0 · Şifre sıfırlama, adım 1–2): e-posta → "E-postanı
 * kontrol et". Bağlantı uygulamayı /reset-password ile açar (adım 3–4).
 */
export function ForgotPasswordScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const { mutate: forgotPassword, isPending, error } = useForgotPasswordMutation()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = (data: ForgotPasswordRequest) => {
    forgotPassword(data, { onSuccess: () => setSentTo(data.email) })
  }

  const toLogin = () => router.replace('/(auth)/login')

  if (sentTo) {
    return (
      <Screen testID="screen-forgot-sent" contentClassName="flex-1 gap-5 px-6">
        <PasswordFlowHeader step={1} onBack={toLogin} />
        <View className="flex-1 items-center gap-[18px] pt-[100px]">
          <View className="h-[120px] w-[120px]" accessibilityElementsHidden>
            <View className="absolute inset-0">
              <Ring size={120} from={0.8} to={2} delay={200} duration={1600} />
            </View>
            <Pop duration={500} className="absolute inset-0">
              <View className="h-[120px] w-[120px] items-center justify-center rounded-full bg-accent">
                <Icon name="Mail" size={52} color={colors.onAccent} strokeWidth={2} />
              </View>
            </Pop>
          </View>
          <EnterUp delay={60}>
            <Text
              accessibilityRole="header"
              align="center"
              className="font-display text-4xl text-fg"
            >
              E-postanı kontrol et
            </Text>
          </EnterUp>
          <EnterUp delay={120}>
            <Text align="center" className="max-w-[320px] text-base text-fg-muted">
              Sıfırlama bağlantısını{' '}
              <Text className="font-body-bold text-base text-fg">{sentTo}</Text> adresine gönderdik.
              Bağlantı 1 saat geçerli.
            </Text>
          </EnterUp>
          <EnterUp delay={180} className="mt-auto w-full">
            <Button
              label="Giriş ekranına dön"
              onPress={toLogin}
              variant="outline"
              size="lg"
              fullWidth
            />
          </EnterUp>
        </View>
      </Screen>
    )
  }

  return (
    <Screen testID="screen-forgot-password" keyboard contentClassName="flex-1 gap-5 px-6">
      <PasswordFlowHeader step={0} onBack={toLogin} />
      <View className="flex-1 gap-[18px]">
        <EnterUp className="mt-[30px] self-start">
          <Float>
            <View className="h-24 w-24 items-center justify-center rounded-4xl bg-accent">
              <Jiggle delay={400}>
                <Icon name="Lock" size={44} color={colors.onAccent} strokeWidth={2} />
              </Jiggle>
            </View>
          </Float>
        </EnterUp>
        <EnterUp delay={60}>
          <Text accessibilityRole="header" className="font-display text-[38px] leading-10 text-fg">
            Şifreni mi unuttun?
          </Text>
        </EnterUp>
        <EnterUp delay={120}>
          <Text className="text-base text-fg-muted">
            Hesabına bağlı e-posta adresini yaz, sana bir sıfırlama bağlantısı gönderelim.
          </Text>
        </EnterUp>
        {error ? <ErrorBanner message={getErrorMessage(error)} /> : null}
        <EnterUp delay={180}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                testID="forgot-email"
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
        <EnterUp delay={240} className="mt-auto">
          <Button
            testID="forgot-submit"
            label="Sıfırlama bağlantısı gönder"
            loadingLabel="Gönderiliyor"
            onPress={handleSubmit(onSubmit)}
            isLoading={isPending}
            size="xl"
            fullWidth
          />
        </EnterUp>
      </View>
    </Screen>
  )
}
