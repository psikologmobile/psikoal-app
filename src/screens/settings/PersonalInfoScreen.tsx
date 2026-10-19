import { View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import type { UpdateProfileRequest } from '@/domains/auth'

import { Avatar } from '@/core/components/atoms/Avatar'
import { Button } from '@/core/components/atoms/Button'
import { Icon } from '@/core/components/atoms/Icon'
import { Spinner } from '@/core/components/atoms/Spinner'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { InfoBanner } from '@/core/components/molecules/InfoBanner'
import { ReadonlyField } from '@/core/components/molecules/ReadonlyField'
import { ScreenHeader } from '@/core/components/molecules/ScreenHeader'
import { TextField } from '@/core/components/molecules/TextField'
import { CityPicker } from '@/core/components/organisms/CityPicker'
import { useToast } from '@/core/components/organisms/Toast'
import { Screen } from '@/core/components/templates/Screen'
import { EnterUp, Orbit, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { getInitials } from '@/core/utils/personName'
import {
  UpdateProfileSchema,
  useAuthStore,
  useChangeAvatar,
  useUpdateProfileMutation,
} from '@/domains/auth'
import { getErrorMessage } from '@/lib/api'

const INFO = {
  client:
    'Telefon ve e-postan, ilan açarken verdiğin izinle yalnız ilanına teklif veren uzmanlara açılır.',
  expert: 'Telefonun ve şehrin, eşleştiğinde danışanla paylaşılabilir. Profilinde gösterilmez.',
} as const

/**
 * Kişisel bilgiler (b0 / b5 · Kişisel bilgiler): avatar, ad-soyad, kilitli
 * e-posta, telefon, şehir; kaydedince toast. Revize 2: eski paylaşım
 * anahtarları kaldırıldı — iletişim görünürlüğünü sözleşme belirler.
 */
export function PersonalInfoScreen() {
  const colors = useThemeColors()
  const toast = useToast()
  const user = useAuthStore((s) => s.user)
  const isClient = user?.role === 'client'
  const { changeAvatar, isUploading } = useChangeAvatar()
  const { mutate: updateProfile, isPending, error } = useUpdateProfileMutation()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileRequest>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
      city: user?.city ?? null,
    },
  })

  const onSubmit = ({ firstName, lastName, phone, city }: UpdateProfileRequest) => {
    updateProfile(
      { firstName, lastName, phone: phone?.trim() || null, city: city ?? null },
      { onSuccess: () => toast.show('Bilgilerin kaydedildi') }
    )
  }

  return (
    <Screen
      testID="screen-personal"
      keyboard
      contentClassName="gap-3.5"
      footer={
        <Button
          testID="personal-save"
          label="Kaydet"
          loadingLabel="Kaydediliyor"
          onPress={handleSubmit(onSubmit)}
          isLoading={isPending}
          size="xl"
          fullWidth
        />
      }
    >
      <EnterUp>
        <ScreenHeader title="Kişisel bilgiler" />
      </EnterUp>

      <EnterUp delay={60} className="items-center">
        <PressableScale
          onPress={() => void changeAvatar()}
          disabled={isUploading}
          accessibilityRole="button"
          accessibilityLabel="Profil fotoğrafını değiştir"
          className="h-28 w-28"
        >
          <View className="absolute -inset-1.5">
            <Orbit duration={12000}>
              <View className="h-[124px] w-[124px] rounded-full border border-dashed border-accent-line" />
            </Orbit>
          </View>
          <Avatar size="hero" src={user?.avatarUrl ?? undefined} initials={getInitials(user)} />
          <View className="absolute -right-0.5 bottom-0.5 h-9 w-9 items-center justify-center rounded-full border-[3px] border-bg bg-primary">
            {isUploading ? (
              <Spinner size={14} colorClassName="border-primary-fg" />
            ) : (
              <Icon name="Camera" size={16} color={colors.onPrimary} strokeWidth={2.2} />
            )}
          </View>
        </PressableScale>
      </EnterUp>

      {error ? <ErrorBanner message={getErrorMessage(error)} /> : null}

      <EnterUp delay={120} className="flex-row gap-2.5">
        <View className="flex-1">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Ad"
                autoCapitalize="words"
                value={value ?? ''}
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
                label="Soyad"
                autoCapitalize="words"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.lastName?.message}
              />
            )}
          />
        </View>
      </EnterUp>

      <EnterUp delay={180}>
        <ReadonlyField
          label="E-posta"
          value={user?.email ?? ''}
          hint="Giriş kimliğin olduğu için değiştirilemez."
        />
      </EnterUp>

      <EnterUp delay={240}>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              testID="personal-phone"
              type="tel"
              label="Telefon"
              placeholder="0500 000 00 00"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              hint={isClient ? 'Açık ilanın varken telefon boşaltılamaz.' : undefined}
            />
          )}
        />
      </EnterUp>

      <EnterUp delay={300}>
        <Controller
          control={control}
          name="city"
          render={({ field: { onChange, value } }) => (
            <CityPicker value={value ?? null} onChange={onChange} />
          )}
        />
      </EnterUp>

      <EnterUp delay={360}>
        <InfoBanner>{isClient ? INFO.client : INFO.expert}</InfoBanner>
      </EnterUp>
    </Screen>
  )
}
