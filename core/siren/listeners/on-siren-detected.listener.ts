import { Logger } from '@/core/_ports_/logger'
import { SirenLookout } from '@/core/_ports_/siren.lookout'
import { AppStore } from '@/core/_redux_/createStore'
import { blockLaunchedApp } from '@/core/siren/usecases/block-launched-app.usecase'

export const onSirenDetectedListener = ({
  store,
  sirenLookout,
  logger,
}: {
  store: AppStore
  sirenLookout: SirenLookout
  logger: Logger
}) => {
  sirenLookout.onSirenDetected((packageName: string) => {
    try {
      store.dispatch(blockLaunchedApp({ packageName }))
    } catch (error) {
      logger.error(`Error in onSirenDetected listener: ${error}`)
    }
  })
}
