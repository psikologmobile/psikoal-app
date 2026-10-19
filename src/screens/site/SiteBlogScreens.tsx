import { useState } from 'react'

import { Pressable, View } from 'react-native'

import { SiteAuthActions } from './components/SiteAuthActions'
import { SiteButton } from './components/SiteButton'
import { SiteFooter } from './components/SiteFooter'
import { SiteGrid } from './components/SiteGrid'
import { SiteHeader } from './components/SiteHeader'
import { SiteLink } from './components/SiteLink'
import { SitePage, SiteSection } from './components/SitePage'
import { SITE_ROUTES, blogPostHref, loginHref, registerHref } from './siteRoutes'
import { useSiteSession } from './useSiteSession'

import type { SiteNavItem } from './components/SiteHeader'
import type { BlogListItem } from '@/domains/blog'

import { Avatar } from '@/core/components/atoms/Avatar'
import { Skeleton } from '@/core/components/atoms/Skeleton'
import { Text } from '@/core/components/atoms/Text'
import { ErrorBanner } from '@/core/components/molecules/ErrorBanner'
import { cn } from '@/core/utils/cn'
import { formatDate } from '@/core/utils/formatDate'
import { BlogCover, BlogLikeButton, useBlogDetailQuery, useBlogListQuery } from '@/domains/blog'
import { useCategoriesQuery } from '@/domains/category'

const BLOG_NAV: SiteNavItem[] = [
  { label: 'Nasıl çalışır', href: SITE_ROUTES.home },
  { label: 'Uzmanlar için', href: SITE_ROUTES.experts },
  { label: 'Blog', href: SITE_ROUTES.blog, current: true },
  { label: 'Destek', href: SITE_ROUTES.support },
]

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((part) => part && !part.endsWith('.'))
    .slice(-2)
    .map((part) => part.charAt(0).toLocaleUpperCase('tr-TR'))
    .join('')
}

function metaLine(post: BlogListItem): string {
  const category = post.categories[0]
  return `${category ? `${category} · ` : ''}${post.readingTime} dk`
}

function CategoryChip({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        'site-press h-[42px] justify-center rounded-full border px-4',
        selected ? 'border-accent bg-accent' : 'border-border-strong bg-transparent'
      )}
    >
      <Text
        className={cn(
          'text-body-sm',
          selected ? 'font-body-bold text-accent-fg' : 'font-body-semibold text-fg'
        )}
      >
        {label}
      </Text>
    </Pressable>
  )
}

function FeaturedPost({ post }: { post: BlogListItem }) {
  return (
    <SiteLink
      href={blogPostHref(post.slug)}
      className="site-a site-d3 mb-8 overflow-hidden rounded-[32px] border border-border min-[901px]:flex-row"
    >
      <View className="min-[901px]:flex-[1.2]">
        <BlogCover imageUrl={post.coverImage} size="hero" seed={post.slug} className="h-[340px]" />
      </View>
      <View className="justify-center gap-3.5 p-9 min-[901px]:flex-1">
        <Text className="font-body-heavy text-label uppercase tracking-[1px] text-primary-text">
          Öne çıkan · {metaLine(post)}
        </Text>
        <Text className="font-display text-[36px] leading-10 text-fg">{post.title}</Text>
        <Text className="font-body-regular text-base leading-6 text-fg-muted">{post.excerpt}</Text>
        <Text className="text-body-sm text-fg-muted">
          {post.author.name} · {formatDate(post.publishedAt, 'dayMonthShort')} · ♥ {post.likeCount}
        </Text>
      </View>
    </SiteLink>
  )
}

function PostCard({ post }: { post: BlogListItem }) {
  return (
    <SiteLink
      href={blogPostHref(post.slug)}
      className="site-hov h-full overflow-hidden rounded-3xl border border-border"
    >
      <BlogCover imageUrl={post.coverImage} size="card" seed={post.slug} />
      <View className="gap-2 p-4.5">
        <Text className="font-body-bold text-label text-primary-text">{metaLine(post)}</Text>
        <Text className="font-body-heavy text-[19px] leading-6 text-fg">{post.title}</Text>
        <Text className="text-body-sm text-fg-muted">{post.excerpt}</Text>
        <Text className="text-label text-fg-muted">
          {post.author.name} · {formatDate(post.publishedAt, 'dayMonthShort')}
        </Text>
      </View>
    </SiteLink>
  )
}

