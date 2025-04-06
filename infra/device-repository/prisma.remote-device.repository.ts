import { Device as PrismaDevice } from '@prisma/client'
import { Device } from '@/core/device/device'
import { RemoteDeviceRepository } from '@/core/ports/remote-device.repository'
import { appStorage } from '../__abstract__/app-storage'
import { PrismaAppStorage } from '../prisma/databaseService'

export class PrismaRemoteDeviceRepository implements RemoteDeviceRepository {
  private get prisma() {
    return (appStorage as PrismaAppStorage).getExtendedClient()
  }

  async findAll(): Promise<Device[]> {
    const devices = await this.prisma.device.findMany()
    return devices.map((device: PrismaDevice) => ({
      id: device.id,
      name: device.name,
      type: device.type,
    }))
  }
}
