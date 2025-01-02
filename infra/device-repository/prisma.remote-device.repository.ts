import { PrismaClient } from '@prisma/client'
import { Device } from '@/core/device/device'
import { RemoteDeviceRepository } from '@/core/ports/remote-device.repository'

export class PrismaRemoteDeviceRepository implements RemoteDeviceRepository {
  private prisma: PrismaClient

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient()
  }

  async findAll(): Promise<Device[]> {
    const devices = await this.prisma.device.findMany()
    return devices.map((device) => ({
      id: device.id,
      name: device.name,
      type: device.type,
    }))
  }
}
