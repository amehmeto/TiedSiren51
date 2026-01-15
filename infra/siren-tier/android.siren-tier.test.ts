import { setCallbackClass } from '@amehmeto/expo-foreground-service'
import {
  BLOCKING_CALLBACK_CLASS,
  setBlockedApps,
} from '@amehmeto/tied-siren-blocking-overlay'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  facebookAndroidSiren,
  instagramAndroidSiren,
} from '@/core/_tests_/data-builders/android-siren.builder'
import { buildBlockingSchedule } from '@/core/_tests_/data-builders/blocking-schedule.builder'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { AndroidSirenTier } from './android.siren-tier'

vi.mock('@amehmeto/expo-foreground-service', () => ({
  setCallbackClass: vi.fn(),
}))

vi.mock('@amehmeto/tied-siren-blocking-overlay', () => ({
  BLOCKING_CALLBACK_CLASS: 'com.blocking.CallbackClass',
  setBlockedApps: vi.fn(),
}))

const mockSetCallbackClass = vi.mocked(setCallbackClass)
const mockSetBlockedApps = vi.mocked(setBlockedApps)

describe('AndroidSirenTier', () => {
  let androidSirenTier: AndroidSirenTier
  let logger: InMemoryLogger

  beforeEach(() => {
    vi.clearAllMocks()
    logger = new InMemoryLogger()
    androidSirenTier = new AndroidSirenTier(logger)
  })

  describe('updateBlockingSchedule', () => {
    it('calls setBlockedApps with package names from schedule', async () => {
      mockSetBlockedApps.mockResolvedValueOnce(undefined)
      const schedules = [
        buildBlockingSchedule({
          sirens: {
            android: [facebookAndroidSiren],
          },
        }),
      ]

      await androidSirenTier.updateBlockingSchedule(schedules)

      expect(mockSetBlockedApps).toHaveBeenCalledWith(['com.facebook.katana'])
    })

    it('logs schedule count and app count', async () => {
      mockSetBlockedApps.mockResolvedValueOnce(undefined)
      const schedules = [
        buildBlockingSchedule({
          sirens: {
            android: [facebookAndroidSiren, instagramAndroidSiren],
          },
        }),
      ]
      const expectedLog = {
        level: 'info',
        message:
          '[AndroidSirenTier] Blocking schedule updated: 1 schedules, 2 apps: com.facebook.katana, com.example.instagram',
      }

      await androidSirenTier.updateBlockingSchedule(schedules)

      expect(logger.getLogs()).toContainEqual(expectedLog)
    })

    it('handles empty schedule list', async () => {
      mockSetBlockedApps.mockResolvedValueOnce(undefined)
      const expectedLog = {
        level: 'info',
        message:
          '[AndroidSirenTier] Blocking schedule updated: 0 schedules, 0 apps: ',
      }

      await androidSirenTier.updateBlockingSchedule([])

      expect(mockSetBlockedApps).toHaveBeenCalledWith([])
      expect(logger.getLogs()).toContainEqual(expectedLog)
    })

    it('logs error and rethrows when setBlockedApps fails', async () => {
      const error = new Error('Native module error')
      mockSetBlockedApps.mockRejectedValueOnce(error)
      const schedules = [buildBlockingSchedule()]
      const expectedLog = {
        level: 'error',
        message: `[AndroidSirenTier] Failed to update blocking schedule: ${error}`,
      }

      const updatePromise = androidSirenTier.updateBlockingSchedule(schedules)

      await expect(updatePromise).rejects.toThrow('Native module error')
      expect(logger.getLogs()).toContainEqual(expectedLog)
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
        message: '[AndroidSirenTier] Native blocking initialized',
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
