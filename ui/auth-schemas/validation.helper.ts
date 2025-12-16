import { z } from 'zod'
import {
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
  ForgotPasswordInput,
  SignInInput,
  SignUpInput,
} from './auth.schema'

export interface ValidationResult<T = SignInInput | SignUpInput> {
  isValid: boolean
  errors: Record<string, string>
  data?: T
}

export function validateSignInInput(
  input: SignInInput,
): ValidationResult<SignInInput> {
  return validateWithSchema(signInSchema, input)
}

export function validateSignUpInput(
  input: SignUpInput,
): ValidationResult<SignUpInput> {
  return validateWithSchema(signUpSchema, input)
}

export function validateForgotPasswordInput(
  input: ForgotPasswordInput,
): ValidationResult<ForgotPasswordInput> {
  return validateWithSchema(forgotPasswordSchema, input)
}

export function getForgotPasswordValidationError(email: string): string | null {
  const validation = validateForgotPasswordInput({ email })

  if (!validation.isValid) return Object.values(validation.errors).join(', ')

  return null
}

function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
): ValidationResult<T> {
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
