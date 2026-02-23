import { Logger } from '@/core/_ports_/logger'
import { AppStore } from '@/core/_redux_/createStore'
import { selectNullableAuthUserId } from '@/core/auth/selectors/selectNullableAuthUserId'
import { loadDevices } from '@/core/device/usecases/load-devices.usecase'
import { selectFeatureFlags } from '@/core/feature-flag/selectors/selectFeatureFlags'

type OnMultiDeviceReadyDependencies = {
  store: AppStore
  logger: Logger
}

export const onMultiDeviceReadyListener = ({
  store,
  logger,
}: OnMultiDeviceReadyDependencies): (() => void) => {
  let lastUserId = selectNullableAuthUserId(store.getState())
  let isLastMultiDevice = selectFeatureFlags(store.getState()).MULTI_DEVICE

  return store.subscribe(() => {
    try {
      const state = store.getState()
      const userId = selectNullableAuthUserId(state)
      const isMultiDevice = selectFeatureFlags(state).MULTI_DEVICE

      if (userId === lastUserId && isMultiDevice === isLastMultiDevice) return

      lastUserId = userId
      isLastMultiDevice = isMultiDevice

      if (userId && isMultiDevice) void store.dispatch(loadDevices())
    } catch (error) {
      logger.error(
        `[onMultiDeviceReadyListener] Failed to load devices: ${error}`,
      )
    }
  })
}
