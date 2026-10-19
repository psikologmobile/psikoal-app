import { useLocalSearchParams } from 'expo-router'

import { AssessmentResultScreen } from '@/screens/assessment'
import { AppWebShell } from '@/screens/shell'

export default function AssessmentResultRoute() {
  const { resultId } = useLocalSearchParams<{ resultId: string }>()
  return (
    <AppWebShell>
      <AssessmentResultScreen resultId={resultId ?? ''} />
    </AppWebShell>
  )
}
