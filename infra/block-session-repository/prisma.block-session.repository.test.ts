import { beforeEach, describe, expect, it } from 'vitest'
import { PrismaBlockSessionRepository } from './prisma.block-session.repository'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { BlockSession } from '@/core/block-session/block.session'
import { UpdatePayload } from '@/core/ports/update.payload'
import { appStorage } from '@/infra/__abstract__/app-storage'
import { PrismaAppStorage } from '@/infra/prisma/databaseService'

type ExtendedPrismaClient = ReturnType<PrismaAppStorage['getExtendedClient']>

describe('PrismaBlockSessionRepository', () => {
  let repository: PrismaBlockSessionRepository
  let prisma: ExtendedPrismaClient

  beforeEach(async () => {
    repository = new PrismaBlockSessionRepository()
    prisma = (appStorage as PrismaAppStorage).getExtendedClient()
    // Clear junction tables first
    await prisma.$executeRaw`DELETE FROM "_BlockSessionToDevice"`
    await prisma.$executeRaw`DELETE FROM "_BlockSessionToBlocklist"`
    // Then clear main tables
    await prisma.blockSession.deleteMany()
    await prisma.device.deleteMany()
    await prisma.blocklist.deleteMany()
  })

  const prepareSessionPayload = async () => {
    const sessionPayload = buildBlockSession()
    // @ts-expect-error - removing id for creation
    delete sessionPayload.id

    await prisma.device.create({
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
    const created = await repository.create(sessionPayload)

    expect(created).toStrictEqual({
      ...sessionPayload,
      id: expect.any(String),
    })
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

    await prisma.device.create({
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
      expect(foundSessions).toContainEqual(
        expect.objectContaining({
          id: createdSession.id,
          name: createdSession.name,
          startedAt: createdSession.startedAt,
          endedAt: createdSession.endedAt,
          devices: expect.arrayContaining([
            expect.objectContaining(testDevice),
          ]),
        }),
      )
    }
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
      `BlockSession ${created.id} not found`,
    )
  })
})
