import { beforeEach, describe, it } from 'vitest'
import { blocklistFormFixture } from './blocklist-form.fixture'

describe('blocklistSchema', () => {
  let fixture: ReturnType<typeof blocklistFormFixture>

  beforeEach(() => {
    fixture = blocklistFormFixture()
  })

  it('should pass with valid form', () => {
    fixture.given.withOverrides({
      name: 'Test',
      sirens: {
        android: [{ packageName: 'com.example' }],
        websites: [],
        keywords: [],
      },
    })
    fixture.when.validate()
    fixture.then.shouldBeValid()
  })

  it('should fail with empty name', () => {
    fixture.given.withOverrides({
      name: '',
      sirens: { android: [], websites: [], keywords: [] },
    })
    fixture.when.validate()
    fixture.then.shouldBeInvalidWithMessage(
      'name',
      'Blocklist name must be provided',
    )
  })

  it('should fail if all sirens are empty', () => {
    fixture.given.withOverrides({
      name: 'Test',
      sirens: { android: [], websites: [], keywords: [] },
    })
    fixture.when.validate()
    fixture.then.shouldBeInvalidWithMessage(
      'sirens',
      'You must select at least one of: Apps, Websites, or Keywords.',
    )
  })

  it('should pass using blocklist config', () => {
    fixture.given.fromConfig({
      name: 'Social Block',
      sirens: {
        android: [],
        ios: [],
        linux: [],
        macos: [],
        windows: [],
        websites: ['facebook.com'],
        keywords: ['social'],
      },
    })
    fixture.when.validate()
    fixture.then.shouldBeValid()
  })
})
