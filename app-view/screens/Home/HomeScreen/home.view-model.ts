import { RootState } from '@/core/_redux_/createStore'
import { BlockSession } from '@/core/block-session/block.session'
import { formatDistance } from 'date-fns'
import { createSelector } from '@reduxjs/toolkit'
import {
  Greetings,
  HomeViewModel,
  HomeViewModelType,
  SessionBoardMessage,
  SessionBoardTitle,
} from './home-view-model.types'
import { selectActiveSessions } from '@/core/block-session/selectors/selectActiveSessions'
import { selectAllBlockSessions } from '@/core/block-session/selectors/selectAllBlockSessions'
import { DateProvider } from '@/core/ports/port.date-provider'
import { isActive } from '@/core/block-session/selectors/isActive'
import { selectScheduledSessions } from '@/core/block-session/selectors/selectScheduledSessions'

function greetUser(now: Date) {
  const hour = now.getHours()

  if (hour >= 6 && hour < 12) return Greetings.GoodMorning
  if (hour >= 12 && hour < 18) return Greetings.GoodAfternoon
  if (hour >= 18 && hour < 22) return Greetings.GoodEvening
  return Greetings.GoodNight
}

function generateTimeInfo(dateProvider: DateProvider, session: BlockSession) {
  const start = dateProvider.recoverDate(session.startedAt)
  const end = dateProvider.recoverDate(session.endedAt)
  const now = dateProvider.getNow()
  return isActive(dateProvider, session)
    ? 'Ends ' +
        formatDistance(end, now, {
          addSuffix: true,
        })
    : 'Starts at ' + dateProvider.toHHmm(start)
}

function formatToViewModel(
  blockSessions: BlockSession[],
  dateProvider: DateProvider,
) {
  return blockSessions.map((session) => {
    const timeline = generateTimeInfo(dateProvider, session)

    return {
      id: session.id,
      name: session.name,
      minutesLeft: timeline,
      blocklists: session.blocklists.length,
      devices: session.devices.length,
    }
  })
}

const selectNow = (_state: RootState, now: Date) => now
const selectDateProvider = (
  _state: RootState,
  _now: Date,
  dateProvider: DateProvider,
) => dateProvider

export const selectHomeViewModel = createSelector(
  [
    (rootState: RootState) => rootState.blockSession,
    selectNow,
    selectDateProvider,
  ],
  (blockSession, now, dateProvider): HomeViewModelType => {
    const blockSessions = selectAllBlockSessions(blockSession)

    const greetings = greetUser(dateProvider.getNow())

    const NO_ACTIVE_SESSION = {
      title: SessionBoardTitle.NO_ACTIVE_SESSIONS as const,
      message: SessionBoardMessage.NO_ACTIVE_SESSIONS as const,
    }

    const NO_SCHEDULED_SESSION = {
      title: SessionBoardTitle.NO_SCHEDULED_SESSIONS as const,
      message: SessionBoardMessage.NO_SCHEDULED_SESSIONS as const,
    }

    if (!blockSessions.length)
      return {
        type: HomeViewModel.WithoutActiveNorScheduledSessions,
        greetings,
        activeSessions: NO_ACTIVE_SESSION,
        scheduledSessions: NO_SCHEDULED_SESSION,
      }

    const activeSessions = selectActiveSessions(dateProvider, blockSession)
    const formattedActiveSessions = formatToViewModel(
      activeSessions,
      dateProvider,
    )

    const scheduledSessions = selectScheduledSessions(
      dateProvider,
      blockSession,
    )
    const formattedScheduledSessions = formatToViewModel(
      scheduledSessions,
      dateProvider,
    )

    if (!activeSessions.length)
      return {
        type: HomeViewModel.WithoutActiveWithScheduledSessions,
        greetings,
        activeSessions: NO_ACTIVE_SESSION,
        scheduledSessions: {
          title: SessionBoardTitle.SCHEDULED_SESSIONS,
          blockSessions: formattedScheduledSessions,
        },
      }

    if (!scheduledSessions.length)
      return {
        type: HomeViewModel.WithActiveWithoutScheduledSessions,
        greetings,
        activeSessions: {
          title: SessionBoardTitle.ACTIVE_SESSIONS,
          blockSessions: formattedActiveSessions,
        },
        scheduledSessions: NO_SCHEDULED_SESSION,
      }

    return {
      type: HomeViewModel.WithActiveAndScheduledSessions,
      greetings,
      activeSessions: {
        title: SessionBoardTitle.ACTIVE_SESSIONS as const,
        blockSessions: formattedActiveSessions,
      },
      scheduledSessions: {
        title: SessionBoardTitle.SCHEDULED_SESSIONS as const,
        blockSessions: formattedScheduledSessions,
      },
    }
  },
)
