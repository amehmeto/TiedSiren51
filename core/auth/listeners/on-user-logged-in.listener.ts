import { AuthGateway } from '@/core/_ports_/auth.gateway'
import { Logger } from '@/core/_ports_/logger'
import { AppStore } from '@/core/_redux_/createStore'
import { userAuthenticated } from '@/core/auth/reducer'
import { loadUser } from '@/core/auth/usecases/load-user.usecase'
import { targetSirens } from '@/core/siren/usecases/target-sirens.usecase'

export const onUserLoggedInListener = ({
  store,
  authGateway,
  logger,
}: {
  store: AppStore
  authGateway: AuthGateway
  logger: Logger
}) => {
  authGateway.onUserLoggedIn((user) => {
    try {
      store.dispatch(userAuthenticated(user))
      store.dispatch(loadUser())
      store.dispatch(targetSirens())
    } catch (error) {
      logger.error(`Error in onUserLoggedIn listener: ${error}`)
    }
  })
}
