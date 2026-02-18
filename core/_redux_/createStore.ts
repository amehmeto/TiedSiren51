import {
  Action,
  configureStore,
  Middleware,
  ThunkDispatch,
} from '@reduxjs/toolkit'
import { Dependencies } from './dependencies'
import { registerListeners } from './registerListeners'
import { rootReducer } from './rootReducer'
import {
  sanitizeDevToolsAction,
  sanitizeDevToolsState,
} from './sensitive-fields-sanitizer'

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
    if (isAction(action)) actions.push(sanitizeDevToolsAction(action))
    return next(action)
  }

  const store = configureStore({
    reducer: rootReducer,
    devTools: {
      actionSanitizer: sanitizeDevToolsAction,
      stateSanitizer: sanitizeDevToolsState,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: dependencies,
        },
      }).prepend(logActionMiddleware),
    preloadedState,
  })

  const appStore = {
    ...store,
    getActions: () => actions,
  }

  registerListeners(appStore, dependencies)

  return appStore
}

export type AppStore = Omit<ReturnType<typeof createStore>, 'getActions'>
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = ThunkDispatch<RootState, Dependencies, Action>
