import { Device as PrismaDevice } from '@prisma/client'
import { Device } from '@/core/device/device'
import { RemoteDeviceRepository } from '@/core/ports/remote-device.repository'
import { extendedClient } from '@/infra/directory/myDbModule'

export class PrismaRemoteDeviceRepository implements RemoteDeviceRepository {
  private prisma = extendedClient

  async findAll(): Promise<Device[]> {
    const devices = await this.prisma.device.findMany()
    return devices.map((device: PrismaDevice) => ({
      id: device.id,
      name: device.name,
      type: device.type,
    }))
  }
}
