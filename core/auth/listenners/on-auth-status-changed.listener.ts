import { AppStore } from '@/core/_redux_/createStore'
import { AuthGateway } from '@/core/ports/auth.gateway'
import { userAuthenticated } from '@/core/auth/reducer'
import { loadUser } from '@/core/auth/usecases/load-user.usecase'
import { tieSirens } from '@/core/siren/usecases/tie-sirens.usecase'

export const onAuthStatusChangedListener = ({
  store,
  authGateway,
}: {
  store: AppStore
  authGateway: AuthGateway
}) => {
  authGateway.onAuthStatusChanged((user) => {
    store.dispatch(userAuthenticated(user))

    if (!user) return

    store.dispatch(loadUser())
    store.dispatch(tieSirens())
  })
}
