import { ConsentStorage } from '@/core/_ports_/consent.storage'

export class InMemoryConsentStorage implements ConsentStorage {
  private hasGivenConsent = false

  async hasConsented(): Promise<boolean> {
    return this.hasGivenConsent
  }

  async giveConsent(): Promise<void> {
    this.hasGivenConsent = true
  }
}
