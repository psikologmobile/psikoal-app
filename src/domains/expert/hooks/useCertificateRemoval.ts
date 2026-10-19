import { useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
  CERTIFICATE_NOT_FOUND,
  useRemoveExpertCertificateMutation,
} from '../api/useRemoveExpertCertificateMutation'
import { expertKeys } from '../expert.constants'

import { getErrorMessage, isApiErrorCode } from '@/lib/api'

export type CertificateRemovalTarget = { value: string; label: string }

type UseCertificateRemovalParams = {
  /** Kaldırma tamamlandı (ya da sertifika zaten yoktu): kullanıcıya gösterilecek mesaj. */
  onDone?: (message: string) => void
}

type UseCertificateRemovalReturn = {
  /** Onay sayfasında gösterilen sertifika (yoksa sayfa kapalı). */
  target: CertificateRemovalTarget | null
  ask: (target: CertificateRemovalTarget) => void
  cancel: () => void
  confirm: () => void
  isPending: boolean
  errorMessage: string | undefined
}

/**
 * Sertifika kaldırma akışı: onay sayfası → DELETE. 404 CERTIFICATE_NOT_FOUND
 * (başka cihazdan zaten kaldırılmış) hata sayılmaz: profil tazelenir, sayfa kapanır.
 */
export function useCertificateRemoval({
  onDone,
}: UseCertificateRemovalParams = {}): UseCertificateRemovalReturn {
  const queryClient = useQueryClient()
  const mutation = useRemoveExpertCertificateMutation()
  const [target, setTarget] = useState<CertificateRemovalTarget | null>(null)

  const confirm = () => {
    if (!target) return
    mutation.mutate(target.value, {
      onSuccess: () => {
        setTarget(null)
        onDone?.('Sertifika kaldırıldı')
      },
      onError: (error) => {
        if (isApiErrorCode(error, CERTIFICATE_NOT_FOUND)) {
          void queryClient.invalidateQueries({ queryKey: expertKeys.all })
          setTarget(null)
          onDone?.('Bu sertifika zaten kaldırılmış')
        }
      },
    })
  }

  const isNotFound = isApiErrorCode(mutation.error, CERTIFICATE_NOT_FOUND)

  return {
    target,
    ask: (next) => {
      mutation.reset()
      setTarget(next)
    },
    cancel: () => {
      if (!mutation.isPending) setTarget(null)
    },
    confirm,
    isPending: mutation.isPending,
    errorMessage: mutation.error && !isNotFound ? getErrorMessage(mutation.error) : undefined,
  }
}
