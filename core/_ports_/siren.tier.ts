export interface BlockingWindow {
  id: string
  startTime: string // "14:00"
  endTime: string // "15:00"
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
  block(packageName: string): Promise<void>
  initializeNativeBlocking(): Promise<void>
}
