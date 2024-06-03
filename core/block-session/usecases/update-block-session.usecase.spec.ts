import { beforeEach, describe, it, expect } from 'vitest'
import { blockSessionFixture } from './block-session.fixture'
import { UpdateBlockSessionPayload } from './update-block-session.usecase'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'

describe('Feature: Updating block session', () => {
  let fixture: ReturnType<typeof blockSessionFixture>

  beforeEach(() => {
    fixture = blockSessionFixture()
  })

  it('should update a block session', async () => {
    const updateBlockSessionPayload: UpdateBlockSessionPayload = {
      id: 'block-session-id',
      name: 'Working time',
      startedAt: '01:10',
      endedAt: '01:45',
    }

    const existingBlockSession = buildBlockSession({
      id: 'block-session-id',
      name: 'Sleeping time',
    })
    fixture.given.existingBlockSession(existingBlockSession)
    fixture.given.nowIs({
      hours: 0,
      minutes: 50,
    })

    await fixture.when.updatingBlockSession(updateBlockSessionPayload)

    fixture.then.blockSessionShouldBeStoredAs({
      ...existingBlockSession,
      name: 'Working time',
      startedAt: '01:10',
      endedAt: '01:45',
      startNotificationId: expect.any(String),
      endNotificationId: expect.any(String),
    })
    fixture.then.scheduledNotificationsShouldBeCancelled([
      existingBlockSession.startNotificationId,
      existingBlockSession.endNotificationId,
    ])
    fixture.then.notificationsShouldBeScheduled([
      {
        title: 'Tied Siren',
        body: `Block session "Working time" has started`,
        trigger: {
          seconds: 20 * 60,
        },
      },
      {
        title: 'Tied Siren',
        body: `Block session "Working time" has ended`,
        trigger: {
          seconds: 55 * 60,
        },
      },
    ])
  })
})
