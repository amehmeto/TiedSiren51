import { useLocalSearchParams } from 'expo-router'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { selectBlockSessionById } from '@/core/block-session/selectors/selectBlockSessionById'
import {
  BlockSessionForm,
  BlockSessionFormValues,
} from '@/ui/screens/Home/shared/BlockSessionForm'

export default function EditBlockSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const blockSession = useSelector((state: RootState) =>
    selectBlockSessionById(sessionId, state),
  )

  const initialValues: BlockSessionFormValues = {
    id: blockSession.id,
    name: blockSession.name,
    blocklistIds: blockSession.blocklistIds,
    devices: blockSession.devices,
    startedAt: blockSession.startedAt,
    endedAt: blockSession.endedAt,
    blockingConditions: blockSession.blockingConditions,
  }

  return <BlockSessionForm initialValues={initialValues} mode="edit" />
}
