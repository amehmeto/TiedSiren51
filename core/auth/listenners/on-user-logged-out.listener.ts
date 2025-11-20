import { AuthGateway } from '@/core/_ports_/auth.gateway'
import { AppStore } from '@/core/_redux_/createStore'
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
