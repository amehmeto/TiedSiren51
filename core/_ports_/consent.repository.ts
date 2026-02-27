export interface ConsentRepository {
  hasConsented(): Promise<boolean>
  giveConsent(): Promise<void>
}
