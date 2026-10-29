import { fireEvent } from '@testing-library/react-native'

import { LEGAL_DOCUMENTS, LEGAL_DRAFT_NOTICE } from './content/legalDocuments'
import { ExpertsLandingScreen } from './ExpertsLandingScreen'
import { InviteScreen } from './InviteScreen'
import { LegalScreen } from './LegalScreen'
import { NotFoundScreen } from './NotFoundScreen'
import { SiteBlogFeedScreen, SiteBlogPostScreen } from './SiteBlogScreens'
import { SiteLandingScreen } from './SiteLandingScreen'
import { isSafeReturnPath, loginHref, registerHref } from './siteRoutes'
import { SupportScreen } from './SupportScreen'

import type { SiteSession } from './useSiteSession'

import { queryResult, renderScreen } from '@/test-utils/screen'

jest.mock('expo-router', () => ({
  ...require('@/test-utils/screen').expoRouterMock,
  Link: ({ children }: { children: unknown }) => children,
  usePathname: () => '/',
}))
jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@/test-utils/screen').asyncStorageMock
)
jest.mock('expo-secure-store', () => require('@/test-utils/screen').secureStoreMock)
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
)

const mockSession = jest.fn<SiteSession, []>()
jest.mock('./useSiteSession', () => ({ useSiteSession: () => mockSession() }))

