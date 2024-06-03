import { Device } from '@/core/device/device'
import { RemoteDeviceRepository } from '@/core/ports/remote-device.repository'

export class FakeDataDeviceRepository implements RemoteDeviceRepository {
  async findAll(): Promise<Device[]> {
    return [
      { id: '1', type: 'phone', name: 'iPhone 12' },
      { id: '2', type: 'tablet', name: 'iPad Pro' },
      { id: '3', type: 'laptop', name: 'MacBook Pro' },
    ]
  }
}
