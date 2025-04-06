import { beforeEach, describe, expect, it } from 'vitest'
import { PrismaRemoteDeviceRepository } from './prisma.remote-device.repository'
import { appStorage } from '@/infra/__abstract__/app-storage'
import { PrismaAppStorage } from '@/infra/prisma/databaseService'

type ExtendedPrismaClient = ReturnType<PrismaAppStorage['getExtendedClient']>

describe('PrismaRemoteDeviceRepository', () => {
  let repository: PrismaRemoteDeviceRepository
  let prisma: ExtendedPrismaClient

  beforeEach(async () => {
    repository = new PrismaRemoteDeviceRepository()
    prisma = (appStorage as PrismaAppStorage).getExtendedClient()
    await prisma.device.deleteMany()
  })

  it('should find all remote devices', async () => {
    const testDevices = [
      { id: 'device-1', name: 'Device 1', type: 'smartphone' },
      { id: 'device-2', name: 'Device 2', type: 'tablet' },
      { id: 'device-3', name: 'Device 3', type: 'laptop' },
    ]

    for (const device of testDevices) {
      await prisma.device.create({
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
