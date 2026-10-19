import { useMemo, useState } from 'react'

import { useTopupOptionsQuery, usePayTrInitMutation, useWalletQuery } from '../api'
import { savePendingTopup } from '../utils/topupSession'
import {
  isPaymentProviderUnavailableError,
  isTopupAmountOutOfRangeError,
  isTopupExpertNotApprovedError,
  parseTopupAmountInput,
} from '../utils/walletUtils'

import { formatTry } from '@/core/utils/formatTry'
import { getErrorMessage } from '@/lib/api'

type TopupSelection = { kind: 'preset'; index: number } | { kind: 'custom' }

export type TopupConsentKey = 'distanceSales' | 'preInformation'

export type TopupSubmitError =
  | { kind: 'outOfRange'; message: string }
  | { kind: 'notApproved' }
  | { kind: 'providerUnavailable' }
  | { kind: 'generic'; message: string }

export type TopupStep = 'form' | 'paytr'

export type TopupPresetView = { label: string; selected: boolean; select: () => void }

export type UseTopupFormReturn = {
  isLoading: boolean
  isError: boolean
  retry: () => void
  step: TopupStep
  presets: TopupPresetView[]
  customText: string
  setCustomText: (text: string) => void
  /** Seçilen/yazılan tutar (kuruş); geçersizse null. */
  amountKurus: number | null
  amountLabel: string
  /** Elle yazılan tutar boş ya da aralık dışıysa. */
  amountError: string | null
  rangeHint: string
  vatNote: string
  balanceLabel: string
  afterLabel: string
  consents: Record<TopupConsentKey, boolean>
  toggleConsent: (key: TopupConsentKey) => void
  /** "Ödemeye geç"e basılmış ama sözleşmeler eksik. */
  showConsentError: boolean
  submit: () => void
  isSubmitting: boolean
  submitError: TopupSubmitError | null
  iframeUrl: string | null
  backToForm: () => void
}

/** Tasarım ikinci hazır tutarla başlar (₺500); liste kısaysa ilki. */
const DEFAULT_PRESET_INDEX = 1

/**
 * Web bakiye yükleme formu (b2_Site_Bakiye_yükle): hazır tutar ya da elle tutar,
 * iki zorunlu sözleşme onayı, özet ve PayTR başlatma. Etiketler sunucudan; elle
 * yazılan tutarın ve "yükleme sonrası bakiye"nin önizlemesi formatTry ile.
 * Aralık denetiminin son sözü sunucuda (TOPUP_AMOUNT_OUT_OF_RANGE).
 */
export function useTopupForm(): UseTopupFormReturn {
  const options = useTopupOptionsQuery()
  const wallet = useWalletQuery()
  const init = usePayTrInitMutation()

  const [selection, setSelection] = useState<TopupSelection>({
    kind: 'preset',
    index: DEFAULT_PRESET_INDEX,
  })
  const [customText, setCustomTextState] = useState('')
  const [consents, setConsents] = useState<Record<TopupConsentKey, boolean>>({
    distanceSales: false,
    preInformation: false,
  })
  const [tried, setTried] = useState(false)
  const [step, setStep] = useState<TopupStep>('form')
  const [submitError, setSubmitError] = useState<TopupSubmitError | null>(null)

  const data = options.data
  const presetList = useMemo(() => data?.presets ?? [], [data])
  const presetIndex =
    selection.kind === 'preset' ? Math.min(selection.index, Math.max(presetList.length - 1, 0)) : -1
  const preset = presetIndex >= 0 ? presetList[presetIndex] : undefined

  const customKurus = selection.kind === 'custom' ? parseTopupAmountInput(customText) : null
  const rangeHint = data ? `${formatTry(data.minKurus)} – ${formatTry(data.maxKurus)}` : ''

  let amountError: string | null = null
  if (selection.kind === 'custom' && data) {
    if (customKurus === null) amountError = 'Yüklemek istediğin tutarı yaz.'
    else if (customKurus < data.minKurus || customKurus > data.maxKurus)
      amountError = `Tutar ${formatTry(data.minKurus)} ile ${formatTry(data.maxKurus)} arasında olmalı.`
  }

  let amountKurus: number | null
  let amountLabel: string
  if (selection.kind === 'preset') {
    amountKurus = preset?.amountKurus ?? null
    amountLabel = preset?.label ?? '—'
  } else {
    amountKurus = amountError ? null : customKurus
    amountLabel = customKurus !== null ? formatTry(customKurus) : '—'
  }

  const balanceKurus = wallet.data?.balanceKurus
  const afterLabel =
    balanceKurus !== undefined && amountKurus !== null ? formatTry(balanceKurus + amountKurus) : '—'

  const presets = useMemo(
    () =>
      presetList.map((p, index) => ({
        label: p.label,
        selected: index === presetIndex,
        select: () => {
          setSelection({ kind: 'preset', index })
          setCustomTextState('')
          setSubmitError(null)
        },
      })),
    [presetList, presetIndex]
  )

  const setCustomText = (text: string) => {
    setCustomTextState(text)
    setSubmitError(null)
    setSelection(text.trim() ? { kind: 'custom' } : { kind: 'preset', index: DEFAULT_PRESET_INDEX })
  }

  const allConsents = consents.distanceSales && consents.preInformation

  const submit = () => {
    setTried(true)
    setSubmitError(null)
    if (!allConsents || amountKurus === null || init.isPending) return
    const requested = amountKurus
    init.mutate(
      { amountKurus: requested },
      {
        onSuccess: () => {
          savePendingTopup({
            amountKurus: requested,
            amountLabel,
            balanceBeforeKurus: balanceKurus ?? 0,
            startedAt: Date.now(),
          })
          setStep('paytr')
        },
        onError: (error) => {
          if (isTopupAmountOutOfRangeError(error)) {
            setSubmitError({ kind: 'outOfRange', message: getErrorMessage(error) })
          } else if (isTopupExpertNotApprovedError(error)) {
            setSubmitError({ kind: 'notApproved' })
          } else if (isPaymentProviderUnavailableError(error)) {
            setSubmitError({ kind: 'providerUnavailable' })
          } else {
            setSubmitError({ kind: 'generic', message: getErrorMessage(error) })
          }
        },
      }
    )
  }

  return {
    isLoading: options.isLoading,
    isError: options.isError,
    retry: () => void options.refetch(),
    step,
    presets,
    customText,
    setCustomText,
    amountKurus,
    amountLabel,
    amountError,
    rangeHint,
    vatNote: data?.vatNote ?? '',
    balanceLabel: wallet.data?.balanceLabel ?? '—',
    afterLabel,
    consents,
    toggleConsent: (key) => setConsents((c) => ({ ...c, [key]: !c[key] })),
    showConsentError: tried && !allConsents,
    submit,
    isSubmitting: init.isPending,
    submitError,
    iframeUrl: step === 'paytr' ? (init.data?.iframeUrl ?? null) : null,
    backToForm: () => {
      setStep('form')
      init.reset()
    },
  }
}
