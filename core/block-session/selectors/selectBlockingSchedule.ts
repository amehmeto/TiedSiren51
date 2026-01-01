import { createSelector } from '@reduxjs/toolkit'
import { DateProvider } from '@/core/_ports_/date-provider'
import { BlockingSchedule } from '@/core/_ports_/siren.tier'
import { RootState } from '@/core/_redux_/createStore'
import { blocklistAdapter } from '@/core/blocklist/blocklist'
import { selectActiveSessions } from './selectActiveSessions'

/**
 * Selects the blocking schedule by joining active sessions with fresh blocklist data.
 *
 * This selector:
 * 1. Gets all active block sessions
 * 2. Joins embedded blocklist IDs with current blocklist state (fresh data)
 * 3. Creates BlockingWindow objects with time ranges and deduplicated sirens
 * 4. Deduplicates packages across multiple blocklists in the same time window
 *
 * @returns BlockingSchedule with windows containing startTime, endTime, and sirens
 */
export const selectBlockingSchedule = createSelector(
  [
    (state: RootState) => state.blockSession,
    (state: RootState) => state.blocklist,
    (_state: RootState, dateProvider: DateProvider) => dateProvider,
  ],
  (blockSessionState, blocklistState, dateProvider): BlockingSchedule => {
    const activeSessions = selectActiveSessions(dateProvider, blockSessionState)
    const blocklistSelectors = blocklistAdapter.getSelectors()

    const windows = activeSessions.map((session) => {
      const apps = new Set<string>()
      const websites = new Set<string>()
      const keywords = new Set<string>()

      const freshBlocklists = session.blocklists
        .map((embedded) =>
          blocklistSelectors.selectById(blocklistState, embedded.id),
        )
        .filter(Boolean)

      freshBlocklists.forEach((blocklist) => {
        blocklist.sirens.android.forEach((siren) => apps.add(siren.packageName))
        blocklist.sirens.websites.forEach((website) => websites.add(website))
        blocklist.sirens.keywords.forEach((keyword) => keywords.add(keyword))
      })

      return {
        id: session.id,
        startTime: session.startedAt,
        endTime: session.endedAt,
        sirens: {
          apps: Array.from(apps),
          websites: Array.from(websites),
          keywords: Array.from(keywords),
        },
      }
    })

    return { windows }
  },
)
