import { Blocklist, blocklistAdapter } from '../blocklist'
import { expect } from 'vitest'
import { AppStore } from '../../_redux_/createStore'
import { createBlocklist } from './create-blocklist.usecase'
import { selectBlocklistById } from '../selectors/selectBlocklistById'
import { createTestStore } from '../../_tests_/createTestStore'
import { updateBlocklist } from './update-blocklist.usecase'
import { stateBuilderProvider } from '../../_tests_/state-builder'
import { FakeDataBlocklistRepository } from '@/infra/blocklist-repository/fake-data.blocklist.repository'
import { renameBlocklist } from './rename-blocklist.usecase'
import { duplicateBlocklist } from './duplicate-blocklist.usecase'
import { deleteBlocklist } from './delete-blocklist.usecase'

export function blocklistFixture(
  testStateBuilderProvider = stateBuilderProvider(),
) {
  let store: AppStore
  const blocklistRepository = new FakeDataBlocklistRepository()

  return {
    given: {
      existingBlocklist: (blocklist: Blocklist) => {
        blocklistRepository.blocklists.set(blocklist.id, blocklist)
        testStateBuilderProvider.setState((builder) =>
          builder.withBlocklists([blocklist]),
        )
      },
    },
    when: {
      updatingBlocklist: async (
        payload: Partial<Blocklist> & Required<Pick<Blocklist, 'id'>>,
      ) => {
        store = createTestStore(
          {
            blocklistRepository,
          },
          testStateBuilderProvider.getState(),
        )
        await store.dispatch(updateBlocklist(payload))
      },
      creatingBlocklist: async (payload: Blocklist) => {
        store = createTestStore()
        await store.dispatch(createBlocklist(payload))
      },
      renamingBlocklist: async (renameBlocklistPayload: {
        name: string
        id: string
      }) => {
        store = createTestStore(
          {
            blocklistRepository,
          },
          testStateBuilderProvider.getState(),
        )
        await store.dispatch(renameBlocklist(renameBlocklistPayload))
      },
      duplicatingBlocklist: async (toBeDuplicatedPayload: {
        name: string
        id: string
      }) => {
        store = createTestStore(
          {
            blocklistRepository,
          },
          testStateBuilderProvider.getState(),
        )
        await store.dispatch(duplicateBlocklist(toBeDuplicatedPayload))
      },
      deletingBlocklist: async (blocklistId: string) => {
        store = createTestStore(
          {
            blocklistRepository,
          },
          testStateBuilderProvider.getState(),
        )
        await store.dispatch(deleteBlocklist(blocklistId))
      },
    },
    then: {
      blocklistShouldBeStoredAs: (expectedBlocklist: Blocklist) => {
        const retrievedBlocklist = selectBlocklistById(
          expectedBlocklist.id,
          store.getState(),
        )
        expect(retrievedBlocklist).toStrictEqual(expectedBlocklist)
      },
      blocklistShouldBeSavedInRepositoryAs(expectedBlocklist: Blocklist) {
        const retrievedBlocklist = blocklistRepository.blocklists.get(
          expectedBlocklist.id,
        )
        expect(retrievedBlocklist).toStrictEqual(expectedBlocklist)
      },
      retrievedBlocklistsFromStoreShouldBe(expectedBlocklists: Blocklist[]) {
        const state = store.getState()
        const retrievedBlocklists = blocklistAdapter
          .getSelectors()
          .selectAll(state.blocklist)
        expect(retrievedBlocklists).toEqual(
          expect.arrayContaining(expectedBlocklists),
        )
      },
      blocklistShouldNotBeInStore(deletedSessionId: string) {
        const retrievedBlocklist = selectBlocklistById(
          deletedSessionId,
          store.getState(),
        )
        expect(retrievedBlocklist).toBeUndefined()
      },
    },
  }
}
