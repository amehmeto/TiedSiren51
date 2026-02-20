import { describe, expect, it } from 'vitest'
import { extractPasswordResetOobCode } from './extract-password-reset-oob-code.helper'

describe('extractPasswordResetOobCode', () => {
  it('should extract oobCode from a valid resetPassword deep link', () => {
    const url =
      'tiedsiren://app?mode=resetPassword&oobCode=abc123&continueUrl=https://example.com'

    const extractedOobCode = extractPasswordResetOobCode(url)

    expect(extractedOobCode).toBe('abc123')
  })

  it('should return null when mode is not resetPassword', () => {
    const extractedOobCode = extractPasswordResetOobCode(
      'tiedsiren://app?mode=verifyEmail&oobCode=abc123',
    )

    expect(extractedOobCode).toBeNull()
  })

  it('should return null when oobCode is missing', () => {
    const extractedOobCode = extractPasswordResetOobCode(
      'tiedsiren://app?mode=resetPassword',
    )

    expect(extractedOobCode).toBeNull()
  })

  it('should return null when mode is missing', () => {
    const extractedOobCode = extractPasswordResetOobCode(
      'tiedsiren://app?oobCode=abc123',
    )

    expect(extractedOobCode).toBeNull()
  })

  it('should return null for a URL with no query params', () => {
    const extractedOobCode = extractPasswordResetOobCode('tiedsiren://app')

    expect(extractedOobCode).toBeNull()
  })
})
