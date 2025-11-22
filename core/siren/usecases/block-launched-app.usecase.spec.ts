import { beforeEach, describe, it } from 'vitest'
import {
  facebookAndroidSiren,
  instagramAndroidSiren,
} from '@/core/_tests_/data-builders/android-siren.builder'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { blockLaunchedAppFixture } from './block-launched-app.fixture'

describe('Feature: Block launched app', () => {
  let fixture: ReturnType<typeof blockLaunchedAppFixture>

  beforeEach(() => {
    fixture = blockLaunchedAppFixture()
  })

  it('should block detected app if in active block session', async () => {
    fixture.given.nowIs({
      hours: 14,
      minutes: 30,
    })
    fixture.given.activeBlockSession(
      buildBlockSession({
        startedAt: '14:00',
        endedAt: '15:00',
        blocklists: [
          buildBlocklist({
            sirens: {
              android: [facebookAndroidSiren, instagramAndroidSiren],
            },
          }),
        ],
      }),
    )

    await fixture.when.appLaunched('com.facebook.katana')

    fixture.then.appShouldBeBlocked('com.facebook.katana')
  })

  it('should not block app if not in active block session', async () => {
    fixture.given.nowIs({
      hours: 14,
      minutes: 30,
    })
    fixture.given.activeBlockSession(
      buildBlockSession({
        startedAt: '14:00',
        endedAt: '15:00',
        blocklists: [
          buildBlocklist({
            sirens: {
              android: [instagramAndroidSiren],
            },
          }),
        ],
      }),
    )

    await fixture.when.appLaunched('com.facebook.katana')

    fixture.then.appShouldNotBeBlocked('com.facebook.katana')
  })

  it('should not block app if block session is not active', async () => {
    fixture.given.nowIs({
      hours: 16,
      minutes: 30,
    })
    fixture.given.activeBlockSession(
      buildBlockSession({
        startedAt: '14:00',
        endedAt: '15:00',
        blocklists: [
          buildBlocklist({
            sirens: {
              android: [facebookAndroidSiren],
            },
          }),
        ],
      }),
    )

    await fixture.when.appLaunched('com.facebook.katana')

    fixture.then.noAppShouldBeBlocked()
  })
})
