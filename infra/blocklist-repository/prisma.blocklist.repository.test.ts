import { beforeEach, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client/react-native'
import { PrismaBlocklistRepository } from './prisma.blocklist.repository'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'

describe('PrismaBlocklistRepository', () => {
  let prisma: PrismaClient
  let repository: PrismaBlocklistRepository

  beforeEach(async () => {
    prisma = new PrismaClient()
    await prisma.$connect()
    repository = new PrismaBlocklistRepository(prisma)
    await prisma.blocklist.deleteMany()
  })

  it('should create a blocklist', async () => {
    const blocklistPayload = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload.id

    const created = await repository.create(blocklistPayload)

    expect(created).toStrictEqual({
      ...blocklistPayload,
      id: expect.any(String),
    })
  })

  it('should find a blocklist by id', async () => {
    const blocklistPayload = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload.id

    const created = await repository.create(blocklistPayload)
    const found = await repository.findById(created.id)
    expect(found).toStrictEqual(created)
  })

  it('should find all current blocklists', async () => {
    const currentBlocklists = await repository.findAll()
    expect(currentBlocklists).toStrictEqual([])
  })

  it('should update a blocklist', async () => {
    const blocklistPayload = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload.id

    const created = await repository.create(blocklistPayload)
    const updatePayload = {
      ...created,
      name: 'updated name',
    }

    await repository.update(updatePayload)
    const found = await repository.findById(created.id)
    expect(found).toStrictEqual(updatePayload)
  })

  it('should delete a blocklist', async () => {
    const blocklistPayload = buildBlocklist()
    // @ts-expect-error - removing id for creation
    delete blocklistPayload.id

    const created = await repository.create(blocklistPayload)
    await repository.delete(created.id)

    await expect(repository.findById(created.id)).rejects.toThrow()
  })
})
