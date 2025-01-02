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
    // Clear all data before each test
    await prisma.blockSession.deleteMany()
    await prisma.blocklist.deleteMany()
    await prisma.device.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  const prepareSessionPayload = async () => {
    const sessionPayload = buildBlockSession()
    // @ts-expect-error - removing id for creation
    delete sessionPayload.id

    // Remove IDs from related records
    const cleanedBlocklists = sessionPayload.blocklists.map((bl) => ({
      name: bl.name,
      sirens: bl.sirens,
    }))
    const cleanedDevices = sessionPayload.devices.map((dev) => ({
      name: dev.name,
      type: dev.type,
    }))

    return {
      ...sessionPayload,
      blocklists: cleanedBlocklists,
      devices: cleanedDevices,
    }
  }

  it('should create a block session', async () => {
    const sessionPayload = await prepareSessionPayload()
    const created = await repository.create(sessionPayload)

    expect(created).toEqual({
      id: expect.any(String),
      name: sessionPayload.name,
      startedAt: sessionPayload.startedAt,
      endedAt: sessionPayload.endedAt,
      startNotificationId: sessionPayload.startNotificationId,
      endNotificationId: sessionPayload.endNotificationId,
      blockingConditions: sessionPayload.blockingConditions,
      blocklists: expect.arrayContaining(
        sessionPayload.blocklists.map((bl) =>
          expect.objectContaining({
            id: expect.any(String),
            name: bl.name,
            sirens: bl.sirens,
          }),
        ),
      ),
      devices: expect.arrayContaining(
        sessionPayload.devices.map((dev) =>
          expect.objectContaining({
            id: expect.any(String),
            name: dev.name,
            type: dev.type,
          }),
        ),
      ),
    })
  })

  it('should find a block session by id', async () => {
    // Create session with related records
    const sessionPayload = await prepareSessionPayload()
    const created = await repository.create(sessionPayload)

    // Find the session
    const found = await repository.findById(created.id)

    // Compare without checking the exact structure of related records
    expect(found).toEqual({
      id: created.id,
      name: created.name,
      startedAt: created.startedAt,
      endedAt: created.endedAt,
      startNotificationId: created.startNotificationId,
      endNotificationId: created.endNotificationId,
      blockingConditions: created.blockingConditions,
      blocklists: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          sirens: expect.any(Object),
        }),
      ]),
      devices: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          type: expect.any(String),
        }),
      ]),
    })
  })

  it('should find all current block sessions', async () => {
    // Create first session
    const sessionPayload1 = await prepareSessionPayload()
    await repository.create(sessionPayload1)

    // Create second session with different data
    const sessionPayload2 = {
      ...(await prepareSessionPayload()),
      name: 'Different Session',
    }
    await repository.create(sessionPayload2)

    const currentSessions = await repository.findAll()
    expect(currentSessions).toHaveLength(2)
    expect(currentSessions.map((s) => s.name)).toContain(sessionPayload1.name)
    expect(currentSessions.map((s) => s.name)).toContain(sessionPayload2.name)
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
