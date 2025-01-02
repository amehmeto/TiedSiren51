import { beforeEach, describe, expect, it, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { PrismaBlocklistRepository } from './prisma.blocklist.repository'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { CreatePayload } from '@/core/ports/create.payload'
import { Blocklist } from '@/core/blocklist/blocklist'

describe('PrismaBlocklistRepository', () => {
  let prisma: PrismaClient
  let repository: PrismaBlocklistRepository

  beforeEach(async () => {
    prisma = new PrismaClient()
    repository = new PrismaBlocklistRepository(prisma)
    await prisma.blocklist.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should create a blocklist', async () => {
    const blocklistPayload: CreatePayload<Blocklist> = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload.id

    const created = await repository.create(blocklistPayload)

    expect(created).toMatchObject({
      id: expect.any(String),
      name: blocklistPayload.name,
      sirens: blocklistPayload.sirens,
    })
  })

  it('should find a blocklist by id', async () => {
    const blocklistPayload: CreatePayload<Blocklist> = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload.id

    const created = await repository.create(blocklistPayload)
    const found = await repository.findById(created.id)

    expect(found).toEqual(created)
  })

  it('should find all current blocklists', async () => {
    const createBlocklistPayload1: CreatePayload<Blocklist> = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete createBlocklistPayload1.id
    await repository.create(createBlocklistPayload1)

    const createBlocklistPayload2: CreatePayload<Blocklist> = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete createBlocklistPayload2.id
    await repository.create(createBlocklistPayload2)

    const currentBlocklists = await repository.findAll()
    expect(currentBlocklists).toHaveLength(2)
  })

  it('should update a blocklist', async () => {
    const blocklistPayload: CreatePayload<Blocklist> = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload.id

    const created = await repository.create(blocklistPayload)
    const updatedBlocklist = {
      ...created,
      name: 'Updated Blocklist',
    }

    await repository.update(updatedBlocklist)
    const found = await repository.findById(created.id)

    expect(found.name).toBe('Updated Blocklist')
  })

  it('should delete a blocklist', async () => {
    const blocklistPayload: CreatePayload<Blocklist> = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload.id

    const created = await repository.create(blocklistPayload)
    await repository.delete(created.id)

    await expect(repository.findById(created.id)).rejects.toThrow(
      `Blocklist with id ${created.id} not found`,
    )
  })
})
