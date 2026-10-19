import { View } from 'react-native'

import { useRouter } from 'expo-router'

import type { SessionType } from '@/domains/listing'

import { Avatar } from '@/core/components/atoms/Avatar'
import { BudgetCells } from '@/core/components/atoms/BudgetCells'
import { Button } from '@/core/components/atoms/Button'
import { Checkbox } from '@/core/components/atoms/Checkbox'
import { ChoiceChip } from '@/core/components/atoms/ChoiceChip'
import { Icon } from '@/core/components/atoms/Icon'
import { IconButton } from '@/core/components/atoms/IconButton'
import { ProgressSegments } from '@/core/components/atoms/ProgressSegments'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { TagChip } from '@/core/components/atoms/TagChip'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { RadioCard } from '@/core/components/molecules/RadioCard'
import { TextArea } from '@/core/components/molecules/TextArea'
import { TextField } from '@/core/components/molecules/TextField'
import { WebPageHeader } from '@/core/components/molecules/WebPageHeader'
import { CityPicker } from '@/core/components/organisms/CityPicker'
import { SuccessHero } from '@/core/components/organisms/SuccessHero'
import { Screen, WebColumns } from '@/core/components/templates'
import { useBreakpoint } from '@/core/hooks'
import { EnterRight, EnterUp, Fill, Float, Pop, PressableScale } from '@/core/motion'
import { useThemeColors } from '@/core/theme'
import { cn } from '@/core/utils/cn'
import { formatDate } from '@/core/utils/formatDate'
import { formatTry } from '@/core/utils/formatTry'
import { RESULT_LEVEL_LABELS, useMyAssessmentResultsQuery } from '@/domains/assessment'
import { useAuthStore } from '@/domains/auth'
import { useCategoriesQuery } from '@/domains/category'
import {
  BUDGET_CELL_COUNT,
  BUDGET_PRESETS,
  budgetRangeLabel,
  budgetRuleText,
  CREATE_LISTING_STEPS,
  DEFAULT_LISTING_RULES,
  descriptionStrength,
  LISTING_MAX_ACTIVE,
  CLIENT_SESSION_MODE_LABELS,
  shortClientName,
  useCreateListingWizard,
  useListingRulesQuery,
  useMyListingsQuery,
} from '@/domains/listing'
import { openLegalDocument } from '@/lib/externalLinks'

const CONSENT_TEXT =
  'İlanıma teklif gönderen uzmanların adımı, soyadımı, telefon numaramı ve e-posta adresimi görmesine ve benimle bu bilgiler üzerinden iletişime geçmesine açık rıza veriyorum.'
const CONSENT_HELPER =
  'Bilgilerin yalnız ilanına teklif gönderen uzmanlara açılır. İlanın eşleştiğinde ya da kapandığında yeni uzmanlar bilgilerini göremez.'

/** Web adım listesi (tasarım: b1_Web_İlan_oluştur `.steps`). */
const WEB_STEPS = [
  'Konu',
  'Alanlar',
  'Görüşme',
  'Bütçe',
  'Test sonucu',
  'İletişim izni',
  'Önizleme',
]

const SESSION_OPTIONS: SessionType[] = ['online', 'yüz_yüze', 'yüz_yüze_online']
/** Önizlemedeki görüşme etiketi (tasarım: "Online veya yüz yüze"). */
const PREVIEW_MODE: Record<SessionType, string> = {
  online: 'Online',
  yüz_yüze: 'Yüz yüze',
  yüz_yüze_online: 'Online veya yüz yüze',
}

function StepHeading({
  eyebrow,
  title,
  compact = false,
}: {
  eyebrow: string
  title: string
  /** Web bölüm başlığı: yalnız eyebrow, 22 px display. */
  compact?: boolean
}) {
  if (compact) {
    return (
      <Text accessibilityRole="header" className="font-display-bold text-[22px] leading-7 text-fg">
        {eyebrow}
      </Text>
    )
  }
  return (
    <>
      <EnterRight>
        <Text variant="overline" color="link">
          {eyebrow}
        </Text>
      </EnterRight>
      <EnterRight index={1}>
        <Text
          accessibilityRole="header"
          className="font-display text-[32px] leading-[34px] tracking-tight text-fg"
        >
          {title}
        </Text>
      </EnterRight>
    </>
  )
}

