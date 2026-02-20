import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { BlockSession } from '@/core/block-session/block-session'
import { Blocklist } from '@/core/blocklist/blocklist'
import { Sirens } from '@/core/siren/sirens'
import { selectAuthUserId } from '../selectors/selectAuthUserId'

type UserData = {
  blocklists: Blocklist[]
  blockSessions: BlockSession[]
  sirens: Sirens
}

export const loadUser = createAppAsyncThunk<UserData>(
  'auth/loadUser',
  async (
    _,
    {
      extra: {
        blocklistRepository,
        blockSessionRepository,
        sirensRepository,
        logger,
      },
      getState,
    },
  ) => {
    const userId = selectAuthUserId(getState())
    const emptySirens: Sirens = {
      android: [],
      ios: [],
      windows: [],
      macos: [],
      linux: [],
      websites: [],
      keywords: [],
    }
    const [blocklists, blockSessions, sirens] = await Promise.all([
      blocklistRepository.findAll(userId),
      blockSessionRepository.findAll(userId),
      sirensRepository.getSelectableSirens(userId).catch((error) => {
        logger.error(
          `[loadUser] Failed to get sirens, using empty defaults: ${error}`,
        )
        return emptySirens
      }),
    ])

    return {
      blocklists,
      blockSessions,
      sirens,
    }
  },
)
