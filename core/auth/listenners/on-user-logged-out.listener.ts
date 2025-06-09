import { AppStore } from '@/core/_redux_/createStore'
import { AuthGateway } from '@/core/ports/auth.gateway'
import { logOut } from '@/core/auth/usecases/log-out.usecase'

export const onUserLoggedOutListener = ({
  store,
  authGateway,
}: {
  store: AppStore
  authGateway: AuthGateway
}) => {
  authGateway.onUserLoggedOut(() => {
    store.dispatch(logOut())
  })
}
