import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { InMemoryConsentRepository } from '@/infra/consent-repository/in-memory.consent.repository'
import { loadAccessibilityConsent } from '../usecases/load-accessibility-consent.usecase'
import { selectHasAccessibilityConsent } from './selectHasAccessibilityConsent'

describe('selectHasAccessibilityConsent', () => {
  let consentRepository: InMemoryConsentRepository

  beforeEach(() => {
    consentRepository = new InMemoryConsentRepository()
  })

  test('should return null initially', () => {
    const store = createTestStore({ consentRepository })

    const hasConsented = selectHasAccessibilityConsent(store.getState())

    expect(hasConsented).toBeNull()
  })

  test('should return false when user has not consented', async () => {
    const store = createTestStore({ consentRepository })

    await store.dispatch(loadAccessibilityConsent())
    const hasConsented = selectHasAccessibilityConsent(store.getState())

    expect(hasConsented).toBe(false)
  })

  test('should return true when user has consented', async () => {
    await consentRepository.giveConsent()
    const store = createTestStore({ consentRepository })

    await store.dispatch(loadAccessibilityConsent())
    const hasConsented = selectHasAccessibilityConsent(store.getState())

    expect(hasConsented).toBe(true)
  })
})
