import { createEntityAdapter } from '@reduxjs/toolkit'
import { HHmmString } from '@/core/_ports_/date-provider'
import { Device } from '../device/device'

export enum BlockingConditions {
  TIME = 'time',
  LOCATION = 'location',
  WIFI = 'wifi',
  USAGE_LIMIT = 'usage_limit',
  LAUNCH_COUNT = 'launch_count',
}

export type BlockSession = {
  id: string
  name: string
  blocklistIds: string[]
  devices: Device[]
  startedAt: HHmmString
  endedAt: HHmmString
  startNotificationId: string
  endNotificationId: string
  blockingConditions: BlockingConditions[]
}

export const blockSessionAdapter = createEntityAdapter<BlockSession>()
