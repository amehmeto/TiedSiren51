import * as Sentry from '@sentry/react-native'
import { Logger } from '@/core/_ports_/logger'

export class SentryLogger implements Logger {
  private readonly verboseLogging =
    process.env.EXPO_PUBLIC_VERBOSE_LOGGING === 'true'

  initialize(): void {
    Sentry.init({
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      enabled: !__DEV__,
      tracesSampleRate: 0.1,
    })
  }

  info(message: string): void {
    Sentry.addBreadcrumb({ message, level: 'info' })
    if (this.verboseLogging) Sentry.captureMessage(message, 'info')
  }

  warn(message: string): void {
    Sentry.addBreadcrumb({ message, level: 'warning' })
    if (this.verboseLogging) Sentry.captureMessage(message, 'warning')
  }

  error(message: string): void {
    Sentry.addBreadcrumb({ message, level: 'error' })
    Sentry.captureMessage(message, 'error')
  }
}
