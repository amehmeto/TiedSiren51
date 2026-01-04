import { onUserLoggedInListener } from '@/core/auth/listeners/on-user-logged-in.listener'
import { onUserLoggedOutListener } from '@/core/auth/listeners/on-user-logged-out.listener'
import { onBlockingScheduleChangedListener } from '@/core/siren/listeners/on-blocking-schedule-changed.listener'
import { AppStore } from './createStore'
import { Dependencies } from './dependencies'

export const registerListeners = (
  store: AppStore,
  dependencies: Dependencies,
) => {
  const {
    authGateway,
    dateProvider,
    foregroundService,
    logger,
    sirenLookout,
    sirenTier,
  } = dependencies

  onUserLoggedInListener({
    store,
    authGateway,
    logger,
  })

  onUserLoggedOutListener({
    store,
    authGateway,
    logger,
  })

  onBlockingScheduleChangedListener({
    store,
    sirenLookout,
    sirenTier,
    foregroundService,
    dateProvider,
  })
}
