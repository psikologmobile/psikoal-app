import { useState } from 'react'

import { View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { useRouter } from 'expo-router'

import type { IconName } from '@/core/components/atoms/Icon'
import type { ChangePasswordRequest } from '@/domains/auth'

import { Button } from '@/core/components/atoms/Button'
import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { ScreenHeader } from '@/core/components/molecules/ScreenHeader'
import { SettingsGroup, SettingsRow } from '@/core/components/molecules/SettingsRow'
import { StrengthMeter } from '@/core/components/molecules/StrengthMeter'
import { TextField } from '@/core/components/molecules/TextField'
import { BottomSheet } from '@/core/components/organisms/BottomSheet'
import { useToast } from '@/core/components/organisms/Toast'
import { Screen } from '@/core/components/templates/Screen'
import { Breathe, DrawCheck, EnterRight, EnterUp, Pop, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'
import {
  ChangePasswordSchema,
  passwordStrength,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useFreezeAccountMutation,
} from '@/domains/auth'
import { getErrorMessage, isApiErrorCode } from '@/lib/api'
import { openLegalDocument } from '@/lib/externalLinks'

const CURRENT_PASSWORD_INVALID = 'AUTH_CURRENT_PASSWORD_INVALID'

type SheetStep = 'freeze' | 'delete1' | 'delete2'

/** Hukuken onaylı metinler (değiştirme). */
const SHEETS: Record<
  SheetStep,
  { title: string; text: string; cta: string; icon: IconName; danger: boolean }
> = {
  freeze: {
    title: 'Hesabımı dondur',
    text: 'Hesabın geçici olarak devre dışı bırakılacak, istediğin zaman tekrar giriş yaparak aktifleştirebilirsin. Devam etmek istiyor musun?',
    cta: 'Dondur',
    icon: 'Snowflake',
    danger: false,
  },
  delete1: {
    title: 'Hesabımı sil',
    text: 'Bu işlem geri alınamaz. Hesabın ve tüm verilerin kalıcı olarak silinir.',
    cta: 'Devam et',
    icon: 'Trash2',
    danger: true,
  },
  delete2: {
    title: 'Son onay',
    text: 'Hesabını silmek istediğinden emin misin? Bu işlem geri alınamaz.',
    cta: 'Hesabımı sil',
    icon: 'Trash2',
    danger: true,
  },
}

const LEGAL: { label: string; doc: 'privacy' | 'terms' | 'kvkk' }[] = [
  { label: 'Gizlilik politikası', doc: 'privacy' },
  { label: 'Kullanım koşulları', doc: 'terms' },
  { label: 'KVKK aydınlatma metni', doc: 'kvkk' },
]

function PasswordCard() {
  const colors = useThemeColors()
  const [done, setDone] = useState(false)
  const { mutate: changePassword, isPending, error, reset } = useChangePasswordMutation()
  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<ChangePasswordRequest>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })
  const newPassword = useWatch({ control, name: 'newPassword' })
  const strength = passwordStrength(newPassword)
  const currentInvalid = isApiErrorCode(error, CURRENT_PASSWORD_INVALID)

  const onSubmit = (data: ChangePasswordRequest) => {
    reset()
    changePassword(data, {
      onSuccess: () => {
        resetForm()
        setDone(true)
      },
    })
  }

  return (
    <View className="gap-2.5 rounded-card border border-border p-4">
      <Controller
        control={control}
        name="currentPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            testID="password-current"
            type="password"
            autoComplete="current-password"
            label="Mevcut şifre"
            value={value}
            onChangeText={(t) => {
              setDone(false)
              onChange(t)
            }}
            onBlur={onBlur}
            error={errors.currentPassword?.message ?? (currentInvalid ? error?.message : undefined)}
          />
        )}
      />
      <Controller
        control={control}
        name="newPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            testID="password-new"
            type="password"
            autoComplete="new-password"
            label="Yeni şifre"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.newPassword?.message}
          />
        )}
      />
      <StrengthMeter score={strength.score} />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            testID="password-confirm"
            type="password"
            autoComplete="new-password"
            label="Yeni şifre tekrar"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirmPassword?.message}
          />
        )}
      />
      {error && !currentInvalid ? <ErrorBanner message={getErrorMessage(error)} /> : null}
      {done ? (
        <Pop>
          <View
            accessibilityLiveRegion="polite"
            className="h-btn-md flex-row items-center justify-center gap-2 rounded-md bg-accent-soft"
          >
            <DrawCheck size={16} color={colors.onAccentSoft} strokeWidth={3} delay={150} />
            <Text className="font-body-bold text-body text-accent-soft-fg">Şifren güncellendi</Text>
          </View>
        </Pop>
      ) : (
        <Button
          testID="password-submit"
          label="Güncelle"
          loadingLabel="Güncelleniyor"
          onPress={handleSubmit(onSubmit)}
          isLoading={isPending}
          fullWidth
        />
      )}
    </View>
  )
}

