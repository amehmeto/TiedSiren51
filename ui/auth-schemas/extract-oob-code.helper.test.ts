import { describe, expect, it } from 'vitest'
import { extractOobCode, FirebaseDeepLinkMode } from './extract-oob-code.helper'

describe('extractOobCode', () => {
  describe('verifyEmail mode', () => {
    it('should extract oobCode from a valid verifyEmail deep link', () => {
      const url =
        'tiedsiren://app?mode=verifyEmail&oobCode=abc123&continueUrl=https://example.com'

      const extractedOobCode = extractOobCode(
        url,
        FirebaseDeepLinkMode.VerifyEmail,
      )

      expect(extractedOobCode).toBe('abc123')
    })

    it('should return null when mode is resetPassword', () => {
      const extractedOobCode = extractOobCode(
        'tiedsiren://app?mode=resetPassword&oobCode=abc123',
        FirebaseDeepLinkMode.VerifyEmail,
      )

      expect(extractedOobCode).toBeNull()
    })
  })

  describe('resetPassword mode', () => {
    it('should extract oobCode from a valid resetPassword deep link', () => {
      const url =
        'tiedsiren://app?mode=resetPassword&oobCode=abc123&continueUrl=https://example.com'

      const extractedOobCode = extractOobCode(
        url,
        FirebaseDeepLinkMode.ResetPassword,
      )

      expect(extractedOobCode).toBe('abc123')
    })

    it('should return null when mode is verifyEmail', () => {
      const extractedOobCode = extractOobCode(
        'tiedsiren://app?mode=verifyEmail&oobCode=abc123',
        FirebaseDeepLinkMode.ResetPassword,
      )

      expect(extractedOobCode).toBeNull()
    })
  })

  describe('shared behavior', () => {
    it('should return null when oobCode is missing', () => {
      const extractedOobCode = extractOobCode(
        'tiedsiren://app?mode=verifyEmail',
        FirebaseDeepLinkMode.VerifyEmail,
      )

      expect(extractedOobCode).toBeNull()
    })

    it('should return null when mode is missing', () => {
      const extractedOobCode = extractOobCode(
        'tiedsiren://app?oobCode=abc123',
        FirebaseDeepLinkMode.VerifyEmail,
      )

      expect(extractedOobCode).toBeNull()
    })

    it('should return null for a URL with no query params', () => {
      const extractedOobCode = extractOobCode(
        'tiedsiren://app',
        FirebaseDeepLinkMode.VerifyEmail,
      )

      expect(extractedOobCode).toBeNull()
    })
  })
})
