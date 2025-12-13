import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
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
      extra: { blocklistRepository, blockSessionRepository, sirensRepository },
    },
  ) => {
    const [blocklists, blockSessions, sirens] = await Promise.all([
      blocklistRepository.findAll(),
      blockSessionRepository.findAll(),
      sirensRepository.getSelectableSirens(),
    ])

    return {
      blocklists,
      blockSessions,
      sirens,
    }
  },
)
