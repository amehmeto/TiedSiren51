import { faker } from '@faker-js/faker'
import type { PartialDeep } from 'type-fest'
import { Blocklist } from '../../blocklist/blocklist'
import { buildAndroidSiren } from './android-siren.builder'

export function buildBlocklist(
  wantedBlocklist: PartialDeep<Blocklist> = {},
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

  const defaultSirens = {
    android: [buildAndroidSiren()],
    ios: [],
    linux: [],
    macos: [],
    windows: [],
    websites: [faker.internet.domainName()],
    keywords: [faker.lorem.word()],
  }

  const randomBlocklist: Blocklist = {
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement(blocklistNameExamples),
    sirens: defaultSirens,
  }

  return {
    ...randomBlocklist,
    ...wantedBlocklist,
    sirens: wantedBlocklist.sirens
      ? {
          android: wantedBlocklist.sirens.android ?? defaultSirens.android,
          ios: wantedBlocklist.sirens.ios ?? defaultSirens.ios,
          linux: wantedBlocklist.sirens.linux ?? defaultSirens.linux,
          macos: wantedBlocklist.sirens.macos ?? defaultSirens.macos,
          windows: wantedBlocklist.sirens.windows ?? defaultSirens.windows,
          websites: wantedBlocklist.sirens.websites ?? defaultSirens.websites,
          keywords: wantedBlocklist.sirens.keywords ?? defaultSirens.keywords,
        }
      : defaultSirens,
  }
}
