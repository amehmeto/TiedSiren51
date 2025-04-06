/* eslint-disable import/no-unresolved */
import { AppStore, createStore } from '@/core/_redux_/createStore'
import { Dependencies } from '@/core/_redux_/dependencies'
import { loadUser } from '@/core/auth/usecases/load-user.usecase'

export async function initializeApp(
  dependencies: Dependencies,
): Promise<AppStore> {
  await dependencies.appStorage.initialize()
  const store = createStore(dependencies)
  await store.dispatch(loadUser()).unwrap()
  return store
}
