import { describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import {
  amazonPrimeAndroidSiren,
  youtubeAndroidSiren,
} from '@/core/_tests_/data-builders/android-siren.builder'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { BlocklistViewModel } from '@/core/blocklist/selectors/blocklist-view-model.type'
import { selectBlocklistViewModel } from '@/core/blocklist/selectors/blocklist.view-model'

describe('Blocklists View Model', () => {
  test('Example: there is no blocklist', () => {
    const store = createTestStore({}, stateBuilder().build())
    const expectedViewModel = {
      type: BlocklistViewModel.NoBlocklist,
      message: 'Create your first blocklist to start planning block sessions',
    }

    const blocklistViewModel = selectBlocklistViewModel(store.getState())

    expect(blocklistViewModel).toStrictEqual(expectedViewModel)
  })

  test('Example: there is some blocklists', () => {
    const store = createTestStore(
      {},
      stateBuilder()
        .withBlocklists([
          buildBlocklist({
            id: 'blocklist-id-1',
            name: 'Distractions',
            sirens: {
              android: [youtubeAndroidSiren],
              ios: [],
              linux: [],
              macos: [],
              windows: [],
              websites: [],
              keywords: [],
            },
          }),
          buildBlocklist({
            id: 'blocklist-id-2',
            name: 'Videos',
            sirens: {
              android: [youtubeAndroidSiren, amazonPrimeAndroidSiren],
              ios: [],
              linux: [],
              macos: [],
              windows: [],
              websites: ['dailymotion.fr'],
              keywords: ['cat videos'],
            },
          }),
        ])
        .build(),
    )

    const expectedViewModel = {
      type: BlocklistViewModel.WithBlockLists,
      blocklists: [
        {
          id: 'blocklist-id-1',
          name: 'Distractions',
          totalBlocks: '1 blocks',
        },
        {
          id: 'blocklist-id-2',
          name: 'Videos',
          totalBlocks: '4 blocks',
        },
      ],
    }

    const blocklistViewModel = selectBlocklistViewModel(store.getState())

    expect(blocklistViewModel).toStrictEqual(expectedViewModel)
  })
})
