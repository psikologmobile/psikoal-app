import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { expertKeys } from '../expert.constants'

import type { PickedDocument } from '../utils/pickDocument'

import { post } from '@/lib/api'
import { appendUploadFile, multipartConfig } from '@/lib/uploadFile'

/** Backend'in izin verdiği içerik tipleri — UploadService.DocumentContentTypes. */
export const DOCUMENT_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const

/** Backend sınırı: ExpertsController'daki `RequestSizeLimit(10 * 1024 * 1024)`. */
export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024

const CvResponseSchema = z.object({ cvUrl: z.string() })
const CertificatesResponseSchema = z.object({ certificates: z.array(z.string()) })

type UploadTarget = 'cv' | 'certificate'

/**
 * Uzman belgesini (CV / sertifika) yükler.
 *
 * Bu yol bir dönem hiç bağlanmamıştı: butonlar "Bu özellik yakında aktif olacak"
 * diyordu, oysa backend uçları (`POST /experts/profile/cv`, `/certificates`) ve
 * admin panelindeki imzalı-URL üreten belge görüntüleyici hazırdı. Sonuç: uzman
 * onay kuyruğu belge kanıtı olmadan işliyordu — bir psikoloji pazaryerinde
 * lisans doğrulaması yapılamıyor demek.
 */
export function useUploadExpertDocumentMutation(target: UploadTarget) {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { suppressErrorAlert: true },
    mutationFn: async (document: PickedDocument) => {
      // FormData ŞART, JSON değil: uçlar IFormFile bekliyor. Alan adı `file`
      // olmak zorunda — controller parametresi bu adla bağlanıyor, farklı bir
      // ad 422 VALIDATION_FAILED verir ve "dosya boş" gibi görünür.
      // Dosya ekleme ve başlık platforma göre değişir (bkz. lib/uploadFile).
      const form = new FormData()
      await appendUploadFile(form, 'file', document)

      const raw = await post(
        target === 'cv' ? '/experts/profile/cv' : '/experts/profile/certificates',
        form,
        multipartConfig()
      )

      const schema = target === 'cv' ? CvResponseSchema : CertificatesResponseSchema
      const result = schema.safeParse(raw)
      if (!result.success) throw result.error

      return result.data
    },
    onSuccess: () => {
      // Profil önbelleği tazelenmeli: belge yüklendikten sonra ekran hâlâ
      // "CV Yükle" gösteriyorsa kullanıcı yüklemenin başarısız olduğunu sanır.
      void queryClient.invalidateQueries({ queryKey: expertKeys.all })
    },
  })
}
