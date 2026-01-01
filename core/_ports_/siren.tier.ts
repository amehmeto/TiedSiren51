import { ISODateString } from './date-provider'

export type BlockingWindow = {
  id: string
  startTime: ISODateString
  endTime: ISODateString
  sirens: {
    apps: string[]
    websites: string[]
    keywords: string[]
  }
}

export type BlockingSchedule = BlockingWindow[]

export interface SirenTier {
  initializeNativeBlocking(): Promise<void>
  setBlockingSchedule(schedule: BlockingSchedule): Promise<void>
  /** @deprecated Use setBlockingSchedule instead. Will be removed in native-to-native blocking migration. */
  block(packageName: string): Promise<void>
}
