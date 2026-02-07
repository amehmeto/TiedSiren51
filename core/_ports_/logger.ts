export enum LogLevel {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

export interface LogEntry {
  level: LogLevel
  message: string
}

export interface Logger {
  initialize(): void
  info(message: string): void
  warn(message: string): void
  error(message: string): void
}
