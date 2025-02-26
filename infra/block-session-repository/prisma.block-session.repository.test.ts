import { beforeEach, describe, expect, it } from 'vitest'
import { PrismaBlockSessionRepository } from './prisma.block-session.repository'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { BlockSession } from '@/core/block-session/block.session'
import { UpdatePayload } from '@/core/ports/update.payload'
import { extendedClient } from '@/myDbModule'

describe('PrismaBlockSessionRepository', () => {
  let repository: PrismaBlockSessionRepository

  beforeEach(async () => {
    repository = new PrismaBlockSessionRepository()
    // Clear junction tables first
    await extendedClient.$executeRaw`DELETE FROM "_BlockSessionToDevice"`
    await extendedClient.$executeRaw`DELETE FROM "_BlockSessionToBlocklist"`
    // Then clear main tables
    await extendedClient.blockSession.deleteMany()
    await extendedClient.device.deleteMany()
    await extendedClient.blocklist.deleteMany()
  })

  const prepareSessionPayload = async () => {
    const sessionPayload = buildBlockSession()
    // @ts-expect-error - removing id for creation
    delete sessionPayload.id

    // Create required device first
    await extendedClient.device.create({
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
    const currentSessions = await repository.findAll()
    expect(currentSessions).toHaveLength(0)
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
