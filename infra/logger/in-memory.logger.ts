import { Logger, LogEntry, LogLevel } from '@/core/_ports_/logger'
import { DateProvider } from '@/core/_ports_/port.date-provider'

export class InMemoryLogger implements Logger {
  private logs: LogEntry[] = []

  constructor(private readonly dateProvider: DateProvider) {}

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
    const entry = {
      timestamp: this.dateProvider.getISOStringNow(),
      level,
      message,
    }
    this.logs.push(entry)

    // Also output to console for debugging
    // eslint-disable-next-line no-console
    const consoleMethod = level === 'error' ? console.error : console.log
    consoleMethod(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`)
  }
}
