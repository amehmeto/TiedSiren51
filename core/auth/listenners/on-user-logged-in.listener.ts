import { AppStore } from '@/core/_redux_/createStore'
import { userAuthenticated } from '@/core/auth/reducer'
import { loadUser } from '@/core/auth/usecases/load-user.usecase'
import { AuthGateway } from '@/core/ports/auth.gateway'
import { tieSirens } from '@/core/siren/usecases/tie-sirens.usecase'

export const onUserLoggedInListener = ({
  store,
  authGateway,
}: {
  store: AppStore
  authGateway: AuthGateway
}) => {
  authGateway.onUserLoggedIn((user) => {
    store.dispatch(userAuthenticated(user))

    if (!user) return

    store.dispatch(loadUser())
    store.dispatch(tieSirens())
  })
}
