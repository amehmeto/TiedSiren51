import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { selectAuthUserId } from '../../auth/selectors/selectAuthUserId'

export const addKeywordToSirens = createAppAsyncThunk(
  'siren/addKeywordToSirens',
  async (keyword: string, { getState, extra: { sirensRepository } }) => {
    const userId = selectAuthUserId(getState())
    await sirensRepository.addKeywordToSirens(userId, keyword)
    return keyword
  },
)
