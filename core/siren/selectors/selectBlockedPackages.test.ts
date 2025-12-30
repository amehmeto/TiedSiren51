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

    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withBlockSessions([
          buildBlockSession({
            startedAt: '08:00',
            endedAt: '09:00',
            blocklists: [
              buildBlocklist({
                sirens: {
                  android: [facebookAndroidSiren],
                },
              }),
            ],
          }),
        ])
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

    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withBlockSessions([
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
        ])
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

    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withBlockSessions([
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
        ])
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

    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withBlockSessions([
          buildBlockSession({
            startedAt: '14:00',
            endedAt: '15:00',
            blocklists: [
              buildBlocklist({
                sirens: {
                  android: [facebookAndroidSiren, youtubeAndroidSiren],
                },
              }),
              buildBlocklist({
                sirens: {
                  android: [facebookAndroidSiren, instagramAndroidSiren],
                },
              }),
            ],
          }),
        ])
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
})
