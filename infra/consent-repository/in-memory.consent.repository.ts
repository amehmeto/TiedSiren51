import { ConsentRepository } from '@/core/_ports_/consent.repository'

export class InMemoryConsentRepository implements ConsentRepository {
  private hasGivenConsent = false

  private shouldThrow = false

  simulateError(): void {
    this.shouldThrow = true
  }

  async hasConsented(): Promise<boolean> {
    if (this.shouldThrow) throw new Error('Simulated consent repository error')
    return this.hasGivenConsent
  }

  async giveConsent(): Promise<void> {
    this.hasGivenConsent = true
  }
}
