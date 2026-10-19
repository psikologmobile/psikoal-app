import { View } from 'react-native'

import type { UseExpertOnboardingReturn } from '@/domains/expert'

import { Avatar } from '@/core/components/atoms/Avatar'
import { Button } from '@/core/components/atoms/Button'
import { ChoiceChip } from '@/core/components/atoms/ChoiceChip'
import { Icon } from '@/core/components/atoms/Icon'
import { IconButton } from '@/core/components/atoms/IconButton'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { Stepper } from '@/core/components/molecules/Stepper'
import { TextArea } from '@/core/components/molecules/TextArea'
import { TextField } from '@/core/components/molecules/TextField'
import { CityPicker } from '@/core/components/organisms/CityPicker'
import { DrawCheck, EnterRight, Fill, Orbit, Pop, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { useCategoriesQuery } from '@/domains/category'
import { BIO_MAX, EXPERIENCE_MAX } from '@/domains/expert'

type StepProps = { flow: UseExpertOnboardingReturn }

function StepTitle({ children }: { children: string }) {
  return (
    <EnterRight>
      <Text accessibilityRole="header" className="mt-2 font-display text-h2 text-fg">
        {children}
      </Text>
    </EnterRight>
  )
}

/** 1/4 — ünvan ve deneyim yılı. */
export function StepIdentity({ flow, firstName }: StepProps & { firstName: string }) {
  const { values, errors, set } = flow
  return (
    <View className="gap-4">
      <StepTitle>{firstName ? `Seni tanıyalım, ${firstName}.` : 'Seni tanıyalım.'}</StepTitle>
      <EnterRight delay={60}>
        <Text className="text-body text-fg-muted">
          Profilin admin onayından sonra danışanlara görünür.
        </Text>
      </EnterRight>
      <EnterRight delay={120}>
        <TextField
          testID="onboarding-title"
          label="Ünvan"
          labelRight={<Text className="text-label text-fg-muted">Zorunlu</Text>}
          placeholder="Ör. Klinik Psikolog"
          autoCapitalize="words"
          value={values.title}
          onChangeText={(t) => set('title', t)}
          error={errors.title}
        />
      </EnterRight>
      <EnterRight delay={180}>
        <Stepper
          label="Deneyim yılı"
          unit="yıl"
          min={0}
          max={EXPERIENCE_MAX}
          value={values.experienceYears}
          onChange={(n) => set('experienceYears', n)}
        />
      </EnterRight>
    </View>
  )
}

/** 2/4 — uzmanlık alanları (kategorilerden). */
export function StepSpecializations({ flow }: StepProps) {
  const { values, errors, toggleSpecialization } = flow
  const { data: categories, isLoading, isError, refetch } = useCategoriesQuery()
  return (
    <View className="gap-3.5">
      <StepTitle>Uzmanlık alanların</StepTitle>
      <EnterRight delay={60}>
        <Text className="text-body text-fg-muted">
          En az birini seç. Fırsatlar bu alanlara göre süzülür.
        </Text>
      </EnterRight>
      <EnterRight delay={120} className="flex-row flex-wrap gap-2">
        {isLoading ? (
          [96, 120, 84, 110, 90].map((w, i) => (
            <Skeleton key={i} width={w} height={46} borderRadius="full" delay={i * 120} />
          ))
        ) : isError ? (
          <Button
            label="Alanlar yüklenemedi · Tekrar dene"
            variant="outline"
            onPress={() => void refetch()}
          />
        ) : (
          (categories ?? []).map((c) => (
            <ChoiceChip
              key={c.id}
              label={c.name}
              selected={values.specializations.includes(c.name)}
              onPress={() => toggleSpecialization(c.name)}
            />
          ))
        )}
      </EnterRight>
      {errors.specializations ? (
        <Text accessibilityRole="alert" className="text-xs text-danger-soft-fg">
          {errors.specializations}
        </Text>
      ) : null}
    </View>
  )
}

/** 3/4 — iletişim, biyografi (50–1000), eğitim. */
export function StepAbout({ flow }: StepProps) {
  const { values, errors, set } = flow
  return (
    <View className="gap-3">
      <StepTitle>Kendini anlat</StepTitle>
      <EnterRight delay={60} className="flex-row gap-2.5">
        <View className="flex-1">
          <TextField
            testID="onboarding-phone"
            type="tel"
            label="Telefon"
            placeholder="0500 000 00 00"
            value={values.phone}
            onChangeText={(t) => set('phone', t)}
          />
        </View>
        <View className="flex-1">
          <CityPicker value={values.city} onChange={(c) => set('city', c)} />
        </View>
      </EnterRight>
      <EnterRight delay={60}>
        <Text className="text-xs text-fg-muted">
          İsteğe bağlı; eşleştiğinde danışanla paylaşılabilir.
        </Text>
      </EnterRight>
      <EnterRight delay={120} className="gap-2">
        <TextArea
          testID="onboarding-bio"
          label="Biyografi"
          placeholder="Çalışma yaklaşımın, odaklandığın konular…"
          value={values.bio}
          onChangeText={(t) => set('bio', t)}
          minLength={50}
          maxLength={BIO_MAX}
          minHeight={140}
          error={errors.bio}
        />
        <View className="h-1.5 overflow-hidden rounded-full bg-border" accessibilityElementsHidden>
          <Fill value={values.bio.length / BIO_MAX} delay={400} className="bg-primary" />
        </View>
      </EnterRight>
      <EnterRight delay={180}>
        <TextField
          label="Eğitim"
          optional
          placeholder="Ör. Hacettepe Ünv. Klinik Psikoloji YL"
          value={values.education}
          onChangeText={(t) => set('education', t)}
        />
      </EnterRight>
    </View>
  )
}

type DocsProps = StepProps & {
  initials: string
  avatarUrl: string | null
  isUploadingAvatar: boolean
  onPickAvatar: () => void
  onPickCv: () => void
  onPickCertificate: () => void
}

function PickedRow({ name, onRemove }: { name: string; onRemove?: () => void }) {
  const colors = useThemeColors()
  return (
    <View className="min-h-14 flex-row items-center gap-2.5 rounded-xl border border-border px-3.5 py-2">
      <Pop>
        <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
          <DrawCheck size={13} color={colors.onPrimary} strokeWidth={3.4} delay={100} />
        </View>
      </Pop>
      <Text numberOfLines={1} className="flex-1 font-body-semibold text-body-sm text-fg">
        {name}
      </Text>
      <Text className="text-xs text-fg-muted">Gönderince yüklenir</Text>
      {onRemove ? (
        <IconButton
          icon="X"
          variant="ghost"
          accessibilityLabel={`${name} kaldır`}
          onPress={onRemove}
        />
      ) : null}
    </View>
  )
}

function AddDocButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="min-h-[54px] items-center justify-center rounded-xl border border-dashed border-border-strong px-3"
    >
      <Text className="text-center font-body-bold text-body text-link">{label}</Text>
    </PressableScale>
  )
}

