import { faker } from '@faker-js/faker'
import type { PartialDeep } from 'type-fest'
import {
  assertISODateString,
  ISODateString,
} from '@/core/_ports_/date-provider'
import { BlockingSchedule } from '@/core/_ports_/siren.tier'
import { buildSirens } from './sirens.builder'

const defaultStartTimeValue = '2024-01-01T10:00:00.000Z'
assertISODateString(defaultStartTimeValue)
const defaultStartTime: ISODateString = defaultStartTimeValue

const defaultEndTimeValue = '2024-01-01T11:00:00.000Z'
assertISODateString(defaultEndTimeValue)
const defaultEndTime: ISODateString = defaultEndTimeValue

export function buildBlockingSchedule(
  wantedSchedule: PartialDeep<BlockingSchedule> = {},
): BlockingSchedule {
  const { id, startTime, endTime, sirens } = wantedSchedule
  return {
    id: id ?? faker.string.uuid(),
    startTime: startTime ?? defaultStartTime,
    endTime: endTime ?? defaultEndTime,
    sirens: buildSirens(sirens),
  }
}