/** Yazılar (b2_Site_Blog) — web'de oturumsuz ziyaretçinin /blog sayfası. */
export function SiteBlogFeedScreen() {
  const [category, setCategory] = useState<string | undefined>(undefined)
  const categoriesQuery = useCategoriesQuery()
  const blogsQuery = useBlogListQuery(category ? { category } : {})
  const blogs = blogsQuery.data?.data ?? []
  const [featured, ...rest] = blogs
  const categories = categoriesQuery.data ?? []

  return (
    <SitePage
      testID="screen-site-blog"
      head={{
        title: 'Yazılar',
        description: 'Uzmanlarımızdan ruh sağlığı üzerine kısa ve anlaşılır yazılar.',
        path: SITE_ROUTES.blog,
      }}
      header={
        <SiteHeader
          nav={BLOG_NAV}
          desktopActions={<SiteAuthActions />}
          menuFooter={<SiteButton href={loginHref()} label="Web'de kullan" />}
        />
      }
      footer={<SiteFooter />}
    >
      <SiteSection className="gap-4 pb-6 pt-10">
        <Text
          role="heading"
          aria-level={1}
          className="site-a font-display text-[44px] leading-[46px] tracking-[-1.3px] text-fg sm:text-6xl sm:leading-[58px]"
        >
          Yazılar
        </Text>
        <Text className="site-a site-d1 font-body-regular text-lg text-fg-muted">
          Uzmanlarımızdan ruh sağlığı üzerine kısa ve anlaşılır yazılar.
        </Text>
        {categories.length > 0 ? (
          <View className="site-a site-d2 flex-row flex-wrap gap-2">
            <CategoryChip
              label="Tümü"
              selected={category === undefined}
              onPress={() => setCategory(undefined)}
            />
            {categories.map((item) => (
              <CategoryChip
                key={item.id}
                label={item.name}
                selected={category === item.blogTag}
                onPress={() => setCategory(item.blogTag)}
              />
            ))}
          </View>
        ) : null}
      </SiteSection>

      <SiteSection className="pb-18">
        {blogsQuery.isLoading ? (
          <View accessibilityLabel="Yükleniyor" className="gap-5">
            <Skeleton height={340} borderRadius="3xl" />
            <SiteGrid itemClassName="min-[641px]:w-1/2 min-[901px]:w-1/3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={300} borderRadius="3xl" delay={i * 120} />
              ))}
            </SiteGrid>
          </View>
        ) : blogsQuery.isError ? (
          <ErrorBanner
            title="Yazılar yüklenemedi"
            description="Bağlantını kontrol edip tekrar dene."
            onRetry={() => void blogsQuery.refetch()}
          />
        ) : !featured ? (
          <View className="items-center gap-2 py-15">
            <Text className="font-body-bold text-lg text-fg">Bu konuda henüz yazı yok</Text>
            <Text className="text-body text-fg-muted">Başka bir konu seçebilirsin.</Text>
          </View>
        ) : (
          <>
            <FeaturedPost post={featured} />
            <SiteGrid itemClassName="min-[641px]:w-1/2 min-[901px]:w-1/3">
              {rest.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </SiteGrid>
          </>
        )}
      </SiteSection>
    </SitePage>
  )
}

/** Beğeni: oturum yoksa girişe götürür (beğenmek hesap ister). */
function LikeBar({ slug, liked, likeCount }: { slug: string; liked: boolean; likeCount: number }) {
  const { isAuthenticated } = useSiteSession()
  return (
    <View className="mt-3 flex-row flex-wrap items-center justify-between gap-3 rounded-card border border-border p-4.5">
      <Text className="font-body-bold text-body text-fg">Bu yazı işine yaradı mı?</Text>
      {isAuthenticated ? (
        <BlogLikeButton slug={slug} liked={liked} likeCount={likeCount} variant="pill" />
      ) : (
        <SiteButton
          href={loginHref(blogPostHref(slug))}
          label={`♥ ${likeCount}`}
          variant="ghost"
          accessibilityLabel="Beğenmek için giriş yap"
        />
      )}
    </View>
  )
}

