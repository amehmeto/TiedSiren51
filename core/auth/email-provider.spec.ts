import { describe, expect, test } from 'vitest'
import {
  extractDomain,
  getEmailProvider,
  getOpenEmailLabel,
  getWebUrl,
} from './email-provider'

describe('extractDomain', () => {
  test.each<[string, string]>([
    ['user@gmail.com', 'gmail.com'],
    ['user@GMAIL.COM', 'gmail.com'],
    ['invalid', ''],
  ])('extractDomain("%s") → "%s"', (email, expectedDomain) => {
    const extractedDomain = extractDomain(email)

    expect(extractedDomain).toBe(expectedDomain)
  })
})

describe('getEmailProvider', () => {
  test.each<[string, string]>([
    ['user@gmail.com', 'Gmail'],
    ['user@googlemail.com', 'Gmail'],
    ['user@outlook.com', 'Outlook'],
    ['user@hotmail.com', 'Outlook'],
    ['user@live.com', 'Outlook'],
    ['user@yahoo.com', 'Yahoo Mail'],
    ['user@icloud.com', 'Apple Mail'],
    ['user@me.com', 'Apple Mail'],
    ['user@mac.com', 'Apple Mail'],
    ['user@protonmail.com', 'Proton Mail'],
    ['user@proton.me', 'Proton Mail'],
  ])('should identify %s as %s', (email, expectedName) => {
    const provider = getEmailProvider(email)

    expect(provider?.name).toBe(expectedName)
  })

  test('should return null for unknown domain', () => {
    const provider = getEmailProvider('user@company.com')

    expect(provider).toBeNull()
  })

  test('should include deep link URLs for known provider', () => {
    const provider = getEmailProvider('user@gmail.com')

    expect(provider?.deepLink).toBe('googlegmail://')
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
