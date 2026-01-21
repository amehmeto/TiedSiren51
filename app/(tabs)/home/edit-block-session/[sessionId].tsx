import { useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { selectBlockSessionById } from '@/core/block-session/selectors/selectBlockSessionById'
import { blocklistAdapter } from '@/core/blocklist/blocklist'
import {
  BlockSessionForm,
  Session,
} from '@/ui/screens/Home/shared/BlockSessionForm'

export default function EditBlockSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const blockSession = useSelector((state: RootState) =>
    selectBlockSessionById(sessionId, state),
  )
  const blocklistEntities = useSelector((state: RootState) =>
    blocklistAdapter.getSelectors().selectEntities(state.blocklist),
  )

  const session: Session = useMemo(() => {
    return {
      id: blockSession.id,
      name: blockSession.name,
      blocklists: blockSession.blocklistIds.flatMap((id) =>
        id in blocklistEntities ? [blocklistEntities[id]] : [],
      ),
      devices: blockSession.devices,
      startedAt: blockSession.startedAt,
      endedAt: blockSession.endedAt,
      blockingConditions: blockSession.blockingConditions,
    }
  }, [blockSession, blocklistEntities])

  return <BlockSessionForm session={session} mode="edit" />
}
