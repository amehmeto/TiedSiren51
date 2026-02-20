export function extractPasswordResetOobCode(url: string): string | null {
  const queryString = url.split('?')[1]
  if (!queryString) return null

  const params = new URLSearchParams(queryString)
  const mode = params.get('mode')
  const oobCode = params.get('oobCode')
  return mode === 'resetPassword' && oobCode ? oobCode : null
}
