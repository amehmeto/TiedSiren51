import { setCallbackClass } from '@amehmeto/expo-foreground-service'
import {
  BLOCKING_CALLBACK_CLASS,
  showOverlay,
} from '@amehmeto/tied-siren-blocking-overlay'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { AndroidSirenTier } from './android.siren-tier'

vi.mock('@amehmeto/expo-foreground-service', () => ({
  setCallbackClass: vi.fn(),
}))

vi.mock('@amehmeto/tied-siren-blocking-overlay', () => ({
  showOverlay: vi.fn(),
  BLOCKING_CALLBACK_CLASS: 'com.blocking.CallbackClass',
}))

const mockShowOverlay = vi.mocked(showOverlay)
const mockSetCallbackClass = vi.mocked(setCallbackClass)

describe('AndroidSirenTier', () => {
  let androidSirenTier: AndroidSirenTier
  let logger: InMemoryLogger

  beforeEach(() => {
    vi.clearAllMocks()
    logger = new InMemoryLogger()
    androidSirenTier = new AndroidSirenTier(logger)
  })

  describe('block', () => {
    it('calls showOverlay with correct packageName', async () => {
      const packageName = 'com.facebook.katana'
      mockShowOverlay.mockResolvedValueOnce(undefined)

      await androidSirenTier.block(packageName)

      expect(mockShowOverlay).toHaveBeenCalledTimes(1)
      expect(mockShowOverlay).toHaveBeenCalledWith(packageName)
    })

    it('logs success message when overlay is shown', async () => {
      const packageName = 'com.facebook.katana'
      mockShowOverlay.mockResolvedValueOnce(undefined)
      const expectedLogEntry = {
        level: 'info',
        message: `Blocking overlay shown for: ${packageName}`,
      }

      await androidSirenTier.block(packageName)

      expect(logger.getLogs()).toContainEqual(expectedLogEntry)
    })

    it('handles ERR_INVALID_PACKAGE error gracefully', async () => {
      const error = Object.assign(new Error('Package name cannot be empty'), {
        code: 'ERR_INVALID_PACKAGE',
      })
      mockShowOverlay.mockRejectedValueOnce(error)

      const blockPromise = androidSirenTier.block('')

      await expect(blockPromise).rejects.toThrow('Package name cannot be empty')
    })

    it('handles ERR_OVERLAY_LAUNCH error gracefully', async () => {
      const error = Object.assign(new Error('Failed to launch overlay'), {
        code: 'ERR_OVERLAY_LAUNCH',
      })
      mockShowOverlay.mockRejectedValueOnce(error)

      const blockPromise = androidSirenTier.block('com.example.app')

      await expect(blockPromise).rejects.toThrow('Failed to launch overlay')
    })

    it('logs error message when overlay fails to show', async () => {
      const packageName = 'com.example.app'
      const error = new Error('Failed to launch overlay')
      mockShowOverlay.mockRejectedValueOnce(error)
      const expectedLogEntry = {
        level: 'error',
        message: `[AndroidSirenTier] Failed to show blocking overlay for ${packageName}: ${error}`,
      }

      await androidSirenTier.block(packageName).catch(() => {})

      expect(logger.getLogs()).toContainEqual(expectedLogEntry)
    })
  })

  describe('initializeNativeBlocking', () => {
    it('calls setCallbackClass with BLOCKING_CALLBACK_CLASS', async () => {
      mockSetCallbackClass.mockResolvedValueOnce(undefined)

      await androidSirenTier.initializeNativeBlocking()

      expect(mockSetCallbackClass).toHaveBeenCalledTimes(1)
      expect(mockSetCallbackClass).toHaveBeenCalledWith(BLOCKING_CALLBACK_CLASS)
    })

    it('logs success message when initialization succeeds', async () => {
      mockSetCallbackClass.mockResolvedValueOnce(undefined)
      const expectedLogEntry = {
        level: 'info',
        message: 'Native blocking initialized',
      }

      await androidSirenTier.initializeNativeBlocking()

      expect(logger.getLogs()).toContainEqual(expectedLogEntry)
    })

    it('handles errors gracefully without throwing', async () => {
      const error = new Error('Native module not available')
      mockSetCallbackClass.mockRejectedValueOnce(error)

      const result = await androidSirenTier.initializeNativeBlocking()

      expect(result).toBeUndefined()
    })

    it('logs error message when initialization fails', async () => {
      const error = new Error('Native module not available')
      mockSetCallbackClass.mockRejectedValueOnce(error)
      const expectedLogEntry = {
        level: 'error',
        message: `[AndroidSirenTier] Failed to initialize native blocking: ${error}`,
      }

      await androidSirenTier.initializeNativeBlocking()

      expect(logger.getLogs()).toContainEqual(expectedLogEntry)
    })
  })
})
