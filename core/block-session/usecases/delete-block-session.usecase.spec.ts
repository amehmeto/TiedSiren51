import { beforeEach, describe, it } from 'vitest'
import { blockSessionFixture } from './block-session.fixture'
import { buildBlockSession } from '../../_tests_/data-builders/block-session.builder'

describe('Feature: Deleting a block session', () => {
  let fixture: ReturnType<typeof blockSessionFixture>

  beforeEach(() => {
    fixture = blockSessionFixture()
  })

  it('should delete a block session', async () => {
    const givenBlockSession = buildBlockSession()

    fixture.given.existingBlockSession(givenBlockSession)

    await fixture.when.deletingBlockSession(givenBlockSession.id)

    fixture.then.blockSessionShouldNotBeInStore(givenBlockSession.id)
    fixture.then.scheduledNotificationsShouldBeCancelled([
      givenBlockSession.startNotificationId,
      givenBlockSession.endNotificationId,
    ])
  })
})
