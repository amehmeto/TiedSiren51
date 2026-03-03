import { fetchAndActivate } from 'firebase/remote-config'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { FirebaseFeatureFlagProvider } from './firebase.feature-flag.provider'

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({})),
}))

vi.mock('../auth-gateway/firebaseConfig', () => ({
  firebaseConfig: {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
  },
}))

vi.mock('firebase/remote-config', () => ({
  getRemoteConfig: vi.fn(() => ({ defaultConfig: {} })),
  fetchAndActivate: vi.fn(),
  getValue: vi.fn(() => ({ asBoolean: () => true })),
}))

const mockRemoteFetch = vi.mocked(fetchAndActivate)

function simulateIndexedDBAvailable() {
  // @ts-expect-error -- Node doesn't have indexedDB; simulate browser environment
  globalThis.indexedDB = {} satisfies Partial<IDBFactory>
}

function simulateIndexedDBUnavailable() {
  // @ts-expect-error -- simulating React Native where indexedDB is undefined
  delete globalThis.indexedDB
}

describe('FirebaseFeatureFlagProvider', () => {
  let provider: FirebaseFeatureFlagProvider
  let logger: InMemoryLogger

  beforeEach(() => {
    vi.clearAllMocks()
    logger = new InMemoryLogger()
    provider = new FirebaseFeatureFlagProvider(logger)
  })

  afterEach(() => {
    simulateIndexedDBUnavailable()
  })

  describe('fetchActivateRemoteConfig', () => {
    describe('when indexedDB is unavailable', () => {
      it('should use defaults and skip remote fetch', async () => {
        simulateIndexedDBUnavailable()
        const expectedLog = {
          level: 'info',
          message:
            '[FirebaseFeatureFlagProvider] indexedDB unavailable, using defaults',
        }

        await provider.fetchAndActivate()

        expect(mockRemoteFetch).not.toHaveBeenCalled()
        expect(logger.getLogs()).toContainEqual(expectedLog)
      })
    })

    describe('when indexedDB is available', () => {
      beforeEach(() => {
        simulateIndexedDBAvailable()
      })

      it('should call firebase remote config fetch', async () => {
        mockRemoteFetch.mockResolvedValueOnce(true)

        await provider.fetchAndActivate()

        expect(mockRemoteFetch).toHaveBeenCalledTimes(1)
      })

      it('should log and rethrow when remote config fetch fails', async () => {
        const error = new Error('Network error')
        mockRemoteFetch.mockRejectedValueOnce(error)
        const expectedLog = {
          level: 'error',
          message: `[FirebaseFeatureFlagProvider] Failed to fetch remote config: ${error}`,
        }

        const fetchPromise = provider.fetchAndActivate()

        await expect(fetchPromise).rejects.toThrow('Network error')
        expect(logger.getLogs()).toContainEqual(expectedLog)
      })
    })
  })
})
