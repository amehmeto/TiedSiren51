import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { InMemoryConsentStorage } from '@/infra/consent-storage/in-memory.consent.storage'
import { loadAccessibilityConsent } from './load-accessibility-consent.usecase'

describe('loadAccessibilityConsent usecase', () => {
  let consentStorage: InMemoryConsentStorage

  beforeEach(() => {
    consentStorage = new InMemoryConsentStorage()
  })

  test('should load false when user has not consented', async () => {
    const store = createTestStore({ consentStorage })

    await store.dispatch(loadAccessibilityConsent())

    const hasConsented = store.getState().accessibilityConsent.hasConsented
    expect(hasConsented).toBe(false)
  })

  test('should load true when user has already consented', async () => {
    await consentStorage.giveConsent()
    const store = createTestStore({ consentStorage })

    await store.dispatch(loadAccessibilityConsent())

    const hasConsented = store.getState().accessibilityConsent.hasConsented
    expect(hasConsented).toBe(true)
  })
})
