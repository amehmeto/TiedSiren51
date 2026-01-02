import uuid from 'react-native-uuid'

import { BlockSessionRepository } from '@/core/_ports_/block-session.repository'
import { HHmmString } from '@/core/_ports_/date-provider'
import {
  facebookAndroidSiren,
  instagramAndroidSiren,
} from '@/core/_tests_/data-builders/android-siren.builder'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import {
  BlockingConditions,
  BlockSession,
} from '@/core/block-session/block-session'
import { InMemoryRepository } from '../__abstract__/in-memory.repository'

const startedAt: HHmmString = '10:48'
const endedAt: HHmmString = '13:58'

export class FakeDataBlockSessionRepository
  extends InMemoryRepository<BlockSession>
  implements BlockSessionRepository
{
  entities: Map<string, BlockSession> = new Map(
    [
      buildBlockSession({
        id: String(uuid.v4()),
        name: 'Sleeping time',
        blocklists: [
          {
            id: 'blocklist-id',
            name: 'Distractions',
            sirens: {
              android: [instagramAndroidSiren, facebookAndroidSiren],
              ios: [],
              linux: [],
              macos: [],
              windows: [],
              websites: ['twitter.com'],
              keywords: ['cat videos'],
            },
          },
          {
            id: 'blocklist-id-2',
            name: 'Games',
            sirens: {
              android: [instagramAndroidSiren, facebookAndroidSiren],
              ios: [],
              linux: [],
              macos: [],
              windows: [],
              websites: ['twitter.com'],
              keywords: ['cat videos'],
            },
          },
        ],
        devices: [
          {
            id: 'device-id',
            type: 'android',
            name: 'Huawei P30',
          },
          {
            id: 'device-id-2',
            type: 'android',
            name: 'Google Pixel 3a',
          },
        ],
        startedAt,
        endedAt,
        startNotificationId: 'start-notification-id',
        endNotificationId: 'end-notification-id',
      }),
      buildBlockSession({
        id: String(uuid.v4()),
        name: 'Playing time',
        blocklists: [
          {
            id: 'blocklist-id',
            name: 'Distractions',
            sirens: {
              android: [instagramAndroidSiren, facebookAndroidSiren],
              ios: [],
              linux: [],
              macos: [],
              windows: [],
              websites: ['twitter.com'],
              keywords: ['cat videos'],
            },
          },
          {
            id: 'blocklist-id-2',
            name: 'Games',
            sirens: {
              android: [instagramAndroidSiren, facebookAndroidSiren],
              ios: [],
              linux: [],
              macos: [],
              windows: [],
              websites: ['twitter.com'],
              keywords: ['cat videos'],
            },
          },
        ],
        devices: [
          {
            id: 'device-id',
            type: 'android',
            name: 'Huawei P30',
          },
          {
            id: 'device-id-2',
            type: 'android',
            name: 'Google Pixel 3a',
          },
        ],
        startedAt,
        endedAt,
        startNotificationId: 'start-notification-id',
        endNotificationId: 'end-notification-id',
        blockingConditions: [BlockingConditions.TIME],
      }),
      buildBlockSession({
        id: String(uuid.v4()),
        name: 'Sleeping time',
        blocklists: [
          {
            id: 'blocklist-id',
            name: 'Distractions',
            sirens: {
              android: [instagramAndroidSiren, facebookAndroidSiren],
              ios: [],
              linux: [],
              macos: [],
              windows: [],
              websites: ['twitter.com'],
              keywords: ['cat videos'],
            },
          },
          {
            id: 'blocklist-id-2',
            name: 'Games',
            sirens: {
              android: [instagramAndroidSiren, facebookAndroidSiren],
              ios: [],
              linux: [],
              macos: [],
              windows: [],
              websites: ['twitter.com'],
              keywords: ['cat videos'],
            },
          },
        ],
        devices: [
          {
            id: 'device-id',
            type: 'android',
            name: 'Huawei P30',
          },
          {
            id: 'device-id-2',
            type: 'android',
            name: 'Google Pixel 3a',
          },
        ],
        startedAt,
        endedAt,
        startNotificationId: 'start-notification-id',
        endNotificationId: 'end-notification-id',
        blockingConditions: [BlockingConditions.TIME],
      }),
    ].map((blockSession) => [blockSession.id, blockSession]),
  )

  delete(sessionId: string): Promise<void> {
    return super.delete(sessionId)
  }

  findById(sessionId: string): Promise<BlockSession> {
    return super.findById(sessionId)
  }

  update(
    session: Partial<BlockSession> & Required<Pick<BlockSession, 'id'>>,
  ): Promise<void> {
    return super.update(session)
  }

  findAll(): Promise<BlockSession[]> {
    return Promise.resolve(Array.from(this.entities.values()))
  }

  create(sessionPayload: Omit<BlockSession, 'id'>): Promise<BlockSession> {
    return super.create(sessionPayload)
  }
}
