import { describe, expect, it } from 'vitest'
import { extractVerifyEmailOobCode } from './extract-verify-email-oob-code.helper'

describe('extractVerifyEmailOobCode', () => {
  it('should extract oobCode from a valid verifyEmail deep link', () => {
    const url =
      'tiedsiren://app?mode=verifyEmail&oobCode=abc123&continueUrl=https://example.com'

    const extractedOobCode = extractVerifyEmailOobCode(url)

    expect(extractedOobCode).toBe('abc123')
  })

  it('should return null when mode is not verifyEmail', () => {
    const extractedOobCode = extractVerifyEmailOobCode(
      'tiedsiren://app?mode=resetPassword&oobCode=abc123',
    )

    expect(extractedOobCode).toBeNull()
  })

  it('should return null when oobCode is missing', () => {
    const extractedOobCode = extractVerifyEmailOobCode(
      'tiedsiren://app?mode=verifyEmail',
    )

    expect(extractedOobCode).toBeNull()
  })

  it('should return null when mode is missing', () => {
    const extractedOobCode = extractVerifyEmailOobCode(
      'tiedsiren://app?oobCode=abc123',
    )

    expect(extractedOobCode).toBeNull()
  })

  it('should return null for a URL with no query params', () => {
    const extractedOobCode = extractVerifyEmailOobCode('tiedsiren://app')

    expect(extractedOobCode).toBeNull()
  })
})
