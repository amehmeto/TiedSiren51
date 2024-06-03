import { AnyAction, configureStore, ThunkDispatch } from '@reduxjs/toolkit'
import { rootReducer } from './rootReducer'
import { Dependencies } from './dependencies'

export type PreloadedState = Partial<RootState>

export const createStore = (
  dependencies: Dependencies,
  preloadedState?: PreloadedState,
) =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: dependencies,
        },
      }),
    preloadedState,
  })

export type AppStore = ReturnType<typeof createStore>
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = ThunkDispatch<RootState, Dependencies, AnyAction>
