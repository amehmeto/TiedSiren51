import * as Sentry from '@sentry/react-native'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SentryLogger } from './sentry.logger'

// Define __DEV__ for test environment (React Native global)
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
;(globalThis as never as { __DEV__: boolean }).__DEV__ = true

vi.mock('@sentry/react-native', () => ({
  init: vi.fn(),
  addBreadcrumb: vi.fn(),
  captureMessage: vi.fn(),
}))

describe('SentryLogger', () => {
  let logger: SentryLogger

  beforeEach(() => {
    vi.clearAllMocks()
    logger = new SentryLogger()
  })

  describe('initialize()', () => {
    it('should call Sentry.init with correct config', () => {
      logger.initialize()

      expect(Sentry.init).toHaveBeenCalledWith({
        dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
        enabled: false, // __DEV__ is true in tests, so enabled is false
        tracesSampleRate: 0.1,
      })
    })

    it('should call Sentry.init exactly once', () => {
      logger.initialize()

      expect(Sentry.init).toHaveBeenCalledTimes(1)
    })
  })

  describe('info()', () => {
    it('should add a breadcrumb with level info', () => {
      logger.info('Test info message')

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Test info message',
        level: 'info',
      })
    })

    it('should not capture the message when verbose logging is disabled', () => {
      logger.info('Test info message')

      expect(Sentry.captureMessage).not.toHaveBeenCalled()
    })
  })

  describe('warn()', () => {
    it('should add a breadcrumb with level warning', () => {
      logger.warn('Test warning message')

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Test warning message',
        level: 'warning',
      })
    })

    it('should not capture the message when verbose logging is disabled', () => {
      logger.warn('Test warning message')

      expect(Sentry.captureMessage).not.toHaveBeenCalled()
    })
  })

  describe('error()', () => {
    it('should add a breadcrumb with level error', () => {
      logger.error('Test error message')

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Test error message',
        level: 'error',
      })
    })

    it('should capture the message in Sentry', () => {
      logger.error('Test error message')

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Test error message',
        'error',
      )
    })

    it('should add breadcrumb before capturing message', () => {
      const callOrder: string[] = []
      vi.mocked(Sentry.addBreadcrumb).mockImplementation(() => {
        callOrder.push('breadcrumb')
      })
      vi.mocked(Sentry.captureMessage).mockImplementation(() => {
        callOrder.push('capture')
        return ''
      })

      logger.error('Test error message')

      expect(callOrder).toStrictEqual(['breadcrumb', 'capture'])
    })
  })
})
