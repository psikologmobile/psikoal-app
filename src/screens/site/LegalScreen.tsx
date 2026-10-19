import { Pressable, ScrollView, View } from 'react-native'

import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { SiteLink } from './components/SiteLink'
import { SitePage, SiteSection, useSiteScroll } from './components/SitePage'
import {
  LEGAL_DOCUMENTS,
  LEGAL_DRAFT_NOTICE,
  LEGAL_LAST_UPDATED,
  getLegalDocument,
} from './content/legalDocuments'
import { SITE_ROUTES } from './siteRoutes'

import type { LegalSection, LegalSlug, LegalTable } from './content/legalDocuments'

import { Text } from '@/core/components/atoms/Text'
import { cn } from '@/core/utils/cn'

function TableBlock({ table }: { table: LegalTable }) {
  return (
    // Tablolar telefonda yatay kaydırılır (tasarım notu).
    <ScrollView horizontal className="mb-3 rounded-lg border border-border">
      <View className="min-w-full">
        <View className="flex-row border-b border-border bg-surface">
          {table.head.map((cell) => (
            <Text key={cell} className="w-[200px] px-4 py-3 font-body-bold text-body-sm text-fg">
              {cell}
            </Text>
          ))}
        </View>
        {table.rows.map((row, r) => (
          <View
            key={row.join('|')}
            className={cn('flex-row', r < table.rows.length - 1 && 'border-b border-border')}
          >
            {row.map((cell, c) => (
              <Text key={`${r}-${c}`} className="w-[200px] px-4 py-3 text-body-sm text-fg-muted">
                {cell}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

function TableOfContents({ sections }: { sections: readonly LegalSection[] }) {
  const { scrollToAnchor } = useSiteScroll()
  return (
    <View className="mb-2 rounded-xl bg-surface px-5 py-4.5">
      <Text className="mb-2 font-body-bold text-body-sm text-fg">İçindekiler</Text>
      <View className="gap-1.5">
        {sections.map((section, i) => (
          <Pressable
            key={section.id}
            accessibilityRole="link"
            onPress={() => scrollToAnchor(section.id)}
          >
            <Text className="font-body-semibold text-body text-link">
              {i + 1}. {section.title}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

/**
 * Hukuk metinleri (b2_Site_Hukuk_metinleri): solda belge listesi, sağda belge
 * (son güncelleme, başlık, içindekiler, bölümler, kaydırılabilir tablo). Her belge
 * ayrı adres (/gizlilik, /kosullar, /kvkk, /mesafeli-satis, /on-bilgilendirme).
 */
export function LegalScreen({ slug }: { slug: LegalSlug }) {
  const doc = getLegalDocument(slug)
  return (
    <SitePage
      testID={`screen-site-legal-${slug}`}
      head={{ title: doc.title, description: doc.description, path: doc.path }}
      header={
        <SiteHeader
          actions={
            <SiteLink href={SITE_ROUTES.support}>
              <Text className="font-body-bold text-body text-link">Destek</Text>
            </SiteLink>
          }
        />
      }
      footer={<SiteFooter />}
    >
      <SiteSection className="gap-12 pb-20 pt-6 min-[901px]:flex-row min-[901px]:items-start">
        <View
          role="navigation"
          aria-label="Hukuk metinleri"
          className="site-a flex-row flex-wrap gap-0.5 rounded-card border border-border p-2.5 min-[901px]:w-[260px] min-[901px]:flex-col"
        >
          {LEGAL_DOCUMENTS.map((item) => {
            const current = item.slug === slug
            return (
              <SiteLink
                key={item.slug}
                href={item.path}
                current={current}
                className={cn('site-lnk rounded-sm px-3 py-2.5', current && 'bg-accent-soft')}
              >
                <Text
                  className={cn(
                    'font-body-semibold text-body-sm',
                    current ? 'text-accent-soft-fg' : 'text-fg-muted'
                  )}
                >
                  {item.title}
                </Text>
              </SiteLink>
            )
          })}
        </View>

        <View className="site-a site-d1 max-w-[720px] flex-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="font-body-bold text-label text-primary-text">
              Son güncelleme: {LEGAL_LAST_UPDATED}
            </Text>
            <View className="rounded-full bg-danger-soft px-2.5 py-1">
              <Text className="font-body-heavy text-xs text-danger-soft-fg">
                {LEGAL_DRAFT_NOTICE}
              </Text>
            </View>
          </View>
          <Text
            role="heading"
            aria-level={1}
            className="mb-5 mt-2 font-display text-[34px] leading-[38px] tracking-[-0.7px] text-fg sm:text-5xl sm:leading-[52px]"
          >
            {doc.title}
          </Text>
          <TableOfContents sections={doc.sections} />
          {doc.sections.map((section, i) => (
            <LegalSectionBlock key={section.id} section={section} index={i} />
          ))}
        </View>
      </SiteSection>
    </SitePage>
  )
}

function LegalSectionBlock({ section, index }: { section: LegalSection; index: number }) {
  return (
    <View nativeID={section.id}>
      <Text role="heading" aria-level={2} className="mb-2 mt-7 font-display-bold text-2xl text-fg">
        {index + 1}. {section.title}
      </Text>
      {section.paragraphs.map((p) => (
        <Text key={p} className="mb-3 font-body-regular text-base leading-7 text-fg">
          {p}
        </Text>
      ))}
      {section.table ? <TableBlock table={section.table} /> : null}
    </View>
  )
}
