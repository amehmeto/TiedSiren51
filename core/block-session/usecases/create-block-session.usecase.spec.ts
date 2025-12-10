import { beforeEach, describe, expect, it } from 'vitest'
import {
  facebookAndroidSiren,
  instagramAndroidSiren,
} from '@/core/_tests_/data-builders/android-siren.builder'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { BlockingConditions } from '@/core/block-session/block.session'
import { blockSessionFixture } from './block-session.fixture'
import { CreateBlockSessionPayload } from './create-block-session.usecase'

describe('Feature: Creating a block session', () => {
  let fixture: ReturnType<typeof blockSessionFixture>

  beforeEach(() => {
    fixture = blockSessionFixture()
  })

  it('should create a block session', async () => {
    const blockSessionPayload: CreateBlockSessionPayload = {
      name: 'Sleeping time',
      blocklists: [
        buildBlocklist({
          id: 'blocklist-id',
          name: 'Distraction',
          sirens: {
            android: [instagramAndroidSiren, facebookAndroidSiren],
            ios: [],
            linux: [],
            macos: [],
            windows: [],
            websites: [],
            keywords: [],
          },
        }),
      ],
      devices: [
        {
          id: 'device-id',
          type: 'ios',
          name: 'Huawei P30',
        },
      ],
      startedAt: '00:10',
      endedAt: '00:30',
      blockingConditions: [BlockingConditions.TIME],
    }

    fixture.given.nowIs({
      hours: 0,
      minutes: 0,
    })

    await fixture.when.creatingBlockSession(blockSessionPayload)

    fixture.then.notificationsShouldBeScheduled([
      {
        title: 'Tied Siren',
        body: `Block session "Sleeping time" has started`,
        trigger: {
          seconds: 10 * 60,
        },
      },
      {
        title: 'Tied Siren',
        body: `Block session "Sleeping time" has ended`,
        trigger: {
          seconds: 30 * 60,
        },
      },
    ])
    fixture.then.backgroundTasksShouldBeScheduled(['target-sirens'])
    fixture.then.blockSessionsFromStoreShouldBe([
      {
        id: expect.any(String),
        name: 'Sleeping time',
        blockingConditions: [BlockingConditions.TIME],
        blocklists: [
          buildBlocklist({
            id: 'blocklist-id',
            name: 'Distraction',
            sirens: {
              android: [instagramAndroidSiren, facebookAndroidSiren],
              ios: [],
              linux: [],
              macos: [],
              windows: [],
              websites: [],
              keywords: [],
            },
          }),
        ],
        devices: [
          {
            id: 'device-id',
            type: 'ios',
            name: 'Huawei P30',
          },
        ],
        startedAt: '00:10',
        endedAt: '00:30',
        startNotificationId: expect.any(String),
        endNotificationId: expect.any(String),
      },
    ])
  })
})
