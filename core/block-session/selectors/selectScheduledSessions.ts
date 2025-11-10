import { EntityState } from '@reduxjs/toolkit'
import { DateProvider } from '../../ports/port.date-provider'
import { BlockSession, blockSessionAdapter } from '../block.session'
import { isActive } from './isActive'

export const selectScheduledSessions = (
  dateProvider: DateProvider,
  blockSession: EntityState<BlockSession, string>,
): BlockSession[] => {
  return blockSessionAdapter
    .getSelectors()
    .selectAll(blockSession)
    .filter((session) => !isActive(dateProvider, session))
}
