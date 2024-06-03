import { faker } from '@faker-js/faker'
import { Blocklist } from '../../blocklist/blocklist'
import { buildAndroidSiren } from './android-siren.builder'

export function buildBlocklist(
  wantedBlocklist: Partial<Blocklist> = {},
): Blocklist {
  const blocklistNameExamples = [
    'Distractions',
    'Necessary evils',
    'Games',
    'Social Medias',
    'Work',
    'Entertainment',
    'Productivity',
    'Time wasters',
    'News',
  ]

  const randomBlocklist: Blocklist = {
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement(blocklistNameExamples),
    sirens: {
      android: [buildAndroidSiren()],
      ios: [],
      linux: [],
      macos: [],
      windows: [],
      websites: [faker.internet.domainName()],
      keywords: [faker.lorem.word()],
    },
  }
  return { ...randomBlocklist, ...wantedBlocklist }
}
