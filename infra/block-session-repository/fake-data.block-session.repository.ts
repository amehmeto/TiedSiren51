import uuid from 'react-native-uuid'

import { BlockSessionRepository } from '@/core/_ports_/block-session.repository'
import { HHmmString } from '@/core/_ports_/date-provider'
import { UpdatePayload } from '@/core/_ports_/update.payload'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import {
  BlockingConditions,
  BlockSession,
} from '@/core/block-session/block-session'
import { InMemoryRepository } from '@/infra/__abstract__/in-memory.repository'

export class FakeDataBlockSessionRepository implements BlockSessionRepository {
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

  private readonly store = new InMemoryRepository<BlockSession>()

  get entities(): Map<string, BlockSession> {
    return this.store.entities
  }

  set entities(value: Map<string, BlockSession>) {
    this.store.entities = value
  }

  constructor() {
    for (const [id, session] of FakeDataBlockSessionRepository.entries)
      this.store.entities.set(id, session)
  }

  findById(_userId: string, sessionId: string): Promise<BlockSession> {
    return this.store.findById(sessionId)
  }

  findAll(_userId: string): Promise<BlockSession[]> {
    return this.store.findAll()
  }

  create(
    _userId: string,
    sessionPayload: Omit<BlockSession, 'id'>,
  ): Promise<BlockSession> {
    return this.store.create(sessionPayload)
  }

  update(_userId: string, session: UpdatePayload<BlockSession>): Promise<void> {
    this.store.update(session)
    return Promise.resolve()
  }

  delete(_userId: string, sessionId: string): Promise<void> {
    return this.store.delete(sessionId)
  }

  deleteAll(_userId: string): Promise<void> {
    return this.store.deleteAll()
  }
}
