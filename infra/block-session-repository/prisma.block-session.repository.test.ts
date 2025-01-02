import { beforeEach, describe, expect, it, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { PrismaBlockSessionRepository } from './prisma.block-session.repository'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { BlockSession } from '@/core/block-session/block.session'
import { UpdatePayload } from '@/core/ports/update.payload'

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

  const createTestBlocklist = async () => {
    const blocklist = await prisma.blocklist.create({
      data: {
        name: 'Test Blocklist',
        sirens: JSON.stringify([]),
      },
    })
    return {
      ...blocklist,
      sirens: JSON.parse(blocklist.sirens),
    }
  }

  const createTestDevice = async () => {
    return await prisma.device.create({
      data: {
        name: 'Test Device',
        type: 'android',
      },
    })
  }

  const prepareSessionPayload = async () => {
    const sessionPayload = buildBlockSession()
    const blocklist = await createTestBlocklist()
    const device = await createTestDevice()

    // @ts-expect-error - removing id for creation
    delete sessionPayload.id

    return {
      ...sessionPayload,
      blocklists: [blocklist],
      devices: [device],
    }
  }

  it('should create a block session', async () => {
    const sessionPayload = await prepareSessionPayload()
    const created = await repository.create(sessionPayload)

    expect(created).toStrictEqual({
      id: expect.any(String),
      name: sessionPayload.name,
      startedAt: sessionPayload.startedAt,
      endedAt: sessionPayload.endedAt,
      startNotificationId: sessionPayload.startNotificationId,
      endNotificationId: sessionPayload.endNotificationId,
      blockingConditions: sessionPayload.blockingConditions,
      blocklists: sessionPayload.blocklists,
      devices: sessionPayload.devices,
    })
  })

  it('should find a block session by id', async () => {
    const sessionPayload = await prepareSessionPayload()
    const created = await repository.create(sessionPayload)
    const found = await repository.findById(created.id)

    expect(found).toStrictEqual(created)
  })

  it('should find all current block sessions', async () => {
    const sessionPayload1 = await prepareSessionPayload()
    await repository.create(sessionPayload1)

    const sessionPayload2 = await prepareSessionPayload()
    await repository.create(sessionPayload2)

    const currentSessions = await repository.findAll()
    expect(currentSessions).toHaveLength(2)
  })

  it('should update a block session', async () => {
    const sessionPayload = await prepareSessionPayload()
    const created = await repository.create(sessionPayload)

    const updateSessionPayload: UpdatePayload<BlockSession> = {
      id: created.id,
      name: 'Updated name',
    }

    await repository.update(updateSessionPayload)
    const updated = await repository.findById(created.id)

    expect(updated).toStrictEqual({
      ...created,
      name: 'Updated name',
    })
  })

  it('should delete a block session', async () => {
    const sessionPayload = await prepareSessionPayload()
    const created = await repository.create(sessionPayload)
    await repository.delete(created.id)

    await expect(repository.findById(created.id)).rejects.toThrow(
      `BlockSession with id ${created.id} not found`,
    )
  })
})
