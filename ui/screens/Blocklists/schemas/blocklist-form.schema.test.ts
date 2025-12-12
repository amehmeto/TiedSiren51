import { beforeEach, describe, expect, it } from 'vitest'
import { blocklistFormFixture } from './blocklist-form.fixture'
import { blocklistSchema } from './blocklist-form.schema'

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

  it('should pass with android apps when other siren arrays are undefined', () => {
    const result = blocklistSchema.safeParse({
      name: 'Test',
      sirens: { android: [{ packageName: 'com.test' }] },
    })
    expect(result.success).toBe(true)
  })

  it('should fail when all siren arrays are undefined', () => {
    const result = blocklistSchema.safeParse({
      name: 'Test',
      sirens: {},
    })
    expect(result.success).toBe(false)
  })
})
