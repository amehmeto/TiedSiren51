import { z } from 'zod'

const CONTAINS_UPPERCASE_LOWERCASE_AND_DIGITS_REGEX_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/

const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .regex(
    CONTAINS_UPPERCASE_LOWERCASE_AND_DIGITS_REGEX_PATTERN,
    'Password must contain uppercase, lowercase and number',
  )

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: passwordSchema,
})

export const changePasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const authSchema = {
  signUp: signUpSchema,
  signIn: signInSchema,
  forgotPassword: forgotPasswordSchema,
  changePassword: changePasswordSchema,
}
