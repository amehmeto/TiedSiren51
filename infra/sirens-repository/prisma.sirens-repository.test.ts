import { beforeEach, describe, expect, it } from 'vitest'
import { PrismaSirensRepository } from './prisma.sirens-repository'
import { appStorage } from '@/infra/__abstract__/app-storage'
import { PrismaAppStorage } from '@/infra/prisma/databaseService'

type ExtendedPrismaClient = ReturnType<PrismaAppStorage['getExtendedClient']>

describe('PrismaSirensRepository', () => {
  let repository: PrismaSirensRepository
  let prisma: ExtendedPrismaClient

  beforeEach(async () => {
    repository = new PrismaSirensRepository()
    prisma = (appStorage as PrismaAppStorage).getExtendedClient()
    await prisma.siren.deleteMany()
  })

  it('should init selectable sirens when empty', async () => {
    const sirens = await repository.getSelectableSirens()

    expect(sirens).toStrictEqual({
      android: [],
      ios: [],
      windows: [],
      macos: [],
      linux: [],
      websites: [],
      keywords: [],
    })
  })

  it('should add keywords to sirens', async () => {
    await repository.addKeywordToSirens('keyword')
    await repository.addKeywordToSirens('justin bieber')

    const sirens = await repository.getSelectableSirens()
    expect(sirens.keywords).toStrictEqual(['keyword', 'justin bieber'])
  })

  it('should add websites to sirens', async () => {
    await repository.addWebsiteToSirens('www.google.com')
    await repository.addWebsiteToSirens('www.facebook.com')

    const sirens = await repository.getSelectableSirens()
    expect(sirens.websites).toStrictEqual([
      'www.google.com',
      'www.facebook.com',
    ])
  })

  it('should add android apps to sirens', async () => {
    await repository.addAndroidSirenToSirens({
      packageName: 'com.youtube.android',
      appName: 'YouTube',
      icon: 'youtube.png',
    })
    await repository.addAndroidSirenToSirens({
      packageName: 'com.facebook.android',
      appName: 'Facebook',
      icon: 'facebook.png',
    })

    const sirens = await repository.getSelectableSirens()
    expect(sirens.android).toStrictEqual([
      {
        packageName: 'com.youtube.android',
        appName: 'YouTube',
        icon: 'youtube.png',
      },
      {
        packageName: 'com.facebook.android',
        appName: 'Facebook',
        icon: 'facebook.png',
      },
    ])
  })
})
