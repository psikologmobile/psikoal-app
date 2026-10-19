import { Platform } from 'react-native'

import { appendUploadFile, multipartConfig } from './uploadFile'

const file = { uri: 'blob:http://localhost/abc', name: 'avatar.png', mimeType: 'image/png' }

describe('uploadFile', () => {
  const originalOS = Platform.OS
  const originalFetch = global.fetch

  afterEach(() => {
    Platform.OS = originalOS
    global.fetch = originalFetch
  })

  it('native: RN dosya nesnesini ekler ve çok parçalı başlığı verir', async () => {
    Platform.OS = 'ios'
    const form = { append: jest.fn() } as unknown as FormData

    await appendUploadFile(form, 'file', file)

    expect(form.append).toHaveBeenCalledWith('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
    })
    expect(multipartConfig()).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } })
  })

  it('web: seçicinin adresinden gerçek File ekler ve başlığı tarayıcıya bırakır', async () => {
    Platform.OS = 'web'
    global.fetch = jest.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['x'], { type: 'image/png' })),
    }) as unknown as typeof fetch
    const form = { append: jest.fn() } as unknown as FormData

    await appendUploadFile(form, 'file', file)

    expect(global.fetch).toHaveBeenCalledWith(file.uri)
    const appended = (form.append as jest.Mock).mock.calls[0][1] as File
    expect(appended).toBeInstanceOf(File)
    expect(appended.name).toBe('avatar.png')
    expect(appended.type).toBe('image/png')
    expect(multipartConfig()).toBeUndefined()
  })
})
