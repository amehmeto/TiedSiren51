import { describe, it, expect } from 'vitest'
import { powersyncSchema } from './powersync.schema'

describe('powersyncSchema', () => {
  it('should define all expected tables', () => {
    const tableNames = Object.keys(powersyncSchema.tables)

    expect(tableNames).toContain('siren')
    expect(tableNames).toContain('blocklist')
    expect(tableNames).toContain('block_session')
    expect(tableNames).toContain('device')
    expect(tableNames).toContain('timer')
    expect(tableNames).toContain('block_session_blocklist')
    expect(tableNames).toContain('block_session_device')
  })

  it('should have 7 tables total', () => {
    const tableNames = Object.keys(powersyncSchema.tables)

    expect(tableNames).toHaveLength(7)
  })
})
