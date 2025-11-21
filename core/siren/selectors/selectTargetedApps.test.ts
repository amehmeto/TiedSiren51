import { describe, expect, test } from 'vitest'
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
  test('should return empty array when there are no active block sessions', () => {
    const dateProvider = new StubDateProvider()
    dateProvider.now = new Date('2024-01-01T10:00:00')

    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withBlockSessions([
          buildBlockSession({
            startedAt: '08:00',
            endedAt: '09:00', // Session ended
            blocklists: [
              buildBlocklist({
                sirens: {
                  android: [facebookAndroidSiren],
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
        ])
        .build(),
    )

    const targetedApps = selectTargetedApps(store.getState(), dateProvider)

    expect(targetedApps).toEqual([])
  })

  test('should return targeted apps from single active block session', () => {
    const dateProvider = new StubDateProvider()
    dateProvider.now = new Date('2024-01-01T14:30:00')

    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withBlockSessions([
          buildBlockSession({
            startedAt: '14:00',
            endedAt: '15:00', // Active session
            blocklists: [
              buildBlocklist({
                sirens: {
                  android: [facebookAndroidSiren, instagramAndroidSiren],
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
        ])
        .build(),
    )

    const targetedApps = selectTargetedApps(store.getState(), dateProvider)

    expect(targetedApps).toEqual([facebookAndroidSiren, instagramAndroidSiren])
  })

  test('should return targeted apps from multiple active block sessions', () => {
    const dateProvider = new StubDateProvider()
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
                  android: [instagramAndroidSiren, youtubeAndroidSiren],
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
        ])
        .build(),
    )

    const targetedApps = selectTargetedApps(store.getState(), dateProvider)

    expect(targetedApps).toEqual([
      facebookAndroidSiren,
      instagramAndroidSiren,
      youtubeAndroidSiren,
    ])
  })

  test('should flatten apps from multiple blocklists in same session', () => {
    const dateProvider = new StubDateProvider()
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
                  ios: [],
                  linux: [],
                  macos: [],
                  windows: [],
                  websites: [],
                  keywords: [],
                },
              }),
              buildBlocklist({
                sirens: {
                  android: [instagramAndroidSiren],
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
        ])
        .build(),
    )

    const targetedApps = selectTargetedApps(store.getState(), dateProvider)

    expect(targetedApps).toEqual([facebookAndroidSiren, instagramAndroidSiren])
  })
})
