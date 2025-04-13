import { beforeEach, describe, expect, it } from 'vitest'
import { PrismaRemoteDeviceRepository } from './prisma.remote-device.repository'

describe('PrismaRemoteDeviceRepository', () => {
  let repository: PrismaRemoteDeviceRepository

  beforeEach(async () => {
    repository = new PrismaRemoteDeviceRepository()
    await repository.initialize()
    await repository.resetForTesting()
  })

  it('should find all remote devices', async () => {
    const testDevices = [
      { id: 'device-1', name: 'Device 1', type: 'smartphone' },
      { id: 'device-2', name: 'Device 2', type: 'tablet' },
      { id: 'device-3', name: 'Device 3', type: 'laptop' },
    ]

    for (const device of testDevices) {
      await repository.createDeviceForTesting(device)
    }

    const devices = await repository.findAll()

    expect(devices).toHaveLength(testDevices.length)

    for (const testDevice of testDevices) {
      expect(devices).toContainEqual(
        expect.objectContaining({
          id: testDevice.id,
          name: testDevice.name,
          type: testDevice.type,
        }),
      )
    }
  })
})
