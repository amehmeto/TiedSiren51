import AsyncStorage from '@react-native-async-storage/async-storage'
import { ConsentStorage } from '@/core/_ports_/consent.storage'
import { Logger } from '@/core/_ports_/logger'

export class AsyncStorageConsentStorage implements ConsentStorage {
  private static readonly STORAGE_KEY = 'accessibility_disclosure_consent'

  constructor(private readonly logger: Logger) {}

  async hasConsented(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(
        AsyncStorageConsentStorage.STORAGE_KEY,
      )
      return value === 'true'
    } catch (error) {
      this.logger.error(
        `[AsyncStorageConsentStorage] Failed to hasConsented: ${error}`,
      )
      throw error
    }
  }

  async giveConsent(): Promise<void> {
    try {
      await AsyncStorage.setItem(AsyncStorageConsentStorage.STORAGE_KEY, 'true')
    } catch (error) {
      this.logger.error(
        `[AsyncStorageConsentStorage] Failed to giveConsent: ${error}`,
      )
      throw error
    }
  }
}
