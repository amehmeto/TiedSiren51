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
import { selectTargetedApps } from './selectTargetedApps'

describe('selectTargetedApps', () => {
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
            endedAt: '09:00', // Session ended
            blocklistIds: [blocklist.id],
          }),
        ])
        .withBlocklists([blocklist])
        .build(),
    )

    const targetedApps = selectTargetedApps(store.getState(), dateProvider)

    expect(targetedApps).toStrictEqual([])
  })

  test('should return targeted apps from single active block session', () => {
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
            endedAt: '15:00', // Active session
            blocklistIds: [blocklist.id],
          }),
        ])
        .withBlocklists([blocklist])
        .build(),
    )

    const targetedApps = selectTargetedApps(store.getState(), dateProvider)

    expect(targetedApps).toStrictEqual([
      facebookAndroidSiren,
      instagramAndroidSiren,
    ])
  })

  test('should return targeted apps from multiple active block sessions', () => {
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
        android: [instagramAndroidSiren, youtubeAndroidSiren],
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

    const targetedApps = selectTargetedApps(store.getState(), dateProvider)

    expect(targetedApps).toStrictEqual([
      facebookAndroidSiren,
      instagramAndroidSiren,
      youtubeAndroidSiren,
    ])
  })

  test('should flatten apps from multiple blocklists in same session', () => {
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
        android: [instagramAndroidSiren],
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

    const targetedApps = selectTargetedApps(store.getState(), dateProvider)

    expect(targetedApps).toStrictEqual([
      facebookAndroidSiren,
      instagramAndroidSiren,
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

    const targetedApps = selectTargetedApps(store.getState(), dateProvider)

    expect(targetedApps).toStrictEqual([facebookAndroidSiren])
  })
})
