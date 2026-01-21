import { faker } from '@faker-js/faker'
import { HHmmString } from '@/core/_ports_/date-provider'
import {
  BlockingConditions,
  BlockSession,
} from '@/core/block-session/block-session'
import { buildDevice } from './device.builder'

export const buildBlockSession = (
  wantedBlockSession: Partial<BlockSession> = {},
): BlockSession => {
  const sessionNameExamples = [
    'Sleeping time',
    'Working time',
    'Meditation time',
  ]

  const startedAt: HHmmString = '03:48'
  const endedAt: HHmmString = '13:58'

  const defaultBlockSession: BlockSession = {
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement(sessionNameExamples),
    startedAt,
    endedAt,
    startNotificationId: 'start-notification-id',
    endNotificationId: 'end-notification-id',
    blocklistIds: [faker.string.uuid()],
    devices: [buildDevice(), buildDevice()],
    blockingConditions: [BlockingConditions.TIME],
  }
  return { ...defaultBlockSession, ...wantedBlockSession }
}
