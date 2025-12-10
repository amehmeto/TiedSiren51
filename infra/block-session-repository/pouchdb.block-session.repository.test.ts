import PouchDB from 'pouchdb'
import { beforeEach, describe, expect, it } from 'vitest'
import { CreatePayload } from '@/core/_ports_/create.payload'
import { UpdatePayload } from '@/core/_ports_/update.payload'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { BlockSession } from '@/core/block-session/block.session'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { PouchdbBlockSessionRepository } from './pouchdb.block-session.repository'

describe('PouchDBBlockSessionRepository', () => {
  let blockSessionRepository: PouchdbBlockSessionRepository
  let db: PouchDB.Database<BlockSession>

  beforeEach(async () => {
    db = new PouchDB('pdb-block-sessions')
    await db.destroy()

    const logger = new InMemoryLogger()
    blockSessionRepository = new PouchdbBlockSessionRepository(logger)
  })

  const buildSessionPayload = (): CreatePayload<BlockSession> => {
    const { id: _id, ...sessionPayload } = buildBlockSession()
    return sessionPayload
  }

  it('should create a block session', async () => {
    const sessionPayload = buildSessionPayload()
    const expectedBlockSession = {
      id: expect.any(String),
      ...sessionPayload,
    }

    const createdBlockSession =
      await blockSessionRepository.create(sessionPayload)

    expect(createdBlockSession).toStrictEqual(expectedBlockSession)
  })

  it('should find a block session by id', async () => {
    const sessionPayload = buildSessionPayload()

    const createdBlockSession =
      await blockSessionRepository.create(sessionPayload)

    const foundBlockSession = await blockSessionRepository.findById(
      createdBlockSession.id,
    )
    expect(foundBlockSession).toStrictEqual(createdBlockSession)
  })

  it('should find all current block sessions', async () => {
    const createSessionPayload = buildSessionPayload()

    const createdSession1 =
      await blockSessionRepository.create(createSessionPayload)

    const createSessionPayload2 = buildSessionPayload()

    const createdSession2 = await blockSessionRepository.create(
      createSessionPayload2,
    )

    const currentSessions = await blockSessionRepository.findAll()

    expect(currentSessions).toHaveLength(2)
    expect(currentSessions).toContainEqual(createdSession1)
    expect(currentSessions).toContainEqual(createdSession2)
  })

  it('should update a block session', async () => {
    const createSessionPayload = buildSessionPayload()

    const createdBlockSession =
      await blockSessionRepository.create(createSessionPayload)

    const updateSessionPayload: UpdatePayload<BlockSession> = {
      id: createdBlockSession.id,
      name: 'Updated name',
    }

    const expectedBlockSession = {
      ...createdBlockSession,
      name: 'Updated name',
    }

    await blockSessionRepository.update(updateSessionPayload)
    const updatedBlockSession = await blockSessionRepository.findById(
      updateSessionPayload.id,
    )

    expect(updatedBlockSession).toStrictEqual(expectedBlockSession)
  })

  it('should delete a block session', async () => {
    const createSessionPayload = buildSessionPayload()

    const createdBlockSession =
      await blockSessionRepository.create(createSessionPayload)

    await blockSessionRepository.delete(createdBlockSession.id)

    const promise = blockSessionRepository.findById(createdBlockSession.id)

    await expect(promise).rejects.toThrow()
  })
})
