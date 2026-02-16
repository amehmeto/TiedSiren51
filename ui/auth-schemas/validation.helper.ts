import { z } from 'zod'
import {
  changePasswordSchema,
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
  ChangePasswordInput,
  ForgotPasswordInput,
  SignInInput,
  SignUpInput,
} from './auth.schema'

export type ValidationResult<T = SignInInput | SignUpInput> =
  | { errorMessage: string; data?: never }
  | { errorMessage: null; data: T }

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

export function validateChangePasswordInput(
  input: ChangePasswordInput,
): ValidationResult<ChangePasswordInput> {
  return validateWithSchema(changePasswordSchema, input)
}

export function getForgotPasswordValidationError(email: string): string | null {
  const { errorMessage } = validateForgotPasswordInput({ email })

  return errorMessage
}

function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
): ValidationResult<T> {
  const validation = schema.safeParse(input)

  if (!validation.success) {
    const fieldErrors: Record<string, string> = {}
    validation.error.errors.forEach((error) => {
      const [key] = error.path
      if (typeof key === 'string') fieldErrors[key] = error.message
    })

    const errorMessage = Object.values(fieldErrors).join(', ')

    return { errorMessage }
  }

  return {
    errorMessage: null,
    data: validation.data,
  }
}
