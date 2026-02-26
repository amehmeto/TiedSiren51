import * as IntentLauncher from 'expo-intent-launcher'
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

vi.mock('expo-intent-launcher', () => ({
  startActivityAsync: vi.fn(),
}))

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

const mockStartActivity = vi.mocked(IntentLauncher.startActivityAsync)
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

    it('should launch Gmail via intent launcher', async () => {
      mockStartActivity.mockResolvedValueOnce({ resultCode: -1 })

      await openEmailApp('user@gmail.com')

      expect(mockStartActivity).toHaveBeenCalledWith(
        'android.intent.action.MAIN',
        {
          packageName: 'com.google.android.gm',
          category: 'android.intent.category.LAUNCHER',
        },
      )
      expect(mockOpenURL).not.toHaveBeenCalled()
    })

    it('should fall back to deep link when intent launcher fails', async () => {
      mockStartActivity.mockRejectedValueOnce(new Error('Activity not found'))
      mockOpenURL.mockResolvedValueOnce(true)

      await openEmailApp('user@gmail.com')

      expect(mockStartActivity).toHaveBeenCalled()
      expect(mockOpenURL).toHaveBeenCalledWith('googlegmail://')
    })

    it('should fall back to web URL when both intent and deep link fail', async () => {
      mockStartActivity.mockRejectedValueOnce(new Error('Activity not found'))
      mockOpenURL
        .mockRejectedValueOnce(new Error('Cannot open URL'))
        .mockResolvedValueOnce(true)

      await openEmailApp('user@gmail.com')

      expect(mockOpenURL).toHaveBeenNthCalledWith(1, 'googlegmail://')
      expect(mockOpenURL).toHaveBeenNthCalledWith(2, 'https://mail.google.com')
    })

    it('should fall back to mailto for unknown provider', async () => {
      mockOpenURL.mockResolvedValueOnce(true)

      await openEmailApp('user@company.com')

      expect(mockStartActivity).not.toHaveBeenCalled()
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

      expect(mockStartActivity).not.toHaveBeenCalled()
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
