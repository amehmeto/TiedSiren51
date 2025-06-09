import { describe, it, expect } from 'vitest'
import { blocklistSchema } from './blocklist-form.schema'

const validBlocklist = {
  name: 'Test Blocklist',
  sirens: {
    android: [{ packageName: 'com.example.app' }],
    websites: [],
    keywords: [],
  },
}

const expectValidationSuccess = (
  result: ReturnType<typeof blocklistSchema.safeParse>,
) => {
  expect(result.success).toBe(true)
}

const expectValidationFailure = (
  result: ReturnType<typeof blocklistSchema.safeParse>,
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

describe('blocklistSchema', () => {
  describe('Basic field validation', () => {
    it('should pass with valid data', () => {
      const result = blocklistSchema.safeParse(validBlocklist)
      expectValidationSuccess(result)
    })

    it.each([
      {
        field: 'name',
        value: '',
        expectedMessage: 'Blocklist name must be provided',
      },
    ])(
      'should fail when $field is invalid',
      ({ field, value, expectedMessage }) => {
        const result = blocklistSchema.safeParse({
          ...validBlocklist,
          [field]: value,
        })
        expectValidationFailure(result, field, expectedMessage)
      },
    )
  })

  describe('Sirens validation', () => {
    it('should fail when all sirens are empty', () => {
      const result = blocklistSchema.safeParse({
        ...validBlocklist,
        sirens: { android: [], websites: [], keywords: [] },
      })
      expectValidationFailure(
        result,
        'sirens',
        'You must select at least one of: Apps, Websites, or Keywords.',
      )
    })

    it.each([
      {
        description: 'only websites selected',
        sirens: { android: [], websites: ['example.com'], keywords: [] },
      },
      {
        description: 'only keywords selected',
        sirens: { android: [], websites: [], keywords: ['focus'] },
      },
      {
        description: 'only android selected',
        sirens: {
          android: [{ packageName: 'com.example.app' }],
          websites: [],
          keywords: [],
        },
      },
    ])('should pass when $description', ({ sirens }) => {
      const result = blocklistSchema.safeParse({
        ...validBlocklist,
        sirens,
      })
      expectValidationSuccess(result)
    })

    it('should fail when all sirens missing', () => {
      const result = blocklistSchema.safeParse({
        ...validBlocklist,
        sirens: {},
      })
      expectValidationFailure(
        result,
        'sirens',
        'You must select at least one of: Apps, Websites, or Keywords.',
      )
    })
  })
})
