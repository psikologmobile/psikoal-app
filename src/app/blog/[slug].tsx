import { Platform } from 'react-native'

import { useLocalSearchParams } from 'expo-router'

import { BlogDetailScreen } from '@/screens/blog'
import { SiteBlogPostScreen, useSiteSession } from '@/screens/site'

/** Web'de oturumsuz ziyaretçi sitenin yazı sayfasını görür. */
export default function BlogDetailRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { isAuthenticated } = useSiteSession()
  if (Platform.OS === 'web' && !isAuthenticated) return <SiteBlogPostScreen slug={slug ?? ''} />
  return <BlogDetailScreen slug={slug ?? ''} />
}
