import { describe, it, expect } from 'vitest'
import { FeatureFlags } from '@/feature-flags'
import { blockSessionSchema } from './block-session.schema'

type ValidationCase = {
  field: string
  value: unknown
  expectedMessage: string
}

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
  validation: ReturnType<typeof blockSessionSchema.safeParse>,
) => {
  expect(validation.success).toBe(true)
}

const expectValidationFailure = (
  validation: ReturnType<typeof blockSessionSchema.safeParse>,
  expectedPath: string,
  expectedMessage: string,
) => {
  expect(validation.success).toBe(false)
  if (!validation.success) {
    const error = validation.error.issues.find(
      (issue) => issue.path[0] === expectedPath,
    )
    expect(error).toBeDefined()
    expect(error?.message).toBe(expectedMessage)
  }
}

describe('blockSessionSchema', () => {
  describe('Basic field validation', () => {
    it('should pass with valid data', () => {
      const validation = blockSessionSchema.safeParse(validBlockSession)
      expectValidationSuccess(validation)
    })

    it.each<ValidationCase>([
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
        const validation = blockSessionSchema.safeParse({
          ...validBlockSession,
          [field]: value,
        })
        expectValidationFailure(validation, field, expectedMessage)
      },
    )
  })

  describe('Blocklists and devices validation', () => {
    it('should fail when blocklistIds is empty', () => {
      const validation = blockSessionSchema.safeParse({
        ...validBlockSession,
        blocklistIds: [],
      })
      expectValidationFailure(
        validation,
        'blocklistIds',
        'At least one blocklist must be selected',
      )
    })

    it.runIf(FeatureFlags.MULTI_DEVICE)(
      'should fail when devices is empty',
      () => {
        const validation = blockSessionSchema.safeParse({
          ...validBlockSession,
          devices: [],
        })
        expectValidationFailure(
          validation,
          'devices',
          'At least one device must be selected',
        )
      },
    )

    it.skipIf(FeatureFlags.MULTI_DEVICE)(
      'should pass when devices is empty (feature flag off)',
      () => {
        const validation = blockSessionSchema.safeParse({
          ...validBlockSession,
          devices: [],
        })
        expectValidationSuccess(validation)
      },
    )
  })

  describe('Time fields validation', () => {
    it.each<ValidationCase>([
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
        const validation = blockSessionSchema.safeParse({
          ...validBlockSession,
          [field]: value,
        })
        expectValidationFailure(validation, field, expectedMessage)
      },
    )
  })

  describe('Blocking conditions validation', () => {
    it.runIf(FeatureFlags.BLOCKING_CONDITIONS)(
      'should fail when blockingConditions is empty',
      () => {
        const validation = blockSessionSchema.safeParse({
          ...validBlockSession,
          blockingConditions: [],
        })
        expectValidationFailure(
          validation,
          'blockingConditions',
          'A blocking condition must be selected',
        )
      },
    )

    it.skipIf(FeatureFlags.BLOCKING_CONDITIONS)(
      'should pass when blockingConditions is empty (feature flag off)',
      () => {
        const validation = blockSessionSchema.safeParse({
          ...validBlockSession,
          blockingConditions: [],
        })
        expectValidationSuccess(validation)
      },
    )
  })
})
