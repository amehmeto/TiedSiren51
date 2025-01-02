import { beforeEach, describe, expect, it, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { PrismaBlockSessionRepository } from './prisma.block-session.repository'
import { BlockingConditions } from '@/core/block-session/block.session'

describe('PrismaBlockSessionRepository', () => {
  let prisma: PrismaClient
  let repository: PrismaBlockSessionRepository

  beforeEach(async () => {
    prisma = new PrismaClient()
    repository = new PrismaBlockSessionRepository(prisma)

    // Clean up database before each test
    await prisma.blockSession.deleteMany()
    await prisma.blocklist.deleteMany()
    await prisma.device.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  const createMockBlocklist = async () => {
    const blocklist = await prisma.blocklist.create({
      data: {
        name: 'Test Blocklist',
        sirens: JSON.stringify([]),
      },
    })
    // Map to domain model
    return {
      id: blocklist.id,
      name: blocklist.name,
      sirens: JSON.parse(blocklist.sirens),
    }
  }

  const createMockDevice = async () => {
    const device = await prisma.device.create({
      data: {
        name: 'Test Device',
        type: 'android',
      },
    })
    // Map to domain model
    return {
      id: device.id,
      name: device.name,
      type: device.type,
    }
  }

  it('should create a block session', async () => {
    const blocklist = await createMockBlocklist()
    const device = await createMockDevice()

    const sessionData = {
      name: 'Test Session',
      //   minutesLeft: '30',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      startNotificationId: '123',
      endNotificationId: '456',
      blockingConditions: [
        BlockingConditions.TIME,
        BlockingConditions.LOCATION,
      ],
      blocklists: [blocklist],
      devices: [device],
    }

    const created = await repository.create(sessionData)

    expect(created).toMatchObject({
      id: expect.any(String),
      name: sessionData.name,
      startedAt: sessionData.startedAt,
      endedAt: sessionData.endedAt,
      startNotificationId: sessionData.startNotificationId,
      endNotificationId: sessionData.endNotificationId,
      blockingConditions: sessionData.blockingConditions,
    })
    expect(created.blocklists).toHaveLength(1)
    expect(created.devices).toHaveLength(1)
  })

  it('should find a block session by id', async () => {
    const sessionData = {
      name: 'Test Session',
      minutesLeft: '30',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      startNotificationId: '123',
      endNotificationId: '456',
      blockingConditions: JSON.stringify([BlockingConditions.TIME]),
    }

    const created = await prisma.blockSession.create({ data: sessionData })
    const found = await repository.findById(created.id)

    expect(found).toBeTruthy()
    expect(found.id).toBe(created.id)
    expect(found.name).toBe(sessionData.name)
    expect(found.blockingConditions).toEqual([BlockingConditions.TIME])
  })

  it('should update a block session', async () => {
    const sessionData = {
      name: 'Test Session',
      minutesLeft: '30',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      startNotificationId: '123',
      endNotificationId: '456',
      blockingConditions: JSON.stringify([BlockingConditions.TIME]),
    }

    const created = await prisma.blockSession.create({ data: sessionData })

    const updateData = {
      id: created.id,
      name: 'Updated Session',
      minutesLeft: '45',
      startedAt: sessionData.startedAt,
      endedAt: sessionData.endedAt,
      startNotificationId: sessionData.startNotificationId,
      endNotificationId: sessionData.endNotificationId,
      blockingConditions: [
        BlockingConditions.TIME,
        BlockingConditions.LOCATION,
      ],
    }

    await repository.update(updateData)
    const updated = await repository.findById(created.id)

    expect(updated.name).toBe('Updated Session')
    expect(updated.blockingConditions).toEqual([
      BlockingConditions.TIME,
      BlockingConditions.LOCATION,
    ])
  })

  it('should delete a block session', async () => {
    const sessionData = {
      name: 'Test Session',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      startNotificationId: '123',
      endNotificationId: '456',
      blockingConditions: JSON.stringify([BlockingConditions.TIME]),
    }

    const created = await prisma.blockSession.create({ data: sessionData })
    await repository.delete(created.id)

    await expect(repository.findById(created.id)).rejects.toThrow(
      `BlockSession with id ${created.id} not found`,
    )
  })

  it('should find all current block sessions', async () => {
    const blocklist = await createMockBlocklist()
    const device = await createMockDevice()

    // Create first session
    const sessionData1 = {
      name: 'Test Session 1',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      startNotificationId: '123',
      endNotificationId: '456',
      blockingConditions: [BlockingConditions.TIME],
      blocklists: [blocklist],
      devices: [device],
    }
    await repository.create(sessionData1)

    // Create second session
    const sessionData2 = {
      name: 'Test Session 2',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      startNotificationId: '789',
      endNotificationId: '012',
      blockingConditions: [BlockingConditions.LOCATION],
      blocklists: [blocklist],
      devices: [device],
    }
    await repository.create(sessionData2)

    const allSessions = await repository.findAll()
    expect(allSessions).toHaveLength(2)
    expect(allSessions[0].name).toBe('Test Session 1')
    expect(allSessions[1].name).toBe('Test Session 2')
  })
})
