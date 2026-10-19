import { Platform } from 'react-native'

import type { AxiosRequestConfig } from 'axios'

export type UploadFile = { uri: string; name: string; mimeType: string }

/**
 * Seçilen dosyayı FormData'ya platforma uygun biçimde ekler.
 *
 * Native: React Native FormData `{ uri, name, type }` nesnesini dosya olarak gönderir.
 * Web: tarayıcı bu nesneyi "[object Object]" metnine çevirir ve sunucu dosyayı göremez
 * (400). Seçicinin verdiği blob:/data: adresi okunup gerçek bir File eklenir.
 */
export async function appendUploadFile(
  form: FormData,
  field: string,
  file: UploadFile
): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(file.uri)).blob()
    form.append(field, new File([blob], file.name, { type: file.mimeType || blob.type }))
    return
  }
  // REASON: React Native FormData { uri, name, type } nesnesi kabul eder; DOM Blob tipi yoktur
  form.append(field, { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob)
}

/**
 * Çok parçalı istek ayarı. Native'de başlık verilir (boundary'yi RN ekler); web'de
 * başlık hiç yazılmaz: tarayıcı boundary'li başlığı kendisi üretir, elle yazılan
 * başlık boundary'yi düşürür ve sunucu gövdeyi ayrıştıramaz.
 */
export function multipartConfig(): AxiosRequestConfig | undefined {
  return Platform.OS === 'web' ? undefined : { headers: { 'Content-Type': 'multipart/form-data' } }
}
