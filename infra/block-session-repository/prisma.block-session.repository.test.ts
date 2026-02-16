import { PrismaClient } from '@prisma/client/react-native'
import { beforeEach, describe, expect, it } from 'vitest'
import { UpdatePayload } from '@/core/_ports_/update.payload'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { BlockSession } from '@/core/block-session/block-session'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { PrismaBlockSessionRepository } from './prisma.block-session.repository'

describe('PrismaBlockSessionRepository', () => {
  let repository: PrismaBlockSessionRepository
  let prismaClient: PrismaClient

  beforeEach(async () => {
    const logger = new InMemoryLogger()
    repository = new PrismaBlockSessionRepository(logger)
    await repository.initialize()
    prismaClient = repository.getClient()

    // Clear junction tables first
    await prismaClient.$executeRaw`DELETE FROM "_BlockSessionToDevice"`
    await prismaClient.$executeRaw`DELETE FROM "_BlockSessionToBlocklist"`
    // Then clear the main tables
    await prismaClient.blockSession.deleteMany()
    await prismaClient.device.deleteMany()
    await prismaClient.blocklist.deleteMany()
  })

  const prepareSessionPayload = async () => {
    const sessionPayload = buildBlockSession()
    // @ts-expect-error - removing id for creation
    delete sessionPayload.id
    await prismaClient.device.create({
      data: {
        id: 'test-device-id',
        type: 'test-type',
        name: 'Test Device',
      },
    })

    return {
      ...sessionPayload,
      blocklists: [],
      devices: [
        {
          id: 'test-device-id',
          type: 'test-type',
          name: 'Test Device',
        },
      ],
    }
  }

  it('should create a block session', async () => {
    const sessionPayload = await prepareSessionPayload()
    const expectedBlockSession = {
      ...sessionPayload,
      id: expect.any(String),
    }

    const created = await repository.create(sessionPayload)

    expect(created).toStrictEqual(expectedBlockSession)
  })

  it('should find a block session by id', async () => {
    const sessionPayload = await prepareSessionPayload()
    const created = await repository.create(sessionPayload)

    const found = await repository.findById(created.id)
    expect(found).toStrictEqual(created)
  })

  it('should find all current block sessions', async () => {
    const sessionNames = [
      'Morning Session',
      'Afternoon Session',
      'Evening Session',
    ]
    const createdSessions = []
    await prismaClient.device.create({
      data: {
        id: 'test-device-id',
        type: 'test-type',
        name: 'Test Device',
      },
    })

    const testDevice = {
      id: 'test-device-id',
      type: 'test-type',
      name: 'Test Device',
    }

    for (const name of sessionNames) {
      const sessionPayload = await prepareSessionPayload()
      const sessionWithCustomName = {
        ...sessionPayload,
        name,
      }

      const created = await repository.create(sessionWithCustomName)
      createdSessions.push(created)
    }

    const foundSessions = await repository.findAll()

    expect(foundSessions).toHaveLength(createdSessions.length)

    for (const createdSession of createdSessions) {
      const expectedSessionFields = expect.objectContaining({
        id: createdSession.id,
        name: createdSession.name,
        startedAt: createdSession.startedAt,
        endedAt: createdSession.endedAt,
        devices: expect.arrayContaining([expect.objectContaining(testDevice)]),
      })
      expect(foundSessions).toContainEqual(expectedSessionFields)
    }
  })

  it('should update a block session', async () => {
    const sessionPayload = await prepareSessionPayload()
    const created = await repository.create(sessionPayload)

    const updateSessionPayload: UpdatePayload<BlockSession> = {
      id: created.id,
      name: 'Updated name',
    }

    const expectedBlockSession = {
      ...created,
      name: 'Updated name',
    }

    await repository.update(updateSessionPayload)
    const updated = await repository.findById(created.id)

    expect(updated).toStrictEqual(expectedBlockSession)
  })

  it('should delete a block session', async () => {
    const sessionPayload = await prepareSessionPayload()
    const created = await repository.create(sessionPayload)
    await repository.delete(created.id)

    const promise = repository.findById(created.id)

    await expect(promise).rejects.toThrow(
      `BlockSession ${created.id} not found`,
    )
  })
})
