import { AppStore } from '@/core/_redux_/createStore'
import { AuthGateway } from '@/core/ports/auth.gateway'
import { userAuthenticated } from '@/core/auth/reducer'

export const onAuthStatusChangedListener = ({
  store,
  authGateway,
}: {
  store: AppStore
  authGateway: AuthGateway
}) => {
  authGateway.onAuthStatusChanged((user) => {
    store.dispatch(userAuthenticated(user))
  })
}
