import { beforeEach, describe, expect, it } from 'vitest'
import { PrismaSirensRepository } from './prisma.sirens-repository'

// Create a test-specific subclass that extends the production repository
class TestPrismaSirensRepository extends PrismaSirensRepository {
  async reset(): Promise<void> {
    await this.baseClient.siren.deleteMany()
  }
}

describe('PrismaSirensRepository', () => {
  let repository: TestPrismaSirensRepository

  beforeEach(async () => {
    repository = new TestPrismaSirensRepository()
    await repository.initialize()
    await repository.reset()
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
