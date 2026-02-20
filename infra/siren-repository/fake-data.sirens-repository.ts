import { faker } from '@faker-js/faker'
import { SirensRepository } from '@/core/_ports_/sirens.repository'
import { buildAndroidSiren } from '@/core/_tests_/data-builders/android-siren.builder'
import { AndroidSiren, Sirens } from '@/core/siren/sirens'

export class FakeDataSirensRepository implements SirensRepository {
  selectableSirens: Sirens = {
    android: [buildAndroidSiren(), buildAndroidSiren(), buildAndroidSiren()],
    ios: [],
    windows: [],
    macos: [],
    linux: [],
    websites: [
      faker.internet.domainName(),
      faker.internet.domainName(),
      faker.internet.domainName(),
      faker.internet.domainName(),
    ],
    keywords: [
      faker.lorem.word(),
      faker.lorem.word(),
      faker.lorem.word(),
      faker.lorem.word(),
    ],
  }

  addKeywordToSirens(_userId: string, keyword: string): Promise<void> {
    this.selectableSirens.keywords = [
      ...this.selectableSirens.keywords,
      keyword,
    ]
    return Promise.resolve()
  }

  getSelectableSirens(_userId: string): Promise<Sirens> {
    return Promise.resolve(this.selectableSirens)
  }

  addWebsiteToSirens(_userId: string, website: string): Promise<void> {
    this.selectableSirens.websites = [
      ...this.selectableSirens.websites,
      website,
    ]
    return Promise.resolve()
  }

  addAndroidSirenToSirens(
    _userId: string,
    androidSiren: AndroidSiren,
  ): Promise<void> {
    this.selectableSirens.android = [
      ...this.selectableSirens.android,
      androidSiren,
    ]
    return Promise.resolve()
  }

  deleteAllSirens(_userId: string): Promise<void> {
    this.selectableSirens = {
      android: [],
      ios: [],
      windows: [],
      macos: [],
      linux: [],
      websites: [],
      keywords: [],
    }
    return Promise.resolve()
  }
}
