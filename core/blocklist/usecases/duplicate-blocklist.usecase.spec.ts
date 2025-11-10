import { beforeEach, describe, it, expect } from 'vitest'
import { buildBlocklist } from '../../_tests_/data-builders/blocklist.builder'
import { blocklistFixture } from './blocklist.fixture'

describe('Feature: Duplicating a blocklist', () => {
  let fixture: ReturnType<typeof blocklistFixture>

  beforeEach(() => {
    fixture = blocklistFixture()
  })

  it('should duplicate a blocklist', async () => {
    const givenBlocklist = buildBlocklist()

    fixture.given.existingBlocklist(givenBlocklist)

    await fixture.when.duplicatingBlocklist({
      id: givenBlocklist.id,
      name: 'Copy of ' + givenBlocklist.name,
    })

    fixture.then.retrievedBlocklistsFromStoreShouldBe([
      givenBlocklist,
      {
        ...givenBlocklist,
        id: expect.any(String),
        name: 'Copy of ' + givenBlocklist.name,
      },
    ])
  })
})
