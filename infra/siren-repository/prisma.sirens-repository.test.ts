import { beforeEach, describe, expect, it } from 'vitest'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { PrismaSirensRepository } from './prisma.sirens-repository'

describe('PrismaSirensRepository', () => {
  let repository: PrismaSirensRepository

  beforeEach(async () => {
    const dateProvider = new StubDateProvider()
    const logger = new InMemoryLogger(dateProvider)
    repository = new PrismaSirensRepository(logger)
    await repository.initialize()
  })

  it('should init selectable sirens when empty', async () => {
    const expectedSirens = {
      android: [],
      ios: [],
      windows: [],
      macos: [],
      linux: [],
      websites: [],
      keywords: [],
    }

    const sirens = await repository.getSelectableSirens()

    expect(sirens).toStrictEqual(expectedSirens)
  })

  it('should add keywords to sirens', async () => {
    const expectedKeywords = ['keyword', 'justin bieber']

    await repository.addKeywordToSirens('keyword')
    await repository.addKeywordToSirens('justin bieber')
    const sirens = await repository.getSelectableSirens()

    expect(sirens.keywords).toStrictEqual(expectedKeywords)
  })

  it('should add websites to sirens', async () => {
    const expectedWebsites = ['www.google.com', 'www.facebook.com']

    await repository.addWebsiteToSirens('www.google.com')
    await repository.addWebsiteToSirens('www.facebook.com')
    const sirens = await repository.getSelectableSirens()

    expect(sirens.websites).toStrictEqual(expectedWebsites)
  })

  it('should add android apps to sirens', async () => {
    const youtubeSiren = {
      packageName: 'com.youtube.android',
      appName: 'YouTube',
      icon: 'youtube.png',
    }
    const facebookSiren = {
      packageName: 'com.facebook.android',
      appName: 'Facebook',
      icon: 'facebook.png',
    }
    const expectedAndroidSirens = [youtubeSiren, facebookSiren]

    await repository.addAndroidSirenToSirens(youtubeSiren)
    await repository.addAndroidSirenToSirens(facebookSiren)
    const sirens = await repository.getSelectableSirens()

    expect(sirens.android).toStrictEqual(expectedAndroidSirens)
  })
})
