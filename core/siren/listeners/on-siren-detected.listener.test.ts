import { beforeEach, describe, expect, it } from 'vitest'
import { Logger } from '@/core/_ports_/logger'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { InMemorySirenLookout } from '@/infra/siren-tier/in-memory.siren-lookout'

class ThrowingLogger implements Logger {
  private logs: { level: string; message: string }[] = []

  private errorToThrow: Error

  constructor(errorToThrow: Error) {
    this.errorToThrow = errorToThrow
  }

  initialize(): void {
    // noop
  }

  info(): void {
    throw this.errorToThrow
  }

  error(message: string): void {
    this.logs.push({ level: 'error', message })
  }

  warn(): void {
    // noop
  }

  getLogs() {
    return this.logs
  }
}

describe('onSirenDetected listener', () => {
  let sirenLookout: InMemorySirenLookout
  let logger: InMemoryLogger
  const loggingError = new Error('Logging failed')
  let throwingLogger: ThrowingLogger

  beforeEach(() => {
    sirenLookout = new InMemorySirenLookout()
    logger = new InMemoryLogger()
    throwingLogger = new ThrowingLogger(loggingError)
  })

  it('should log detected app when siren is detected', () => {
    const expectedLog = {
      level: 'info',
      message: '[onSirenDetectedListener] Detected app: com.facebook.katana',
    }
    createTestStore({ sirenLookout, logger })

    sirenLookout.simulateDetection('com.facebook.katana')

    expect(logger.getLogs()).toContainEqual(expectedLog)
  })

  it('should log error when logging fails', () => {
    createTestStore({ sirenLookout, logger: throwingLogger })

    sirenLookout.simulateDetection('com.facebook.katana')

    const expectedLog = {
      level: 'error',
      message: `[onSirenDetectedListener] Failed to log detection: ${loggingError}`,
    }
    expect(throwingLogger.getLogs()).toContainEqual(expectedLog)
  })
})
