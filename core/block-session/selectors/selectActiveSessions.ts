import { EntityState } from '@reduxjs/toolkit'
import { DateProvider } from '@/core/_ports_/port.date-provider'
import {
  BlockSession,
  blockSessionAdapter,
} from '@/core/block-session/block.session'
import { isActive } from './isActive'

export const selectActiveSessions = (
  dateProvider: DateProvider,
  blockSession: EntityState<BlockSession, string>,
): BlockSession[] => {
  return blockSessionAdapter
    .getSelectors()
    .selectAll(blockSession)
    .filter((session) => isActive(dateProvider, session))
}
