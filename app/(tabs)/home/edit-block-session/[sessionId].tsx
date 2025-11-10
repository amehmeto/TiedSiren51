import { useLocalSearchParams } from 'expo-router'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { selectBlockSessionById } from '@/core/block-session/selectors/selectBlockSessionById'
import { BlockSessionForm } from '@/ui/screens/Home/shared/BlockSessionForm'

export default function EditBlockSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const session = useSelector((state: RootState) =>
    selectBlockSessionById(sessionId, state),
  )

  return <BlockSessionForm session={session} mode="edit" />
}
