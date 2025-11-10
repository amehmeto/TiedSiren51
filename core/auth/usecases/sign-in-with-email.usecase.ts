import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { Dependencies } from '@/core/_zustand_/dependencies'
import { AuthUser } from '../authUser'
import { LoginCredentials } from '../authTypes'

export const signInWithEmailCommand = async (
  dependencies: Dependencies,
  payload: LoginCredentials,
): Promise<AuthUser> => {
  const { authGateway } = dependencies
  return authGateway.signInWithEmail(payload.email, payload.password)
}

export const signInWithEmail = createAppAsyncThunk<
  AuthUser,
  LoginCredentials,
  { rejectValue: string }
>('auth/signInWithEmail', async (payload, { extra, rejectWithValue }) => {
  try {
    return await signInWithEmailCommand(extra, payload)
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Unknown error occurred.',
    )
  }
})
