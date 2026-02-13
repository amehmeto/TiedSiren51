import { beforeEach, describe, expect, test } from 'vitest'
import { HOUR, MINUTE } from '@/core/__constants__/time'
import { createTestStore } from '@/core/_tests_/createTestStore'
import {
  instagramAndroidSiren,
  facebookAndroidSiren,
} from '@/core/_tests_/data-builders/android-siren.builder'
import { buildBlockSession } from '@/core/_tests_/data-builders/block-session.builder'
import { buildBlocklist } from '@/core/_tests_/data-builders/blocklist.builder'
import { buildSirens } from '@/core/_tests_/data-builders/sirens.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import {
  BlocklistFormViewState,
  FormMode,
  selectBlocklistFormViewModel,
} from './blocklist-form.view-model'

describe('selectBlocklistFormViewModel', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
    dateProvider.now = new Date('2024-01-01T10:00:00.000Z')
  })

  test('Creating mode returns Creating variant with empty savedSelection', () => {
    const store = createTestStore({ dateProvider })
    const expectedViewModel = {
      type: BlocklistFormViewState.Creating,
      savedSelection: {
        androidPackageNames: [],
        websites: [],
        keywords: [],
      },
    }

    const viewModel = selectBlocklistFormViewModel(
      store.getState(),
      dateProvider,
      FormMode.Create,
      undefined,
    )

    expect(viewModel).toMatchObject(expectedViewModel)
  })

  test('Creating mode includes available sirens from state', () => {
    const expectedAvailableSirens = buildSirens({
      android: [instagramAndroidSiren, facebookAndroidSiren],
      websites: ['youtube.com'],
      keywords: ['gaming'],
    })
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withAvailableSirens(expectedAvailableSirens).build(),
    )

    const viewModel = selectBlocklistFormViewModel(
      store.getState(),
      dateProvider,
      FormMode.Create,
      undefined,
    )

    expect(viewModel.availableSirens).toStrictEqual(expectedAvailableSirens)
  })

  test('Editing without strict mode returns Editing variant with empty lockedSirens', () => {
    const blocklist = buildBlocklist({
      id: 'blocklist-1',
      sirens: {
        android: [instagramAndroidSiren],
        websites: ['reddit.com'],
        keywords: ['news'],
      },
    })
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withBlocklists([blocklist]).build(),
    )
    const expectedViewModel = {
      type: BlocklistFormViewState.Editing,
      lockedSirens: {
        android: new Set(),
        websites: new Set(),
        keywords: new Set(),
      },
    }

    const viewModel = selectBlocklistFormViewModel(
      store.getState(),
      dateProvider,
      FormMode.Edit,
      'blocklist-1',
    )

    expect(viewModel).toMatchObject(expectedViewModel)
  })

  test('Editing with strict mode but blocklist not in session returns Editing variant', () => {
    const blocklist = buildBlocklist({ id: 'blocklist-1' })
    const session = buildBlockSession({ blocklistIds: ['other-blocklist'] })

    const endedAt = dateProvider.msToISOString(
      dateProvider.getNowMs() + 1 * HOUR,
    )

    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withBlocklists([blocklist])
        .withBlockSessions([session])
        .withStrictModeEndedAt(endedAt)
        .build(),
    )

    const viewModel = selectBlocklistFormViewModel(
      store.getState(),
      dateProvider,
      FormMode.Edit,
      'blocklist-1',
    )

    expect(viewModel.type).toBe(BlocklistFormViewState.Editing)
  })

  test('Editing with strict mode + blocklist in active session returns EditingWithLockedSirens', () => {
    const blocklist = buildBlocklist({
      id: 'blocklist-1',
      sirens: {
        android: [instagramAndroidSiren],
        websites: ['reddit.com'],
        keywords: ['news'],
      },
    })
    const session = buildBlockSession({
      blocklistIds: ['blocklist-1'],
      startedAt: '03:00',
      endedAt: '23:00',
    })

    const endedAt = dateProvider.msToISOString(
      dateProvider.getNowMs() + 2 * HOUR + 30 * MINUTE,
    )

    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withBlocklists([blocklist])
        .withBlockSessions([session])
        .withStrictModeEndedAt(endedAt)
        .build(),
    )
    const expectedViewModel = {
      type: BlocklistFormViewState.EditingWithLockedSirens,
      lockedSirens: {
        android: new Set([instagramAndroidSiren.packageName]),
        websites: new Set(['reddit.com']),
        keywords: new Set(['news']),
      },
      lockedToastMessage: 'Locked (2 hours, 30 minutes left)',
    }

    const viewModel = selectBlocklistFormViewModel(
      store.getState(),
      dateProvider,
      FormMode.Edit,
      'blocklist-1',
    )

    expect(viewModel).toMatchObject(expectedViewModel)
  })

  test('savedSelection correctly maps packageNames, websites, and keywords', () => {
    const blocklist = buildBlocklist({
      id: 'blocklist-1',
      sirens: {
        android: [instagramAndroidSiren, facebookAndroidSiren],
        websites: ['reddit.com', 'twitter.com'],
        keywords: ['news', 'politics'],
      },
    })
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withBlocklists([blocklist]).build(),
    )
    const expectedSavedSelection = {
      androidPackageNames: [
        instagramAndroidSiren.packageName,
        facebookAndroidSiren.packageName,
      ],
      websites: ['reddit.com', 'twitter.com'],
      keywords: ['news', 'politics'],
    }

    const viewModel = selectBlocklistFormViewModel(
      store.getState(),
      dateProvider,
      FormMode.Edit,
      'blocklist-1',
    )

    expect(viewModel.savedSelection).toStrictEqual(expectedSavedSelection)
  })

  test('Non-existent blocklistId falls back to Creating', () => {
    const store = createTestStore({ dateProvider })

    const viewModel = selectBlocklistFormViewModel(
      store.getState(),
      dateProvider,
      FormMode.Edit,
      'non-existent-id',
    )

    expect(viewModel.type).toBe(BlocklistFormViewState.Creating)
  })
})
