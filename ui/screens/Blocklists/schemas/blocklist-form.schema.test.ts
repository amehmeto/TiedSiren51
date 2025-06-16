import { describe, it } from 'vitest'
import { blocklistFormFixture, Blocklist } from './blocklist-form.fixture'

const validBlocklist: Blocklist = {
  name: 'Test Blocklist',
  sirens: {
    android: [{ packageName: 'com.example.app' }],
    websites: [],
    keywords: [],
  },
}

describe('blocklistSchema', () => {
  describe('Basic field validation', () => {
    it('should pass with valid data', () => {
      const fixture = blocklistFormFixture()
      fixture.given.field('name', validBlocklist.name)
      fixture.given.sirens(validBlocklist.sirens)
      fixture.when.validate()
      fixture.then.shouldBeValid()
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
        const fixture = blocklistFormFixture()
        fixture.given.field(field as keyof Blocklist, value)
        fixture.when.validate()
        fixture.then.shouldBeInvalidWithMessage(field, expectedMessage)
      },
    )
  })

  describe('Sirens validation', () => {
    it('should fail when all sirens are empty', () => {
      const fixture = blocklistFormFixture()
      fixture.given.sirens({ android: [], websites: [], keywords: [] })
      fixture.when.validate()
      fixture.then.shouldBeInvalidWithMessage(
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
      const fixture = blocklistFormFixture()
      fixture.given.sirens(sirens)
      fixture.when.validate()
      fixture.then.shouldBeValid()
    })

    it('should fail when all sirens missing', () => {
      const fixture = blocklistFormFixture()
      fixture.given.sirens({})
      fixture.when.validate()
      fixture.then.shouldBeInvalidWithMessage(
        'sirens',
        'You must select at least one of: Apps, Websites, or Keywords.',
      )
    })
  })
})
