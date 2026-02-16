import { AuthGateway } from '@/core/_ports_/auth.gateway'
import { Logger } from '@/core/_ports_/logger'
import { AppStore } from '@/core/_redux_/createStore'
import { logOut } from '@/core/auth/usecases/log-out.usecase'

type OnUserLoggedOutDependencies = {
  store: AppStore
  authGateway: AuthGateway
  logger: Logger
}

export const onUserLoggedOutListener = ({
  store,
  authGateway,
  logger,
}: OnUserLoggedOutDependencies) => {
  authGateway.onUserLoggedOut(() => {
    try {
      store.dispatch(logOut())
    } catch (error) {
      logger.error(`Error in onUserLoggedOut listener: ${error}`)
    }
  })
}
