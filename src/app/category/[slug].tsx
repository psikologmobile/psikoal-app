import { useLocalSearchParams } from 'expo-router'

import { CategoryScreen } from '@/screens/category'

export default function CategoryRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  return <CategoryScreen slug={slug ?? ''} />
}
