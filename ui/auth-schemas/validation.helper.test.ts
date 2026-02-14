import { describe, expect, it } from 'vitest'
import {
  getForgotPasswordValidationError,
  validateForgotPasswordInput,
  validateSignInInput,
  validateSignUpInput,
} from './validation.helper'

describe('validateSignInInput', () => {
  it('should return valid result for correct credentials', () => {
    const expectedData = {
      email: 'user@example.com',
      password: 'password123',
    }

    const result = validateSignInInput(expectedData)

    expect(result.errorMessage).toBeNull()
    expect(result.data).toStrictEqual(expectedData)
  })

  it('should return invalid result for missing email', () => {
    const result = validateSignInInput({
      email: '',
      password: 'password123',
    })

    expect(result.errorMessage).not.toBeNull()
  })

  it('should return invalid result for missing password', () => {
    const result = validateSignInInput({
      email: 'user@example.com',
      password: '',
    })

    expect(result.errorMessage).not.toBeNull()
  })
})

describe('validateSignUpInput', () => {
  it('should return valid result for correct credentials', () => {
    const expectedData = {
      email: 'user@example.com',
      password: 'Password123',
    }

    const result = validateSignUpInput(expectedData)

    expect(result.errorMessage).toBeNull()
    expect(result.data).toStrictEqual(expectedData)
  })

  it('should return invalid result for weak password', () => {
    const result = validateSignUpInput({
      email: 'user@example.com',
      password: 'weak',
    })

    expect(result.errorMessage).not.toBeNull()
  })
})

describe('validateForgotPasswordInput', () => {
  it('should return valid result for correct email', () => {
    const expectedData = { email: 'user@example.com' }

    const result = validateForgotPasswordInput(expectedData)

    expect(result.errorMessage).toBeNull()
    expect(result.data).toStrictEqual(expectedData)
  })

  it('should return invalid result for empty email', () => {
    const result = validateForgotPasswordInput({ email: '' })

    expect(result.errorMessage).not.toBeNull()
  })
})

describe('getForgotPasswordValidationError', () => {
  it('should return null for valid email', () => {
    const error = getForgotPasswordValidationError('user@example.com')

    expect(error).toBeNull()
  })

  it('should return error for empty email', () => {
    const error = getForgotPasswordValidationError('')

    expect(error).not.toBeNull()
  })

  it('should return error for invalid email format', () => {
    const error = getForgotPasswordValidationError('invalid-email')

    expect(error).not.toBeNull()
  })
})
