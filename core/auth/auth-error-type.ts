export enum AuthErrorType {
  Credential = 'CREDENTIAL',
  Network = 'NETWORK',
  RateLimit = 'RATE_LIMIT',
  Validation = 'VALIDATION',
  Cancelled = 'CANCELLED',
  Unknown = 'UNKNOWN',
}

export function isAuthErrorType(value: unknown): value is AuthErrorType {
  if (typeof value !== 'string') return false
  const values: string[] = Object.values(AuthErrorType)
  return values.includes(value)
}
