import { beforeEach, describe, it, expect } from 'vitest'
import { blockSessionFixture } from './block-session.fixture'
import { buildBlockSession } from '../../_tests_/data-builders/block-session.builder'

describe('Feature: Duplicating a block session', () => {
  let fixture: ReturnType<typeof blockSessionFixture>

  beforeEach(() => {
    fixture = blockSessionFixture()
  })

  it('should duplicate a block session', async () => {
    const givenBlockSession = buildBlockSession({
      startedAt: '00:10',
      endedAt: '00:45',
    })

    fixture.given.existingBlockSession(givenBlockSession)
    fixture.given.nowIs({
      hours: 0,
      minutes: 5,
    })

    await fixture.when.duplicatingBlockSession({
      id: givenBlockSession.id,
      name: 'Copy of ' + givenBlockSession.name,
    })

    fixture.then.blockSessionsFromStoreShouldBe([
      givenBlockSession,
      {
        ...givenBlockSession,
        id: expect.any(String),
        name: 'Copy of ' + givenBlockSession.name,
        startNotificationId: expect.any(String),
        endNotificationId: expect.any(String),
      },
    ])
    fixture.then.notificationsShouldBeScheduled([
      {
        title: 'Tied Siren',
        body: `Block session "Copy of ${givenBlockSession.name}" has started`,
        trigger: {
          seconds: 5 * 60,
        },
      },
      {
        title: 'Tied Siren',
        body: `Block session "Copy of ${givenBlockSession.name}" has ended`,
        trigger: {
          seconds: 40 * 60,
        },
      },
    ])
  })
})
