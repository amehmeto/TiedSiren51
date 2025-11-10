import {
  signInSchema,
  signUpSchema,
  SignInInput,
  SignUpInput,
} from './auth-schemas'
import { z } from 'zod'

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  data?: SignInInput | SignUpInput
}

export function validateSignInInput(input: SignInInput): ValidationResult {
  return validateWithSchema(signInSchema, input)
}

export function validateSignUpInput(input: SignUpInput): ValidationResult {
  return validateWithSchema(signUpSchema, input)
}

function validateWithSchema<T extends SignInInput | SignUpInput>(
  schema: z.ZodSchema<T>,
  input: unknown,
): ValidationResult {
  const validation = schema.safeParse(input)

  if (!validation.success) {
    const fieldErrors: Record<string, string> = {}
    validation.error.errors.forEach((error) => {
      const key = error.path[0]
      if (typeof key === 'string') fieldErrors[key] = error.message
    })

    return {
      isValid: false,
      errors: fieldErrors,
    }
  }

  return {
    isValid: true,
    errors: {},
    data: validation.data,
  }
}
