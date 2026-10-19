import { useLocalSearchParams } from 'expo-router'

import { AssessmentResultScreen } from '@/screens/assessment'

export default function AssessmentResultRoute() {
  const { resultId } = useLocalSearchParams<{ resultId: string }>()
  return <AssessmentResultScreen resultId={resultId ?? ''} />
}