/** Yazı (b2_Site_Blog_yazısı) — web'de oturumsuz ziyaretçinin /blog/[slug] sayfası. */
export function SiteBlogPostScreen({ slug }: { slug: string }) {
  const query = useBlogDetailQuery(slug)
  const blog = query.data

  const header = (
    <SiteHeader
      actions={
        <SiteLink href={SITE_ROUTES.blog}>
          <Text className="font-body-bold text-body text-link">← Tüm yazılar</Text>
        </SiteLink>
      }
    />
  )

  if (query.isLoading || query.isError || !blog) {
    return (
      <SitePage
        testID="screen-site-blog-post"
        head={{
          title: 'Yazı',
          description: 'PsikoAl uzmanlarından ruh sağlığı yazısı.',
          path: blogPostHref(slug),
        }}
        header={header}
        footer={<SiteFooter />}
      >
        <SiteSection className="gap-4 pb-18 pt-4">
          {query.isLoading ? (
            <View accessibilityLabel="Yükleniyor" className="gap-4">
              <Skeleton height={320} borderRadius="3xl" />
              <Skeleton width="60%" height={40} borderRadius="xs" delay={120} />
              <Skeleton height={160} borderRadius="md" delay={240} />
            </View>
          ) : (
            <View className="items-center gap-4 py-15">
              <Text className="font-display text-h3 text-fg">Yazı bulunamadı</Text>
              <Text className="text-body text-fg-muted">
                İçerik kaldırılmış olabilir. Diğer yazılara göz atabilirsin.
              </Text>
              <SiteButton href={SITE_ROUTES.blog} label="Tüm yazılar" />
            </View>
          )}
        </SiteSection>
      </SitePage>
    )
  }

  const paragraphs = (blog.content ?? blog.excerpt).split(/\n{2,}/).filter((p) => p.trim())
  const category = blog.categories[0]

  return (
    <SitePage
      testID="screen-site-blog-post"
      head={{ title: blog.title, description: blog.excerpt, path: blogPostHref(blog.slug) }}
      header={header}
      footer={<SiteFooter />}
    >
      <SiteSection className="pb-18">
        <View className="site-a mb-10 mt-4 overflow-hidden rounded-[32px]">
          <BlogCover
            imageUrl={blog.coverImage}
            size="hero"
            seed={blog.slug}
            className="h-[320px]"
          />
        </View>
        <View className="gap-10 min-[1101px]:flex-row min-[1101px]:items-start">
          <View className="max-w-[720px] flex-1 gap-4.5">
            <Text className="site-a site-d1 font-body-bold text-body-sm text-primary-text">
              {category ? `${category} · ` : ''}
              {blog.readingTime} dk okuma · {formatDate(blog.publishedAt, 'long')}
            </Text>
            <Text
              role="heading"
              aria-level={1}
              className="site-a site-d2 font-display text-[34px] leading-[38px] tracking-[-0.7px] text-fg sm:text-[52px] sm:leading-[55px] sm:tracking-[-1px]"
            >
              {blog.title}
            </Text>
            <View className="site-a site-d3 flex-row items-center gap-3">
              <Avatar size="sm" tone="accent" initials={initialsOf(blog.author.name)} />
              <View>
                <Text className="font-body-bold text-body text-fg">{blog.author.name}</Text>
                <Text className="text-label text-fg-muted">{blog.author.title}</Text>
              </View>
            </View>
            {paragraphs.map((paragraph, i) => {
              const heading = paragraph.match(/^#{1,3}\s+(.*)$/)
              return heading ? (
                <Text
                  key={i}
                  role="heading"
                  aria-level={2}
                  className="mt-2 font-display-bold text-2xl text-fg"
                >
                  {heading[1]}
                </Text>
              ) : (
                <Text
                  key={i}
                  className={cn(
                    'font-body-regular text-[17px] leading-7',
                    i === 0 ? 'text-fg' : 'text-fg-muted'
                  )}
                >
                  {paragraph.trim()}
                </Text>
              )
            })}
            <LikeBar slug={blog.slug} liked={blog.liked} likeCount={blog.likeCount} />
          </View>
          <View className="site-a site-d3 gap-3.5 rounded-3xl bg-accent p-5 min-[1101px]:w-[300px]">
            <Text className="font-display-bold text-[22px] leading-7 text-accent-fg">
              Destek almak ister misin?
            </Text>
            <Text className="text-body-sm text-accent-muted">
              İlan aç, bu alanda uzman psikologlar sana teklif göndersin.
            </Text>
            <SiteButton href={registerHref('client')} label="Ücretsiz ilan aç" />
          </View>
        </View>
      </SiteSection>
    </SitePage>
  )
}
