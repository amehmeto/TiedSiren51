import { Device as PrismaDevice } from '@prisma/client'
import { Logger } from '@/core/_ports_/logger'
import { RemoteDeviceRepository } from '@/core/_ports_/remote-device.repository'
import { Device } from '@/core/device/device'
import { PrismaRepository } from '@/infra/__abstract__/prisma.repository'

export class PrismaRemoteDeviceRepository
  extends PrismaRepository
  implements RemoteDeviceRepository
{
  protected readonly logger: Logger

  constructor(logger: Logger) {
    super()
    this.logger = logger
  }

  async findAll(): Promise<Device[]> {
    try {
      const devices = await this.baseClient.device.findMany()
      return devices.map((device: PrismaDevice) => ({
        id: device.id,
        name: device.name,
        type: device.type,
      }))
    } catch (error) {
      this.logger.error(
        `[PrismaRemoteDeviceRepository] Failed to find all devices: ${error}`,
      )
      throw error
    }
  }
}
