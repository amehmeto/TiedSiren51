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

  test.each<[string, string]>([
    ['user@gmail.com', 'googlegmail://'],
    ['user@googlemail.com', 'googlegmail://'],
    ['user@outlook.com', 'ms-outlook://'],
    ['user@hotmail.com', 'ms-outlook://'],
    ['user@live.com', 'ms-outlook://'],
    ['user@yahoo.com', 'ymail://'],
    ['user@icloud.com', 'message://'],
    ['user@me.com', 'message://'],
    ['user@mac.com', 'message://'],
    ['user@protonmail.com', 'protonmail://'],
    ['user@proton.me', 'protonmail://'],
  ])('should resolve deep link for %s as %s', (email, expectedDeepLink) => {
    const provider = getEmailProvider(email)

    expect(provider?.deepLink).toBe(expectedDeepLink)
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
  test.each<[string, string]>([
    ['user@gmail.com', 'https://mail.google.com'],
    ['user@googlemail.com', 'https://mail.google.com'],
    ['user@outlook.com', 'https://outlook.live.com'],
    ['user@hotmail.com', 'https://outlook.live.com'],
    ['user@live.com', 'https://outlook.live.com'],
    ['user@yahoo.com', 'https://mail.yahoo.com'],
    ['user@icloud.com', 'https://www.icloud.com/mail'],
    ['user@me.com', 'https://www.icloud.com/mail'],
    ['user@mac.com', 'https://www.icloud.com/mail'],
    ['user@protonmail.com', 'https://mail.proton.me'],
    ['user@proton.me', 'https://mail.proton.me'],
  ])('should return web URL for %s as %s', (email, expectedWebUrl) => {
    const webUrl = getWebUrl(email)

    expect(webUrl).toBe(expectedWebUrl)
  })

  test('should return null for unknown domain', () => {
    const webUrl = getWebUrl('user@company.com')

    expect(webUrl).toBeNull()
  })
})
