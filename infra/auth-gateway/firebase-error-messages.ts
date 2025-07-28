export function displayErrorMessage(error: unknown): string {
  function isFirebaseError(
    err: unknown,
  ): err is { code: string; message: string } {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      typeof (err as { code: unknown }).code === 'string' &&
      'message' in err &&
      typeof (err as { message: unknown }).message === 'string'
    )
  }

  const firebaseErrorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already in use.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-credential': 'Invalid credentials.',
  }

  const firebaseMessage =
    isFirebaseError(error) &&
    (firebaseErrorMessages[error.code] ?? error.message)

  const standardErrorMessage = error instanceof Error && error.message

  return firebaseMessage || standardErrorMessage || 'Unknown error occurred.'
}
