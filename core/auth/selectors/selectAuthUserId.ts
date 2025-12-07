import { RootState } from '@/core/_redux_/createStore'
import { selectAuthUserIdOrNull } from './selectAuthUserIdOrNull'

export const selectAuthUserId = (state: RootState): string => {
  const userId = selectAuthUserIdOrNull(state)
  if (!userId) throw new Error('User not authenticated')
  return userId
}
