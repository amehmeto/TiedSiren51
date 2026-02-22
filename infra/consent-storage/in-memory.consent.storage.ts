import { ConsentStorage } from '@/core/_ports_/consent.storage'

export class InMemoryConsentStorage implements ConsentStorage {
  private hasGivenConsent = false

  private shouldThrow = false

  simulateError(): void {
    this.shouldThrow = true
  }

  async hasConsented(): Promise<boolean> {
    if (this.shouldThrow) throw new Error('Simulated consent storage error')
    return this.hasGivenConsent
  }

  async giveConsent(): Promise<void> {
    this.hasGivenConsent = true
  }
}
