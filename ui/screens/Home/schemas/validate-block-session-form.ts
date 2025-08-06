import { blockSessionSchema } from '@/ui/screens/Home/schemas/block-session.schema'
import { z } from 'zod'
import { ErrorMessages } from '@/ui/error-messages.type'

export function validateBlockSessionForm() {
  return (values: unknown) => {
    try {
      blockSessionSchema.parse(values)
      return {}
    } catch (e) {
      if (!(e instanceof z.ZodError)) return {}
      const validationErrors: ErrorMessages = {}
      e.issues.forEach((error) => {
        const field = String(error.path[0])
        validationErrors[field] = error.message
      })
      return validationErrors
    }
  }
}
