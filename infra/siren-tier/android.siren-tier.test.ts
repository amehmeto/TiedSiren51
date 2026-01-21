import { setCallbackClass } from '@amehmeto/expo-foreground-service'
import {
  BLOCKING_CALLBACK_CLASS,
  setBlockedApps,
  setBlockingSchedule,
} from '@amehmeto/tied-siren-blocking-overlay'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  facebookAndroidSiren,
  instagramAndroidSiren,
} from '@/core/_tests_/data-builders/android-siren.builder'
import { buildBlockingSchedule } from '@/core/_tests_/data-builders/blocking-schedule.builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { AndroidSirenTier, toNativeBlockingWindows } from './android.siren-tier'

vi.mock('@amehmeto/expo-foreground-service', () => ({
  setCallbackClass: vi.fn(),
}))

vi.mock('@amehmeto/tied-siren-blocking-overlay', () => ({
  BLOCKING_CALLBACK_CLASS: 'com.blocking.CallbackClass',
  setBlockedApps: vi.fn(),
  setBlockingSchedule: vi.fn(),
}))

const mockSetCallbackClass = vi.mocked(setCallbackClass)
const mockSetBlockedApps = vi.mocked(setBlockedApps)
const mockSetBlockingSchedule = vi.mocked(setBlockingSchedule)

describe('AndroidSirenTier', () => {
  let androidSirenTier: AndroidSirenTier
  let logger: InMemoryLogger
  let dateProvider: StubDateProvider

  beforeEach(() => {
    vi.clearAllMocks()
    logger = new InMemoryLogger()
    dateProvider = new StubDateProvider()
    androidSirenTier = new AndroidSirenTier(logger, dateProvider)
  })

  describe('updateBlockingSchedule', () => {
    it('calls setBlockingSchedule with native format windows', async () => {
      mockSetBlockingSchedule.mockResolvedValueOnce(undefined)
      mockSetBlockedApps.mockResolvedValueOnce(undefined)
      const schedules = [
        buildBlockingSchedule({
          sirens: {
            android: [facebookAndroidSiren],
          },
        }),
      ]

      await androidSirenTier.updateBlockingSchedule(schedules)

      expect(mockSetBlockingSchedule).toHaveBeenCalledWith(
        toNativeBlockingWindows(schedules, dateProvider),
      )
    })

    it('calls setBlockedApps with package names from schedule', async () => {
      mockSetBlockingSchedule.mockResolvedValueOnce(undefined)
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
      mockSetBlockingSchedule.mockResolvedValueOnce(undefined)
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
      mockSetBlockingSchedule.mockResolvedValueOnce(undefined)
      mockSetBlockedApps.mockResolvedValueOnce(undefined)
      const expectedLog = {
        level: 'info',
        message:
          '[AndroidSirenTier] Blocking schedule updated: 0 schedules, 0 apps: ',
      }

      await androidSirenTier.updateBlockingSchedule([])

      expect(mockSetBlockingSchedule).toHaveBeenCalledWith([])
      expect(mockSetBlockedApps).toHaveBeenCalledWith([])
      expect(logger.getLogs()).toContainEqual(expectedLog)
    })

    it('logs error and rethrows when setBlockingSchedule fails', async () => {
      const error = new Error('Native module error')
      mockSetBlockingSchedule.mockRejectedValueOnce(error)
      const schedules = [buildBlockingSchedule()]
      const expectedLog = {
        level: 'error',
        message: `[AndroidSirenTier] Failed to update blocking schedule: ${error}`,
      }

      const updatePromise = androidSirenTier.updateBlockingSchedule(schedules)

      await expect(updatePromise).rejects.toThrow('Native module error')
      expect(logger.getLogs()).toContainEqual(expectedLog)
    })

    it('logs error and rethrows when setBlockedApps fails', async () => {
      const error = new Error('Native module error')
      mockSetBlockingSchedule.mockResolvedValueOnce(undefined)
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

describe('toNativeBlockingWindows', () => {
  const dateProvider = new StubDateProvider()

  it('converts BlockingSchedule array to native BlockingWindow format', () => {
    const schedules = [
      buildBlockingSchedule({
        id: 'schedule-1',
        startTime: '2024-01-15T14:30:00.000Z',
        endTime: '2024-01-15T15:45:00.000Z',
        sirens: {
          android: [facebookAndroidSiren],
          websites: ['facebook.com'],
          keywords: ['social'],
        },
      }),
    ]

    const result = toNativeBlockingWindows(schedules, dateProvider)
    const [firstWindow] = result

    expect(result).toHaveLength(1)
    expect(firstWindow.id).toBe('schedule-1')
    expect(firstWindow.startTime).toMatch(/^\d{2}:\d{2}$/)
    expect(firstWindow.endTime).toMatch(/^\d{2}:\d{2}$/)
    expect(firstWindow.packageNames).toStrictEqual(['com.facebook.katana'])
  })

  it('extracts package names from Android sirens', () => {
    const schedules = [
      buildBlockingSchedule({
        sirens: {
          android: [facebookAndroidSiren, instagramAndroidSiren],
        },
      }),
    ]
    const expectedPackageNames = [
      'com.facebook.katana',
      'com.example.instagram',
    ]

    const [firstWindow] = toNativeBlockingWindows(schedules, dateProvider)

    expect(firstWindow.packageNames).toStrictEqual(expectedPackageNames)
  })

  it('handles empty schedule list', () => {
    const result = toNativeBlockingWindows([], dateProvider)

    expect(result).toStrictEqual([])
  })

  it('handles schedule with no Android apps', () => {
    const schedules = [
      buildBlockingSchedule({
        sirens: {
          android: [],
          websites: ['example.com'],
          keywords: [],
        },
      }),
    ]

    const [firstWindow] = toNativeBlockingWindows(schedules, dateProvider)

    expect(firstWindow.packageNames).toStrictEqual([])
  })
})
