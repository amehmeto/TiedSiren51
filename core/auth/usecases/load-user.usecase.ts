import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { BlockSession } from '@/core/block-session/block-session'
import { Blocklist } from '@/core/blocklist/blocklist'
import { EMPTY_SIRENS, Sirens } from '@/core/siren/sirens'
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
    logger.info(`[loadUser] Loading data for user ${userId}`)

    const [blocklists, blockSessions, sirens] = await Promise.all([
      blocklistRepository.findAll(userId).catch((error): Blocklist[] => {
        logger.error(
          `[loadUser] Failed to load blocklists, using empty defaults: ${error}`,
        )
        return []
      }),
      blockSessionRepository.findAll(userId).catch((error): BlockSession[] => {
        logger.error(
          `[loadUser] Failed to load block sessions, using empty defaults: ${error}`,
        )
        return []
      }),
      sirensRepository.getSelectableSirens(userId).catch((error) => {
        logger.error(
          `[loadUser] Failed to get sirens, using empty defaults: ${error}`,
        )
        return EMPTY_SIRENS
      }),
    ])

    logger.info(
      `[loadUser] Loaded ${blocklists.length} blocklists, ${blockSessions.length} block sessions`,
    )

    return {
      blocklists,
      blockSessions,
      sirens,
    }
  },
)
