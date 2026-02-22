import { AbstractPowerSyncDatabase } from '@powersync/common'
import { BlockSessionRepository } from '@/core/_ports_/block-session.repository'
import { CreatePayload } from '@/core/_ports_/create.payload'
import { assertHHmmString } from '@/core/_ports_/date-provider'
import { Logger } from '@/core/_ports_/logger'
import { UpdatePayload } from '@/core/_ports_/update.payload'
import {
  BlockingConditions,
  BlockSession,
} from '@/core/block-session/block-session'
import { Device } from '@/core/device/device'
import {
  BlockSessionBlocklistRecord,
  BlockSessionDeviceRecord,
  BlockSessionRecord,
  DeviceRecord,
} from '@/infra/database-service/powersync.schema'

export class PowersyncBlockSessionRepository implements BlockSessionRepository {
  private readonly logger: Logger

  private readonly db: AbstractPowerSyncDatabase

  constructor(db: AbstractPowerSyncDatabase, logger: Logger) {
    this.db = db
    this.logger = logger
  }

  async create(
    sessionPayload: CreatePayload<BlockSession>,
  ): Promise<BlockSession> {
    try {
      const {
        name,
        startedAt,
        endedAt,
        startNotificationId,
        endNotificationId,
        blockingConditions,
        blocklistIds,
        devices,
      } = sessionPayload

      const { id: sessionId } = await this.db.get<{ id: string }>(
        'SELECT uuid() as id',
      )

      await this.db.execute(
        `INSERT INTO block_session
          (id, name, started_at, ended_at, start_notification_id, end_notification_id, blocking_conditions)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId,
          name,
          startedAt,
          endedAt,
          startNotificationId,
          endNotificationId,
          JSON.stringify(blockingConditions),
        ],
      )

      const created = await this.db.get<BlockSessionRecord>(
        'SELECT * FROM block_session WHERE id = ?',
        [sessionId],
      )

      for (const blocklistId of blocklistIds) {
        await this.db.execute(
          'INSERT INTO block_session_blocklist (id, block_session_id, blocklist_id) VALUES (uuid(), ?, ?)',
          [created.id, blocklistId],
        )
      }

      for (const device of devices) {
        await this.upsertDevice(device)
        await this.db.execute(
          'INSERT INTO block_session_device (id, block_session_id, device_id) VALUES (uuid(), ?, ?)',
          [created.id, device.id],
        )
      }

      return this.loadBlockSession(created.id)
    } catch (error) {
      this.logger.error(
        `[PowersyncBlockSessionRepository] Failed to create block session: ${error}`,
      )
      throw error
    }
  }

  async findAll(): Promise<BlockSession[]> {
    try {
      const sessions = await this.db.getAll<BlockSessionRecord>(
        'SELECT * FROM block_session',
      )

      const loadPromises = sessions.map((s) => this.loadBlockSession(s.id))
      return await Promise.all(loadPromises)
    } catch (error) {
      this.logger.error(
        `[PowersyncBlockSessionRepository] Failed to find all block sessions: ${error}`,
      )
      throw error
    }
  }

  async findById(id: string): Promise<BlockSession> {
    try {
      return await this.loadBlockSession(id)
    } catch (error) {
      this.logger.error(
        `[PowersyncBlockSessionRepository] Failed to find block session ${id}: ${error}`,
      )
      throw error
    }
  }

  async update(payload: UpdatePayload<BlockSession>): Promise<void> {
    try {
      const { id, blocklistIds, devices } = payload
      await this.updateSessionFields(payload)
      await this.replaceBlocklistJunctions(id, blocklistIds)
      await this.replaceDeviceJunctions(id, devices)
    } catch (error) {
      this.logger.error(
        `[PowersyncBlockSessionRepository] Failed to update block session ${payload.id}: ${error}`,
      )
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.execute(
        'DELETE FROM block_session_blocklist WHERE block_session_id = ?',
        [id],
      )
      await this.db.execute(
        'DELETE FROM block_session_device WHERE block_session_id = ?',
        [id],
      )
      await this.db.execute('DELETE FROM block_session WHERE id = ?', [id])
    } catch (error) {
      this.logger.error(
        `[PowersyncBlockSessionRepository] Failed to delete block session ${id}: ${error}`,
      )
      throw error
    }
  }

  async deleteAll(): Promise<void> {
    try {
      await this.db.execute('DELETE FROM block_session_blocklist')
      await this.db.execute('DELETE FROM block_session_device')
      await this.db.execute('DELETE FROM block_session')
    } catch (error) {
      this.logger.error(
        `[PowersyncBlockSessionRepository] Failed to delete all block sessions: ${error}`,
      )
      throw error
    }
  }

  private async updateSessionFields(
    payload: UpdatePayload<BlockSession>,
  ): Promise<void> {
    const {
      id,
      name,
      startedAt,
      endedAt,
      startNotificationId,
      endNotificationId,
      blockingConditions,
    } = payload

    const serializedConditions = this.serializeConditions(blockingConditions)

    await this.db.execute(
      `UPDATE block_session SET
        name = COALESCE(?, name),
        started_at = COALESCE(?, started_at),
        ended_at = COALESCE(?, ended_at),
        start_notification_id = COALESCE(?, start_notification_id),
        end_notification_id = COALESCE(?, end_notification_id),
        blocking_conditions = COALESCE(?, blocking_conditions)
      WHERE id = ?`,
      [
        name ?? null,
        startedAt ?? null,
        endedAt ?? null,
        startNotificationId ?? null,
        endNotificationId ?? null,
        serializedConditions,
        id,
      ],
    )
  }

  private async replaceBlocklistJunctions(
    sessionId: string,
    blocklistIds: string[] | undefined,
  ): Promise<void> {
    if (!blocklistIds) return

    await this.db.execute(
      'DELETE FROM block_session_blocklist WHERE block_session_id = ?',
      [sessionId],
    )
    for (const blocklistId of blocklistIds) {
      await this.db.execute(
        'INSERT INTO block_session_blocklist (id, block_session_id, blocklist_id) VALUES (uuid(), ?, ?)',
        [sessionId, blocklistId],
      )
    }
  }

  private async replaceDeviceJunctions(
    sessionId: string,
    devices: Device[] | undefined,
  ): Promise<void> {
    if (!devices) return

    await this.db.execute(
      'DELETE FROM block_session_device WHERE block_session_id = ?',
      [sessionId],
    )
    for (const device of devices) {
      await this.db.execute(
        'INSERT INTO block_session_device (id, block_session_id, device_id) VALUES (uuid(), ?, ?)',
        [sessionId, device.id],
      )
    }
  }

  private async upsertDevice(device: Device): Promise<void> {
    const { id, type, name } = device
    const existing = await this.db.getOptional<DeviceRecord>(
      'SELECT * FROM device WHERE id = ?',
      [id],
    )

    if (!existing) {
      await this.db.execute(
        'INSERT INTO device (id, type, name) VALUES (?, ?, ?)',
        [id, type, name],
      )
    }
  }

  private async loadBlockSession(id: string): Promise<BlockSession> {
    const session = await this.db.getOptional<BlockSessionRecord>(
      'SELECT * FROM block_session WHERE id = ?',
      [id],
    )

    if (!session) throw new Error(`BlockSession ${id} not found`)

    const blocklistJunctions =
      await this.db.getAll<BlockSessionBlocklistRecord>(
        'SELECT * FROM block_session_blocklist WHERE block_session_id = ?',
        [id],
      )

    const deviceJunctions = await this.db.getAll<BlockSessionDeviceRecord>(
      'SELECT * FROM block_session_device WHERE block_session_id = ?',
      [id],
    )

    const devicePromises = deviceJunctions.map((dj) =>
      this.db.get<DeviceRecord>('SELECT * FROM device WHERE id = ?', [
        dj.device_id,
      ]),
    )
    const devices = await Promise.all(devicePromises)

    return this.mapToBlockSession(session, blocklistJunctions, devices)
  }

  private serializeConditions(
    conditions: BlockingConditions[] | undefined,
  ): string | null {
    const resolved = conditions ?? null

    return resolved && JSON.stringify(resolved)
  }

  private mapToBlockSession(
    session: BlockSessionRecord,
    blocklistJunctions: BlockSessionBlocklistRecord[],
    devices: DeviceRecord[],
  ): BlockSession {
    const {
      started_at,
      ended_at,
      name,
      start_notification_id,
      end_notification_id,
      blocking_conditions,
    } = session

    const startedAtValue = started_at ?? ''
    const endedAtValue = ended_at ?? ''
    assertHHmmString(startedAtValue)
    assertHHmmString(endedAtValue)

    return {
      id: session.id,
      name: name ?? '',
      startedAt: startedAtValue,
      endedAt: endedAtValue,
      startNotificationId: start_notification_id ?? '',
      endNotificationId: end_notification_id ?? '',
      blockingConditions: JSON.parse(blocking_conditions ?? '[]'),
      blocklistIds: blocklistJunctions.map((bj) => bj.blocklist_id ?? ''),
      devices: devices.map((d) => {
        const { id, type, name: deviceName } = d

        return { id, type: type ?? '', name: deviceName ?? '' }
      }),
    }
  }
}