/**
 * Şifre ve gizlilik (b0 / b5 · Şifre ve gizlilik): şifre değiştir, yasal
 * metinler, hesabı dondur, hesabı sil (2 adım). /profile/password ve
 * /profile/privacy aynı ekranı açar.
 */
export function PasswordPrivacyScreen() {
  const router = useRouter()
  const colors = useThemeColors()
  const toast = useToast()
  const [sheet, setSheet] = useState<SheetStep | null>(null)
  const freeze = useFreezeAccountMutation()
  const remove = useDeleteAccountMutation()
  const busy = freeze.isPending || remove.isPending
  const current = sheet ? SHEETS[sheet] : SHEETS.freeze

  const done = {
    onSuccess: () => {
      setSheet(null)
      router.replace('/(auth)/login')
    },
    onError: (e: unknown) => toast.show(getErrorMessage(e), { kind: 'error' }),
  }

  const confirm = () => {
    if (sheet === 'delete1') setSheet('delete2')
    else if (sheet === 'freeze') freeze.mutate(undefined, done)
    else if (sheet === 'delete2') remove.mutate(undefined, done)
  }

  const iconBox = (
    <View
      className={cn(
        'h-11 w-11 items-center justify-center rounded-md',
        current.danger ? 'bg-danger-soft' : 'bg-surface'
      )}
    >
      <Icon
        name={current.icon}
        size={22}
        color={current.danger ? colors.danger : colors.text}
        strokeWidth={2}
      />
    </View>
  )

  return (
    <Screen testID="screen-password-privacy" keyboard contentClassName="gap-3.5">
      <EnterUp>
        <ScreenHeader title="Şifre ve gizlilik" />
      </EnterUp>

      <EnterUp delay={60} className="gap-2">
        <Text variant="overline" color="muted" accessibilityRole="header" className="px-1.5">
          Şifre
        </Text>
        <PasswordCard />
      </EnterUp>

      <EnterUp delay={120}>
        <SettingsGroup title="Veri ve gizlilik" className="mt-1">
          {LEGAL.map((l, i) => (
            <SettingsRow
              key={l.doc}
              label={l.label}
              isLast={i === LEGAL.length - 1}
              onPress={() => void openLegalDocument(l.doc)}
              right={
                <Icon name="ArrowUpRight" size={16} color={colors.textMuted} strokeWidth={2.2} />
              }
            />
          ))}
        </SettingsGroup>
      </EnterUp>

      <EnterUp delay={180} className="flex-row gap-2.5">
        <View className="flex-1">
          <Button
            testID="privacy-freeze"
            label="Hesabımı dondur"
            variant="outline"
            onPress={() => setSheet('freeze')}
            fullWidth
          />
        </View>
        <View className="flex-1">
          <Button
            testID="privacy-delete"
            label="Hesabımı sil"
            variant="danger-outline"
            onPress={() => setSheet('delete1')}
            fullWidth
          />
        </View>
      </EnterUp>

      <BottomSheet
        visible={sheet !== null}
        onClose={() => !busy && setSheet(null)}
        dismissable={!busy}
      >
        <EnterRight key={sheet ?? 'none'} offset={30} duration={300} className="gap-3.5">
          <View className="mt-1.5 flex-row items-center gap-3">
            {sheet === 'delete2' ? (
              <Breathe min={1} max={1.08} duration={1400}>
                {iconBox}
              </Breathe>
            ) : (
              iconBox
            )}
            <Text accessibilityRole="header" variant="sheet">
              {current.title}
            </Text>
          </View>
          <Text variant="body" color="muted">
            {current.text}
          </Text>
          <View className="mt-1.5 flex-row gap-2.5">
            <View className="flex-1">
              <Button
                label="Vazgeç"
                variant="outline"
                size="lg"
                onPress={() => setSheet(null)}
                isDisabled={busy}
                fullWidth
              />
            </View>
            <View className="flex-1">
              {current.danger ? (
                <Button
                  testID="privacy-confirm"
                  label={current.cta}
                  variant="danger"
                  size="lg"
                  onPress={confirm}
                  isLoading={remove.isPending}
                  loadingLabel="Siliniyor"
                  fullWidth
                />
              ) : (
                <PressableScale
                  testID="privacy-confirm"
                  onPress={confirm}
                  disabled={busy}
                  haptics="medium"
                  accessibilityRole="button"
                  accessibilityLabel={current.cta}
                  accessibilityState={{ busy: freeze.isPending }}
                  className="h-btn-lg items-center justify-center rounded-lg bg-fg"
                >
                  <Text className="font-body-heavy text-base text-bg">
                    {freeze.isPending ? 'Donduruluyor' : current.cta}
                  </Text>
                </PressableScale>
              )}
            </View>
          </View>
        </EnterRight>
      </BottomSheet>
    </Screen>
  )
}
