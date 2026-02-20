import { describe, expect, it } from 'vitest'
import { extractOobCode, FirebaseDeepLinkMode } from './extract-oob-code.helper'

const { VerifyEmail, ResetPassword } = FirebaseDeepLinkMode

type OobCodeTestCase = {
  scenario: string
  url: string
  mode: FirebaseDeepLinkMode
  expected: string | null
}

describe('extractOobCode', () => {
  it.each<OobCodeTestCase>([
    {
      scenario: 'valid verifyEmail deep link',
      url: 'tiedsiren://app?mode=verifyEmail&oobCode=abc123&continueUrl=https://example.com',
      mode: VerifyEmail,
      expected: 'abc123',
    },
    {
      scenario: 'valid resetPassword deep link',
      url: 'tiedsiren://app?mode=resetPassword&oobCode=abc123&continueUrl=https://example.com',
      mode: ResetPassword,
      expected: 'abc123',
    },
    {
      scenario: 'mode mismatch (resetPassword URL with verifyEmail mode)',
      url: 'tiedsiren://app?mode=resetPassword&oobCode=abc123',
      mode: VerifyEmail,
      expected: null,
    },
    {
      scenario: 'mode mismatch (verifyEmail URL with resetPassword mode)',
      url: 'tiedsiren://app?mode=verifyEmail&oobCode=abc123',
      mode: ResetPassword,
      expected: null,
    },
    {
      scenario: 'missing oobCode',
      url: 'tiedsiren://app?mode=verifyEmail',
      mode: VerifyEmail,
      expected: null,
    },
    {
      scenario: 'missing mode',
      url: 'tiedsiren://app?oobCode=abc123',
      mode: VerifyEmail,
      expected: null,
    },
    {
      scenario: 'no query params',
      url: 'tiedsiren://app',
      mode: VerifyEmail,
      expected: null,
    },
  ])('should return $expected for $scenario', ({ url, mode, expected }) => {
    const extractedOobCode = extractOobCode(url, mode)

    expect(extractedOobCode).toBe(expected)
  })
})
