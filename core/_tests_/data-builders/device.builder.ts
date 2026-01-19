import { faker } from '@faker-js/faker'
import { Device } from '../../device/device'

export function buildDevice(device: Partial<Device> = {}): Device {
  const randomDevice: Device = {
    id: faker.string.uuid(),
    type: faker.helpers.arrayElement([
      'android',
      'ios',
      'web',
      'masOS',
      'windows',
    ]),
    name: faker.helpers.arrayElement([
      'Huawei P30',
      'Google Pixel 3a',
      'MacBook Pro 2018',
    ]),
  }
  return { ...randomDevice, ...device }
}
