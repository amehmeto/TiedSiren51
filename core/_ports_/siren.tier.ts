import { ISODateString } from './date-provider'

export interface BlockingWindow {
  id: string
  startTime: ISODateString
  endTime: ISODateString
  sirens: {
    apps: string[]
    websites: string[]
    keywords: string[]
  }
}

export interface BlockingSchedule {
  windows: BlockingWindow[]
}

export interface SirenTier {
  initialize(): Promise<void>
  setBlockingSchedule(schedule: BlockingSchedule): Promise<void>
  /** @deprecated Use setBlockingSchedule instead. Will be removed in native-to-native blocking migration. */
  block(packageName: string): Promise<void>
  /** @deprecated Use initialize instead */
  initializeNativeBlocking(): Promise<void>
}
