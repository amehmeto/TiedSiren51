import { useLocalSearchParams } from 'expo-router'
import { BlockSessionForm } from '@/ui/screens/Home/shared/BlockSessionForm'

export default function EditBlockSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()

  return <BlockSessionForm sessionId={sessionId} mode="edit" />
}
