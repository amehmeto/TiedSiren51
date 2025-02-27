import { beforeEach, describe, expect, it } from 'vitest'
import { PrismaRemoteDeviceRepository } from './prisma.remote-device.repository'
import { extendedClient } from '@/infra/directory/myDbModule'

describe('PrismaRemoteDeviceRepository', () => {
  let repository: PrismaRemoteDeviceRepository

  beforeEach(async () => {
    repository = new PrismaRemoteDeviceRepository()
    await extendedClient.device.deleteMany()
  })

  it('should find all remote devices', async () => {
    const devices = await repository.findAll()
    expect(devices).toStrictEqual([])
  })
})