const mockBlogs = jest.fn()
const mockBlog = jest.fn()
jest.mock('@/domains/blog/api/useBlogListQuery', () => ({
  useBlogListQuery: (params: unknown) => mockBlogs(params),
}))
jest.mock('@/domains/blog/api/useBlogDetailQuery', () => ({
  useBlogDetailQuery: () => mockBlog(),
}))
jest.mock('@/domains/blog/api/useLikeBlogMutation', () => ({
  useLikeBlogMutation: () => ({ mutate: jest.fn(), data: undefined }),
}))
jest.mock('@/domains/category/api/useCategoriesQuery', () => ({
  useCategoriesQuery: () =>
    require('@/test-utils/screen').queryResult([
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
    ]),
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

const loggedOut: SiteSession = { hydrated: true, isAuthenticated: false, role: null, user: null }

beforeEach(() => {
  mockSession.mockReturnValue(loggedOut)
  mockBlogs.mockReturnValue(
    queryResult({
      data: [post('1', 'Sınav kaygısıyla baş etmenin 5 yolu'), post('2', 'Uyku hijyeni')],
      meta: { page: 1, total: 2, perPage: 20 },
    })
  )
})

describe('SiteLandingScreen', () => {
  it('renders hero, steps, FAQ and blog teasers', () => {
    const screen = renderScreen(<SiteLandingScreen />)
    expect(screen.getByText('sana gelsin.')).toBeTruthy()
    expect(screen.getByText('Üç adımda doğru uzman.')).toBeTruthy()
    expect(screen.getByText('Lisanslı uzmanlar, senin iznin.')).toBeTruthy()
    expect(screen.getByText('Sınav kaygısıyla baş etmenin 5 yolu')).toBeTruthy()
    // İlk SSS açık başlar; ikincisi tıklanınca açılır.
    expect(screen.getByText(/testleri çözmek danışanlar için/)).toBeTruthy()
    fireEvent.press(screen.getByLabelText('Uzmanlar nasıl doğrulanıyor?'))
    expect(screen.getByText(/ekibimiz profili onaylamadan/)).toBeTruthy()
  })

  it('opens the mobile menu with the hamburger', () => {
    const screen = renderScreen(<SiteLandingScreen />)
    fireEvent.press(screen.getByLabelText('Menü'))
    expect(screen.getAllByText('Uzmanlar için').length).toBeGreaterThan(1)
  })

  it('shows "Uygulamaya git" for a signed-in visitor', () => {
    mockSession.mockReturnValue({ ...loggedOut, isAuthenticated: true, role: 'client' })
    const screen = renderScreen(<SiteLandingScreen />)
    expect(screen.getByText('Uygulamaya git')).toBeTruthy()
  })

  it('hides the blog section when there are no posts', () => {
    mockBlogs.mockReturnValue(queryResult({ data: [], meta: { page: 1, total: 0, perPage: 20 } }))
    const screen = renderScreen(<SiteLandingScreen />)
    expect(screen.queryByText('Okumaya değer.')).toBeNull()
  })
})

describe('ExpertsLandingScreen', () => {
  it('explains the general fee principle without any countdown', () => {
    const screen = renderScreen(<ExpertsLandingScreen />)
    expect(screen.getByText('Yeni ilan daha değerli; zamanla ve teklifle ucuzlar.')).toBeTruthy()
    expect(screen.getByLabelText(/zamanla ve teklif geldikçe düşer/)).toBeTruthy()
    expect(screen.queryByText(/sa sonra/)).toBeNull()
    expect(screen.queryByText(/sonraki düşüş/i)).toBeNull()
    expect(screen.getAllByText('Uzman olarak başvur').length).toBeGreaterThan(0)
  })
})

describe('SupportScreen', () => {
  it('switches between client and expert questions', () => {
    const screen = renderScreen(<SupportScreen />)
    expect(screen.getByText('İlan açmak ücretli mi?')).toBeTruthy()
    fireEvent.press(screen.getByText('Uzmanlar'))
    expect(screen.getByText('Teklif ücreti nasıl belirlenir?')).toBeTruthy()
    expect(screen.getByLabelText('Destek e-postası: destek@example.com')).toBeTruthy()
  })
})

describe('LegalScreen', () => {
  it.each(LEGAL_DOCUMENTS.map((d) => [d.slug, d.title] as const))(
    '%s renders as a draft with placeholders',
    (slug, title) => {
      const screen = renderScreen(<LegalScreen slug={slug} />)
      expect(screen.getAllByText(title).length).toBeGreaterThan(1)
      expect(screen.getByText(LEGAL_DRAFT_NOTICE)).toBeTruthy()
      expect(screen.getByText('İçindekiler')).toBeTruthy()
      expect(screen.getAllByText(/\[ŞİRKET UNVANI\]/).length).toBeGreaterThan(0)
    }
  )
})

describe('NotFoundScreen', () => {
  it('offers a way home', () => {
    const screen = renderScreen(<NotFoundScreen />)
    expect(screen.getByText('Bu sayfa kaybolmuş.')).toBeTruthy()
    expect(screen.getByText('Ana sayfaya dön')).toBeTruthy()
  })
})

describe('InviteScreen', () => {
  it('invites a logged-out visitor to register', () => {
    const screen = renderScreen(<InviteScreen captured />)
    expect(screen.getByText('Bir uzman seni Psikosirius’a davet etti')).toBeTruthy()
    expect(screen.getByText('Hesap oluştur')).toBeTruthy()
  })

  it('warns about an invalid code', () => {
    const screen = renderScreen(<InviteScreen captured={false} />)
    expect(screen.getByText(/geçersiz görünüyor/)).toBeTruthy()
  })

  it('sends a signed-in user to the app', () => {
    mockSession.mockReturnValue({ ...loggedOut, isAuthenticated: true, role: 'client' })
    const screen = renderScreen(<InviteScreen captured />)
    expect(screen.getByText('Uygulamaya git')).toBeTruthy()
    expect(screen.queryByText('Hesap oluştur')).toBeNull()
  })
})

describe('Site blog', () => {
  it('lists posts with a featured one and filters by category', () => {
    const screen = renderScreen(<SiteBlogFeedScreen />)
    expect(screen.getByText('Yazılar')).toBeTruthy()
    expect(screen.getByText('Sınav kaygısıyla baş etmenin 5 yolu')).toBeTruthy()
    fireEvent.press(screen.getByText('Kaygı'))
    expect(mockBlogs).toHaveBeenLastCalledWith({ category: 'kaygi' })
  })

  it('shows an article and asks a logged-out reader to sign in to like', () => {
    mockBlog.mockReturnValue(
      queryResult({
        ...post('1', 'Sınav kaygısı'),
        content: 'Giriş paragrafı.\n\n## Nefes\n\nMetin.',
      })
    )
    const screen = renderScreen(<SiteBlogPostScreen slug="yazi-1" />)
    expect(screen.getByText('Sınav kaygısı')).toBeTruthy()
    expect(screen.getByText('Nefes')).toBeTruthy()
    expect(screen.getByLabelText('Beğenmek için giriş yap')).toBeTruthy()
  })

  it('shows not found for a missing article', () => {
    mockBlog.mockReturnValue(queryResult(undefined, { isError: true }))
    const screen = renderScreen(<SiteBlogPostScreen slug="yok" />)
    expect(screen.getByText('Yazı bulunamadı')).toBeTruthy()
  })
})

describe('siteRoutes', () => {
  it('accepts only same-site return paths', () => {
    expect(isSafeReturnPath('/bakiye')).toBe(true)
    expect(isSafeReturnPath('/blog/yazi?x=1')).toBe(true)
    expect(isSafeReturnPath('//evil.test')).toBe(false)
    expect(isSafeReturnPath('https://evil.test')).toBe(false)
    expect(isSafeReturnPath('/\\evil.test')).toBe(false)
    expect(isSafeReturnPath('/javascript:alert(1)')).toBe(false)
    expect(isSafeReturnPath(undefined)).toBe(false)
  })

  it('builds login and register links', () => {
    expect(loginHref('/bakiye')).toBe('/login?returnTo=%2Fbakiye')
    expect(loginHref()).toBe('/login')
    expect(registerHref('expert')).toBe('/register?role=expert')
  })
})
