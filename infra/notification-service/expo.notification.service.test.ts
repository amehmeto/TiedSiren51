import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { ExpoNotificationService } from './expo.notification.service'

const mockSetNotificationHandler = vi.fn()
const mockGetPermissions = vi.fn()
const mockRequestPermissions = vi.fn()
const mockScheduleNotification = vi.fn()
const mockCancelNotification = vi.fn()
const mockGetExpoPushToken = vi.fn()
const mockPlatformOS = { value: 'android' }

vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return mockPlatformOS.value
    },
  },
}))

vi.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: { eas: { projectId: 'test-project-id' } },
    },
  },
}))

vi.mock('expo-notifications', () => ({
  setNotificationHandler: (...args: unknown[]) =>
    mockSetNotificationHandler(...args),
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissions(...args),
  requestPermissionsAsync: (...args: unknown[]) =>
    mockRequestPermissions(...args),
  scheduleNotificationAsync: (...args: unknown[]) =>
    mockScheduleNotification(...args),
  cancelScheduledNotificationAsync: (...args: unknown[]) =>
    mockCancelNotification(...args),
  getExpoPushTokenAsync: (...args: unknown[]) => mockGetExpoPushToken(...args),
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: 'timeInterval',
  },
}))

function grantPermissions() {
  mockGetPermissions.mockResolvedValueOnce({
    status: 'granted',
    expires: 'never',
    granted: true,
    canAskAgain: true,
  })
}

describe('ExpoNotificationService', () => {
  let service: ExpoNotificationService
  let logger: InMemoryLogger

  beforeEach(() => {
    vi.clearAllMocks()
    logger = new InMemoryLogger()
    service = new ExpoNotificationService(logger)
  })

  describe('scheduleLocalNotification', () => {
    it('should map trigger to TIME_INTERVAL with seconds and repeats', async () => {
      grantPermissions()
      mockScheduleNotification.mockResolvedValueOnce('notification-id-1')
      const trigger = { seconds: 300, shouldRepeat: true }
      const expectedTrigger = {
        type: 'timeInterval',
        seconds: 300,
        repeats: true,
      }

      await service.scheduleLocalNotification('Title', 'Body', trigger)

      const [scheduledPayload] = mockScheduleNotification.mock.calls[0]
      const scheduledTrigger = scheduledPayload.trigger
      expect(scheduledTrigger).toStrictEqual(expectedTrigger)
    })

    it('should pass notification content with title and body', async () => {
      grantPermissions()
      mockScheduleNotification.mockResolvedValueOnce('notification-id-1')
      const trigger = { seconds: 60 }
      const expectedTitle = 'Session ending'
      const expectedBody = 'Your block session is about to end'

      await service.scheduleLocalNotification(
        expectedTitle,
        expectedBody,
        trigger,
      )

      const [scheduledPayload] = mockScheduleNotification.mock.calls[0]
      const contentTitle = scheduledPayload.content.title
      const contentBody = scheduledPayload.content.body
      expect(contentTitle).toBe(expectedTitle)
      expect(contentBody).toBe(expectedBody)
    })

    it('should return the scheduled notification identifier', async () => {
      grantPermissions()
      const expectedNotificationId = 'notification-id-42'
      mockScheduleNotification.mockResolvedValueOnce(expectedNotificationId)
      const trigger = { seconds: 60 }

      const scheduledId = await service.scheduleLocalNotification(
        'Title',
        'Body',
        trigger,
      )

      expect(scheduledId).toBe(expectedNotificationId)
    })

    it('should skip scheduling on web platform', async () => {
      mockPlatformOS.value = 'web'
      const trigger = { seconds: 60 }

      const webNotificationResponse = await service.scheduleLocalNotification(
        'Title',
        'Body',
        trigger,
      )

      mockPlatformOS.value = 'android'
      expect(webNotificationResponse).toBe(
        'Local notifications are not supported on web',
      )
      expect(mockScheduleNotification).not.toHaveBeenCalled()
    })

    it('should log and rethrow when scheduling fails', async () => {
      grantPermissions()
      const error = new Error('Scheduling failed')
      mockScheduleNotification.mockRejectedValueOnce(error)
      const trigger = { seconds: 60 }
      const expectedLog = {
        level: 'error',
        message: `[ExpoNotificationService] Failed to schedule local notification: ${error}`,
      }

      const schedulePromise = service.scheduleLocalNotification(
        'Title',
        'Body',
        trigger,
      )

      await expect(schedulePromise).rejects.toThrow('Scheduling failed')
      expect(logger.getLogs()).toContainEqual(expectedLog)
    })
  })

  describe('initialize', () => {
    it('should configure the notification handler', async () => {
      await service.initialize()

      expect(mockSetNotificationHandler).toHaveBeenCalledTimes(1)
    })
  })
})
