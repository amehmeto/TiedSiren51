/**
 * Logger Interface Contract
 *
 * This file defines the contract for the Logger port.
 * Implementations must fulfill this interface.
 *
 * Location: core/_ports_/logger.ts
 */

export enum LogLevel {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

export interface LogEntry {
  timestamp: string // ISO 8601 format
  level: LogLevel
  message: string
}

export interface Logger {
  /**
   * Log an informational message
   * @param message - The message to log
   */
  info(message: string): void

  /**
   * Log a warning message
   * @param message - The message to log
   */
  warn(message: string): void

  /**
   * Log an error message
   * @param message - The message to log
   */
  error(message: string): void
}

/**
 * Extended interface for InMemoryLogger implementation
 * Adds methods for log inspection and management
 */
export interface InMemoryLoggerInterface extends Logger {
  /**
   * Retrieve all stored log entries
   * @returns Copy of all log entries
   */
  getLogs(): LogEntry[]

  /**
   * Clear all stored log entries
   */
  clear(): void
}
