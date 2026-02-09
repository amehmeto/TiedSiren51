import { RootState } from '@/core/_redux_/createStore'
import { selectNullableAuthUserId } from './selectNullableAuthUserId'

export const selectAuthUserId = (state: RootState): string => {
  const userId = selectNullableAuthUserId(state)
  if (!userId) throw new Error('User not authenticated')
  return userId
}
