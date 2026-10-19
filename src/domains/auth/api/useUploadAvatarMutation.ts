import { useMutation } from '@tanstack/react-query'

import { AvatarUploadResponseSchema } from '../schemas/auth.schema'
import { useAuthStore } from '../store/authStore'

import type { PickedImage } from '../utils/pickAvatarImage'

import { post } from '@/lib/api'
import { appendUploadFile, multipartConfig } from '@/lib/uploadFile'

/**
 * Profil fotoğrafını `POST /auth/me/avatar`'a yükler (MeController.UploadAvatar).
 * Alan adı `file` olmak zorunda — controller parametresi bu adla bağlanıyor.
 * Content-Type elle yazılmaz değil, `multipart/form-data` verilir; boundary'yi
 * platform ekler (bkz. useUploadExpertDocumentMutation).
 */
export function useUploadAvatarMutation() {
  const updateUser = useAuthStore((s) => s.updateUser)

  return useMutation({
    mutationFn: async (image: PickedImage) => {
      const form = new FormData()
      await appendUploadFile(form, 'file', image)

      const raw = await post('/auth/me/avatar', form, multipartConfig())
      return AvatarUploadResponseSchema.parse(raw)
    },
    onSuccess: ({ avatarUrl }) => {
      updateUser({ avatarUrl })
    },
  })
}
