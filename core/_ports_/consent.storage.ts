export interface ConsentStorage {
  hasConsented(): Promise<boolean>
  giveConsent(): Promise<void>
}
