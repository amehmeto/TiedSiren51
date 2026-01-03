import { z } from 'zod'
import { ErrorMessages } from '@/ui/error-messages.type'
import { blockSessionSchema } from '@/ui/screens/Home/schemas/block-session.schema'

export function validateBlockSessionForm() {
  return (values: unknown) => {
    try {
      blockSessionSchema.parse(values)
      return {}
    } catch (e) {
      if (!(e instanceof z.ZodError)) return {}
      const validationErrors: ErrorMessages = {}
      e.errors.forEach((error) => {
        const [field] = error.path
        validationErrors[field] = error.message
      })
      return validationErrors
    }
  }
}
