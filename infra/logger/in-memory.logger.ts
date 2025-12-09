import { Logger, LogEntry, LogLevel } from '@/core/_ports_/logger'

export class InMemoryLogger implements Logger {
  private logs: LogEntry[] = []

  initialize(): void {
    // No-op for in-memory logger (used in tests)
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
    this.logs.push({ level, message })
  }
}
