import { useLocalSearchParams } from 'expo-router'

import { BlogDetailScreen } from '@/screens/blog'

export default function BlogDetailRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  return <BlogDetailScreen slug={slug ?? ''} />
}
