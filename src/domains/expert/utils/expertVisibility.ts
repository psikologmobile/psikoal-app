import { isApiErrorCode } from '@/lib/api'

/** 404 EXPERT_NOT_FOUND — profil yok YA DA bu danışana görünmüyor (Revize 2 §6). */
export const EXPERT_NOT_FOUND = 'EXPERT_NOT_FOUND'

/**
 * Danışan yalnız kendi ilanına teklif veren ya da kendisini davet eden uzmanın
 * profilini görür; diğerlerinde sunucu profilin VARLIĞINI da gizler ve 404
 * EXPERT_NOT_FOUND döner. Ekran bunu "bulunamadı / görüntülenemiyor" durumu
 * olarak gösterir — hata ya da tekrar dene değil.
 */
export function isExpertNotVisibleError(error: unknown): boolean {
  return isApiErrorCode(error, EXPERT_NOT_FOUND)
}
