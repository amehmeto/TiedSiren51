import { beforeEach, describe, expect, it } from 'vitest'
import { Device } from '@/core/device/device'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { PrismaRemoteDeviceRepository } from './prisma.remote-device.repository'

class TestPrismaRemoteDeviceRepository extends PrismaRemoteDeviceRepository {
  async reset(): Promise<void> {
    await this.baseClient.device.deleteMany()
  }

  async createDeviceForTesting(device: Device): Promise<void> {
    await this.baseClient.device.create({
      data: device,
    })
  }
}

describe('PrismaRemoteDeviceRepository', () => {
  let repository: TestPrismaRemoteDeviceRepository

  beforeEach(async () => {
    const dateProvider = new StubDateProvider()
    const logger = new InMemoryLogger(dateProvider)
    repository = new TestPrismaRemoteDeviceRepository(logger)
    await repository.initialize()
    await repository.reset()
  })

  it('should find all remote devices', async () => {
    const testDevices = [
      { id: 'device-1', name: 'Device 1', type: 'smartphone' },
      { id: 'device-2', name: 'Device 2', type: 'tablet' },
      { id: 'device-3', name: 'Device 3', type: 'laptop' },
    ]

    for (const device of testDevices)
      await repository.createDeviceForTesting(device)

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
