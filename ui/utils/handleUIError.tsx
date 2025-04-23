export const handleUIError = (error: unknown, context: string) => {
  return `${context}: ${error instanceof Error ? error.message : String(error)}`
}
