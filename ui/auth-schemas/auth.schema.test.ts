import { expect, describe, it } from 'vitest'
import { LoginCredentials, SignUpCredentials } from '@/core/auth/auth.type'
import { changePasswordSchema, signInSchema, signUpSchema } from './auth.schema'

type InvalidCredentialsTestCase = [
  description: string,
  input: Partial<LoginCredentials | SignUpCredentials>,
  expectedMessage: string,
]

describe('Auth Schemas', () => {
  describe('signInSchema', () => {
    it('should validate correct sign-in data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
      }

      const result = signInSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it.each<InvalidCredentialsTestCase>([
      [
        'invalid email format',
        { email: 'invalid-email', password: 'password123' },
        'Please enter a valid email',
      ],
      [
        'empty email',
        { email: '', password: 'password123' },
        'Email is required',
      ],
      [
        'empty password',
        { email: 'user@example.com', password: '' },
        'Password is required',
      ],
    ])('should reject %s', (_, input, expectedMessage) => {
      const result = signInSchema.safeParse(input)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe(expectedMessage)
    })
  })

  describe('signUpSchema', () => {
    it('should validate correct sign-up data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'Password123',
      }

      const result = signUpSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it.each<InvalidCredentialsTestCase>([
      [
        'weak password (too short)',
        { email: 'user@example.com', password: '123' },
        'Password must be at least 6 characters',
      ],
      [
        'password without uppercase',
        { email: 'user@example.com', password: 'password123' },
        'Password must contain uppercase, lowercase and number',
      ],
      [
        'password without lowercase',
        { email: 'user@example.com', password: 'PASSWORD123' },
        'Password must contain uppercase, lowercase and number',
      ],
      [
        'password without number',
        { email: 'user@example.com', password: 'Password' },
        'Password must contain uppercase, lowercase and number',
      ],
    ])('should reject %s', (_, input, expectedMessage) => {
      const result = signUpSchema.safeParse(input)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe(expectedMessage)
    })
  })

  describe('changePasswordSchema', () => {
    it('should validate matching strong passwords', () => {
      const validData = {
        newPassword: 'NewPassword1',
        confirmPassword: 'NewPassword1',
      }

      const result = changePasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    type ChangePasswordTestCase = [
      description: string,
      input: { newPassword: string; confirmPassword: string },
      expectedMessage: string,
    ]

    it.each<ChangePasswordTestCase>([
      [
        'too short password',
        { newPassword: 'Ab1', confirmPassword: 'Ab1' },
        'Password must be at least 6 characters',
      ],
      [
        'password without uppercase',
        { newPassword: 'password123', confirmPassword: 'password123' },
        'Password must contain uppercase, lowercase and number',
      ],
      [
        'password without lowercase',
        { newPassword: 'PASSWORD123', confirmPassword: 'PASSWORD123' },
        'Password must contain uppercase, lowercase and number',
      ],
      [
        'password without number',
        { newPassword: 'Password', confirmPassword: 'Password' },
        'Password must contain uppercase, lowercase and number',
      ],
      [
        'mismatched passwords',
        { newPassword: 'Password123', confirmPassword: 'Different123' },
        'Passwords do not match',
      ],
    ])('should reject %s', (_, input, expectedMessage) => {
      const result = changePasswordSchema.safeParse(input)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe(expectedMessage)
    })
  })
})
