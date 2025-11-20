import {
  Action,
  configureStore,
  Middleware,
  ThunkDispatch,
} from '@reduxjs/toolkit'
import { onUserLoggedInListener } from '@/core/auth/listenners/on-user-logged-in.listener'
import { onUserLoggedOutListener } from '@/core/auth/listenners/on-user-logged-out.listener'
import { Dependencies } from './dependencies'
import { rootReducer } from './rootReducer'

export type PreloadedState = Partial<RootState>

function isAction(action: unknown): action is Action {
  return (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    typeof action.type === 'string'
  )
}

export const createStore = (
  dependencies: Dependencies,
  preloadedState?: PreloadedState,
) => {
  const actions: Action[] = []
  const logActionMiddleware: Middleware = () => (next) => (action: unknown) => {
    if (isAction(action)) actions.push(action)
    return next(action)
  }

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: dependencies,
        },
      }).prepend(logActionMiddleware),
    preloadedState,
  })

  onUserLoggedInListener({
    store,
    authGateway: dependencies.authGateway,
  })

  onUserLoggedOutListener({
    store,
    authGateway: dependencies.authGateway,
  })

  return {
    ...store,
    getActions: () => actions,
  }
}

export type AppStore = Omit<ReturnType<typeof createStore>, 'getActions'>
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = ThunkDispatch<RootState, Dependencies, Action>
