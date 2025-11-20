import { Device as PrismaDevice } from '@prisma/client'
import { RemoteDeviceRepository } from '@/core/_ports_/remote-device.repository'
import { Device } from '@/core/device/device'
import { PrismaRepository } from '@/infra/__abstract__/prisma.repository'

export class PrismaRemoteDeviceRepository
  extends PrismaRepository
  implements RemoteDeviceRepository
{
  async findAll(): Promise<Device[]> {
    const devices = await this.baseClient.device.findMany()
    return devices.map((device: PrismaDevice) => ({
      id: device.id,
      name: device.name,
      type: device.type,
    }))
  }
}
