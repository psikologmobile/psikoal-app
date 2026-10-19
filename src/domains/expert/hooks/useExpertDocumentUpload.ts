import { useCallback, useState } from 'react'

import { useUploadExpertDocumentMutation } from '../api/useUploadExpertDocumentMutation'
import { pickExpertDocument } from '../utils/pickDocument'

import { getErrorMessage } from '@/lib/api'

type DocumentTarget = 'cv' | 'certificate'

type UseExpertDocumentUploadReturn = {
  /** Belge seçtirir ve yükler; iptal sessizdir. */
  upload: (target: DocumentTarget) => Promise<void>
  isUploading: (target: DocumentTarget) => boolean
  /** Son denemenin kullanıcıya gösterilecek hatası (reddedilen dosya ya da sunucu). */
  errorMessage: string | undefined
}

/**
 * CV / sertifika seç + yükle. Seçim iptal edilirse sessiz kalınır; reddedilen
 * dosya (tip/boyut) ve sunucu hatası `errorMessage` ile döner.
 */
export function useExpertDocumentUpload(): UseExpertDocumentUploadReturn {
  const cv = useUploadExpertDocumentMutation('cv')
  const certificate = useUploadExpertDocumentMutation('certificate')
  const [errorMessage, setErrorMessage] = useState<string>()

  const upload = useCallback(
    async (target: DocumentTarget) => {
      setErrorMessage(undefined)
      const picked = await pickExpertDocument()
      if (picked.status === 'canceled') return
      if (picked.status === 'rejected') {
        setErrorMessage(picked.message)
        return
      }
      const mutation = target === 'cv' ? cv : certificate
      mutation.mutate(picked.document, {
        onError: (error) => setErrorMessage(getErrorMessage(error)),
      })
    },
    [cv, certificate]
  )

  const isUploading = (target: DocumentTarget) =>
    target === 'cv' ? cv.isPending : certificate.isPending

  return { upload, isUploading, errorMessage }
}
