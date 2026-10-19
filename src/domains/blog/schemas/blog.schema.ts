import { z } from 'zod'

export const BlogAuthorSchema = z.object({
  name: z.string(),
  title: z.string(),
})

export const BlogSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  content: z.string().optional(),
  // Kapak yoksa (null/boş) uygulama geometrik dalga kapağı çizer (BlogCover).
  coverImage: z
    .union([z.string().url(), z.literal('')])
    .nullish()
    .transform((value) => value || null),
  categories: z.array(z.string()),
  likeCount: z.number().int().min(0),
  liked: z.boolean().default(false),
  readingTime: z.number().int().positive(),
  publishedAt: z.string().datetime(),
  author: BlogAuthorSchema,
})

export const BlogListItemSchema = BlogSchema.omit({ content: true })

export const BlogListResponseSchema = z.object({
  data: z.array(BlogListItemSchema),
  meta: z.object({ page: z.number(), total: z.number(), perPage: z.number() }),
})

export const BlogLikeResponseSchema = z.object({ likeCount: z.number(), liked: z.boolean() })
