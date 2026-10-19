import { useMemo, useState } from 'react'

import { View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'

import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'

import { PasswordFlowHeader } from './components/PasswordFlowHeader'

import type { ResetPasswordForm } from '@/domains/auth'

import { Button } from '@/core/components/atoms/Button'
import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { TextField } from '@/core/components/molecules/TextField'
import { Screen } from '@/core/components/templates/Screen'
import { DrawCheck, EnterUp, Orbit, Pop } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import {
  parseRecoveryLink,
  PASSWORD_MIN_LENGTH,
  ResetPasswordFormSchema,
  RESET_TOKEN_INVALID,
  useResetPasswordMutation,
} from '@/domains/auth'
import { getErrorMessage, isApiErrorCode } from '@/lib/api'

/**
 * Yeni şifre (b0 · Şifre sıfırlama, adım 3–4). E-postadaki bağlantı uygulamayı
 * `psikoal://reset-password#access_token=…&type=recovery` ile açar; token URL
 * parçasında olduğu için expo-linking'den okunur. Durumlar: geçerli · süresi
 * dolmuş/geçersiz · güncellendi.
 */
export function ResetPasswordScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const url = Linking.useLinkingURL()
  const link = useMemo(() => parseRecoveryLink(url), [url])
  const [done, setDone] = useState(false)
  const { mutate: resetPassword, isPending, error } = useResetPasswordMutation()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })
  const [newPassword, confirmPassword] = useWatch({
    control,
    name: ['newPassword', 'confirmPassword'],
  })
  const matches = newPassword.length >= PASSWORD_MIN_LENGTH && newPassword === confirmPassword

  const isTokenRejected = isApiErrorCode(error, RESET_TOKEN_INVALID)
  const isLinkUnusable = link.status !== 'valid' || isTokenRejected
  const toLogin = () => router.replace('/(auth)/login')

  const onSubmit = ({ newPassword: password }: ResetPasswordForm) => {
    if (link.status !== 'valid') return
    resetPassword(
      { accessToken: link.accessToken, newPassword: password },
      { onSuccess: () => setDone(true) }
    )
  }

  if (done) {
    return (
      <Screen testID="screen-reset-done" contentClassName="flex-1 gap-5 px-6">
        <PasswordFlowHeader step={3} onBack={toLogin} />
        <View className="flex-1 items-center gap-[18px] pt-[100px]">
          <Pop duration={500}>
            <View className="h-[120px] w-[120px] items-center justify-center rounded-full bg-primary">
              <DrawCheck
                size={56}
                viewBox="0 0 48 48"
                d="M13 25l7 7 15-16"
                color={colors.onPrimary}
                strokeWidth={4}
                delay={500}
                duration={700}
                length={120}
              />
            </View>
          </Pop>
          <EnterUp delay={60}>
            <Text
              accessibilityRole="header"
              align="center"
              className="font-display text-4xl text-fg"
            >
              Şifren güncellendi
            </Text>
          </EnterUp>
          <EnterUp delay={120}>
            <Text align="center" className="text-base text-fg-muted">
              Yeni şifrenle giriş yapabilirsin.
            </Text>
          </EnterUp>
          <EnterUp delay={180} className="mt-auto w-full">
            <Button label="Giriş yap" onPress={toLogin} size="xl" fullWidth />
          </EnterUp>
        </View>
      </Screen>
    )
  }

  if (isLinkUnusable) {
    return (
      <Screen testID="screen-reset-invalid" contentClassName="flex-1 gap-5 px-6">
        <PasswordFlowHeader step={2} onBack={toLogin} />
        <View className="flex-1 items-center gap-[18px] pt-[100px]">
          <Pop duration={500}>
            <View className="h-[120px] w-[120px] items-center justify-center rounded-full border-2 border-dashed border-danger bg-danger-soft">
              <Orbit duration={8000}>
                <Icon name="Clock" size={52} color={colors.danger} strokeWidth={2} />
              </Orbit>
            </View>
          </Pop>
          <EnterUp delay={60}>
            <Text
              accessibilityRole="header"
              align="center"
              className="font-display text-h2 text-fg"
            >
              Bağlantının süresi dolmuş
            </Text>
          </EnterUp>
          <EnterUp delay={120}>
            <Text align="center" className="max-w-[320px] text-base text-fg-muted">
              Bu sıfırlama bağlantısı artık geçerli değil. Yeni bir bağlantı isteyebilirsin.
            </Text>
          </EnterUp>
          <EnterUp delay={180} className="mt-auto w-full">
            <Button
              label="Yeni bağlantı iste"
              onPress={() => router.replace('/(auth)/forgot-password')}
              size="xl"
              fullWidth
            />
          </EnterUp>
        </View>
      </Screen>
    )
  }

  return (
    <Screen testID="screen-reset-password" keyboard contentClassName="flex-1 gap-5 px-6">
      <PasswordFlowHeader step={2} onBack={toLogin} />
      <View className="flex-1 gap-4">
        <EnterUp>
          <Text
            accessibilityRole="header"
            className="mt-7 font-display text-[38px] leading-10 text-fg"
          >
            Yeni şifreni belirle
          </Text>
        </EnterUp>
        <EnterUp delay={60}>
          <Text className="text-base text-fg-muted">En az 8 karakter olsun.</Text>
        </EnterUp>
        {error ? <ErrorBanner message={getErrorMessage(error)} /> : null}
        <EnterUp delay={120}>
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                testID="reset-password-new"
                type="password"
                autoComplete="new-password"
                label="Yeni şifre"
                size="lg"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.newPassword?.message}
              />
            )}
          />
        </EnterUp>
        <EnterUp delay={180}>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                testID="reset-password-confirm"
                type="password"
                autoComplete="new-password"
                label="Tekrar"
                size="lg"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
              />
            )}
          />
        </EnterUp>
        {matches ? (
          <View className="flex-row items-center gap-2" accessibilityLiveRegion="polite">
            <Pop>
              <View className="h-[22px] w-[22px] items-center justify-center rounded-full bg-primary">
                <DrawCheck size={13} color={colors.onPrimary} strokeWidth={3.5} delay={100} />
              </View>
            </Pop>
            <Text className="font-body-semibold text-body-sm text-link">Şifreler eşleşiyor</Text>
          </View>
        ) : null}
        <EnterUp delay={240} className="mt-auto">
          <Button
            testID="reset-password-submit"
            label="Şifreyi güncelle"
            loadingLabel="Güncelleniyor"
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
