import { Dependencies } from '@/core/_redux_/dependencies'
import { AppStore, createStore } from '@/core/_redux_/createStore'
import { loadUser } from '@/core/auth/usecases/load-user.usecase'

export async function initializeApp(
  dependencies: Dependencies,
): Promise<AppStore> {
  const store = createStore(dependencies)
  await store.dispatch(loadUser()).unwrap()
  return store
}
