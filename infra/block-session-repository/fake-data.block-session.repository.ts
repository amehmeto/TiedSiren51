import uuid from 'react-native-uuid'

import { BlockSessionRepository } from '@/core/_ports_/block-session.repository'
import { CreatePayload } from '@/core/_ports_/create.payload'
import { HHmmString } from '@/core/_ports_/date-provider'
import { UpdatePayload } from '@/core/_ports_/update.payload'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import {
  BlockingConditions,
  BlockSession,
} from '@/core/block-session/block-session'
import { InMemoryRepository } from '@/infra/__abstract__/in-memory.repository'

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

  delete(userId: string, sessionId: string): Promise<void> {
    return super.delete(userId, sessionId)
  }

  findById(userId: string, sessionId: string): Promise<BlockSession> {
    return super.findById(userId, sessionId)
  }

  update(userId: string, session: UpdatePayload<BlockSession>): Promise<void> {
    return super.update(userId, session)
  }

  findAll(userId: string): Promise<BlockSession[]> {
    return super.findAll(userId)
  }

  create(
    userId: string,
    sessionPayload: CreatePayload<BlockSession>,
  ): Promise<BlockSession> {
    return super.create(userId, sessionPayload)
  }

  deleteAll(userId: string): Promise<void> {
    return super.deleteAll(userId)
  }
}
