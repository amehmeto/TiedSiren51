import { SirenLookout } from '@/core/_ports_/siren.lookout'
import { AppStore } from '@/core/_redux_/createStore'
import { blockLaunchedApp } from '@/core/siren/usecases/block-launched-app.usecase'

export const onSirenDetectedListener = ({
  store,
  sirenLookout,
}: {
  store: AppStore
  sirenLookout: SirenLookout
}) => {
  sirenLookout.onSirenDetected((packageName: string) => {
    store.dispatch(blockLaunchedApp({ packageName }))
  })
}