/** "3 açık ilan sınırındasın" (durum: ilanSiniri). */
function LimitState({ maxActive, onGo }: { maxActive: number; onGo: () => void }) {
  return (
    <Screen
      testID="screen-listing-new"
      contentClassName="flex-1 items-center gap-4 pt-[120px]"
      footer={<Button label="İlanlarıma git" size="xl" fullWidth onPress={onGo} />}
    >
      <Pop>
        <View className="h-[120px] w-[120px] flex-row flex-wrap content-center gap-1.5 rounded-[36px] border border-border-strong bg-surface p-[22px]">
          {Array.from({ length: maxActive }, (_, i) => (
            <View key={i} className="h-[20px] flex-1 rounded-xs bg-primary" />
          ))}
        </View>
      </Pop>
      <EnterUp index={1}>
        <Text variant="h3" align="center" accessibilityRole="header">
          {maxActive} açık ilan sınırındasın
        </Text>
      </EnterUp>
      <EnterUp index={2}>
        <Text className="max-w-[320px] text-center text-base text-fg-muted">
          Aynı anda en çok {maxActive} açık ilanın olabilir. Yeni ilan açmak için birini kapatabilir
          ya da eşleşti olarak işaretleyebilirsin.
        </Text>
      </EnterUp>
    </Screen>
  )
}

type CreateListingScreenProps = {
  /** Kategori/Keşfet'ten gelen ön seçili alan (`?spec=`). */
  initialSpecialization?: string
}

