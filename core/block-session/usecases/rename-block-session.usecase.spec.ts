import { beforeEach, describe, it } from 'vitest'
import { blockSessionFixture } from './block-session.fixture'
import { buildBlockSession } from '../../_tests_/data-builders/block-session.builder'

describe('Feature: Renaming a block session', () => {
  let fixture: ReturnType<typeof blockSessionFixture>

  beforeEach(() => {
    fixture = blockSessionFixture()
  })

  it('should rename a block session', async () => {
    const givenBlockSession = buildBlockSession({
      id: 'block-session-id',
      name: 'Working hours',
    })

    fixture.given.existingBlockSession(givenBlockSession)

    await fixture.when.renamingBlockSession({
      id: givenBlockSession.id,
      name: 'Sleeping time',
    })

    fixture.then.blockSessionsFromStoreShouldBe([
      {
        ...givenBlockSession,
        name: 'Sleeping time',
      },
    ])
  })
})
