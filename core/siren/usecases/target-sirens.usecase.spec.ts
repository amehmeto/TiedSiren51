import { beforeEach, describe, it } from 'vitest'
import {
  facebookAndroidSiren,
  instagramAndroidSiren,
} from '@/core/_tests_/data-builders/android-siren.builder'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { targetSirensFixture } from './target-sirens.fixture'

describe('Feature: Target sirens', () => {
  let fixture: ReturnType<typeof targetSirensFixture>

  beforeEach(() => {
    fixture = targetSirensFixture()
  })

  it('should target the sirens', async () => {
    fixture.given.nowIs({
      hours: 14,
      minutes: 30,
    })
    fixture.given.activeBlockSessions([
      buildBlockSession({
        startedAt: '14:00',
        endedAt: '15:00',
        blocklists: [
          buildBlocklist({
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
      }),
      buildBlockSession({
        startedAt: '14:00',
        endedAt: '15:00',
        blocklists: [
          buildBlocklist({
            sirens: {
              android: [],
              ios: [],
              linux: [],
              macos: [],
              windows: [],
              websites: ['facebook.com', 'instagram.com'],
              keywords: [],
            },
          }),
        ],
      }),
    ])

    const sirensBeingTargeted = fixture.when.targetSirens()
    await sirensBeingTargeted

    fixture.then.sirensShouldTied({
      android: [instagramAndroidSiren, facebookAndroidSiren],
      ios: [],
      linux: [],
      macos: [],
      windows: [],
      websites: ['facebook.com', 'instagram.com'],
      keywords: [],
    })
  })
})
