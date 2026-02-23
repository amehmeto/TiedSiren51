import { Device } from '../device/device'

export interface RemoteDeviceRepository {
  findAll(userId: string): Promise<Device[]>
}
