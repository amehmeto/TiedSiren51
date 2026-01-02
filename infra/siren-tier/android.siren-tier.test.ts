import { setCallbackClass } from '@amehmeto/expo-foreground-service'
import { BLOCKING_CALLBACK_CLASS } from '@amehmeto/tied-siren-blocking-overlay'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ISODateString } from '@/core/_ports_/date-provider'
import { BlockingWindow } from '@/core/_ports_/siren.tier'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { AndroidSirenTier } from './android.siren-tier'

vi.mock('@amehmeto/expo-foreground-service', () => ({
  setCallbackClass: vi.fn(),
}))

vi.mock('@amehmeto/tied-siren-blocking-overlay', () => ({
  BLOCKING_CALLBACK_CLASS: 'com.blocking.CallbackClass',
}))

const mockSetCallbackClass = vi.mocked(setCallbackClass)

describe('AndroidSirenTier', () => {
  let androidSirenTier: AndroidSirenTier
  let logger: InMemoryLogger

  const startTime: ISODateString = '2024-01-01T10:00:00.000Z'
  const endTime: ISODateString = '2024-01-01T11:00:00.000Z'

  const createBlockingWindow = (id: string): BlockingWindow => ({
    id,
    startTime,
    endTime,
    sirens: {
      android: [],
      windows: [],
      macos: [],
      ios: [],
      linux: [],
      websites: [],
      keywords: [],
    },
  })

  beforeEach(() => {
    vi.clearAllMocks()
    logger = new InMemoryLogger()
    androidSirenTier = new AndroidSirenTier(logger)
  })

  describe('block', () => {
    it('logs received schedule with window count', async () => {
      const schedule = [createBlockingWindow('window-1')]
      const expectedLog = {
        level: 'info',
        message: '[AndroidSirenTier] Received blocking schedule with 1 windows',
      }

      await androidSirenTier.block(schedule)

      expect(logger.getLogs()).toContainEqual(expectedLog)
    })

    it('logs each window details', async () => {
      const schedule = [createBlockingWindow('window-1')]
      const expectedLog = {
        level: 'info',
        message: `[AndroidSirenTier]   Window window-1: ${startTime}-${endTime}`,
      }

      await androidSirenTier.block(schedule)

      expect(logger.getLogs()).toContainEqual(expectedLog)
    })

    it('handles empty schedule', async () => {
      const expectedLog = {
        level: 'info',
        message: '[AndroidSirenTier] Received blocking schedule with 0 windows',
      }

      await androidSirenTier.block([])

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
