import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { Dependencies } from '@/core/_zustand_/dependencies'
import { Blocklist } from '@/core/blocklist/blocklist'
import { BlockSession } from '@/core/block-session/block.session'
import { Sirens } from '@/core/siren/sirens'

type UserData = {
  blocklists: Blocklist[]
  blockSessions: BlockSession[]
  sirens: Sirens
}

export const loadUserCommand = async (
  dependencies: Dependencies,
): Promise<UserData> => {
  const [blocklists, blockSessions, sirens] = await Promise.all([
    dependencies.blocklistRepository.findAll(),
    dependencies.blockSessionRepository.findAll(),
    dependencies.sirensRepository.getSelectableSirens(),
  ])

  return {
    blocklists,
    blockSessions,
    sirens,
  }
}

export const loadUser = createAppAsyncThunk<UserData>(
  'auth/loadUser',
  async (_, { extra }) => loadUserCommand(extra),
)
