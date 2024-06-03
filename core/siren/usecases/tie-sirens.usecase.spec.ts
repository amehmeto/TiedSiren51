import { beforeEach, describe, it } from 'vitest'
import { tieSirensFixture } from './tie-sirens.fixture'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import {
  facebookAndroidSiren,
  instagramAndroidSiren,
} from '@/core/_tests_/data-builders/android-siren.builder'

describe('Feature: Tie sirens', () => {
  let fixture: ReturnType<typeof tieSirensFixture>

  beforeEach(() => {
    fixture = tieSirensFixture()
  })

  it('should tie the sirens', async () => {
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

    const sirensBeingTied = fixture.when.tieSirens()
    await sirensBeingTied

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
