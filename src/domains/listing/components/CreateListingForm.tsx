import { useState } from 'react'

import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CreateListingStepAssessment } from './create-listing/CreateListingStepAssessment'
import { CreateListingStepPreferences } from './create-listing/CreateListingStepPreferences'
import { CreateListingStepTopic } from './create-listing/CreateListingStepTopic'

import type { SessionType } from './create-listing/CreateListingStepPreferences'
import type { CreateListingRequest } from '../types/listing.types'

import { Icon } from '@/core/components/atoms/Icon'
import { Text } from '@/core/components/atoms/Text'
import { CheckboxRow } from '@/core/components/molecules/CheckboxRow'
import { StepProgress } from '@/core/components/molecules/StepProgress'
import { BottomActionBar } from '@/core/components/organisms/BottomActionBar'
import { useMyAssessmentResultsQuery } from '@/domains/assessment'

const TOTAL_STEPS = 3
const STEP_LABELS = ['Konu & Açıklama', 'Tercihler', 'Test Sonucu']
const ICON_ON_BRAND = '#FFFFFF'
const CONSENT_TEXT =
  'Ad soyad, telefon ve e-posta bilgilerimin ilanıma teklif veren uzmanlarla paylaşılmasına onay veriyorum.'

type CreateListingFormProps = {
  step: number
  onStepChange: (step: number) => void
  onSubmit: (data: CreateListingRequest) => void
  isLoading?: boolean
  initialSpecialization?: string
}

export function CreateListingForm({
  step,
  onStepChange,
  onSubmit,
  isLoading = false,
  initialSpecialization,
}: CreateListingFormProps) {
  const [title, setTitle] = useState('')
  const [titleError, setTitleError] = useState<string | undefined>()
  const [description, setDescription] = useState('')
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(() =>
    initialSpecialization ? [initialSpecialization] : []
  )
  const [specsError, setSpecsError] = useState<string | undefined>()

  const [sessionType, setSessionType] = useState<SessionType>('online')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [budgetMinError, setBudgetMinError] = useState<string | undefined>()
  const [budgetMaxError, setBudgetMaxError] = useState<string | undefined>()

  const [selectedResultId, setSelectedResultId] = useState<string | undefined>()
  // Revize 2 §3.2: iletişim paylaşımına AÇIK rıza; işaretlenmeden yayınlanmaz.
  const [contactConsent, setContactConsent] = useState(false)
  const [consentError, setConsentError] = useState(false)

  const { data: myResultsResponse } = useMyAssessmentResultsQuery()
  const myResults = myResultsResponse?.data ?? []
  const insets = useSafeAreaInsets()
  const bottomBarHeight = 56 + insets.bottom

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    )
    setSpecsError(undefined)
  }

  const submitListing = () => {
    if (!contactConsent) {
      setConsentError(true)
      return
    }
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      specialization: selectedSpecs,
      budgetMin: parseFloat(budgetMin),
      budgetMax: parseFloat(budgetMax),
      preferredSessionType: sessionType,
      assessmentResultId: selectedResultId,
      contactConsent,
    })
  }

  const validateTopicStep = () => {
    let hasError = false
    if (title.trim().length < 10) {
      setTitleError('İlan başlığı en az 10 karakter olmalıdır')
      hasError = true
    } else {
      setTitleError(undefined)
    }
    if (selectedSpecs.length === 0) {
      setSpecsError('En az 1 uzmanlık alanı seçiniz')
      hasError = true
    } else {
      setSpecsError(undefined)
    }
    return !hasError
  }

  const validatePreferencesStep = () => {
    const minVal = parseFloat(budgetMin)
    const maxVal = parseFloat(budgetMax)
    let hasError = false
    if (!budgetMin || isNaN(minVal) || minVal <= 0) {
      setBudgetMinError('Geçerli minimum bütçe giriniz')
      hasError = true
    } else {
      setBudgetMinError(undefined)
    }
    if (!budgetMax || isNaN(maxVal) || maxVal <= 0) {
      setBudgetMaxError('Geçerli maksimum bütçe giriniz')
      hasError = true
    } else if (maxVal < minVal) {
      setBudgetMaxError('Maksimum bütçe minimumdan küçük olamaz')
      hasError = true
    } else {
      setBudgetMaxError(undefined)
    }
    return !hasError
  }

  const handleNext = () => {
    if (step === 1) {
      if (validateTopicStep()) onStepChange(2)
    } else if (step === 2) {
      if (validatePreferencesStep()) onStepChange(3)
    } else {
      submitListing()
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="px-5 pb-4 pt-2">
        <StepProgress current={step} total={TOTAL_STEPS} label={STEP_LABELS[step - 1]} />
      </View>

      <ScrollView
        contentContainerClassName="px-5 gap-5"
        contentContainerStyle={{ paddingBottom: bottomBarHeight + 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <CreateListingStepTopic
            title={title}
            onTitleChange={setTitle}
            titleError={titleError}
            description={description}
            onDescriptionChange={setDescription}
            selectedSpecs={selectedSpecs}
            onToggleSpec={toggleSpec}
            specsError={specsError}
          />
        )}

        {step === 2 && (
          <CreateListingStepPreferences
            sessionType={sessionType}
            onSessionTypeChange={setSessionType}
            budgetMin={budgetMin}
            onBudgetMinChange={setBudgetMin}
            budgetMinError={budgetMinError}
            budgetMax={budgetMax}
            onBudgetMaxChange={setBudgetMax}
            budgetMaxError={budgetMaxError}
          />
        )}

        {step === 3 && (
          <CreateListingStepAssessment
            title={title}
            selectedSpecs={selectedSpecs}
            budgetMin={budgetMin}
            budgetMax={budgetMax}
            results={myResults}
            selectedResultId={selectedResultId}
            onSelectResult={setSelectedResultId}
          />
        )}

        {step === TOTAL_STEPS && selectedResultId !== undefined && (
          <View className="flex-row items-center justify-center gap-1.5">
            <Icon name="Paperclip" size={13} color={ICON_ON_BRAND} />
            <Text variant="caption" className="text-white">
              Test sonucu ilanına eklenecek
            </Text>
          </View>
        )}
        {step === TOTAL_STEPS && (
          <CheckboxRow
            checked={contactConsent}
            onToggle={() => {
              setContactConsent((value) => !value)
              setConsentError(false)
            }}
            hasError={consentError}
            accessibilityLabel={CONSENT_TEXT}
            testID="listing-contact-consent"
          >
            <Text variant="bodySm" className="text-white">
              {CONSENT_TEXT}
            </Text>
          </CheckboxRow>
        )}
      </ScrollView>

      <BottomActionBar
        actions={
          step < TOTAL_STEPS
            ? [{ label: 'Devam Et', onPress: handleNext, variant: 'inverse' }]
            : selectedResultId === undefined && myResults.length > 0
              ? [
                  {
                    label: 'Testsiz Yayınla',
                    onPress: submitListing,
                    variant: 'inverseGhost',
                    isLoading,
                    loadingLabel: 'Yayınlanıyor...',
                  },
                  {
                    label: 'İlanı Yayınla',
                    onPress: submitListing,
                    variant: 'inverse',
                    isLoading,
                    loadingLabel: 'Yayınlanıyor...',
                  },
                ]
              : [
                  {
                    label: 'İlanı Yayınla',
                    onPress: submitListing,
                    variant: 'inverse',
                    isLoading,
                    loadingLabel: 'Yayınlanıyor...',
                  },
                ]
        }
      />
    </KeyboardAvoidingView>
  )
}
