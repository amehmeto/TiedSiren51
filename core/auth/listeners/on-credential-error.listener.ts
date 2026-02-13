import { Logger } from '@/core/_ports_/logger'
import { AppStore } from '@/core/_redux_/createStore'
import { AuthErrorType } from '@/core/auth/auth-error-type'
import { passwordClearRequested } from '@/core/auth/reducer'

export const onCredentialErrorListener = ({
  store,
  logger,
}: {
  store: AppStore
  logger: Logger
}): (() => void) => {
  let previousErrorType = store.getState().auth.errorType

  return store.subscribe(() => {
    const currentErrorType = store.getState().auth.errorType

    if (previousErrorType === currentErrorType) return
    previousErrorType = currentErrorType

    if (currentErrorType === AuthErrorType.Credential) {
      try {
        store.dispatch(passwordClearRequested())
      } catch (error) {
        logger.error(`Error in onCredentialError listener: ${error}`)
      }
    }
  })
}
