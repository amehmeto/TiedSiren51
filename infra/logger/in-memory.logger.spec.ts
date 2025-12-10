import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryLogger } from './in-memory.logger'

describe('InMemoryLogger', () => {
  let logger: InMemoryLogger

  beforeEach(() => {
    logger = new InMemoryLogger()
  })

  it('should start with empty logs', () => {
    expect(logger.getLogs()).toStrictEqual([])
  })

  describe('info()', () => {
    it('should store entry with level info', () => {
      logger.info('Test info message')

      const logs = logger.getLogs()
      const logLevel = logs[0].level

      expect(logs).toHaveLength(1)
      expect(logLevel).toBe('info')
    })

    it('should store the correct message', () => {
      logger.info('Test info message')

      const logs = logger.getLogs()
      const logMessage = logs[0].message

      expect(logMessage).toBe('Test info message')
    })
  })

  describe('warn()', () => {
    it('should store entry with level warn', () => {
      logger.warn('Test warning message')

      const logs = logger.getLogs()
      const logLevel = logs[0].level

      expect(logs).toHaveLength(1)
      expect(logLevel).toBe('warn')
    })

    it('should store the correct message', () => {
      logger.warn('Test warning message')

      const logs = logger.getLogs()
      const logMessage = logs[0].message

      expect(logMessage).toBe('Test warning message')
    })
  })

  describe('error()', () => {
    it('should store entry with level error', () => {
      logger.error('Test error message')

      const logs = logger.getLogs()
      const logLevel = logs[0].level

      expect(logs).toHaveLength(1)
      expect(logLevel).toBe('error')
    })

    it('should store the correct message', () => {
      logger.error('Test error message')

      const logs = logger.getLogs()
      const logMessage = logs[0].message

      expect(logMessage).toBe('Test error message')
    })
  })

  describe('getLogs()', () => {
    it('should return all logged entries in order', () => {
      logger.info('First message')
      logger.warn('Second message')
      logger.error('Third message')

      const logs = logger.getLogs()
      const firstMessage = logs[0].message
      const secondMessage = logs[1].message
      const thirdMessage = logs[2].message

      expect(logs).toHaveLength(3)
      expect(firstMessage).toBe('First message')
      expect(secondMessage).toBe('Second message')
      expect(thirdMessage).toBe('Third message')
    })

    it('should return a copy, not the internal array reference', () => {
      logger.info('Test message')

      const logs1 = logger.getLogs()
      const logs2 = logger.getLogs()

      expect(logs1).not.toBe(logs2)
      expect(logs1).toStrictEqual(logs2)
    })
  })

  describe('clear()', () => {
    it('should remove all entries', () => {
      logger.info('First message')
      logger.warn('Second message')
      logger.error('Third message')

      logger.clear()

      expect(logger.getLogs()).toStrictEqual([])
    })
  })

  describe('multiple log calls', () => {
    it('should accumulate entries', () => {
      logger.info('Message 1')
      logger.info('Message 2')
      logger.warn('Message 3')

      expect(logger.getLogs()).toHaveLength(3)
    })
  })
})
