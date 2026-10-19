import { useState } from 'react'

import { View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { useRouter } from 'expo-router'

import type { RegisterRequest, UserRole } from '@/domains/auth'
import type { z } from 'zod'

import { Button } from '@/core/components/atoms/Button'
import { IconButton } from '@/core/components/atoms/IconButton'
import { ProgressSegments } from '@/core/components/atoms/ProgressSegments'
import { Text } from '@/core/components/atoms/Text'
import { CheckboxRow } from '@/core/components/molecules/CheckboxRow'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { RadioCard } from '@/core/components/molecules/RadioCard'
import { StrengthMeter } from '@/core/components/molecules/StrengthMeter'
import { TextField } from '@/core/components/molecules/TextField'
import { Screen } from '@/core/components/templates/Screen'
import { EnterRight, EnterUp } from '@/core/motion'
import {
  passwordStrength,
  REFERRAL_CODE_MAX_LENGTH,
  RegisterRequestSchema,
  registerErrorMessage,
  useReferralStore,
  useRegisterMutation,
} from '@/domains/auth'
import { openLegalDocument } from '@/lib/externalLinks'
import { useOnboardingStore } from '@/store/onboardingStore'

type RegisterFormInput = z.input<typeof RegisterRequestSchema>

const ROLES: { role: UserRole; mark: string; title: string; sub: string }[] = [
  { role: 'client', mark: 'D', title: 'Danışan', sub: 'Terapi arıyorum' },
  { role: 'expert', mark: 'U', title: 'Uzman', sub: 'Psikoloğum, danışan arıyorum' },
]

export const VERIFY_EMAIL_ROUTE = '/(auth)/verify-email'

/**
 * Kayıt (b0/b4 · Kayıt): 1) rol 2) bilgiler + şifre gücü + davet kodu + iki
 * zorunlu onay (hukuken onaylı metinler — DEĞİŞTİRME). Başarıda "E-postanı
 * onayla" ekranına geçer.
 */
export function RegisterScreen() {
  const router = useRouter()
  const pendingCode = useReferralStore((s) => s.pendingCode)
  const setOnboardIntent = useOnboardingStore((s) => s.setOnboardIntent)
  const [step, setStep] = useState<0 | 1>(0)
  const [role, setRole] = useState<UserRole>('client')
  const { mutate: register, isPending, error, reset } = useRegisterMutation()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInput, unknown, RegisterRequest>({
    resolver: zodResolver(RegisterRequestSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'client',
      termsAccepted: false,
      healthDataConsent: false,
      referralCode: pendingCode ?? '',
    },
  })

  const [password, termsAccepted, healthDataConsent] = useWatch({
    control,
    name: ['password', 'termsAccepted', 'healthDataConsent'],
  })
  const strength = passwordStrength(password ?? '')
  const ready = Boolean(termsAccepted && healthDataConsent)

  const onSubmit = (data: RegisterRequest) => {
    reset()
    // Kayıt başarılı olur olmaz isAuthenticated true olur ve (auth)/_layout
    // yönlendirir; hedef, ezilmesin diye ÖNCE onboardIntent'e yazılır.
    setOnboardIntent(VERIFY_EMAIL_ROUTE)
    register({ ...data, role }, { onSuccess: () => router.replace(VERIFY_EMAIL_ROUTE as never) })
  }

  const apiError = error ? registerErrorMessage(error) : null

  return (
    <Screen testID="screen-register" keyboard contentClassName="flex-1 gap-5 px-6">
      <View className="flex-row items-center gap-3.5">
        <IconButton
          icon="ChevronLeft"
          accessibilityLabel="Geri"
          onPress={() => (step === 1 ? setStep(0) : router.back())}
        />
        <ProgressSegments
          total={2}
          current={step + 1}
          className="flex-1"
          accessibilityLabel={`Adım ${step + 1} / 2`}
        />
        <Text className="font-body-bold text-body-sm text-fg-muted">{step + 1} / 2</Text>
      </View>

      {step === 0 ? (
        <View className="flex-1 gap-5">
          <View className="mt-3 gap-2">
            <EnterUp>
              <Text accessibilityRole="header" className="font-display text-h1 text-fg">
                Seni nasıl tanıyalım?
              </Text>
            </EnterUp>
            <EnterUp delay={60}>
              <Text className="text-base text-fg-muted">Rolün kayıttan sonra değiştirilemez.</Text>
            </EnterUp>
          </View>
          <View accessibilityRole="radiogroup" accessibilityLabel="Rol" className="gap-3">
            {ROLES.map((r, i) => (
              <EnterUp key={r.role} delay={(i + 2) * 60}>
                <RadioCard
                  testID={`register-role-${r.role}`}
                  variant="large"
                  mark={r.mark}
                  title={r.title}
                  description={r.sub}
                  selected={role === r.role}
                  onPress={() => setRole(r.role)}
                />
              </EnterUp>
            ))}
          </View>
          <EnterUp delay={240} className="mt-auto">
            <Button label="Devam" onPress={() => setStep(1)} size="xl" fullWidth />
          </EnterUp>
        </View>
      ) : (
        <View className="flex-1 gap-3.5">
          <EnterRight>
            <Text accessibilityRole="header" className="mt-1 font-display text-h2 text-fg">
              {role === 'expert' ? 'Uzman hesabını aç' : 'Hesabını aç'}
            </Text>
          </EnterRight>

          {apiError ? <ErrorBanner message={apiError} /> : null}

          <EnterRight delay={60} className="flex-row gap-2.5">
            <View className="flex-1">
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    testID="register-first-name"
                    label="Ad"
                    autoCapitalize="words"
                    autoComplete="given-name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.firstName?.message}
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    testID="register-last-name"
                    label="Soyad"
                    autoCapitalize="words"
                    autoComplete="family-name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.lastName?.message}
                  />
                )}
              />
            </View>
          </EnterRight>

          <EnterRight delay={120}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  testID="register-email"
                  type="email"
                  label="E-posta"
                  placeholder="ornek@mail.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />
          </EnterRight>

          <EnterRight delay={180} className="gap-2.5">
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  testID="register-password"
                  type="password"
                  autoComplete="new-password"
                  label="Şifre"
                  placeholder="En az 8 karakter"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />
            <StrengthMeter score={strength.score} label={strength.label} />
          </EnterRight>

          <EnterRight delay={210}>
            <Controller
              control={control}
              name="referralCode"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  testID="register-referral-code"
                  label="Davet kodu"
                  optional
                  autoCapitalize="characters"
                  maxLength={REFERRAL_CODE_MAX_LENGTH}
                  placeholder="Ör. K7M2Q9XA"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.referralCode?.message}
                  hint="Bir uzmanın davet bağlantısıyla geldiysen kod hazır gelir."
                />
              )}
            />
          </EnterRight>

          <EnterRight delay={240} className="mt-1 gap-2.5">
            <Controller
              control={control}
              name="termsAccepted"
              render={({ field: { onChange, value } }) => (
                <CheckboxRow
                  testID="register-terms"
                  checked={Boolean(value)}
                  onToggle={() => onChange(!value)}
                  hasError={Boolean(errors.termsAccepted)}
                  accessibilityLabel="Kullanım Koşulları ve Gizlilik Politikası'nı okudum, kabul ediyorum"
                >
                  <Text
                    className="font-body-bold text-body-sm text-link"
                    onPress={() => void openLegalDocument('terms')}
                  >
                    Kullanım Koşulları
                  </Text>
                  {' ve '}
                  <Text
                    className="font-body-bold text-body-sm text-link"
                    onPress={() => void openLegalDocument('privacy')}
                  >
                    Gizlilik Politikası
                  </Text>
                  {"'nı okudum, kabul ediyorum."}
                </CheckboxRow>
              )}
            />
            <Controller
              control={control}
              name="healthDataConsent"
              render={({ field: { onChange, value } }) => (
                <CheckboxRow
                  testID="register-health-consent"
                  checked={Boolean(value)}
                  onToggle={() => onChange(!value)}
                  hasError={Boolean(errors.healthDataConsent)}
                  accessibilityLabel="Sağlık verilerimin işlenmesine açık rıza veriyorum"
                >
                  {
                    'Psikolojik test sonuçlarım ve ilanlarımdaki bilgiler dahil sağlık verilerimin, '
                  }
                  <Text
                    className="font-body-bold text-body-sm text-link"
                    onPress={() => void openLegalDocument('kvkk')}
                  >
                    KVKK Aydınlatma Metni
                  </Text>
                  {' kapsamında uzmanlarla eşleşme amacıyla işlenmesine açık rıza veriyorum.'}
                </CheckboxRow>
              )}
            />
          </EnterRight>

          <View className="mt-auto pt-2">
            {ready ? (
              <EnterUp>
                <Button
                  testID="register-submit"
                  label="Kayıt ol"
                  loadingLabel="Kayıt yapılıyor"
                  onPress={handleSubmit(onSubmit)}
                  isLoading={isPending}
                  size="xl"
                  fullWidth
                />
              </EnterUp>
            ) : (
              <Button
                testID="register-submit"
                label="Devam etmek için iki onayı da işaretle"
                onPress={() => undefined}
                isDisabled
                size="xl"
                fullWidth
              />
            )}
          </View>
        </View>
      )}
    </Screen>
  )
}
