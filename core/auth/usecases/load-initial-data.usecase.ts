import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { Blocklist } from '@/core/blocklist/blocklist'
import { BlockSession } from '@/core/block-session/block.session'
import { Sirens } from '@/core/siren/sirens'

interface InitialData {
  blocklists: Blocklist[]
  blockSessions: BlockSession[]
  sirens: Sirens
}

export const loadInitialData = createAppAsyncThunk(
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
    } as InitialData
  },
)
