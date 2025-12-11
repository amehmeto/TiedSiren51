import { onUserLoggedInListener } from '@/core/auth/listeners/on-user-logged-in.listener'
import { onUserLoggedOutListener } from '@/core/auth/listeners/on-user-logged-out.listener'
import { onBlockSessionsChangedListener } from '@/core/siren/listeners/on-block-sessions-changed.listener'
import { onSirenDetectedListener } from '@/core/siren/listeners/on-siren-detected.listener'
import { AppStore } from './createStore'
import { Dependencies } from './dependencies'

export const registerListeners = (
  store: AppStore,
  dependencies: Dependencies,
) => {
  const { authGateway, logger, sirenLookout } = dependencies

  onUserLoggedInListener({
    store,
    authGateway,
  })

  onUserLoggedOutListener({
    store,
    authGateway,
  })

  onSirenDetectedListener({
    store,
    sirenLookout,
  })

  onBlockSessionsChangedListener({
    store,
    sirenLookout,
    logger,
  })
}
