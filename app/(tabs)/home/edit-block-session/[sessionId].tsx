import { useLocalSearchParams } from 'expo-router'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { selectBlockSessionById } from '@/core/block-session/selectors/selectBlockSessionById'
import { selectIsStrictModeActive } from '@/core/strict-mode/selectors/selectIsStrictModeActive'
import { dependencies } from '@/ui/dependencies'
import { BlockSessionForm } from '@/ui/screens/Home/shared/BlockSessionForm'

export default function EditBlockSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const blockSession = useSelector((state: RootState) =>
    selectBlockSessionById(state, sessionId),
  )
  const isStrictModeActive = useSelector((state: RootState) =>
    selectIsStrictModeActive(state, dependencies.dateProvider),
  )

  return (
    <BlockSessionForm
      initialValues={blockSession}
      mode="edit"
      isStrictModeActive={isStrictModeActive}
    />
  )
}
