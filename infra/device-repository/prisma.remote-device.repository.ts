import { Device as PrismaDevice } from '@prisma/client'
import { Device } from '@/core/device/device'
import { RemoteDeviceRepository } from '@/core/ports/remote-device.repository'
import { PrismaRepository } from '@/infra/__abstract__/prisma.repository'

export class PrismaRemoteDeviceRepository
  extends PrismaRepository
  implements RemoteDeviceRepository
{
  constructor() {
    super()
  }

  async findAll(): Promise<Device[]> {
    const devices = await this.baseClient.device.findMany()
    return devices.map((device: PrismaDevice) => ({
      id: device.id,
      name: device.name,
      type: device.type,
    }))
  }
}
