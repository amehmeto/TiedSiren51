import { RemoteDeviceRepository } from '@/core/_ports_/remote-device.repository'
import { Device } from '@/core/device/device'

export class FakeDataDeviceRepository implements RemoteDeviceRepository {
  private devicesByUser = new Map<string, Device[]>()

  feedDevicesForUser(userId: string, devices: Device[]): void {
    this.devicesByUser.set(userId, devices)
  }

  async findAll(userId: string): Promise<Device[]> {
    return this.devicesByUser.get(userId) ?? []
  }
}
