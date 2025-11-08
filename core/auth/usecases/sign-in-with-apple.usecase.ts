import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { Dependencies } from '@/core/_zustand_/dependencies'
import { AuthUser } from '../authUser'

export const signInWithAppleCommand = async (
  dependencies: Dependencies,
): Promise<AuthUser> => {
  const { authGateway } = dependencies
  return authGateway.signInWithApple()
}

export const signInWithApple = createAppAsyncThunk<
  AuthUser,
  void,
  { rejectValue: string }
>('auth/signInWithApple', async (_, { extra, rejectWithValue }) => {
  try {
    return await signInWithAppleCommand(extra)
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Apple sign in failed',
    )
  }
})
