import { expect, describe, it } from 'vitest'
import { LoginCredentials, SignUpCredentials } from '@/core/auth/auth.type'
import { signInSchema, signUpSchema } from './auth.schema'

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
})
