import { beforeEach, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { PrismaRemoteDeviceRepository } from './prisma.remote-device.repository'

describe('PrismaRemoteDeviceRepository', () => {
  let prisma: PrismaClient
  let repository: PrismaRemoteDeviceRepository

  beforeEach(async () => {
    prisma = new PrismaClient()
    await prisma.$connect()
    repository = new PrismaRemoteDeviceRepository(prisma)
    await prisma.device.deleteMany()
  })

  it('should find all remote devices', async () => {
    const devices = await repository.findAll()
    expect(devices).toStrictEqual([])
  })
})
