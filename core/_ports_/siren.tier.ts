import { Sirens } from '../siren/sirens'
import { ISODateString } from './date-provider'

export type BlockingWindow = {
  id: string
  startTime: ISODateString
  endTime: ISODateString
  sirens: Sirens
}

export interface SirenTier {
  initializeNativeBlocking(): Promise<void>
  block(schedule: BlockingWindow[]): Promise<void>
}
