import { beforeEach, describe, it } from 'vitest'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { blocklistFixture } from './blocklist.fixture'

describe('Feature: Deleting a blocklist', () => {
  let fixture: ReturnType<typeof blocklistFixture>

  beforeEach(() => {
    fixture = blocklistFixture()
  })

  it('should delete a blocklist', async () => {
    const givenBlocklist = buildBlocklist()

    fixture.given.existingBlocklist(givenBlocklist)

    await fixture.when.deletingBlocklist(givenBlocklist.id)

    fixture.then.blocklistShouldNotBeInStore(givenBlocklist.id)
  })
})
