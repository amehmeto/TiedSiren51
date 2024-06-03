import { faker } from '@faker-js/faker'
import { buildBlocklist } from './blocklist.builder'
import { buildDevice } from './device.builder'
import { BlockSession } from '@/core/block-session/block.session'

export const buildBlockSession = (
  wantedBlockSession: Partial<BlockSession> = {},
): BlockSession => {
  const sessionNameExamples = [
    'Sleeping time',
    'Working time',
    'Meditation time',
  ]

  const defaultBlockSession = {
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement(sessionNameExamples),
    startedAt: '03:48',
    endedAt: '13:58',
    startNotificationId: 'start-notification-id',
    endNotificationId: 'end-notification-id',
    blocklists: [buildBlocklist()],
    devices: [buildDevice(), buildDevice()],
  }
  return { ...defaultBlockSession, ...wantedBlockSession }
}
