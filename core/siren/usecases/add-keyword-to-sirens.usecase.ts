import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'

export const addKeywordToSirens = createAppAsyncThunk(
  'siren/addKeywordToSirens',
  async (keyword: string, { extra: { sirensRepository } }) => {
    await sirensRepository.addKeywordToSirens(keyword)
    return keyword
  },
)
