import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { InMemoryConsentStorage } from '@/infra/consent-storage/in-memory.consent.storage'
import { giveAccessibilityConsent } from './give-accessibility-consent.usecase'
import { loadAccessibilityConsent } from './load-accessibility-consent.usecase'

describe('giveAccessibilityConsent usecase', () => {
  let consentStorage: InMemoryConsentStorage

  beforeEach(() => {
    consentStorage = new InMemoryConsentStorage()
  })

  test('should set consent state to true', async () => {
    const store = createTestStore({ consentStorage })

    await store.dispatch(giveAccessibilityConsent())

    const hasConsented = store.getState().accessibilityConsent.hasConsented
    expect(hasConsented).toBe(true)
  })

  test('should persist consent (roundtrip with load)', async () => {
    const store = createTestStore({ consentStorage })

    await store.dispatch(giveAccessibilityConsent())
    await store.dispatch(loadAccessibilityConsent())

    const hasConsented = store.getState().accessibilityConsent.hasConsented
    expect(hasConsented).toBe(true)
  })
})
