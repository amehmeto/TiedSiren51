import { beforeEach, describe, it } from 'vitest'
import { UpdatePayload } from '../../_ports_/update.payload'
import { buildBlocklist } from '../../_tests_/data-builders/blocklist.builder'
import { Blocklist } from '../blocklist'
import { blocklistFixture } from './blocklist.fixture'

describe('Feature: Updating blocklist', () => {
  let fixture: ReturnType<typeof blocklistFixture>

  beforeEach(() => {
    fixture = blocklistFixture()
  })

  it('should update a blocklist', async () => {
    const updateBlocklistPayload: UpdatePayload<Blocklist> = {
      id: 'blocklist-id',
      name: 'Distraction',
    }
    const existingBlocklist = buildBlocklist({
      id: 'blocklist-id',
      name: 'Social media',
    })
    fixture.given.existingBlocklist(existingBlocklist)

    await fixture.when.updatingBlocklist(updateBlocklistPayload)

    fixture.then.blocklistShouldBeStoredAs({
      ...existingBlocklist,
      name: 'Distraction',
    })
  })
})
