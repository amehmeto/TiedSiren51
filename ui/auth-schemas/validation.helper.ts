import { z } from 'zod'
import {
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
  ForgotPasswordInput,
  SignInInput,
  SignUpInput,
} from './auth.schema'

type ValidationFailure = { errorMessage: string; data?: never }

type ValidationSuccess<T> = { errorMessage: null; data: T }

export type ValidationResult<T = SignInInput | SignUpInput> =
  | ValidationFailure
  | ValidationSuccess<T>

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
  const { errorMessage } = validateForgotPasswordInput({ email })

  return errorMessage
}

function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
): ValidationResult<T> {
  const { success: isSuccess, error, data } = schema.safeParse(input)

  if (!isSuccess) {
    const fieldErrors: Record<string, string> = {}
    error.errors.forEach((err) => {
      const [key] = err.path
      if (typeof key === 'string') fieldErrors[key] = err.message
    })

    const errorMessage = Object.values(fieldErrors).join(', ')

    return { errorMessage }
  }

  return {
    errorMessage: null,
    data,
  }
}
