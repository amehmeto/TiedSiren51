import { beforeEach, describe, expect, it } from 'vitest'
import { PrismaRemoteDeviceRepository } from './prisma.remote-device.repository'
import { extendedClient } from '@/infra/prisma/databaseService'

describe('PrismaRemoteDeviceRepository', () => {
  let repository: PrismaRemoteDeviceRepository

  beforeEach(async () => {
    repository = new PrismaRemoteDeviceRepository()
    await extendedClient.device.deleteMany()
  })

  it('should find all remote devices', async () => {
    const testDevices = [
      { id: 'device-1', name: 'Device 1', type: 'smartphone' },
      { id: 'device-2', name: 'Device 2', type: 'tablet' },
      { id: 'device-3', name: 'Device 3', type: 'laptop' },
    ]

    for (const device of testDevices) {
      await extendedClient.device.create({
        data: device,
      })
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
