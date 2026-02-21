import { beforeEach, describe, it } from 'vitest'
import { DEFAULT_FEATURE_FLAGS, FeatureFlagKey } from '@/feature-flags'
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
      'You must select at least one of: Apps.',
    )
  })

  it('should fail with only websites when website flag is off', () => {
    fixture.given.blocklistWithOnlyWebsites()
    fixture.when.validate()
    fixture.then.shouldBeInvalid()
  })

  it('should fail with only keywords when keyword flag is off', () => {
    fixture.given.blocklistWithOnlyKeywords()
    fixture.when.validate()
    fixture.then.shouldBeInvalid()
  })

  it('should pass when optional siren fields are undefined', () => {
    fixture.given.blocklistWithUndefinedSirenFields()
    fixture.when.validate()
    fixture.then.shouldBeValid()
  })

  it('should fail when android is undefined but websites exist and flag is off', () => {
    fixture.given.blocklistWithUndefinedAndroid()
    fixture.when.validate()
    fixture.then.shouldBeInvalid()
  })

  it('should pass with android apps when other siren arrays are undefined', () => {
    fixture.given.blocklistWithOnlyAndroidAppsAndUndefinedSirens()
    fixture.when.validate()
    fixture.then.shouldBeValid()
  })

  it('should fail when all siren arrays are undefined', () => {
    fixture.given.blocklistWithEmptySirensObject()
    fixture.when.validate()
    fixture.then.shouldBeInvalid()
  })
})

describe('blocklistSchema with all feature flags enabled', () => {
  const allFlagsEnabled = {
    ...DEFAULT_FEATURE_FLAGS,
    [FeatureFlagKey.WEBSITE_BLOCKING]: true,
    [FeatureFlagKey.KEYWORD_BLOCKING]: true,
  }
  let fixture: ReturnType<typeof blocklistFormFixture>

  beforeEach(() => {
    fixture = blocklistFormFixture(allFlagsEnabled)
  })

  it('should fail if all sirens are empty', () => {
    fixture.given.blocklistWithNoSirensSelected()
    fixture.when.validate()
    fixture.then.shouldBeInvalidWithMessage(
      'sirens',
      'You must select at least one of: Apps, Websites, Keywords.',
    )
  })

  it('should pass with websites and keywords', () => {
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

  it('should pass when android is undefined but websites exist', () => {
    fixture.given.blocklistWithUndefinedAndroid()
    fixture.when.validate()
    fixture.then.shouldBeValid()
  })

  it('should pass with android apps when siren arrays are undefined', () => {
    fixture.given.blocklistWithOnlyAndroidAppsAndUndefinedSirens()
    fixture.when.validate()
    fixture.then.shouldBeValid()
  })

  it('should fail when all siren arrays are undefined', () => {
    fixture.given.blocklistWithEmptySirensObject()
    fixture.when.validate()
    fixture.then.shouldBeInvalid()
  })
})
