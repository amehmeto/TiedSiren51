import { beforeEach, describe, it } from 'vitest'
import {
  blocklistFormFixture,
  createValidBlocklist,
  createFormWithWebsites,
  createFormWithKeywords,
  createFormWithAndroid,
  buildBlocklistForm,
  convertDomainToForm,
} from './blocklist-form.fixture'

describe('blocklistSchema', () => {
  let fixture: ReturnType<typeof blocklistFormFixture>

  beforeEach(() => {
    fixture = blocklistFormFixture()
  })

  describe('Basic field validation', () => {
    it('should pass with valid data using convenience function', () => {
      const validBlocklist = createValidBlocklist()
      fixture.given.withName(validBlocklist.name)
      fixture.given.sirens(validBlocklist.sirens)
      fixture.when.validate()
      fixture.then.shouldBeValid()
    })

    it('should pass with valid data using functional builder', () => {
      const form = buildBlocklistForm({
        name: 'Custom Form',
        sirens: {
          android: [{ packageName: 'com.example.app' }],
          websites: [],
          keywords: [],
        },
      })

      fixture.given.withName(form.name)
      fixture.given.sirens(form.sirens)
      fixture.when.validate()
      fixture.then.shouldBeValid()
    })

    it('should pass using domain builder conversion', () => {
      fixture.given.fromDomain({
        name: 'Domain-Based Form',
        sirens: {
          android: [],
          ios: [],
          linux: [],
          macos: [],
          windows: [],
          websites: ['example.com'],
          keywords: [],
        },
      })
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
        description: 'only websites selected using functional builder',
        setup: () => {
          const form = createFormWithWebsites(['example.com'])
          fixture.given.sirens(form.sirens)
        },
      },
      {
        description: 'only keywords selected using functional builder',
        setup: () => {
          const form = createFormWithKeywords(['focus'])
          fixture.given.sirens(form.sirens)
        },
      },
      {
        description: 'only android apps selected using functional builder',
        setup: () => {
          const form = createFormWithAndroid([
            { packageName: 'com.example.app' },
          ])
          fixture.given.sirens(form.sirens)
        },
      },
      {
        description: 'mixed selection using direct builder',
        setup: () => {
          const form = buildBlocklistForm({
            sirens: {
              android: [{ packageName: 'com.facebook.katana' }],
              websites: ['twitter.com'],
              keywords: ['social'],
            },
          })
          fixture.given.sirens(form.sirens)
        },
      },
    ])('should pass when $description', ({ setup }) => {
      setup()
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

  describe('Pre-built scenarios using domain builder', () => {
    it('should validate social media form', () => {
      fixture.given.socialMediaForm()
      fixture.when.validate()
      fixture.then.shouldBeValid()
    })

    it('should validate work form', () => {
      fixture.given.workForm()
      fixture.when.validate()
      fixture.then.shouldBeValid()
    })

    it('should handle complex domain conversion', () => {
      const form = convertDomainToForm({
        name: 'Entertainment Block',
        sirens: {
          android: [],
          ios: [],
          linux: [],
          macos: [],
          windows: [],
          websites: ['youtube.com', 'netflix.com'],
          keywords: ['entertainment', 'streaming'],
        },
      })

      fixture.given.withName(form.name)
      fixture.given.sirens(form.sirens)
      fixture.when.validate()
      fixture.then.shouldBeValid()
    })
  })

  describe('Functional fixture methods', () => {
    it('should use convenience fixture methods', () => {
      fixture.given.formWithWebsites(['instagram.com'])
      fixture.when.validate()
      fixture.then.shouldBeValid()
    })

    it('should use empty form method', () => {
      fixture.given.emptyForm()
      fixture.when.validate()
      fixture.then.shouldBeInvalidWithMessage(
        'name',
        'Blocklist name must be provided',
      )
    })
  })
})
