import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { selectAuthUserId } from '@/core/auth/selectors/selectAuthUserId'
import { BlockSession } from '@/core/block-session/block-session'
import { Blocklist } from '@/core/blocklist/blocklist'
import { Sirens } from '@/core/siren/sirens'

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
      getState,
      extra: { blocklistRepository, blockSessionRepository, sirensRepository },
    },
  ) => {
    const userId = selectAuthUserId(getState())
    const [blocklists, blockSessions, sirens] = await Promise.all([
      blocklistRepository.findAll(userId),
      blockSessionRepository.findAll(userId),
      sirensRepository.getSelectableSirens(userId),
    ])

    return {
      blocklists,
      blockSessions,
      sirens,
    }
  },
)
