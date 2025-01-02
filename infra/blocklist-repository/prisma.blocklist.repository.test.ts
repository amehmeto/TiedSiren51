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
    // Create new PrismaClient for each test
    prisma = new PrismaClient()
    repository = new PrismaBlocklistRepository(prisma)

    // Clean up ALL related data
    await prisma.$transaction([
      prisma.blockSession.deleteMany(),
      prisma.blocklist.deleteMany(),
      prisma.device.deleteMany(),
    ])
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
    // Create first blocklist
    const blocklistPayload1: CreatePayload<Blocklist> = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload1.id
    const created1 = await repository.create(blocklistPayload1)

    // Create second blocklist
    const blocklistPayload2: CreatePayload<Blocklist> = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload2.id
    const created2 = await repository.create(blocklistPayload2)

    const currentBlocklists = await repository.findAll()
    expect(currentBlocklists).toHaveLength(2)
    expect(currentBlocklists).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: created1.id }),
        expect.objectContaining({ id: created2.id }),
      ]),
    )
  })

  it('should update a blocklist', async () => {
    // Create a blocklist first
    const blocklistPayload: CreatePayload<Blocklist> = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload.id
    const created = await repository.create(blocklistPayload)

    // Update the blocklist
    const updatePayload = {
      id: created.id,
      name: 'Updated Blocklist',
    }

    await repository.update(updatePayload)
    const updated = await repository.findById(created.id)

    expect(updated.name).toBe('Updated Blocklist')
  })

  it('should delete a blocklist', async () => {
    // Create a blocklist first
    const blocklistPayload: CreatePayload<Blocklist> = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload.id

    // Create and then delete
    const created = await repository.create(blocklistPayload)
    await repository.delete(created.id)

    // Verify deletion
    await expect(repository.findById(created.id)).rejects.toThrow(
      `Blocklist with id ${created.id} not found`,
    )
  })
})
