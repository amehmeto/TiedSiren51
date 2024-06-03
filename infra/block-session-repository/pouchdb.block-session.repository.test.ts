import { beforeEach, describe, expect, it } from 'vitest'
import { PouchdbBlockSessionRepository } from './pouchdb.block-session.repository'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { BlockSession } from '@/core/block-session/block.session'
import PouchDB from 'pouchdb'
import { UpdatePayload } from '@/core/ports/update.payload'
import { CreatePayload } from '@/core/ports/create.payload'

describe('PouchDBBlockSessionRepository', () => {
  let blockSessionRepository: PouchdbBlockSessionRepository
  let db: PouchDB.Database<BlockSession>

  beforeEach(async () => {
    db = new PouchDB('block-sessions')
    await db.destroy()

    blockSessionRepository = new PouchdbBlockSessionRepository()
  })

  it('should create a block session', async () => {
    const sessionPayload: CreatePayload<BlockSession> = buildBlockSession()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete sessionPayload.id

    const createdBlockSession =
      await blockSessionRepository.create(sessionPayload)

    expect(createdBlockSession).toStrictEqual({
      id: expect.any(String),
      ...sessionPayload,
    })
  })

  it('should find a block session by id', async () => {
    const sessionPayload: CreatePayload<BlockSession> = buildBlockSession()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete sessionPayload.id

    const createdBlockSession =
      await blockSessionRepository.create(sessionPayload)

    const foundBlockSession = await blockSessionRepository.findById(
      createdBlockSession.id,
    )
    expect(foundBlockSession).toStrictEqual(createdBlockSession)
  })

  it('should find all current block sessions', async () => {
    const createSessionPayload: CreatePayload<BlockSession> =
      buildBlockSession()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete createSessionPayload.id

    await blockSessionRepository.create(createSessionPayload)

    const createSessionPayload2: CreatePayload<BlockSession> =
      buildBlockSession()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete createSessionPayload2.id

    await blockSessionRepository.create(createSessionPayload2)

    const currentSessions = await blockSessionRepository.findAll()

    expect(currentSessions).toStrictEqual([])
  })

  it('should update a block session', async () => {
    const createSessionPayload: CreatePayload<BlockSession> =
      buildBlockSession()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete createSessionPayload.id

    const createdBlockSession =
      await blockSessionRepository.create(createSessionPayload)

    const updateSessionPayload: UpdatePayload<BlockSession> = {
      id: createdBlockSession.id,
      name: 'Updated name',
    }

    await blockSessionRepository.update(updateSessionPayload)
    const updatedBlockSession = await blockSessionRepository.findById(
      updateSessionPayload.id,
    )

    expect(updatedBlockSession).toStrictEqual({
      ...createdBlockSession,
      name: 'Updated name',
    })
  })

  it('should delete a block session', async () => {
    const createSessionPayload: CreatePayload<BlockSession> =
      buildBlockSession()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete createSessionPayload.id

    const createdBlockSession =
      await blockSessionRepository.create(createSessionPayload)

    await blockSessionRepository.delete(createdBlockSession.id)

    await expect(
      blockSessionRepository.findById(createdBlockSession.id),
    ).rejects.toThrow()
  })
})
