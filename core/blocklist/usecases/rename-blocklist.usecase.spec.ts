import { beforeEach, describe, it } from 'vitest'
import { buildBlocklist } from '../../_tests_/data-builders/blocklist.builder'
import { blocklistFixture } from './blocklist.fixture'

describe('Feature: Creating a blocklist', () => {
  let fixture: ReturnType<typeof blocklistFixture>

  beforeEach(() => {
    fixture = blocklistFixture()
  })

  it('should rename a blocklist', async () => {
    const givenBlocklist = buildBlocklist({
      id: 'blocklist-id',
      name: 'Distractions',
    })
    fixture.given.existingBlocklist(givenBlocklist)

    await fixture.when.renamingBlocklist({
      id: givenBlocklist.id,
      name: 'Focus',
    })

    const expectedRenamedBlocklist = buildBlocklist({
      ...givenBlocklist,
      name: 'Focus',
    })
    fixture.then.blocklistShouldBeStoredAs(expectedRenamedBlocklist)
    fixture.then.blocklistShouldBeSavedInRepositoryAs(expectedRenamedBlocklist)
  })
})
