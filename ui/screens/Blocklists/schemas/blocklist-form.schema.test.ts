import { beforeEach, describe, it } from 'vitest'
import { blocklistFormFixture } from './blocklist-form.fixture'

describe('blocklistSchema', () => {
  let fixture: ReturnType<typeof blocklistFormFixture>

  beforeEach(() => {
    fixture = blocklistFormFixture()
  })

  it('should pass with valid form', () => {
    fixture.given.blocklistWithAllRequiredFields()
    fixture.when.validate()
    fixture.then.shouldBeValid()
  })

  it('should fail with empty name', () => {
    fixture.given.blocklistWithEmptyName()
    fixture.when.validate()
    fixture.then.shouldBeInvalidWithMessage(
      'name',
      'Blocklist name must be provided',
    )
  })

  it('should fail if all sirens are empty', () => {
    fixture.given.blocklistWithNoSirensSelected()
    fixture.when.validate()
    fixture.then.shouldBeInvalidWithMessage(
      'sirens',
      'You must select at least one of: Apps, Websites, or Keywords.',
    )
  })

  it('should pass using blocklist config with websites and keywords', () => {
    fixture.given.blocklistWithWebsitesAndKeywords()
    fixture.when.validate()
    fixture.then.shouldBeValid()
  })

  it('should pass with only websites selected', () => {
    fixture.given.blocklistWithOnlyWebsites()
    fixture.when.validate()
    fixture.then.shouldBeValid()
  })

  it('should pass with only keywords selected', () => {
    fixture.given.blocklistWithOnlyKeywords()
    fixture.when.validate()
    fixture.then.shouldBeValid()
  })

  it('should pass when optional siren fields are undefined', () => {
    fixture.given.blocklistWithUndefinedSirenFields()
    fixture.when.validate()
    fixture.then.shouldBeValid()
  })

  it('should pass when android is undefined but websites exist', () => {
    fixture.given.blocklistWithUndefinedAndroid()
    fixture.when.validate()
    fixture.then.shouldBeValid()
  })
})
