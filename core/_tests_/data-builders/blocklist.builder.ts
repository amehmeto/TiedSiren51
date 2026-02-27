import { faker } from '@faker-js/faker'
import type { PartialDeep } from 'type-fest'
import { Blocklist } from '../../blocklist/blocklist'
import { buildAndroidSiren } from './android-siren.builder'

const { internet, lorem, string, helpers } = faker

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
    websites: [internet.domainName()],
    keywords: [lorem.word()],
  }

  const { android, ios, linux, macos, windows, websites, keywords } =
    defaultSirens

  const randomBlocklist: Blocklist = {
    id: string.uuid(),
    name: helpers.arrayElement(blocklistNameExamples),
    sirens: defaultSirens,
  }

  return {
    ...randomBlocklist,
    ...wantedBlocklist,
    sirens: wantedBlocklist.sirens
      ? {
          android: wantedBlocklist.sirens.android ?? android,
          ios: wantedBlocklist.sirens.ios ?? ios,
          linux: wantedBlocklist.sirens.linux ?? linux,
          macos: wantedBlocklist.sirens.macos ?? macos,
          windows: wantedBlocklist.sirens.windows ?? windows,
          websites: wantedBlocklist.sirens.websites ?? websites,
          keywords: wantedBlocklist.sirens.keywords ?? keywords,
        }
      : defaultSirens,
  }
}
