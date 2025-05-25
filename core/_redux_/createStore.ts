import {
  Action,
  configureStore,
  ThunkDispatch,
  Middleware,
} from '@reduxjs/toolkit'
import { rootReducer } from './rootReducer'
import { Dependencies } from './dependencies'
import { onUserLoggedInListener } from '@/core/auth/listenners/on-user-logged-in.listener'
import { onUserLoggedOutListener } from '@/core/auth/listenners/on-user-logged-out.listener'

export type PreloadedState = Partial<RootState>

export const createStore = (
  dependencies: Dependencies,
  preloadedState?: PreloadedState,
) => {
  const actions: Action[] = []
  const logActionMiddleware: Middleware = () => (next) => (action: unknown) => {
    actions.push(action as Action)
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
