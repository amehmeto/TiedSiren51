import { RemoteDeviceRepository } from '@/core/_ports_/remote-device.repository'
import { Device } from '@/core/device/device'
import { PowersyncRepository } from '@/infra/__abstract__/powersync.repository'
import { DeviceRecord } from '@/infra/database-service/powersync.schema'

export class PowersyncRemoteDeviceRepository
  extends PowersyncRepository
  implements RemoteDeviceRepository
{
  async findAll(): Promise<Device[]> {
    try {
      const devices = await this.db.getAll<DeviceRecord>('SELECT * FROM device')

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
