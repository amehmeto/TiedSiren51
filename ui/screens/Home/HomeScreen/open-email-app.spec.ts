import * as Linking from 'expo-linking'
import { Platform } from 'react-native'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { openEmailApp } from './open-email-app'

type LogEntry = { level: string; message: string }

const { mockLogger } = vi.hoisted(() => {
  const logs: LogEntry[] = []
  return {
    mockLogger: {
      info: (message: string) => logs.push({ level: 'info', message }),
      warn: (message: string) => logs.push({ level: 'warn', message }),
      error: (message: string) => logs.push({ level: 'error', message }),
      initialize: () => {},
      getLogs: () => [...logs],
      clear: () => (logs.length = 0),
    },
  }
})

vi.mock('expo-linking', () => ({
  openURL: vi.fn(),
  canOpenURL: vi.fn(),
}))

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
}))

vi.mock('@/ui/dependencies', () => ({
  dependencies: {
    logger: mockLogger,
  },
}))

const mockOpenURL = vi.mocked(Linking.openURL)
const mockCanOpenURL = vi.mocked(Linking.canOpenURL)

describe('openEmailApp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogger.clear()
  })

  describe('on Android', () => {
    beforeEach(() => {
      Platform.OS = 'android'
    })

    it('should open deep link directly without canOpenURL check', async () => {
      mockOpenURL.mockResolvedValueOnce(true)

      await openEmailApp('user@gmail.com')

      expect(mockCanOpenURL).not.toHaveBeenCalled()
      expect(mockOpenURL).toHaveBeenCalledWith('googlegmail://')
    })

    it('should fall back to web URL when deep link throws', async () => {
      mockOpenURL
        .mockRejectedValueOnce(new Error('Activity not found'))
        .mockResolvedValueOnce(true)

      await openEmailApp('user@gmail.com')

      expect(mockOpenURL).toHaveBeenNthCalledWith(1, 'googlegmail://')
      expect(mockOpenURL).toHaveBeenNthCalledWith(2, 'https://mail.google.com')
    })

    it('should fall back to mailto when deep link throws for unknown provider', async () => {
      mockOpenURL.mockResolvedValueOnce(true)

      await openEmailApp('user@company.com')

      expect(mockOpenURL).toHaveBeenCalledWith('mailto:user@company.com')
    })
  })

  describe('on iOS', () => {
    beforeEach(() => {
      Platform.OS = 'ios'
    })

    it('should use canOpenURL before opening deep link', async () => {
      mockCanOpenURL.mockResolvedValueOnce(true)
      mockOpenURL.mockResolvedValueOnce(true)

      await openEmailApp('user@gmail.com')

      expect(mockCanOpenURL).toHaveBeenCalledWith('googlegmail://')
      expect(mockOpenURL).toHaveBeenCalledWith('googlegmail://')
    })

    it('should fall back to web URL when canOpenURL returns false', async () => {
      mockCanOpenURL.mockResolvedValueOnce(false)
      mockOpenURL.mockResolvedValueOnce(true)

      await openEmailApp('user@gmail.com')

      expect(mockOpenURL).toHaveBeenCalledWith('https://mail.google.com')
    })
  })

  describe('fallback chain', () => {
    beforeEach(() => {
      Platform.OS = 'ios'
    })

    it('should fall back to mailto for unknown provider', async () => {
      mockOpenURL.mockResolvedValueOnce(true)

      await openEmailApp('user@company.com')

      expect(mockOpenURL).toHaveBeenCalledWith('mailto:user@company.com')
    })

    it('should log error when all fallbacks fail', async () => {
      const expectedLogEntry = {
        level: 'error',
        message: expect.stringContaining(
          '[openEmailApp] Failed to open email app',
        ),
      }
      mockOpenURL.mockRejectedValueOnce(new Error('Cannot open URL'))

      await openEmailApp('user@company.com')

      expect(mockLogger.getLogs()).toContainEqual(expectedLogEntry)
    })
  })
})
