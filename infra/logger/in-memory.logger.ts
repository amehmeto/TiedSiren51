import { Logger, LogEntry, LogLevel } from '@/core/_ports_/logger'

export class InMemoryLogger implements Logger {
  private logs: LogEntry[] = []

  initialize(): void {
    // No-op for in-memory logger (used in tests)
  }

  info(message: string): void {
    this.log(LogLevel.Info, message)
  }

  warn(message: string): void {
    this.log(LogLevel.Warn, message)
  }

  error(message: string): void {
    this.log(LogLevel.Error, message)
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
