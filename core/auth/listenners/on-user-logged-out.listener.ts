import { AppStore } from '@/core/_redux_/createStore'
import { AuthGateway } from '@/core/ports/auth.gateway'
import { userAuthenticated } from '@/core/auth/reducer'
import { logOut } from '@/core/auth/usecases/log-out.usecase'
import { AuthUser } from '../authUser'

export const onUserLoggedOutListener = ({
  store,
  authGateway,
}: {
  store: AppStore
  authGateway: AuthGateway
}) => {
  authGateway.onUserLoggedOut(() => {
    store.dispatch(userAuthenticated(null as unknown as AuthUser))
    store.dispatch(logOut())
  })
}