/** 4/4 — profil fotoğrafı, CV, sertifikalar, kişisel site. */
export function StepDocuments({
  flow,
  initials,
  avatarUrl,
  isUploadingAvatar,
  onPickAvatar,
  onPickCv,
  onPickCertificate,
}: DocsProps) {
  const colors = useThemeColors()
  const { values, errors, set, removeCertificate } = flow
  return (
    <View className="gap-3">
      <StepTitle>Belgeler ve fotoğraf</StepTitle>
      <EnterRight delay={60}>
        <View className="flex-row items-center gap-4 rounded-card bg-surface p-3.5">
          <View className="h-[84px] w-[84px] items-center justify-center">
            <View className="absolute inset-0">
              <Orbit duration={12000}>
                <View className="h-[84px] w-[84px] rounded-full border-2 border-dashed border-accent-line" />
              </Orbit>
            </View>
            <Avatar size="2xl" src={avatarUrl ?? undefined} initials={initials} />
          </View>
          <View className="flex-1 gap-1.5">
            <Text className="font-body-bold text-body text-fg">Profil fotoğrafı</Text>
            <Text className="text-xs text-fg-muted">
              JPEG, PNG, WebP · en çok 5 MB · 1:1 kırpılır
            </Text>
            <Button
              label="Fotoğraf seç"
              loadingLabel="Yükleniyor"
              variant="outline"
              size="sm"
              onPress={onPickAvatar}
              isLoading={isUploadingAvatar}
            />
          </View>
        </View>
      </EnterRight>
      <EnterRight delay={120} className="gap-2">
        {values.cv ? (
          <View className="gap-1">
            <View className="flex-row items-center gap-2">
              <Icon name="FileText" size={18} color={colors.link} />
              <Text className="font-body-bold text-label text-fg">CV</Text>
            </View>
            <PickedRow name={values.cv.name} onRemove={() => set('cv', null)} />
          </View>
        ) : (
          <AddDocButton label="+ CV ekle · PDF, JPEG, PNG · en çok 10 MB" onPress={onPickCv} />
        )}
      </EnterRight>
      <EnterRight delay={180} className="gap-2">
        {values.certificates.map((doc, i) => (
          <PickedRow
            key={`${doc.uri}-${i}`}
            name={doc.name}
            onRemove={() => removeCertificate(i)}
          />
        ))}
        <AddDocButton
          label="+ Sertifika ekle · PDF, JPEG, PNG · en çok 10 MB"
          onPress={onPickCertificate}
        />
      </EnterRight>
      <EnterRight delay={240}>
        <TextField
          type="url"
          label="Kişisel site"
          optional
          placeholder="https://"
          value={values.personalWebsite}
          onChangeText={(t) => set('personalWebsite', t)}
          error={errors.personalWebsite}
        />
      </EnterRight>
    </View>
  )
}
