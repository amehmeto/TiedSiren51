import { AppStorage } from '../ports/app-storage'

export class MockAppStorage implements AppStorage {
  private _isInitialized = true

  async initialize(): Promise<void> {
    this._isInitialized = true
  }

  isInitialized(): boolean {
    return this._isInitialized
  }

  async disconnect(): Promise<void> {
    this._isInitialized = false
  }

  async refresh(): Promise<void> {
    // No-op for mock
  }
}

export const mockAppStorage = new MockAppStorage()
