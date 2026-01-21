import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import {
  facebookAndroidSiren,
  instagramAndroidSiren,
  youtubeAndroidSiren,
} from '@/core/_tests_/data-builders/android-siren.builder'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { selectBlockedPackages } from './selectBlockedPackages'

describe('selectBlockedPackages', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
  })

  test('should return empty array when there are no active block sessions', () => {
    dateProvider.now = new Date('2024-01-01T10:00:00')
    const blocklist = buildBlocklist({
      id: 'bl-1',
      sirens: {
        android: [facebookAndroidSiren],
      },
    })

    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withBlockSessions([
          buildBlockSession({
            startedAt: '08:00',
            endedAt: '09:00',
            blocklistIds: [blocklist.id],
          }),
        ])
        .withBlocklists([blocklist])
        .build(),
    )

    const blockedPackages = selectBlockedPackages(
      store.getState(),
      dateProvider,
    )

    expect(blockedPackages).toStrictEqual([])
  })

  test('should return package names from single active block session', () => {
    dateProvider.now = new Date('2024-01-01T14:30:00')
    const blocklist = buildBlocklist({
      id: 'bl-1',
      sirens: {
        android: [facebookAndroidSiren, instagramAndroidSiren],
      },
    })

    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withBlockSessions([
          buildBlockSession({
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist.id],
          }),
        ])
        .withBlocklists([blocklist])
        .build(),
    )

    const blockedPackages = selectBlockedPackages(
      store.getState(),
      dateProvider,
    )
    const sortedPackages = blockedPackages.sort()

    expect(sortedPackages).toStrictEqual([
      'com.example.instagram',
      'com.facebook.katana',
    ])
  })

  test('should deduplicate package names across multiple sessions', () => {
    dateProvider.now = new Date('2024-01-01T14:30:00')
    const blocklist1 = buildBlocklist({
      id: 'bl-1',
      sirens: {
        android: [facebookAndroidSiren],
      },
    })
    const blocklist2 = buildBlocklist({
      id: 'bl-2',
      sirens: {
        android: [facebookAndroidSiren, instagramAndroidSiren],
      },
    })

    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withBlockSessions([
          buildBlockSession({
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist1.id],
          }),
          buildBlockSession({
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist2.id],
          }),
        ])
        .withBlocklists([blocklist1, blocklist2])
        .build(),
    )

    const blockedPackages = selectBlockedPackages(
      store.getState(),
      dateProvider,
    )
    const sortedPackages = blockedPackages.sort()

    expect(sortedPackages).toStrictEqual([
      'com.example.instagram',
      'com.facebook.katana',
    ])
  })

  test('should deduplicate package names across multiple blocklists', () => {
    dateProvider.now = new Date('2024-01-01T14:30:00')
    const blocklist1 = buildBlocklist({
      id: 'bl-1',
      sirens: {
        android: [facebookAndroidSiren, youtubeAndroidSiren],
      },
    })
    const blocklist2 = buildBlocklist({
      id: 'bl-2',
      sirens: {
        android: [facebookAndroidSiren, instagramAndroidSiren],
      },
    })

    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withBlockSessions([
          buildBlockSession({
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: [blocklist1.id, blocklist2.id],
          }),
        ])
        .withBlocklists([blocklist1, blocklist2])
        .build(),
    )

    const blockedPackages = selectBlockedPackages(
      store.getState(),
      dateProvider,
    )
    const sortedPackages = blockedPackages.sort()

    expect(sortedPackages).toStrictEqual([
      'com.example.instagram',
      'com.example.youtube',
      'com.facebook.katana',
    ])
  })

  test('should skip blocklist IDs that do not exist in store', () => {
    dateProvider.now = new Date('2024-01-01T14:30:00')
    const existingBlocklist = buildBlocklist({
      id: 'existing-bl',
      sirens: {
        android: [facebookAndroidSiren],
      },
    })

    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withBlockSessions([
          buildBlockSession({
            startedAt: '14:00',
            endedAt: '15:00',
            blocklistIds: ['non-existent-bl', existingBlocklist.id],
          }),
        ])
        .withBlocklists([existingBlocklist])
        .build(),
    )

    const blockedPackages = selectBlockedPackages(
      store.getState(),
      dateProvider,
    )

    expect(blockedPackages).toStrictEqual(['com.facebook.katana'])
  })
})
