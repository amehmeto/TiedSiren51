import { describe, it, expect } from 'vitest'
import { DEFAULT_FEATURE_FLAGS, FeatureFlagValues } from '@/feature-flags'
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

const createSchema = (overrides: Partial<FeatureFlagValues> = {}) =>
  blockSessionSchema({ ...DEFAULT_FEATURE_FLAGS, ...overrides })

describe('blockSessionSchema', () => {
  describe('Basic field validation', () => {
    it('should pass with valid data', () => {
      const schema = createSchema()
      const validation = schema.safeParse(validBlockSession)
      expect(validation.success).toBe(true)
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
        const schema = createSchema()
        expect(() =>
          schema.parse({
            ...validBlockSession,
            [field]: value,
          }),
        ).toThrow(expectedMessage)
      },
    )
  })

  describe('Blocklists and devices validation', () => {
    it('should fail when blocklistIds is empty', () => {
      const schema = createSchema()
      expect(() =>
        schema.parse({
          ...validBlockSession,
          blocklistIds: [],
        }),
      ).toThrow('At least one blocklist must be selected')
    })

    it('should fail when devices is empty and MULTI_DEVICE is enabled', () => {
      const schema = createSchema({ MULTI_DEVICE: true })
      expect(() =>
        schema.parse({
          ...validBlockSession,
          devices: [],
        }),
      ).toThrow('At least one device must be selected')
    })

    it('should pass when devices is empty and MULTI_DEVICE is disabled', () => {
      const schema = createSchema({ MULTI_DEVICE: false })
      const validation = schema.safeParse({
        ...validBlockSession,
        devices: [],
      })
      expect(validation.success).toBe(true)
    })
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
        const schema = createSchema()
        expect(() =>
          schema.parse({
            ...validBlockSession,
            [field]: value,
          }),
        ).toThrow(expectedMessage)
      },
    )
  })

  describe('Blocking conditions validation', () => {
    it('should fail when blockingConditions is empty and BLOCKING_CONDITIONS is enabled', () => {
      const schema = createSchema({ BLOCKING_CONDITIONS: true })
      expect(() =>
        schema.parse({
          ...validBlockSession,
          blockingConditions: [],
        }),
      ).toThrow('A blocking condition must be selected')
    })

    it('should pass when blockingConditions is empty and BLOCKING_CONDITIONS is disabled', () => {
      const schema = createSchema({ BLOCKING_CONDITIONS: false })
      const validation = schema.safeParse({
        ...validBlockSession,
        blockingConditions: [],
      })
      expect(validation.success).toBe(true)
    })
  })
})
