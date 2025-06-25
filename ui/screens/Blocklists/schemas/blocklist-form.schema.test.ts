import { beforeEach, describe, it } from 'vitest'
import {
  blocklistFormFixture,
  BlocklistBuilder,
  createValidBlocklist,
} from './blocklist-form.fixture'

describe('blocklistSchema', () => {
  let fixture: ReturnType<typeof blocklistFormFixture>

  beforeEach(() => {
    fixture = blocklistFormFixture()
  })

  describe('Basic field validation', () => {
    it('should pass with valid data', () => {
      const validBlocklist = createValidBlocklist()
      fixture.given.withName(validBlocklist.name)
      fixture.given.sirens(validBlocklist.sirens)
      fixture.when.validate()
      fixture.then.shouldBeValid()
    })

    it.each([
      {
        field: 'name',
        testDescription: 'empty name',
        setup: () => fixture.given.withEmptyName(),
        expectedMessage: 'Blocklist name must be provided',
      },
    ])(
      'should fail when $testDescription',
      ({ field, setup, expectedMessage }) => {
        setup()
        fixture.when.validate()
        fixture.then.shouldBeInvalidWithMessage(field, expectedMessage)
      },
    )
  })

  describe('Sirens validation', () => {
    it('should fail when all sirens are empty', () => {
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
        sirens: new BlocklistBuilder().withWebsites(['example.com']).build()
          .sirens,
      },
      {
        description: 'only keywords selected',
        sirens: new BlocklistBuilder().withKeywords(['focus']).build().sirens,
      },
      {
        description: 'only android selected',
        sirens: new BlocklistBuilder()
          .withAndroidApps([{ packageName: 'com.example.app' }])
          .build().sirens,
      },
    ])('should pass when $description', ({ sirens }) => {
      fixture.given.sirens(sirens)
      fixture.when.validate()
      fixture.then.shouldBeValid()
    })

    it('should fail when all sirens missing', () => {
      fixture.given.sirens({})
      fixture.when.validate()
      fixture.then.shouldBeInvalidWithMessage(
        'sirens',
        'You must select at least one of: Apps, Websites, or Keywords.',
      )
    })
  })
})
