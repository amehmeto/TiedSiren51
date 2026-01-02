import type {
  AccessibilityEvent,
  AccessibilityEventSubscription,
} from '@amehmeto/expo-accessibility-service'
import * as AccessibilityService from '@amehmeto/expo-accessibility-service'
import { setBlockedApps } from '@amehmeto/tied-siren-blocking-overlay'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { RealAndroidSirenLookout } from './real-android.siren-lookout'

type EventListener = (event: AccessibilityEvent) => void

const { mockAddAccessibilityEventListener } = vi.hoisted(() => ({
  mockAddAccessibilityEventListener: vi.fn<
    [EventListener],
    AccessibilityEventSubscription
  >(),
}))

vi.mock('@amehmeto/expo-accessibility-service', () => ({
  isEnabled: vi.fn(),
  askPermission: vi.fn(),
  addAccessibilityEventListener: mockAddAccessibilityEventListener,
}))

vi.mock('@amehmeto/tied-siren-blocking-overlay', () => ({
  setBlockedApps: vi.fn(),
}))

const mockSetBlockedApps = vi.mocked(setBlockedApps)

const mockIsEnabled = vi.mocked(AccessibilityService.isEnabled)
const mockAskPermission = vi.mocked(AccessibilityService.askPermission)

describe('RealAndroidSirenLookout', () => {
  let lookout: RealAndroidSirenLookout
  let logger: InMemoryLogger

  beforeEach(() => {
    vi.clearAllMocks()
    logger = new InMemoryLogger()
    lookout = new RealAndroidSirenLookout(logger)
  })

  describe('isEnabled', () => {
    it('returns true when accessibility service is enabled', async () => {
      mockIsEnabled.mockResolvedValueOnce(true)

      const isEnabled = await lookout.isEnabled()

      expect(isEnabled).toBe(true)
    })

    it('returns false when accessibility service is disabled', async () => {
      mockIsEnabled.mockResolvedValueOnce(false)

      const isEnabled = await lookout.isEnabled()

      expect(isEnabled).toBe(false)
    })

    it('returns false and logs error when check fails', async () => {
      const error = new Error('Permission check failed')
      mockIsEnabled.mockRejectedValueOnce(error)
      const expectedLogEntry = {
        level: 'error',
        message: `[RealAndroidSirenLookout] Failed to check if accessibility service is enabled: ${error}`,
      }

      const isEnabled = await lookout.isEnabled()

      expect(isEnabled).toBe(false)
      expect(logger.getLogs()).toContainEqual(expectedLogEntry)
    })
  })

  describe('askPermission', () => {
    it('calls AccessibilityService.askPermission', async () => {
      mockAskPermission.mockResolvedValueOnce(undefined)

      await lookout.askPermission()

      expect(mockAskPermission).toHaveBeenCalledTimes(1)
    })

    it('logs error and rethrows when permission request fails', async () => {
      const error = new Error('Permission denied')
      mockAskPermission.mockRejectedValueOnce(error)
      const expectedLogEntry = {
        level: 'error',
        message: `[RealAndroidSirenLookout] Failed to ask for accessibility permission: ${error}`,
      }

      const permissionPromise = lookout.askPermission()

      await expect(permissionPromise).rejects.toThrow('Permission denied')
      expect(logger.getLogs()).toContainEqual(expectedLogEntry)
    })
  })

  describe('startWatching', () => {
    it('starts accessibility subscription', () => {
      const mockRemove = vi.fn()
      mockAddAccessibilityEventListener.mockReturnValueOnce({
        remove: mockRemove,
      })

      lookout.startWatching()

      expect(mockAddAccessibilityEventListener).toHaveBeenCalledTimes(1)
    })

    it('logs success message when subscription starts', () => {
      const mockRemove = vi.fn()
      mockAddAccessibilityEventListener.mockReturnValueOnce({
        remove: mockRemove,
      })
      const expectedLogEntry = {
        level: 'info',
        message:
          '[RealAndroidSirenLookout] Started accessibility event subscription',
      }

      lookout.startWatching()

      expect(logger.getLogs()).toContainEqual(expectedLogEntry)
    })

    it('does not create duplicate subscription if already watching', () => {
      const mockRemove = vi.fn()
      mockAddAccessibilityEventListener.mockReturnValue({ remove: mockRemove })

      lookout.startWatching()
      lookout.startWatching()

      expect(mockAddAccessibilityEventListener).toHaveBeenCalledTimes(1)
    })
  })

  describe('stopWatching', () => {
    it('removes subscription and logs when stopped', () => {
      const mockRemove = vi.fn()
      mockAddAccessibilityEventListener.mockReturnValueOnce({
        remove: mockRemove,
      })
      const expectedLogEntry = {
        level: 'info',
        message: '[RealAndroidSirenLookout] Stopped watching for sirens',
      }

      lookout.startWatching()
      lookout.stopWatching()

      expect(mockRemove).toHaveBeenCalledTimes(1)
      expect(logger.getLogs()).toContainEqual(expectedLogEntry)
    })

    it('does nothing if not watching', () => {
      const unexpectedLogEntry = {
        level: 'info',
        message: '[RealAndroidSirenLookout] Stopped watching for sirens',
      }

      lookout.stopWatching()

      expect(logger.getLogs()).not.toContainEqual(unexpectedLogEntry)
    })
  })

  describe('onSirenDetected', () => {
    it('registers listener and calls it when app is detected', () => {
      const mockRemove = vi.fn()
      mockAddAccessibilityEventListener.mockReturnValueOnce({
        remove: mockRemove,
      })
      const listener = vi.fn()
      const packageName = 'com.facebook.katana'
      const event: AccessibilityEvent = {
        packageName,
        className: 'MainActivity',
        timestamp: Date.now(),
      }

      lookout.onSirenDetected(listener)
      lookout.startWatching()
      const capturedCallback =
        mockAddAccessibilityEventListener.mock.calls[0][0]
      capturedCallback(event)

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'app',
          identifier: packageName,
          timestamp: expect.any(Number),
        }),
      )
    })

    it('logs warning when overwriting existing listener', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const expectedLogEntry = {
        level: 'warn',
        message:
          '[RealAndroidSirenLookout] Overwriting existing siren detection listener. Previous listener will be discarded.',
      }

      lookout.onSirenDetected(listener1)
      lookout.onSirenDetected(listener2)

      expect(logger.getLogs()).toContainEqual(expectedLogEntry)
    })

    it('ignores events with empty packageName', () => {
      const mockRemove = vi.fn()
      mockAddAccessibilityEventListener.mockReturnValueOnce({
        remove: mockRemove,
      })
      const listener = vi.fn()
      const event: AccessibilityEvent = {
        packageName: '',
        className: 'MainActivity',
        timestamp: Date.now(),
      }

      lookout.onSirenDetected(listener)
      lookout.startWatching()
      const capturedCallback =
        mockAddAccessibilityEventListener.mock.calls[0][0]
      capturedCallback(event)

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('updateBlockedApps', () => {
    it('calls setBlockedApps with correct package names', async () => {
      const packageNames = ['com.facebook.katana', 'com.instagram.android']
      mockSetBlockedApps.mockResolvedValueOnce(undefined)

      await lookout.updateBlockedApps(packageNames)

      expect(mockSetBlockedApps).toHaveBeenCalledTimes(1)
      expect(mockSetBlockedApps).toHaveBeenCalledWith(packageNames)
    })

    it('logs success message with package count', async () => {
      const packageNames = ['com.facebook.katana', 'com.instagram.android']
      mockSetBlockedApps.mockResolvedValueOnce(undefined)
      const expectedLogEntry = {
        level: 'info',
        message:
          '[RealAndroidSirenLookout] Blocked apps synced to native: count=2',
      }

      await lookout.updateBlockedApps(packageNames)

      expect(logger.getLogs()).toContainEqual(expectedLogEntry)
    })

    it('logs error and rethrows when setBlockedApps fails', async () => {
      const packageNames = ['com.facebook.katana']
      const error = new Error('Failed to sync blocked apps')
      mockSetBlockedApps.mockRejectedValueOnce(error)
      const expectedLogEntry = {
        level: 'error',
        message: `[RealAndroidSirenLookout] Failed to sync blocked apps: ${error}`,
      }

      const updatePromise = lookout.updateBlockedApps(packageNames)

      await expect(updatePromise).rejects.toThrow('Failed to sync blocked apps')
      expect(logger.getLogs()).toContainEqual(expectedLogEntry)
    })

    it('handles empty package list', async () => {
      mockSetBlockedApps.mockResolvedValueOnce(undefined)
      const expectedLogEntry = {
        level: 'info',
        message:
          '[RealAndroidSirenLookout] Blocked apps synced to native: count=0',
      }

      await lookout.updateBlockedApps([])

      expect(mockSetBlockedApps).toHaveBeenCalledWith([])
      expect(logger.getLogs()).toContainEqual(expectedLogEntry)
    })
  })
})
