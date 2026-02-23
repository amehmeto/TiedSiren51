import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { InMemoryConsentRepository } from '@/infra/consent-repository/in-memory.consent.repository'
import { giveAccessibilityConsent } from './give-accessibility-consent.usecase'
import { loadAccessibilityConsent } from './load-accessibility-consent.usecase'

describe('giveAccessibilityConsent usecase', () => {
  let consentRepository: InMemoryConsentRepository

  beforeEach(() => {
    consentRepository = new InMemoryConsentRepository()
  })

  test('should set consent state to true', async () => {
    const store = createTestStore({ consentRepository })

    await store.dispatch(giveAccessibilityConsent())

    const hasConsented = store.getState().accessibilityConsent.hasConsented
    expect(hasConsented).toBe(true)
  })

  test('should persist consent (roundtrip with load)', async () => {
    const store = createTestStore({ consentRepository })

    await store.dispatch(giveAccessibilityConsent())
    await store.dispatch(loadAccessibilityConsent())

    const hasConsented = store.getState().accessibilityConsent.hasConsented
    expect(hasConsented).toBe(true)
  })
})
