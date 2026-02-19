import uuid from 'react-native-uuid'

import { BlockSessionRepository } from '@/core/_ports_/block-session.repository'
import { HHmmString } from '@/core/_ports_/date-provider'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import {
  BlockingConditions,
  BlockSession,
} from '@/core/block-session/block-session'

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

  entities: Map<string, BlockSession> = new Map(
    FakeDataBlockSessionRepository.entries,
  )

  delete(_userId: string, sessionId: string): Promise<void> {
    this.entities.delete(sessionId)
    return Promise.resolve()
  }

  findById(_userId: string, sessionId: string): Promise<BlockSession> {
    const entity = this.entities.get(sessionId)
    if (!entity) throw new Error(`Entity not found for ${sessionId}`)
    return Promise.resolve(entity)
  }

  update(
    _userId: string,
    session: Partial<BlockSession> & Required<Pick<BlockSession, 'id'>>,
  ): Promise<void> {
    const entity = this.entities.get(session.id)
    if (!entity) throw new Error('Entity not found')
    this.entities.set(session.id, { ...entity, ...session })
    return Promise.resolve()
  }

  findAll(_userId: string): Promise<BlockSession[]> {
    return Promise.resolve(Array.from(this.entities.values()))
  }

  create(
    _userId: string,
    sessionPayload: Omit<BlockSession, 'id'>,
  ): Promise<BlockSession> {
    const id = uuid.v4().toString()
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const entity = { id, ...sessionPayload } as BlockSession
    this.entities.set(id, entity)
    return Promise.resolve(entity)
  }

  deleteAll(_userId: string): Promise<void> {
    this.entities.clear()
    return Promise.resolve()
  }
}
