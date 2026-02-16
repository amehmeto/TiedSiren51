import { describe, expect, it } from 'vitest'
import {
  getForgotPasswordValidationError,
  validateChangePasswordInput,
  validateForgotPasswordInput,
  validateSignInInput,
  validateSignUpInput,
} from './validation.helper'

type ValidCase<T> = [description: string, credentials: T]
type InvalidCase<T> = [
  description: string,
  credentials: T,
  expectedError: string,
]

type AuthCredentials = { email: string; password: string }

describe('validateSignInInput', () => {
  it.each<ValidCase<AuthCredentials>>([
    [
      'correct credentials',
      { email: 'user@example.com', password: 'password123' },
    ],
  ])('should return valid result for %s', (_, credentials) => {
    const validation = validateSignInInput(credentials)

    expect(validation.errorMessage).toBeNull()
    expect(validation.data).toStrictEqual(credentials)
  })

  it.each<InvalidCase<AuthCredentials>>([
    [
      'missing email',
      { email: '', password: 'password123' },
      'Please enter a valid email',
    ],
    [
      'invalid email format',
      { email: 'invalid', password: 'password123' },
      'Please enter a valid email',
    ],
    [
      'missing password',
      { email: 'user@example.com', password: '' },
      'Password is required',
    ],
  ])('should return error for %s', (_, credentials, expectedError) => {
    const validation = validateSignInInput(credentials)

    expect(validation.errorMessage).toBe(expectedError)
  })
})

describe('validateSignUpInput', () => {
  it.each<ValidCase<AuthCredentials>>([
    [
      'correct credentials',
      { email: 'user@example.com', password: 'Password123' },
    ],
  ])('should return valid result for %s', (_, credentials) => {
    const validation = validateSignUpInput(credentials)

    expect(validation.errorMessage).toBeNull()
    expect(validation.data).toStrictEqual(credentials)
  })

  it.each<InvalidCase<AuthCredentials>>([
    [
      'weak password',
      { email: 'user@example.com', password: 'weak' },
      'Password must contain uppercase, lowercase and number',
    ],
    [
      'password without uppercase',
      { email: 'user@example.com', password: 'password123' },
      'Password must contain uppercase, lowercase and number',
    ],
  ])('should return error for %s', (_, credentials, expectedError) => {
    const validation = validateSignUpInput(credentials)

    expect(validation.errorMessage).toBe(expectedError)
  })
})

describe('validateForgotPasswordInput', () => {
  it.each<ValidCase<{ email: string }>>([
    ['correct email', { email: 'user@example.com' }],
  ])('should return valid result for %s', (_, credentials) => {
    const validation = validateForgotPasswordInput(credentials)

    expect(validation.errorMessage).toBeNull()
    expect(validation.data).toStrictEqual(credentials)
  })

  it.each<InvalidCase<{ email: string }>>([
    ['empty email', { email: '' }, 'Please enter a valid email'],
    [
      'invalid email format',
      { email: 'invalid' },
      'Please enter a valid email',
    ],
  ])('should return error for %s', (_, credentials, expectedError) => {
    const validation = validateForgotPasswordInput(credentials)

    expect(validation.errorMessage).toBe(expectedError)
  })
})

type ChangePasswordCredentials = {
  newPassword: string
  confirmPassword: string
}

describe('validateChangePasswordInput', () => {
  it.each<ValidCase<ChangePasswordCredentials>>([
    [
      'matching strong passwords',
      { newPassword: 'Password123', confirmPassword: 'Password123' },
    ],
  ])('should return valid result for %s', (_, credentials) => {
    const validation = validateChangePasswordInput(credentials)

    expect(validation.errorMessage).toBeNull()
    expect(validation.data).toStrictEqual(credentials)
  })

  it.each<InvalidCase<ChangePasswordCredentials>>([
    [
      'weak password',
      { newPassword: 'weak', confirmPassword: 'weak' },
      'Password must contain uppercase, lowercase and number',
    ],
    [
      'mismatched passwords',
      { newPassword: 'Password123', confirmPassword: 'Different123' },
      'Passwords do not match',
    ],
  ])('should return error for %s', (_, credentials, expectedError) => {
    const validation = validateChangePasswordInput(credentials)

    expect(validation.errorMessage).toBe(expectedError)
  })
})

describe('getForgotPasswordValidationError', () => {
  it.each<[string, string, string | null]>([
    ['valid email', 'user@example.com', null],
    ['empty email', '', 'Please enter a valid email'],
    ['invalid email format', 'invalid-email', 'Please enter a valid email'],
  ])('should return expected error for %s', (_, email, expectedError) => {
    const validationError = getForgotPasswordValidationError(email)

    expect(validationError).toBe(expectedError)
  })
})
