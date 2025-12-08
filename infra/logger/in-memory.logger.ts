import * as Sentry from '@sentry/react-native'
import { Logger, LogEntry, LogLevel } from '@/core/_ports_/logger'
import { DateProvider } from '@/core/_ports_/port.date-provider'

export class InMemoryLogger implements Logger {
  private logs: LogEntry[] = []

  constructor(private readonly dateProvider: DateProvider) {}

  initialize(): void {
    Sentry.init({
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      enabled: !__DEV__,
      tracesSampleRate: 1.0,
    })
  }

  info(message: string): void {
    this.log('info', message)
  }

  warn(message: string): void {
    this.log('warn', message)
  }

  error(message: string): void {
    this.log('error', message)
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clear(): void {
    this.logs = []
  }

  private log(level: LogLevel, message: string): void {
    this.logs.push({
      timestamp: this.dateProvider.getISOStringNow(),
      level,
      message,
    })
  }
}
