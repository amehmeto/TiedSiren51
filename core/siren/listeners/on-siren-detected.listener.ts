import { Logger } from '@/core/_ports_/logger'
import { DetectedSiren, SirenLookout } from '@/core/_ports_/siren.lookout'
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
  sirenLookout.onSirenDetected((siren: DetectedSiren) => {
    try {
      // Currently only handling app type sirens
      // Website and keyword detection will be added in future tickets
      if (siren.type === 'app')
        store.dispatch(blockLaunchedApp({ packageName: siren.identifier }))
    } catch (error) {
      logger.error(`Error in onSirenDetected listener: ${error}`)
    }
  })
}
