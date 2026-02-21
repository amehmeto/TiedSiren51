export enum FirebaseDeepLinkMode {
  VerifyEmail = 'verifyEmail',
  ResetPassword = 'resetPassword',
}

export function extractOobCode(
  url: string,
  expectedMode: FirebaseDeepLinkMode,
): string | null {
  const queryString = url.split('?')[1]
  if (!queryString) return null

  const params = new URLSearchParams(queryString)
  const mode = params.get('mode')
  const oobCode = params.get('oobCode')
  return mode === expectedMode && oobCode ? oobCode : null
}
