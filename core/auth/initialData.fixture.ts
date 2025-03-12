import { stateBuilder } from '@/core/_tests_/state-builder'
import { AppStore } from '@/core/_redux_/createStore'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { expect } from 'vitest'
import { loadInitialData } from '@/core/auth/usecases/load-initial-data.usecase'
import { Blocklist } from '@/core/blocklist/blocklist'
import { BlockSession } from '@/core/block-session/block.session'
import { Sirens } from '@/core/siren/sirens'
import { PrismaBlocklistRepository } from '@/infra/blocklist-repository/prisma.blocklist.repository'
import { PrismaBlockSessionRepository } from '@/infra/block-session-repository/prisma.block-session.repository'
import { PrismaSirensRepository } from '@/infra/sirens-repository/prisma.sirens-repository'

interface InitialData {
  blocklists: Blocklist[]
  blockSessions: BlockSession[]
  sirens: Sirens
}

interface InitialDataFixture {
  given: {
    blocklists(blocklists: Blocklist[]): void
    blockSessions(blockSessions: BlockSession[]): void
    sirens(sirens: Sirens): void
  }
  when: {
    loadInitialData(): Promise<void>
  }
  then: {
    initialDataShouldBeLoaded(expectedData: InitialData): void
  }
}

export function initialDataFixture(): InitialDataFixture {
  let store: AppStore
  const blocklistRepository = new PrismaBlocklistRepository()
  const blockSessionRepository = new PrismaBlockSessionRepository()
  const sirensRepository = new PrismaSirensRepository()

  store = createTestStore({
    blocklistRepository,
    blockSessionRepository,
    sirensRepository,
  })

  return {
    given: {
      blocklists(blocklists: Blocklist[]) {
        // Then add the new blocklists
        blocklists.forEach((blocklist) => blocklistRepository.create(blocklist))
      },
      blockSessions(blockSessions: BlockSession[]) {
        // Then add the new block sessions
        blockSessions.forEach((blockSession) =>
          blockSessionRepository.create(blockSession),
        )
      },
      sirens(sirens: Sirens) {
        // Use the getSelectableSirens method to fetch sirens
        sirensRepository.getSelectableSirens().then((existingSirens) => {
          // Add each item from the provided sirens
          sirens.android.forEach((androidSiren) =>
            sirensRepository.addAndroidSirenToSirens(androidSiren),
          )
          sirens.websites.forEach((website) =>
            sirensRepository.addWebsiteToSirens(website),
          )
          sirens.keywords.forEach((keyword) =>
            sirensRepository.addKeywordToSirens(keyword),
          )

          // Directly set the other arrays
          existingSirens.ios = [...sirens.ios]
          existingSirens.windows = [...sirens.windows]
          existingSirens.macos = [...sirens.macos]
          existingSirens.linux = [...sirens.linux]
        })
      },
    },
    when: {
      async loadInitialData() {
        await store.dispatch(loadInitialData())
      },
    },
    then: {
      initialDataShouldBeLoaded(expectedData: InitialData) {
        const expectedState = stateBuilder()
          .withBlocklists(expectedData.blocklists)
          .withBlockSessions(expectedData.blockSessions)
          .withAvailableSirens(expectedData.sirens)
          .build()

        // Debug output to see the difference between expected and actual state
        // console.log('Expected:', JSON.stringify(expectedState, null, 2));
        // console.log('Actual:', JSON.stringify(store.getState(), null, 2));

        expect(store.getState()).toEqual(expectedState)
      },
    },
  }
}
