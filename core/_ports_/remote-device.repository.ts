import { Device } from '../device/device'

export interface RemoteDeviceRepository {
  findAll(): Promise<Device[]>
}
