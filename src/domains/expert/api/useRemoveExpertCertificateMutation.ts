import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { expertKeys } from '../expert.constants'

import { del } from '@/lib/api'

/** 404 — gönderilen değer profildeki sertifikalardan biri değil. */
export const CERTIFICATE_NOT_FOUND = 'CERTIFICATE_NOT_FOUND'

const RemoveCertificateResponseSchema = z.object({ certificates: z.array(z.string()) })

/** Yanıt zarfı (`{ data: … }`) varsa açar; yoksa gövdeyi olduğu gibi döndürür. */
function unwrap(raw: unknown): unknown {
  return typeof raw === 'object' && raw !== null && 'data' in raw
    ? (raw as { data: unknown }).data // REASON: `in` denetiminden geçen düz nesne
    : raw
}

/**
 * Sertifikayı kaldırır: `DELETE /experts/profile/certificates?certificate=<değer>`.
 * Değer `ExpertDto.certificates` içindeki dizgidir (URL kodlanır). Yanıt güncel
 * `{ certificates }`; bilinmeyen değerde 404 CERTIFICATE_NOT_FOUND.
 */
export function useRemoveExpertCertificateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { suppressErrorAlert: true },
    mutationFn: async (certificate: string) => {
      const raw = await del(
        `/experts/profile/certificates?certificate=${encodeURIComponent(certificate)}`
      )
      return RemoveCertificateResponseSchema.parse(unwrap(raw))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: expertKeys.all })
    },
  })
}
