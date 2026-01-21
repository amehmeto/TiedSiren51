import { useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { isDefined } from '@/core/__utils__/array.utils'
import { RootState } from '@/core/_redux_/createStore'
import { selectBlockSessionById } from '@/core/block-session/selectors/selectBlockSessionById'
import { selectAllBlocklists } from '@/core/blocklist/selectors/selectAllBlocklists'
import {
  BlockSessionForm,
  Session,
} from '@/ui/screens/Home/shared/BlockSessionForm'

export default function EditBlockSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const blockSession = useSelector((state: RootState) =>
    selectBlockSessionById(sessionId, state),
  )
  const allBlocklists = useSelector(selectAllBlocklists)

  const session: Session = useMemo(() => {
    return {
      id: blockSession.id,
      name: blockSession.name,
      blocklists: blockSession.blocklistIds
        .map((id) => allBlocklists.find((bl) => bl.id === id))
        .filter(isDefined),
      devices: blockSession.devices,
      startedAt: blockSession.startedAt,
      endedAt: blockSession.endedAt,
      blockingConditions: blockSession.blockingConditions,
    }
  }, [blockSession, allBlocklists])

  return <BlockSessionForm session={session} mode="edit" />
}
