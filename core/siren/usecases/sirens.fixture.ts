import { selectAvailableSirens } from '../selectors/selectAvailableSirens'
import { createTestStore } from '../../_tests_/createTestStore'
import { Sirens } from '../sirens'
import { fetchAvailableSirens } from './fetch-available-sirens.usecase'
import { expect } from 'vitest'
import { FakeDataInstalledAppsRepository } from '@/infra/installed-apps-repository/fake-data.installed-apps.repository'
import { AppStore } from '../../_redux_/createStore'
import { InstalledApp } from '../../installed-app/InstalledApp'
import { FakeDataSirensRepository } from '@/infra/sirens-repository/fake-data.sirens-repository'
import { addKeywordToSirens } from './add-keyword-to-sirens.usecase'
import { stateBuilderProvider } from '../../_tests_/state-builder'
import { addWebsiteToSirens } from './add-website-to-sirens.usecase'
export function sirensFixture(
  testStateBuilderProvider = stateBuilderProvider(),
) {
  let store: AppStore
  const installedAppRepository = new FakeDataInstalledAppsRepository()
  const sirensRepository = new FakeDataSirensRepository()

  return {
    given: {
      existingAvailableSirens: (sirens: Sirens) => {
        testStateBuilderProvider.setState((builder) =>
          builder.withAvailableSirens(sirens),
        )
      },
      installedApps: (installedApps: InstalledApp[]) => {
        installedAppRepository.installedApps = new Map(
          installedApps.map((app) => [app.packageName, app]),
        )
      },
      existingRemoteSirens(existingRemoteSirens: Partial<Sirens>) {
        sirensRepository.selectableSirens = {
          android: existingRemoteSirens.android ?? [],
          ios: existingRemoteSirens.ios ?? [],
          linux: existingRemoteSirens.linux ?? [],
          macos: existingRemoteSirens.macos ?? [],
          windows: existingRemoteSirens.windows ?? [],
          websites: existingRemoteSirens.websites ?? [],
          keywords: existingRemoteSirens.keywords ?? [],
        }
      },
    },
    when: {
      addingWebsiteToSirens: async (website: string) => {
        store = createTestStore(
          {
            installedAppRepository,
            sirensRepository,
          },
          testStateBuilderProvider.getState(),
        )

        await store.dispatch(addWebsiteToSirens(website))
      },
      addingKeywordToSirens: async (keyword: string) => {
        store = createTestStore(
          {
            installedAppRepository,
            sirensRepository,
          },
          testStateBuilderProvider.getState(),
        )

        await store.dispatch(addKeywordToSirens(keyword))
      },
      fetchingAvailableSirens: async () => {
        store = createTestStore({
          installedAppRepository,
          sirensRepository,
        })
        await store.dispatch(fetchAvailableSirens())
      },
    },
    then: {
      keywordShouldBeSaved: async (expectedKeyword: string) => {
        const retrievedKeywords = await sirensRepository.getSelectableSirens()
        expect(retrievedKeywords.keywords).toContain(expectedKeyword)
      },
      websiteShouldBeSaved: async (expectedWebsite: string) => {
        const retrievedKeywords = await sirensRepository.getSelectableSirens()
        expect(retrievedKeywords.websites).toContain(expectedWebsite)
      },
      availableSirensShouldBeStoredAs: (expectedSirens: Sirens) => {
        const retrievedSirens = selectAvailableSirens(store.getState())
        expect(retrievedSirens).toStrictEqual(expectedSirens)
      },
    },
  }
}
