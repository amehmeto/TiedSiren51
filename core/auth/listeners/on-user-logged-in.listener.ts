import { AuthGateway } from '@/core/_ports_/auth.gateway'
import { AppStore } from '@/core/_redux_/createStore'
import { userAuthenticated } from '@/core/auth/reducer'
import { loadUser } from '@/core/auth/usecases/load-user.usecase'
import { targetSirens } from '@/core/siren/usecases/target-sirens.usecase'

export const onUserLoggedInListener = ({
  store,
  authGateway,
}: {
  store: AppStore
  authGateway: AuthGateway
}) => {
  authGateway.onUserLoggedIn((user) => {
    store.dispatch(userAuthenticated(user))
    store.dispatch(loadUser())
    store.dispatch(targetSirens())
  })
}
