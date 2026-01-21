import { useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { selectBlockSessionById } from '@/core/block-session/selectors/selectBlockSessionById'
import { selectBlocklistsByIds } from '@/core/blocklist/selectors/selectBlocklistsByIds'
import {
  BlockSessionForm,
  Session,
} from '@/ui/screens/Home/shared/BlockSessionForm'

export default function EditBlockSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const blockSession = useSelector((state: RootState) =>
    selectBlockSessionById(sessionId, state),
  )
  const blocklists = useSelector((state: RootState) =>
    selectBlocklistsByIds(blockSession.blocklistIds, state),
  )

  const session: Session = useMemo(() => {
    return {
      id: blockSession.id,
      name: blockSession.name,
      blocklists,
      devices: blockSession.devices,
      startedAt: blockSession.startedAt,
      endedAt: blockSession.endedAt,
      blockingConditions: blockSession.blockingConditions,
    }
  }, [blockSession, blocklists])

  return <BlockSessionForm session={session} mode="edit" />
}
