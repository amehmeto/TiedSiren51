import { DateProvider } from '@/core/_ports_/date-provider'
import { RootState } from '@/core/_redux_/createStore'
import {
  BlockSession,
  blockSessionAdapter,
} from '@/core/block-session/block-session'
import { isActive } from './isActive'

export const selectActiveSessions = (
  state: RootState,
  dateProvider: DateProvider,
): BlockSession[] => {
  return blockSessionAdapter
    .getSelectors()
    .selectAll(state.blockSession)
    .filter((session) => isActive(dateProvider, session))
}
