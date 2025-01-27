import { RootState } from '@/core/_redux_/createStore'

export const selectIsUserAuthenticated = (state: RootState) =>
  state.auth.authUser !== null

/*createSelector(
  [(state: RootState) => state.auth],
  (auth) => authAdapter,
)*/
