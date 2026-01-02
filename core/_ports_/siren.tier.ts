import { Sirens } from '../siren/sirens'
import { ISODateString } from './date-provider'

export type BlockingSchedule = {
  id: string
  startTime: ISODateString
  endTime: ISODateString
  sirens: Sirens
}

export interface SirenTier {
  initializeNativeBlocking(): Promise<void>
  updateBlockingSchedule(schedule: BlockingSchedule[]): Promise<void>
}
