import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { Dependencies } from '@/core/_zustand_/dependencies'
import { AuthUser } from '../authUser'

export const signInWithGoogleCommand = async (
  dependencies: Dependencies,
): Promise<AuthUser> => {
  const { authGateway } = dependencies
  return authGateway.signInWithGoogle()
}

export const signInWithGoogle = createAppAsyncThunk<
  AuthUser,
  void,
  { rejectValue: string }
>('auth/signInWithGoogle', async (_, { extra, rejectWithValue }) => {
  try {
    return await signInWithGoogleCommand(extra)
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Google sign in failed',
    )
  }
})
