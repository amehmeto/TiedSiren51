import { column, Schema, Table } from '@powersync/react-native'

const siren = new Table(
  {
    user_id: column.text,
    type: column.text,
    value: column.text,
    name: column.text,
    icon: column.text,
  },
  { localOnly: true },
)

const blocklist = new Table(
  {
    user_id: column.text,
    name: column.text,
    sirens: column.text,
  },
  { localOnly: true },
)

const block_session = new Table(
  {
    user_id: column.text,
    name: column.text,
    started_at: column.text,
    ended_at: column.text,
    blocking_conditions: column.text,
    start_notification_id: column.text,
    end_notification_id: column.text,
  },
  { localOnly: true },
)

const device = new Table(
  {
    user_id: column.text,
    type: column.text,
    name: column.text,
  },
  { localOnly: true },
)

const timer = new Table(
  {
    user_id: column.text,
    ended_at: column.text,
  },
  { localOnly: true },
)

const block_session_blocklist = new Table(
  {
    block_session_id: column.text,
    blocklist_id: column.text,
  },
  {
    localOnly: true,
    indexes: {
      session: ['block_session_id'],
      blocklist: ['blocklist_id'],
    },
  },
)

const block_session_device = new Table(
  {
    block_session_id: column.text,
    device_id: column.text,
  },
  {
    localOnly: true,
    indexes: {
      session: ['block_session_id'],
      device: ['device_id'],
    },
  },
)

export const powersyncSchema = new Schema({
  siren,
  blocklist,
  block_session,
  device,
  timer,
  block_session_blocklist,
  block_session_device,
})

export type Database = (typeof powersyncSchema)['types']
export type SirenRecord = Database['siren']
export type BlocklistRecord = Database['blocklist']
export type BlockSessionRecord = Database['block_session']
export type DeviceRecord = Database['device']
export type TimerRecord = Database['timer']
export type BlockSessionBlocklistRecord = Database['block_session_blocklist']
export type BlockSessionDeviceRecord = Database['block_session_device']
