import { beforeEach, describe, it } from 'vitest'
import {
  facebookAndroidSiren,
  instagramAndroidSiren,
} from '../../_tests_/data-builders/android-siren.builder'
import { buildBlocklist } from '../../_tests_/data-builders/blocklist.builder'
import { blocklistFixture } from './blocklist.fixture'

describe('Feature: Creating a blocklist', () => {
  let fixture: ReturnType<typeof blocklistFixture>

  beforeEach(() => {
    fixture = blocklistFixture()
  })

  it('should create a blocklist', async () => {
    const blocklistPayload = buildBlocklist({
      id: 'blocklist-id',
      name: 'Distraction',
      sirens: {
        android: [instagramAndroidSiren, facebookAndroidSiren],
        ios: [],
        linux: [],
        macos: [],
        windows: [],
        websites: ['facebook.com', 'instagram.com'],
        keywords: ['social', 'media'],
      },
    })

    await fixture.when.creatingBlocklist(blocklistPayload)

    fixture.then.blocklistShouldBeStoredAs({
      id: 'blocklist-id',
      name: 'Distraction',
      sirens: {
        android: [instagramAndroidSiren, facebookAndroidSiren],
        ios: [],
        linux: [],
        macos: [],
        windows: [],
        websites: ['facebook.com', 'instagram.com'],
        keywords: ['social', 'media'],
      },
    })
  })
})
