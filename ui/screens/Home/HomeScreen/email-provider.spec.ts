import { describe, expect, test } from 'vitest'
import {
  extractDomain,
  getEmailProvider,
  getOpenEmailLabel,
  getWebUrl,
} from './email-provider'

describe('extractDomain', () => {
  test('should extract domain from email', () => {
    const extractedDomain = extractDomain('user@gmail.com')

    expect(extractedDomain).toBe('gmail.com')
  })

  test('should lowercase the domain', () => {
    const extractedDomain = extractDomain('user@GMAIL.COM')

    expect(extractedDomain).toBe('gmail.com')
  })

  test('should return empty string for invalid email', () => {
    const extractedDomain = extractDomain('invalid')

    expect(extractedDomain).toBe('')
  })
})

describe('getEmailProvider', () => {
  test('should return Gmail for gmail.com', () => {
    const provider = getEmailProvider('user@gmail.com')

    expect(provider?.name).toBe('Gmail')
  })

  test('should return Gmail for googlemail.com', () => {
    const provider = getEmailProvider('user@googlemail.com')

    expect(provider?.name).toBe('Gmail')
  })

  test('should return Outlook for outlook.com', () => {
    const provider = getEmailProvider('user@outlook.com')

    expect(provider?.name).toBe('Outlook')
  })

  test('should return Outlook for hotmail.com', () => {
    const provider = getEmailProvider('user@hotmail.com')

    expect(provider?.name).toBe('Outlook')
  })

  test('should return Outlook for live.com', () => {
    const provider = getEmailProvider('user@live.com')

    expect(provider?.name).toBe('Outlook')
  })

  test('should return Yahoo Mail for yahoo.com', () => {
    const provider = getEmailProvider('user@yahoo.com')

    expect(provider?.name).toBe('Yahoo Mail')
  })

  test('should return Apple Mail for icloud.com', () => {
    const provider = getEmailProvider('user@icloud.com')

    expect(provider?.name).toBe('Apple Mail')
  })

  test('should return Apple Mail for me.com', () => {
    const provider = getEmailProvider('user@me.com')

    expect(provider?.name).toBe('Apple Mail')
  })

  test('should return Proton Mail for protonmail.com', () => {
    const provider = getEmailProvider('user@protonmail.com')

    expect(provider?.name).toBe('Proton Mail')
  })

  test('should return Proton Mail for proton.me', () => {
    const provider = getEmailProvider('user@proton.me')

    expect(provider?.name).toBe('Proton Mail')
  })

  test('should return null for unknown domain', () => {
    const provider = getEmailProvider('user@company.com')

    expect(provider).toBeNull()
  })

  test('should include deep link URLs for known provider', () => {
    const provider = getEmailProvider('user@gmail.com')

    expect(provider?.iosDeepLink).toBe('googlegmail://')
    expect(provider?.androidDeepLink).toContain('com.google.android.gm')
  })
})

describe('getOpenEmailLabel', () => {
  test('should return provider-specific label for known domain', () => {
    const label = getOpenEmailLabel('user@gmail.com')

    expect(label).toBe('Open Gmail')
  })

  test('should return generic label for unknown domain', () => {
    const label = getOpenEmailLabel('user@company.com')

    expect(label).toBe('Open your email app')
  })
})

describe('getWebUrl', () => {
  test('should return web URL for known provider', () => {
    const webUrl = getWebUrl('user@gmail.com')

    expect(webUrl).toBe('https://mail.google.com')
  })

  test('should return null for unknown domain', () => {
    const webUrl = getWebUrl('user@company.com')

    expect(webUrl).toBeNull()
  })
})
