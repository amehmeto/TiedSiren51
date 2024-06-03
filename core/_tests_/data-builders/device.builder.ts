import { Device } from '../../device/device'
import { faker } from '@faker-js/faker'

export function buildDevice(device: Partial<Device> = {}): Device {
  const deviceTypes = ['android', 'ios', 'web', 'masOS', 'windows']
  const deviceNames = ['Huawei P30', 'Google Pixel 3a', 'MacBook Pro 2018']

  const randomDevice: Device = {
    id: faker.string.uuid(),
    type: faker.helpers.arrayElement(deviceTypes),
    name: faker.helpers.arrayElement(deviceNames),
  }
  return { ...randomDevice, ...device }
}
