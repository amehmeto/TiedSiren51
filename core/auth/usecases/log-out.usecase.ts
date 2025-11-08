import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { Dependencies } from '@/core/_zustand_/dependencies'

export const logOutCommand = async (
  dependencies: Dependencies,
): Promise<void> => {
  const { authGateway } = dependencies
  await authGateway.logOut()
}

export const logOut = createAppAsyncThunk(
  'auth/logOut',
  async (_, { extra }) => {
    await logOutCommand(extra)
    return null
  },
)
