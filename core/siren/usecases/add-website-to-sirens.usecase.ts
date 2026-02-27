import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { selectAuthUserId } from '../../auth/selectors/selectAuthUserId'

export const addWebsiteToSirens = createAppAsyncThunk(
  'siren/addWebsiteToSirens',
  async (website: string, { getState, extra: { sirensRepository } }) => {
    const userId = selectAuthUserId(getState())
    await sirensRepository.addWebsiteToSirens(userId, website)
    return website
  },
)
