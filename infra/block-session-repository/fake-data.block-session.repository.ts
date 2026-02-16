import uuid from 'react-native-uuid'

import { BlockSessionRepository } from '@/core/_ports_/block-session.repository'
import { HHmmString } from '@/core/_ports_/date-provider'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import {
  BlockingConditions,
  BlockSession,
} from '@/core/block-session/block-session'
import { InMemoryRepository } from '../__abstract__/in-memory.repository'

export class FakeDataBlockSessionRepository
  extends InMemoryRepository<BlockSession>
  implements BlockSessionRepository
{
  private static readonly startedAt: HHmmString = '10:48'

  private static readonly endedAt: HHmmString = '13:58'

  private static readonly initialBlockSessions = [
    buildBlockSession({
      id: String(uuid.v4()),
      name: 'Sleeping time',
      blocklistIds: ['blocklist-id', 'blocklist-id-2'],
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
      startedAt: FakeDataBlockSessionRepository.startedAt,
      endedAt: FakeDataBlockSessionRepository.endedAt,
      startNotificationId: 'start-notification-id',
      endNotificationId: 'end-notification-id',
    }),
    buildBlockSession({
      id: String(uuid.v4()),
      name: 'Playing time',
      blocklistIds: ['blocklist-id', 'blocklist-id-2'],
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
      startedAt: FakeDataBlockSessionRepository.startedAt,
      endedAt: FakeDataBlockSessionRepository.endedAt,
      startNotificationId: 'start-notification-id',
      endNotificationId: 'end-notification-id',
      blockingConditions: [BlockingConditions.TIME],
    }),
    buildBlockSession({
      id: String(uuid.v4()),
      name: 'Sleeping time',
      blocklistIds: ['blocklist-id', 'blocklist-id-2'],
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
      startedAt: FakeDataBlockSessionRepository.startedAt,
      endedAt: FakeDataBlockSessionRepository.endedAt,
      startNotificationId: 'start-notification-id',
      endNotificationId: 'end-notification-id',
      blockingConditions: [BlockingConditions.TIME],
    }),
  ]

  private static readonly entries: [string, BlockSession][] =
    FakeDataBlockSessionRepository.initialBlockSessions.map((blockSession) => [
      blockSession.id,
      blockSession,
    ])

  entities: Map<string, BlockSession> = new Map(
    FakeDataBlockSessionRepository.entries,
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

  deleteAll(): Promise<void> {
    return super.deleteAll()
  }
}
