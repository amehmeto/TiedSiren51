export type LogLevel = 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
}

export interface Logger {
  info(message: string): void
  warn(message: string): void
  error(message: string): void
}
