import { createSelector } from '@reduxjs/toolkit'
import { blocklistAdapter } from '@/core/blocklist/blocklist'
import { RootState } from '@/core/_redux_/createStore'
import { BlockingSchedule } from '@/core/_ports_/siren.tier'
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
    (_state: RootState, dateProvider) => dateProvider,
  ],
  (blockSessionState, blocklistState, dateProvider): BlockingSchedule => {
    const activeSessions = selectActiveSessions(dateProvider, blockSessionState)
    const blocklistSelectors = blocklistAdapter.getSelectors()

    const windows = activeSessions.map((session) => {
      // Collect all sirens from fresh blocklist data (not stale embedded copies)
      const apps = new Set<string>()
      const websites = new Set<string>()
      const keywords = new Set<string>()

      // Join session blocklists with fresh state data
      for (const embeddedBlocklist of session.blocklists) {
        const freshBlocklist = blocklistSelectors.selectById(
          blocklistState,
          embeddedBlocklist.id,
        )

        // Skip if blocklist was deleted
        if (!freshBlocklist) continue

        // Collect deduplicated sirens
        for (const siren of freshBlocklist.sirens.android) {
          apps.add(siren.packageName)
        }
        for (const website of freshBlocklist.sirens.websites) {
          websites.add(website)
        }
        for (const keyword of freshBlocklist.sirens.keywords) {
          keywords.add(keyword)
        }
      }

      return {
        id: session.id,
        startTime: new Date(session.startedAt).toTimeString().slice(0, 5), // "HH:MM"
        endTime: new Date(session.endedAt).toTimeString().slice(0, 5), // "HH:MM"
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
