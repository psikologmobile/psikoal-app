import { useEffect, useState } from 'react'

import { View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { useLocalSearchParams } from 'expo-router'

import type { ProfessionalProfileForm } from '@/domains/expert'

import { AppRefreshControl } from '@/core/components/atoms/AppRefreshControl'
import { Button } from '@/core/components/atoms/Button'
import { ChoiceChip } from '@/core/components/atoms/ChoiceChip'
import { Icon } from '@/core/components/atoms/Icon'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { ScreenHeader } from '@/core/components/molecules/ScreenHeader'
import { SegmentedControl } from '@/core/components/molecules/SegmentedControl'
import { Stepper } from '@/core/components/molecules/Stepper'
import { TextArea } from '@/core/components/molecules/TextArea'
import { TextField } from '@/core/components/molecules/TextField'
import { useToast } from '@/core/components/organisms/Toast'
import { Screen } from '@/core/components/templates'
import { useRefresh } from '@/core/hooks'
import { EnterLeft, EnterRight, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { useAuthStore } from '@/domains/auth'
import { useCategoriesQuery } from '@/domains/category'
import {
  ProfessionalProfileFormSchema,
  useExpertDocumentUpload,
  useExpertProfileMutation,
  useExpertProfileQuery,
} from '@/domains/expert'
import { getErrorMessage } from '@/lib/api'

type Tab = 'mesleki' | 'belgeler'

const DOCUMENT_FIELDS: Array<keyof ProfessionalProfileForm> = ['personalWebsite']

/** Depo yolundan okunur ad: ".../certificates/abc.pdf" → "Sertifika 1 · PDF". */
function certificateName(path: string, index: number): string {
  const ext = path.split('.').pop()?.toUpperCase()
  return `Sertifika ${index + 1}${ext && ext.length <= 4 ? ` · ${ext}` : ''}`
}

/**
 * Mesleki bilgiler ve belgeler (tasarım: b5_Mesleki_bilgiler_ve_belgeler).
 * Sekmeler: Mesleki bilgiler (ünvan, alanlar, deneyim, eğitim, biyografi) ·
 * Belgeler (CV, sertifikalar, kişisel site). Kaydedince değişiklik admin onayına
 * düşer → "Değişikliğin incelemede" toast'u.
 */
export function ProfessionalProfileScreen() {
  const params = useLocalSearchParams<{ tab?: string }>()
  const [tab, setTab] = useState<Tab>(params.tab === 'belgeler' ? 'belgeler' : 'mesleki')
  const colors = useThemeColors()
  const toast = useToast()
  const userId = useAuthStore((s) => s.user?.id ?? '')

  const expertQuery = useExpertProfileQuery(userId)
  const expert = expertQuery.data
  const { data: categories } = useCategoriesQuery()
  const save = useExpertProfileMutation()
  const documents = useExpertDocumentUpload()
  const { isRefreshing, onRefresh } = useRefresh(expertQuery)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfessionalProfileForm>({
    resolver: zodResolver(ProfessionalProfileFormSchema),
    defaultValues: {
      title: '',
      specializations: [],
      experienceYears: 0,
      education: '',
      bio: '',
      personalWebsite: '',
    },
  })

  useEffect(() => {
    if (!expert) return
    reset({
      title: expert.title,
      specializations: expert.specializations,
      experienceYears: expert.experienceYears,
      education: expert.education ?? '',
      bio: expert.bio,
      personalWebsite: expert.personalWebsite ?? '',
    })
  }, [expert, reset])

  const onSave = handleSubmit(
    (form) =>
      save.mutate(
        {
          title: form.title,
          specializations: form.specializations,
          experienceYears: form.experienceYears,
          education: form.education || null,
          bio: form.bio,
          personalWebsite: form.personalWebsite || null,
        },
        {
          onSuccess: () => toast.show('Değişikliğin incelemede'),
          onError: (error) => toast.show(getErrorMessage(error), { kind: 'error' }),
        }
      ),
    (formErrors) => {
      // Hatanın olduğu sekmeye geç ki kullanıcı neyi düzelteceğini görsün.
      const fields = Object.keys(formErrors) as Array<keyof ProfessionalProfileForm>
      setTab(fields.every((f) => DOCUMENT_FIELDS.includes(f)) ? 'belgeler' : 'mesleki')
    }
  )

  return (
    <Screen
      keyboard
      testID="screen-professional"
      refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      footer={
        expert ? (
          <Button
            label="Kaydet"
            size="xl"
            fullWidth
            isLoading={save.isPending}
            loadingLabel="Kaydediliyor…"
            onPress={() => void onSave()}
            testID="professional-save"
          />
        ) : undefined
      }
    >
      <ScreenHeader title="Profesyonel profil" />
      <SegmentedControl
        accessibilityLabel="Profil bölümü"
        size="lg"
        options={[
          { value: 'mesleki', label: 'Mesleki bilgiler' },
          { value: 'belgeler', label: 'Belgeler' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {expertQuery.isLoading ? (
        <View className="gap-3" testID="professional-loading">
          <Skeleton variant="rect" height={52} borderRadius="md" />
          <Skeleton variant="rect" height={90} borderRadius="md" delay={120} />
          <Skeleton variant="rect" height={140} borderRadius="md" delay={240} />
        </View>
      ) : !expert ? (
        <ErrorBanner
          title="Profil yüklenemedi"
          description="Bağlantını kontrol edip tekrar dene."
          onRetry={() => void expertQuery.refetch()}
        />
      ) : tab === 'mesleki' ? (
        <EnterLeft key="mesleki" className="gap-3">
          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label="Ünvan"
                placeholder="Klinik Psikolog"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="specializations"
            render={({ field: { value, onChange } }) => (
              <View className="gap-1.5">
                <Text variant="label">Uzmanlık alanları</Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {(categories ?? []).map((category) => (
                    <ChoiceChip
                      key={category.id}
                      label={category.name}
                      selected={value.includes(category.name)}
                      onPress={() =>
                        onChange(
                          value.includes(category.name)
                            ? value.filter((s) => s !== category.name)
                            : [...value, category.name]
                        )
                      }
                    />
                  ))}
                </View>
                {errors.specializations?.message ? (
                  <Text accessibilityRole="alert" className="text-label text-danger">
                    {errors.specializations.message}
                  </Text>
                ) : null}
              </View>
            )}
          />
          <Controller
            control={control}
            name="experienceYears"
            render={({ field: { value, onChange } }) => (
              <Stepper
                label="Deneyim (yıl)"
                value={value}
                onChange={onChange}
                min={0}
                max={50}
                unit="yıl"
              />
            )}
          />
          <Controller
            control={control}
            name="education"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label="Eğitim"
                optional
                placeholder="Hacettepe Klinik Psk. YL"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.education?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="bio"
            render={({ field: { value, onChange } }) => (
              <TextArea
                label="Biyografi"
                value={value}
                onChangeText={onChange}
                maxLength={1000}
                minLength={50}
                minHeight={130}
                error={errors.bio?.message}
                placeholder="Yaklaşımını ve kimlerle çalıştığını anlat."
              />
            )}
          />
          <Text className="text-label text-fg-muted">Değişiklikler admin onayına gidebilir.</Text>
        </EnterLeft>
      ) : (
        <EnterRight key="belgeler" className="gap-2.5">
          {documents.errorMessage ? <ErrorBanner message={documents.errorMessage} /> : null}
          <View className="flex-row items-center gap-3 rounded-xl bg-surface p-3.5">
            <View className="h-11 w-11 items-center justify-center rounded-sm bg-accent-soft">
              <Icon name="FileText" size={20} color={colors.onAccentSoft} />
            </View>
            <View className="flex-1">
              <Text className="font-body-bold text-body">CV</Text>
              <Text className="text-badge text-fg-muted">
                {expert.cvUrl ? 'Yüklendi · admin incelemesinde görünür' : 'Henüz yüklenmedi'}
              </Text>
            </View>
            <Button
              label={expert.cvUrl ? 'Güncelle' : 'Yükle'}
              size="sm"
              variant="outline"
              isLoading={documents.isUploading('cv')}
              loadingLabel="Yükleniyor…"
              onPress={() => void documents.upload('cv')}
            />
          </View>

          <Text variant="label" className="mt-1">
            Sertifikalar
          </Text>
          {(expert.certificates ?? []).map((path, index) => (
            <EnterRight key={path} index={index + 1}>
              <View className="min-h-touch flex-row items-center gap-2.5 rounded-lg border border-border px-3.5 py-3">
                <Icon name="Award" size={18} color={colors.primaryText} />
                <Text className="flex-1 font-body-semibold text-body-sm">
                  {certificateName(path, index)}
                </Text>
              </View>
            </EnterRight>
          ))}
          <PressableScale
            onPress={() => void documents.upload('certificate')}
            disabled={documents.isUploading('certificate')}
            accessibilityRole="button"
            accessibilityLabel="Sertifika ekle"
            className="h-btn-lg flex-row items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong"
          >
            <Icon name="Plus" size={18} color={colors.primaryText} strokeWidth={2.4} />
            <Text className="font-body-bold text-body text-primary-text">
              {documents.isUploading('certificate') ? 'Yükleniyor…' : 'Sertifika ekle'}
            </Text>
          </PressableScale>
          <Text className="text-badge text-fg-muted">PDF, JPEG, PNG · en çok 10 MB</Text>

          <Controller
            control={control}
            name="personalWebsite"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label="Kişisel site"
                optional
                type="url"
                placeholder="https://ornek.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.personalWebsite?.message}
                containerClassName="mt-1.5"
              />
            )}
          />
        </EnterRight>
      )}
    </Screen>
  )
}
