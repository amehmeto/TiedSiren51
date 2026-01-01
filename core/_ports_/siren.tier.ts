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
  block(packageName: string): Promise<void>
}
