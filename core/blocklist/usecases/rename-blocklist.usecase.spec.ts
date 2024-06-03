import { beforeEach, describe, it } from 'vitest'
import { blocklistFixture } from './blocklist.fixture'
import { buildBlocklist } from '../../_tests_/data-builders/blocklist.builder'

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

    fixture.then.blocklistShouldBeStoredAs(
      buildBlocklist({
        ...givenBlocklist,
        name: 'Focus',
      }),
    )
    fixture.then.blocklistShouldBeSavedInRepositoryAs(
      buildBlocklist({
        ...givenBlocklist,
        name: 'Focus',
      }),
    )
  })
})
