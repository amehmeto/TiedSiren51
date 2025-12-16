import { createEntityAdapter } from '@reduxjs/toolkit'
import { Blocklist } from '@/core/blocklist/blocklist'
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
  blocklists: Blocklist[]
  devices: Device[]
  startedAt: string
  endedAt: string
  startNotificationId: string
  endNotificationId: string
  blockingConditions: BlockingConditions[]
}

export const blockSessionAdapter = createEntityAdapter<BlockSession>()
