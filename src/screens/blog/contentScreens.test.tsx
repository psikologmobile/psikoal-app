import { fireEvent } from '@testing-library/react-native'

import { BlogDetailScreen } from './BlogDetailScreen'
import { BlogFeedScreen } from './BlogFeedScreen'

import { CategoryScreen } from '@/screens/category'
import {
  errorQuery,
  loadingQuery,
  mockRouter,
  queryResult,
  renderScreen,
} from '@/test-utils/screen'

jest.mock('expo-router', () => require('@/test-utils/screen').expoRouterMock)
jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@/test-utils/screen').asyncStorageMock
)
jest.mock('expo-secure-store', () => require('@/test-utils/screen').secureStoreMock)
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
)

const mockBlogs = jest.fn()
const mockBlog = jest.fn()
const mockCategory = jest.fn()
const mockLike = jest.fn()

jest.mock('@/domains/blog/api/useBlogListQuery', () => ({
  useBlogListQuery: (params: unknown) => mockBlogs(params),
}))
jest.mock('@/domains/blog/api/useBlogDetailQuery', () => ({
  useBlogDetailQuery: () => mockBlog(),
}))
jest.mock('@/domains/blog/api/useLikeBlogMutation', () => ({
  useLikeBlogMutation: () => ({ mutate: mockLike, data: undefined }),
}))
jest.mock('@/domains/category/api/useCategoriesQuery', () => ({
  useCategoriesQuery: () => ({
    data: [
      {
        id: 'c1',
        slug: 'kaygi',
        name: 'Kaygı',
        icon: 'Brain',
        summary: 'Sürekli endişe',
        description: 'Kaygı doğal bir tepkidir.',
        blogTag: 'kaygi',
        assessmentCategory: 'kaygi',
      },
    ],
    refetch: jest.fn(),
  }),
}))
jest.mock('@/domains/category/api/useCategoryDetailQuery', () => ({
  useCategoryDetailQuery: () => mockCategory(),
}))
jest.mock('@/domains/assessment/hooks/usePlayableAssessments', () => ({
  usePlayableAssessments: () => ({
    data: [
      { id: 'a1', title: 'Kaygı ölçeği', category: 'kaygi', estimatedMinutes: 3, questionCount: 7 },
    ],
    isLoading: false,
    refetch: jest.fn(),
  }),
}))

const post = (id: string, title: string) => ({
  id,
  slug: `yazi-${id}`,
  title,
  excerpt: 'Kısa özet',
  coverImage: null,
  categories: ['Kaygı'],
  likeCount: 12,
  liked: false,
  readingTime: 6,
  publishedAt: '2026-10-14T10:00:00Z',
  author: { name: 'Uzm. Psk. Elif Kaya', title: 'Klinik Psikolog' },
})

beforeEach(() => {
  jest.clearAllMocks()
  mockBlogs.mockReturnValue(
    queryResult({ data: [post('1', 'Sınav kaygısı'), post('2', 'Uyku hijyeni')] })
  )
  mockBlog.mockReturnValue(
    queryResult({
      ...post('1', 'Sınav kaygısı'),
      content: 'Giriş paragrafı.\n\n## 1. Nefes\n\nYavaş nefes.',
    })
  )
  mockCategory.mockReturnValue(
    queryResult({
      id: 'c1',
      slug: 'kaygi',
      name: 'Kaygı',
      icon: 'Brain',
      summary: 'Sürekli endişe',
      description: 'Kaygı doğal bir tepkidir.',
      blogTag: 'kaygi',
      assessmentCategory: 'kaygi',
      expertCount: 128,
      completedMatchCount: 342,
    })
  )
})

describe('BlogFeedScreen', () => {
  it('öne çıkan + satır kartı, süzgeç, beğeni', () => {
    const { getByText, getByLabelText, getAllByLabelText } = renderScreen(<BlogFeedScreen />)
    expect(getByText('Sınav kaygısı')).toBeTruthy()
    expect(getByText('Uyku hijyeni')).toBeTruthy()
    fireEvent.press(getByLabelText('Kaygı'))
    expect(mockBlogs).toHaveBeenLastCalledWith({ category: 'kaygi' })
    fireEvent.press(getAllByLabelText('Beğen, 12')[0] ?? getByText('12'))
    expect(mockLike).toHaveBeenCalledWith({ slug: 'yazi-2' }, expect.any(Object))
    expect(getAllByLabelText('Beğeniyi geri al, 13').length).toBe(1)
  })

  it('boş, yükleniyor, hata', () => {
    mockBlogs.mockReturnValue(queryResult({ data: [] }))
    const empty = renderScreen(<BlogFeedScreen />)
    expect(empty.getByText('Bu konuda henüz yazı yok')).toBeTruthy()
    empty.unmount()
    mockBlogs.mockReturnValue(loadingQuery())
    const loading = renderScreen(<BlogFeedScreen />)
    expect(loading.getAllByLabelText('Yükleniyor').length).toBeGreaterThan(0)
    loading.unmount()
    mockBlogs.mockReturnValue(errorQuery())
    expect(renderScreen(<BlogFeedScreen />).getByText('Yazılar yüklenemedi')).toBeTruthy()
  })
})

describe('BlogDetailScreen', () => {
  it('başlık, ara başlık, beğen çubuğu', () => {
    const { getByText } = renderScreen(<BlogDetailScreen slug="yazi-1" />)
    expect(getByText('Sınav kaygısı')).toBeTruthy()
    expect(getByText('1. Nefes')).toBeTruthy()
    expect(getByText('Bu yazı işine yaradı mı?')).toBeTruthy()
    fireEvent.press(getByText('12'))
    expect(mockLike).toHaveBeenCalled()
  })

  it('bulunamadı', () => {
    mockBlog.mockReturnValue(errorQuery())
    expect(renderScreen(<BlogDetailScreen slug="x" />).getByText('Yazı bulunamadı')).toBeTruthy()
  })
})

describe('CategoryScreen', () => {
  it('istatistik, ilgili test/yazı ve "Destek al"', () => {
    const { getByText, getByLabelText, getByTestId } = renderScreen(<CategoryScreen slug="kaygi" />)
    expect(getByText('Kaygı')).toBeTruthy()
    expect(getByLabelText('Bu alanda uzman: 128')).toBeTruthy()
    expect(getByText('İlgili testler')).toBeTruthy()
    expect(getByText('Sınav kaygısı')).toBeTruthy()
    fireEvent.press(getByTestId('category-support'))
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/listing/new',
      params: { spec: 'Kaygı' },
    })
  })

  it('yüklenemedi', () => {
    mockCategory.mockReturnValue(errorQuery())
    expect(renderScreen(<CategoryScreen slug="x" />).getByText('Konu yüklenemedi')).toBeTruthy()
  })
})
