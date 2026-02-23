import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { InMemoryConsentRepository } from '@/infra/consent-repository/in-memory.consent.repository'
import { loadAccessibilityConsent } from './load-accessibility-consent.usecase'

describe('loadAccessibilityConsent usecase', () => {
  let consentRepository: InMemoryConsentRepository

  beforeEach(() => {
    consentRepository = new InMemoryConsentRepository()
  })

  test('should load false when user has not consented', async () => {
    const store = createTestStore({ consentRepository })

    await store.dispatch(loadAccessibilityConsent())

    const hasConsented = store.getState().accessibilityConsent.hasConsented
    expect(hasConsented).toBe(false)
  })

  test('should load true when user has already consented', async () => {
    await consentRepository.giveConsent()
    const store = createTestStore({ consentRepository })

    await store.dispatch(loadAccessibilityConsent())

    const hasConsented = store.getState().accessibilityConsent.hasConsented
    expect(hasConsented).toBe(true)
  })

  test('should fallback to false when storage fails', async () => {
    consentRepository.simulateError()
    const store = createTestStore({ consentRepository })

    await store.dispatch(loadAccessibilityConsent())

    const hasConsented = store.getState().accessibilityConsent.hasConsented
    expect(hasConsented).toBe(false)
  })
})
