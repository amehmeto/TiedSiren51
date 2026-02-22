import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { InMemoryConsentStorage } from '@/infra/consent-storage/in-memory.consent.storage'
import { loadAccessibilityConsent } from '../usecases/load-accessibility-consent.usecase'
import { selectHasAccessibilityConsent } from './selectHasAccessibilityConsent'

describe('selectHasAccessibilityConsent', () => {
  let consentStorage: InMemoryConsentStorage

  beforeEach(() => {
    consentStorage = new InMemoryConsentStorage()
  })

  test('should return null initially', () => {
    const store = createTestStore({ consentStorage })

    const hasConsented = selectHasAccessibilityConsent(store.getState())

    expect(hasConsented).toBeNull()
  })

  test('should return false when user has not consented', async () => {
    const store = createTestStore({ consentStorage })

    await store.dispatch(loadAccessibilityConsent())
    const hasConsented = selectHasAccessibilityConsent(store.getState())

    expect(hasConsented).toBe(false)
  })

  test('should return true when user has consented', async () => {
    await consentStorage.giveConsent()
    const store = createTestStore({ consentStorage })

    await store.dispatch(loadAccessibilityConsent())
    const hasConsented = selectHasAccessibilityConsent(store.getState())

    expect(hasConsented).toBe(true)
  })
})
