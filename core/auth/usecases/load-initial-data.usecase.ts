import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { Blocklist } from '@/core/blocklist/blocklist'
import { BlockSession } from '@/core/block-session/block.session'
import { Sirens } from '@/core/siren/sirens'

type InitialData = {
  blocklists: Blocklist[]
  blockSessions: BlockSession[]
  sirens: Sirens
}

export const loadInitialData = createAppAsyncThunk<InitialData>(
  'auth/loadInitialData',
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
