import { AuthGateway } from '@/core/_ports_/auth.gateway'
import { Logger } from '@/core/_ports_/logger'
import { AppStore } from '@/core/_redux_/createStore'
import { userAuthenticated } from '@/core/auth/reducer'
import { loadUser } from '@/core/auth/usecases/load-user.usecase'

type OnUserLoggedInDependencies = {
  store: AppStore
  authGateway: AuthGateway
  logger: Logger
}

export const onUserLoggedInListener = ({
  store,
  authGateway,
  logger,
}: OnUserLoggedInDependencies) => {
  authGateway.onUserLoggedIn((user) => {
    try {
      store.dispatch(userAuthenticated(user))
      store.dispatch(loadUser()).then((action) => {
        if (loadUser.rejected.match(action)) {
          logger.error(
            `[onUserLoggedIn] loadUser failed: ${action.error.message}`,
          )
        }
      })
    } catch (error) {
      logger.error(`Error in onUserLoggedIn listener: ${error}`)
    }
  })
}
