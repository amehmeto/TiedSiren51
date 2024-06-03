import { BlockSession, blockSessionAdapter } from '../block.session'
import { EntityState } from '@reduxjs/toolkit'
import { DateProvider } from '../../ports/port.date-provider'
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
