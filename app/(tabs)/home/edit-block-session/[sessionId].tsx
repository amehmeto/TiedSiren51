import { RootState } from '@/core/_redux_/createStore'
import { useSelector } from 'react-redux'
import { selectBlockSessionById } from '@/core/block-session/selectors/selectBlockSessionById'
import { BlockSessionForm } from '@/ui/screens/Home/shared/BlockSessionForm'
import { useLocalSearchParams } from 'expo-router'

export default function EditBlockSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const session = useSelector((state: RootState) =>
    selectBlockSessionById(sessionId as string, state),
  )

  return <BlockSessionForm session={session} mode="edit" />
}