/** Danışan · İlan oluştur, 7 adım (tasarım: b0_İlan_oluştur). */
export function CreateListingScreen({ initialSpecialization }: CreateListingScreenProps) {
  const router = useRouter()
  const colors = useThemeColors()
  const user = useAuthStore((s) => s.user)
  const rulesQuery = useListingRulesQuery()
  const myListingsQuery = useMyListingsQuery()
  const categoriesQuery = useCategoriesQuery()
  const resultsQuery = useMyAssessmentResultsQuery()

  const rules = rulesQuery.data ?? DEFAULT_LISTING_RULES
  const maxActive = rulesQuery.data?.maxActive ?? LISTING_MAX_ACTIVE
  const wizard = useCreateListingWizard({
    rules: rulesQuery.data,
    initialSpecialization,
    initialCity: user?.city,
    profilePhone: user?.phone,
  })
  const { step, values, errors, update } = wizard
  const { isWebLayout, isWide } = useBreakpoint()

  if (rulesQuery.isLoading || myListingsQuery.isLoading) {
    return (
      <Screen testID="screen-listing-new">
        <View accessibilityLabel="Yükleniyor" className="gap-4">
          <Skeleton height={44} borderRadius="full" width={44} />
          <Skeleton height={40} width="80%" borderRadius="sm" delay={120} />
          <Skeleton height={54} borderRadius="md" delay={240} />
          <Skeleton height={170} borderRadius="md" delay={360} />
        </View>
      </Screen>
    )
  }

  const activeCount = myListingsQuery.data?.meta.activeCount ?? 0
  if ((activeCount >= maxActive && !wizard.created) || wizard.limitReached) {
    return <LimitState maxActive={maxActive} onGo={() => router.replace('/(tabs)/offers')} />
  }

  if (wizard.created) {
    const listingId = wizard.created.id
    return (
      <Screen
        testID="screen-listing-new"
        contentClassName="flex-1 justify-center"
        footer={
          <Button
            label="İlanımı gör"
            size="xl"
            fullWidth
            onPress={() => router.replace(`/listing/${listingId}`)}
          />
        }
      >
        <SuccessHero
          title="İlan yayınlandı, incelemede"
          description="Admin onayından sonra uzmanlar ilanını görecek. Genelde birkaç saat sürer."
          tone="primary"
          confetti={6}
        />
      </Screen>
    )
  }

  const categories = categoriesQuery.data ?? []
  const areaNames = Array.from(
    new Set([...categories.map((c) => c.name), ...values.specialization])
  )
  const strength = descriptionStrength(values.description.trim().length)
  const results = resultsQuery.data?.data ?? []
  const selectedResult = results.find((r) => r.id === values.assessmentResultId)
  const [fromCell, toCell] = BUDGET_PRESETS[values.budgetPreset] ?? [0, 3]
  const rangeLabel = budgetRangeLabel(wizard.budget.budgetMin, wizard.budget.budgetMax)

  /** Adım gövdesi: mobilde o anki adım, web'de bütün bölümler (aynı alanlar, aynı doğrulama). */
  const stepBody = (current: number, web: boolean) => (
    <>
      {current === 0 ? (
        <>
          <StepHeading compact={web} eyebrow="Konu" title="Neyle ilgili destek arıyorsun?" />
          <EnterRight index={2}>
            <TextField
              label="Başlık"
              value={values.title}
              onChangeText={(text) => update('title', text)}
              maxLength={rules.titleMax}
              labelRight={
                <Text className="text-label text-fg-muted">
                  {values.title.length}/{rules.titleMax}
                </Text>
              }
              error={errors.title}
              testID="listing-title"
            />
          </EnterRight>
          <EnterRight index={3}>
            <TextArea
              label="Açıklama"
              value={values.description}
              onChangeText={(text) => update('description', text)}
              maxLength={rules.descriptionMax}
              minHeight={170}
              error={errors.description}
              testID="listing-description"
            />
          </EnterRight>
          <EnterRight index={4}>
            <View className="gap-2 rounded-lg bg-accent-soft p-3.5">
              <View className="flex-row justify-between">
                <Text variant="label" className="text-accent-soft-fg">
                  Anlatım gücü
                </Text>
                <Text variant="label" className="text-accent-soft-fg">
                  {strength.label}
                </Text>
              </View>
              <View
                className="h-1.5 overflow-hidden rounded-full bg-accent-line"
                accessibilityRole="progressbar"
                accessibilityLabel={`Anlatım gücü: ${strength.label}`}
                accessibilityValue={{ min: 0, max: 100, now: Math.round(strength.value * 100) }}
              >
                <Fill value={strength.value} delay={400} duration={900} />
              </View>
              <Text className="text-label text-accent-soft-fg">
                Ne kadar açık anlatırsan, gelen teklifler o kadar isabetli olur.
              </Text>
            </View>
          </EnterRight>
        </>
      ) : null}

      {current === 1 ? (
        <>
          <StepHeading compact={web} eyebrow="Uzmanlık alanları" title="Hangi konularda?" />
          <EnterRight index={2}>
            <Text className="text-body text-fg-muted">
              Birden fazla seçebilirsin.
              {values.specialization.length > 0
                ? ` ${values.specialization.length} alan seçili.`
                : ''}
            </Text>
          </EnterRight>
          <EnterRight index={3}>
            {categoriesQuery.isLoading ? (
              <View className="flex-row flex-wrap gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} width={96} height={46} borderRadius="full" delay={i * 100} />
                ))}
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {areaNames.map((name) => (
                  <ChoiceChip
                    key={name}
                    label={name}
                    selected={values.specialization.includes(name)}
                    onPress={() => wizard.toggleSpecialization(name)}
                  />
                ))}
              </View>
            )}
          </EnterRight>
          {errors.specialization ? <ErrorBanner message={errors.specialization} /> : null}
        </>
      ) : null}

      {current === 2 ? (
        <>
          <StepHeading compact={web} eyebrow="Görüşme şekli" title="Nasıl görüşmek istersin?" />
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="Görüşme şekli"
            className="gap-2.5"
          >
            {SESSION_OPTIONS.map((option, i) => (
              <EnterRight key={option} index={i + 2}>
                <RadioCard
                  title={CLIENT_SESSION_MODE_LABELS[option]}
                  selected={values.preferredSessionType === option}
                  onPress={() => update('preferredSessionType', option)}
                />
              </EnterRight>
            ))}
          </View>
          {wizard.needsCity ? (
            <Pop>
              <View className="gap-1.5">
                <CityPicker
                  label="Şehir"
                  value={values.city}
                  onChange={(city) => update('city', city)}
                  error={errors.city}
                />
                {!errors.city ? (
                  <Text className="text-label text-fg-muted">Yüz yüze görüşme için zorunlu</Text>
                ) : null}
              </View>
            </Pop>
          ) : null}
        </>
      ) : null}

      {current === 3 ? (
        <>
          <StepHeading compact={web} eyebrow="Bütçe · seans başı" title="Ne kadar ayırabilirsin?" />
          <EnterRight index={2}>
            <View className="rounded-lg bg-accent-soft p-3.5">
              <Text className="text-body-sm text-accent-soft-fg">{budgetRuleText(rules)}</Text>
            </View>
          </EnterRight>
          <EnterRight index={3}>
            <View className="gap-4 rounded-2xl bg-surface p-5">
              <Text className="text-center font-display text-[34px] leading-9 text-fg">
                {rangeLabel}
              </Text>
              <BudgetCells
                count={BUDGET_CELL_COUNT}
                from={fromCell}
                to={toCell}
                className="h-[70px]"
              />
              <View className="flex-row justify-between">
                <Text className="font-body-semibold text-xs text-fg-muted">
                  {formatTry(wizard.scale.min * 100)}
                </Text>
                <Text className="font-body-semibold text-xs text-fg-muted">
                  {rules.budgetMaxTry === null
                    ? `${formatTry(wizard.scale.top * 100)}+`
                    : formatTry(wizard.scale.top * 100)}
                </Text>
              </View>
            </View>
          </EnterRight>
          <EnterRight index={4}>
            <View className="flex-row flex-wrap gap-2">
              {BUDGET_PRESETS.map(([from, to], i) => {
                const range = wizard.scale.range(from, to)
                const label = budgetRangeLabel(range.budgetMin, range.budgetMax)
                const selected = values.budgetPreset === i
                return (
                  <PressableScale
                    key={label}
                    onPress={() => update('budgetPreset', i)}
                    haptics="selection"
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={label}
                    wrapperClassName="w-[48.5%]"
                    className={cn(
                      'h-12 items-center justify-center rounded-md border',
                      selected ? 'border-accent-line bg-accent-soft' : 'border-border-strong'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-body',
                        selected
                          ? 'font-body-bold text-accent-soft-fg'
                          : 'font-body-semibold text-fg'
                      )}
                    >
                      {label}
                    </Text>
                  </PressableScale>
                )
              })}
            </View>
          </EnterRight>
          {errors.budgetMin || errors.budgetMax ? (
            <ErrorBanner message={errors.budgetMin ?? errors.budgetMax} />
          ) : null}
        </>
      ) : null}

      {current === 4 ? (
        <>
          <StepHeading
            compact={web}
            eyebrow="Test sonucu · isteğe bağlı"
            title="Bir test sonucu ekle"
          />
          <EnterRight index={2}>
            <Text className="text-body text-fg-muted">
              Uzmanlar seni daha iyi anlar. Eklemeden de devam edebilirsin.
            </Text>
          </EnterRight>
          <View accessibilityRole="radiogroup" accessibilityLabel="Test sonucu" className="gap-2.5">
            {results.map((result, i) => (
              <EnterRight key={result.id} index={i + 3}>
                <RadioCard
                  title={result.assessmentTitle}
                  description={`${RESULT_LEVEL_LABELS[result.level]} · ${result.score} puan · ${formatDate(result.createdAt, 'dayMonthShort')}`}
                  selected={values.assessmentResultId === result.id}
                  onPress={() => update('assessmentResultId', result.id)}
                />
              </EnterRight>
            ))}
            <EnterRight index={results.length + 3}>
              <RadioCard
                title="Ekleme"
                description="Test sonucu olmadan devam et"
                selected={values.assessmentResultId === undefined}
                onPress={() => update('assessmentResultId', undefined)}
              />
            </EnterRight>
          </View>
        </>
      ) : null}

      {current === 5 ? (
        <>
          <StepHeading compact={web} eyebrow="İletişim izni" title="Kimler görecek?" />
          <EnterRight index={2}>
            <View className="flex-row items-center gap-2.5 rounded-xl bg-surface p-3.5">
              <Float>
                <View className="h-11 w-11 items-center justify-center rounded-md bg-accent-soft">
                  <Icon name="Eye" size={22} color={colors.onAccentSoft} />
                </View>
              </Float>
              <Text className="flex-1 text-body-sm text-fg">
                Teklif gönderen uzmanlar{' '}
                <Text className="font-body-bold">ad soyadını, telefonunu ve e-postanı</Text> görür.
              </Text>
            </View>
          </EnterRight>
          {wizard.needsPhone ? (
            <EnterRight index={3}>
              <TextField
                label="Telefon"
                type="tel"
                labelRight={<Text className="text-label text-fg-muted">Zorunlu</Text>}
                value={values.phone}
                onChangeText={(text) => update('phone', text)}
                placeholder="0500 000 00 00"
                error={errors.phone}
                testID="listing-phone"
              />
            </EnterRight>
          ) : null}
          <EnterRight index={4}>
            <View
              className={cn(
                'flex-row items-start gap-3 rounded-xl border p-4',
                errors.contactConsent ? 'border-danger' : 'border-border-strong'
              )}
            >
              <Checkbox
                checked={values.contactConsent}
                onChange={(checked) => update('contactConsent', checked)}
                accessibilityLabel="İletişim izni"
                hasError={Boolean(errors.contactConsent)}
                testID="listing-consent"
              />
              <View className="flex-1 gap-2">
                <Text className="text-body-sm text-fg">
                  {CONSENT_TEXT}{' '}
                  <Text
                    accessibilityRole="link"
                    onPress={() => void openLegalDocument('kvkk')}
                    className="font-body-bold text-link"
                  >
                    KVKK Aydınlatma Metni
                  </Text>
                </Text>
                <Text className="text-label text-fg-muted">{CONSENT_HELPER}</Text>
              </View>
            </View>
          </EnterRight>
          {errors.contactConsent ? <ErrorBanner message={errors.contactConsent} /> : null}
        </>
      ) : null}

      {current === 6 ? (
        <>
          <StepHeading compact={web} eyebrow="Önizleme" title="Uzmanlar böyle görecek" />
          <EnterRight index={2}>
            <View className="gap-2.5 rounded-3xl border border-border-strong bg-surface p-4">
              <View className="flex-row items-center gap-2.5">
                <Avatar size="sm" tone="accent" initials={user?.firstName?.charAt(0)} />
                <Text className="font-body-semibold text-body-sm text-fg">
                  {shortClientName(user?.firstName, user?.lastName)} ·{' '}
                  <Text className="font-body text-fg-muted">şimdi</Text>
                </Text>
              </View>
              <Text className="font-body-bold text-lg text-fg">{values.title.trim()}</Text>
              {values.description.trim() ? (
                <Text variant="bodySm" color="muted" numberOfLines={2}>
                  {values.description.trim()}
                </Text>
              ) : null}
              <View className="flex-row flex-wrap gap-1.5">
                {values.specialization.map((spec) => (
                  <TagChip key={spec} label={spec} tone="accent" />
                ))}
                <TagChip label={PREVIEW_MODE[values.preferredSessionType]} tone="accent" />
                {wizard.needsCity && values.city ? (
                  <TagChip label={values.city} tone="accent" />
                ) : null}
                {selectedResult ? <TagChip label="Test sonucu var" tone="accent" /> : null}
              </View>
              <Text className="font-body-bold text-body-sm text-fg">Bütçe {rangeLabel}</Text>
            </View>
          </EnterRight>
          <EnterRight index={3}>
            <Text className="text-label text-fg-muted">
              Tam adın yalnız sana teklif veren uzmanlara açılır.
            </Text>
          </EnterRight>
        </>
      ) : null}
    </>
  )

  if (isWebLayout) {
    const doneCount = WEB_STEPS.filter((_, i) => wizard.stepDone(i)).length
    const steps = (
      <EnterUp index={1}>
        <View accessibilityLabel="Adımlar" className="gap-1">
          {WEB_STEPS.map((label, i) => {
            const done = wizard.stepDone(i)
            return (
              <View key={label} className="h-10 flex-row items-center gap-2.5 rounded-sm px-2.5">
                {done ? (
                  <Pop>
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <Icon name="Check" size={14} color={colors.onPrimary} strokeWidth={3} />
                    </View>
                  </Pop>
                ) : (
                  <View className="h-6 w-6 items-center justify-center rounded-full border border-border-strong">
                    <Text className="font-body-heavy text-xs text-fg">{i + 1}</Text>
                  </View>
                )}
                <Text
                  className={cn(
                    'text-body-sm',
                    done ? 'font-body-bold text-fg' : 'font-body-semibold text-fg-muted'
                  )}
                >
                  {label}
                </Text>
              </View>
            )
          })}
          <View
            className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-border"
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: CREATE_LISTING_STEPS, now: doneCount }}
          >
            <Fill value={doneCount / CREATE_LISTING_STEPS} duration={400} />
          </View>
          <Text className="text-xs text-fg-muted">
            {doneCount} / {CREATE_LISTING_STEPS} adım hazır
          </Text>
        </View>
      </EnterUp>
    )
    const preview = (
      <EnterUp index={3} className="gap-3.5">
        {stepBody(6, true)}
        {errors.form ? <ErrorBanner message={errors.form} /> : null}
        <Button
          label="Yayınla"
          size="xl"
          fullWidth
          isLoading={wizard.isSubmitting}
          loadingLabel="Yayınlanıyor…"
          onPress={() => void wizard.publishAll()}
          testID="listing-new-publish"
        />
        <Text className="text-label text-fg-muted">
          Aynı anda en çok {maxActive} açık ilanın olabilir · {activeCount}/{maxActive}
        </Text>
      </EnterUp>
    )
    return (
      <Screen testID="screen-listing-new" keyboard contentClassName="gap-6">
        <WebPageHeader
          backLabel="Keşfet"
          onBack={() => router.back()}
          title="Yeni ilan"
          subtitle="İhtiyacını anlat; admin onayından sonra uzmanlar teklifleriyle gelsin."
        />
        <View className="flex-row items-start gap-6">
          {isWide ? <View className="w-[200px]">{steps}</View> : null}
          <View className="min-w-0 flex-1">
            <WebColumns aside={preview} asideWidth={340} asideWidthNarrow={300} stackAt={760}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <EnterUp key={i} index={Math.min(7, i + 2)}>
                  <View
                    className={cn(
                      'gap-3.5 rounded-3xl border p-6',
                      i === 5 && errors.contactConsent ? 'border-danger' : 'border-border'
                    )}
                  >
                    {stepBody(i, true)}
                  </View>
                </EnterUp>
              ))}
            </WebColumns>
          </View>
        </View>
      </Screen>
    )
  }

  const footer = (
    <View className="w-full gap-2.5">
      {errors.form ? <ErrorBanner message={errors.form} /> : null}
      {wizard.blockedLabel ? (
        <Button label={wizard.blockedLabel} size="xl" fullWidth isDisabled onPress={wizard.next} />
      ) : (
        <Button
          label={wizard.isLast ? 'Yayınla' : 'Devam'}
          size="xl"
          fullWidth
          isLoading={wizard.isSubmitting}
          loadingLabel="Yayınlanıyor…"
          onPress={wizard.next}
          testID="listing-new-next"
        />
      )}
    </View>
  )

  return (
    <Screen testID="screen-listing-new" keyboard footer={footer} contentClassName="gap-[18px]">
      <View className="flex-row items-center gap-3">
        {wizard.isFirst ? (
          <IconButton accessibilityLabel="Kapat" icon="X" onPress={() => router.back()} />
        ) : (
          <IconButton accessibilityLabel="Geri" icon="ChevronLeft" onPress={wizard.back} />
        )}
        <ProgressSegments
          total={CREATE_LISTING_STEPS}
          current={step + 1}
          accessibilityLabel={`Adım ${step + 1} / ${CREATE_LISTING_STEPS}`}
          className="flex-1"
        />
        <Text className="font-body-bold text-body-sm text-fg-muted">
          {step + 1}/{CREATE_LISTING_STEPS}
        </Text>
      </View>

      <View key={step} className="gap-3.5">
        {stepBody(step, false)}
      </View>
    </Screen>
  )
}
