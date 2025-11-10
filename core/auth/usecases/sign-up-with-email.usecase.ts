import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { Dependencies } from '@/core/_zustand_/dependencies'
import { AuthUser } from '../authUser'
import { SignUpCredentials } from '../authTypes'

export const signUpWithEmailCommand = async (
  dependencies: Dependencies,
  payload: SignUpCredentials,
): Promise<AuthUser> => {
  const { authGateway } = dependencies
  return authGateway.signUpWithEmail(payload.email, payload.password)
}

export const signUpWithEmail = createAppAsyncThunk<
  AuthUser,
  SignUpCredentials,
  { rejectValue: string }
>('auth/signUpWithEmail', async (payload, { extra, rejectWithValue }) => {
  const { email, password } = payload
  try {
    return await signUpWithEmailCommand(extra, { email, password })
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Unknown error occurred.',
    )
  }
})
