import { faker } from '@faker-js/faker'
import type { PartialDeep } from 'type-fest'
import { ISODateString } from '@/core/_ports_/date-provider'
import { BlockingSchedule } from '@/core/_ports_/siren.tier'
import { buildSirens } from './sirens.builder'

const defaultStartTime: ISODateString = '2024-01-01T10:00:00.000Z'
const defaultEndTime: ISODateString = '2024-01-01T11:00:00.000Z'

export function buildBlockingSchedule(
  wantedSchedule: PartialDeep<BlockingSchedule> = {},
): BlockingSchedule {
  return {
    id: wantedSchedule.id ?? faker.string.uuid(),
    startTime: wantedSchedule.startTime ?? defaultStartTime,
    endTime: wantedSchedule.endTime ?? defaultEndTime,
    sirens: buildSirens(wantedSchedule.sirens),
  }
}
