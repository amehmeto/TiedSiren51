import { AbstractPowerSyncDatabase } from '@powersync/common'
import { Logger } from '@/core/_ports_/logger'
import { RemoteDeviceRepository } from '@/core/_ports_/remote-device.repository'
import { Device } from '@/core/device/device'
import { DeviceRecord } from '@/infra/database-service/powersync.schema'

export class PowersyncRemoteDeviceRepository implements RemoteDeviceRepository {
  private readonly logger: Logger

  private readonly db: AbstractPowerSyncDatabase

  constructor(db: AbstractPowerSyncDatabase, logger: Logger) {
    this.db = db
    this.logger = logger
  }

  async findAll(userId: string): Promise<Device[]> {
    try {
      const devices = await this.db.getAll<DeviceRecord>(
        'SELECT * FROM device WHERE user_id = ?',
        [userId],
      )

      return devices.map((d) => {
        const { id, name, type } = d

        return { id, name: name ?? '', type: type ?? '' }
      })
    } catch (error) {
      this.logger.error(
        `[PowersyncRemoteDeviceRepository] Failed to find all devices: ${error}`,
      )
      throw error
    }
  }
}
