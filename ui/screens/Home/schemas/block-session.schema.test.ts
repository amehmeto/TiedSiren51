import { describe, it, expect } from 'vitest'
import { blockSessionSchema } from './block-session.schema'

const validBlockSession = {
  id: '1',
  name: 'Test Session',
  blocklistIds: ['blocklist-1'],
  devices: [{ id: '1', name: 'Laptop' }],
  startedAt: '08:00',
  endedAt: '10:00',
  blockingConditions: ['condition1'],
}

const expectValidationSuccess = (
  result: ReturnType<typeof blockSessionSchema.safeParse>,
) => {
  expect(result.success).toBe(true)
}

const expectValidationFailure = (
  result: ReturnType<typeof blockSessionSchema.safeParse>,
  expectedPath: string,
  expectedMessage: string,
) => {
  expect(result.success).toBe(false)
  if (!result.success) {
    const error = result.error.issues.find(
      (issue) => issue.path[0] === expectedPath,
    )
    expect(error).toBeDefined()
    expect(error?.message).toBe(expectedMessage)
  }
}

describe('blockSessionSchema', () => {
  describe('Basic field validation', () => {
    it('should pass with valid data', () => {
      const result = blockSessionSchema.safeParse(validBlockSession)
      expectValidationSuccess(result)
    })

    it.each<{ field: string; value: string | null; expectedMessage: string }>([
      {
        field: 'name',
        value: null,
        expectedMessage: 'A session name must be provided',
      },
      {
        field: 'name',
        value: '',
        expectedMessage: 'A session name must be provided',
      },
    ])(
      'should fail when $field is invalid',
      ({ field, value, expectedMessage }) => {
        const result = blockSessionSchema.safeParse({
          ...validBlockSession,
          [field]: value,
        })
        expectValidationFailure(result, field, expectedMessage)
      },
    )
  })

  describe('Blocklists and devices validation', () => {
    it('should fail when blocklistIds is empty', () => {
      const result = blockSessionSchema.safeParse({
        ...validBlockSession,
        blocklistIds: [],
      })
      expectValidationFailure(
        result,
        'blocklistIds',
        'At least one blocklist must be selected',
      )
    })

    it('should fail when devices is empty', () => {
      const result = blockSessionSchema.safeParse({
        ...validBlockSession,
        devices: [],
      })
      expectValidationFailure(
        result,
        'devices',
        'At least one device must be selected',
      )
    })
  })

  describe('Time fields validation', () => {
    it.each<{ field: string; value: string | null; expectedMessage: string }>([
      {
        field: 'startedAt',
        value: null,
        expectedMessage: 'A start time must be provided',
      },
      {
        field: 'endedAt',
        value: null,
        expectedMessage: 'An end time must be provided',
      },
      {
        field: 'startedAt',
        value: '8am',
        expectedMessage: 'Start time must be in HH:mm format (e.g. 07:00)',
      },
      {
        field: 'endedAt',
        value: '25:00',
        expectedMessage: 'End time must be in HH:mm format (e.g. 07:00)',
      },
    ])(
      'should fail when $field is invalid',
      ({ field, value, expectedMessage }) => {
        const result = blockSessionSchema.safeParse({
          ...validBlockSession,
          [field]: value,
        })
        expectValidationFailure(result, field, expectedMessage)
      },
    )
  })

  describe('Blocking conditions validation', () => {
    it('should fail when blockingConditions is empty', () => {
      const result = blockSessionSchema.safeParse({
        ...validBlockSession,
        blockingConditions: [],
      })
      expectValidationFailure(
        result,
        'blockingConditions',
        'A blocking condition must be selected',
      )
    })
  })
})
