export const handleUIError = (error: unknown, context: string) => {
  if (error instanceof Error) return `${context}: ${error.message}`

  if (typeof error === 'string') return `${context}: ${error}`

  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string')
      return `${context}: ${error.message}`

    if ('error' in error && typeof error.error === 'string')
      return `${context}: ${error.error}`

    return `${context}: ${JSON.stringify(error)}`
  }

  return `${context}: Unknown error`
}
