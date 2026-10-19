import { Platform } from 'react-native'

import { BlogFeedScreen } from '@/screens/blog'
import { SiteBlogFeedScreen, useSiteSession } from '@/screens/site'

/** Web'de oturumsuz ziyaretçi sitenin blog sayfasını (statik HTML) görür. */
export default function BlogFeedRoute() {
  const { isAuthenticated } = useSiteSession()
  if (Platform.OS === 'web' && !isAuthenticated) return <SiteBlogFeedScreen />
  return <BlogFeedScreen />
}
