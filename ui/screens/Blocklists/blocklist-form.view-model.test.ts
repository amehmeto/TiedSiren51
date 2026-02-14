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
import { AndroidSiren } from '@/core/siren/sirens'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import {
  BlocklistFormViewState,
  FormMode,
  SectionedSiren,
  SectionedSirenEntry,
  selectBlocklistFormViewModel,
} from './blocklist-form.view-model'

function withoutDividers<T>(
  sectioned: SectionedSiren<T>[],
): SectionedSirenEntry<T>[] {
  return sectioned.filter(
    (entry): entry is SectionedSirenEntry<T> => entry.type === 'siren',
  )
}

describe('selectBlocklistFormViewModel', () => {
  let dateProvider: StubDateProvider

  beforeEach(() => {
    dateProvider = new StubDateProvider()
    dateProvider.now = new Date('2024-01-01T10:00:00.000Z')
  })

  test('Creating mode returns Creating variant with empty sorted lists', () => {
    const store = createTestStore({ dateProvider })

    const viewModel = selectBlocklistFormViewModel(
      store.getState(),
      dateProvider,
      FormMode.Create,
      undefined,
    )

    expect(viewModel.type).toBe(BlocklistFormViewState.Creating)
    expect(viewModel.existingBlocklist).toBeNull()
    expect(viewModel.lockedToastMessage).toBeNull()
    expect(viewModel.blocklistNamePlaceholder).toBe('Blocklist name')
    expect(viewModel.sortedAndroidApps).toStrictEqual([])
    expect(viewModel.sortedWebsites).toStrictEqual([])
    expect(viewModel.sortedKeywords).toStrictEqual([])
  })

  test('Creating mode returns sorted available sirens', () => {
    const availableSirens = buildSirens({
      android: [instagramAndroidSiren, facebookAndroidSiren],
      websites: ['youtube.com'],
      keywords: ['gaming'],
    })
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withAvailableSirens(availableSirens).build(),
    )

    const viewModel = selectBlocklistFormViewModel(
      store.getState(),
      dateProvider,
      FormMode.Create,
      undefined,
    )

    const appNames = withoutDividers(viewModel.sortedAndroidApps).map(
      (entry) => entry.siren.appName,
    )
    const expectedAppNames = ['Facebook', 'Instagram']
    expect(appNames).toStrictEqual(expectedAppNames)
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
    const expectedLockedSirens = {
      android: new Set(),
      websites: new Set(),
      keywords: new Set(),
    }

    const viewModel = selectBlocklistFormViewModel(
      store.getState(),
      dateProvider,
      FormMode.Edit,
      'blocklist-1',
    )

    expect(viewModel.type).toBe(BlocklistFormViewState.Editing)
    expect(viewModel.existingBlocklist).toBe(blocklist)
    expect(viewModel.lockedToastMessage).toBeNull()
    expect(viewModel.blocklistNamePlaceholder).toBe(blocklist.name)
    expect(viewModel.lockedSirens).toStrictEqual(expectedLockedSirens)
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
      existingBlocklist: blocklist,
      lockedSirens: {
        android: new Set([instagramAndroidSiren.packageName]),
        websites: new Set(['reddit.com']),
        keywords: new Set(['news']),
      },
      lockedToastMessage: 'Locked (2 hours, 30 minutes left)',
      blocklistNamePlaceholder: blocklist.name,
    }

    const viewModel = selectBlocklistFormViewModel(
      store.getState(),
      dateProvider,
      FormMode.Edit,
      'blocklist-1',
    )

    expect(viewModel).toMatchObject(expectedViewModel)
  })

  test('Editing mode places selected sirens first in sorted lists', () => {
    const availableSirens = buildSirens({
      android: [facebookAndroidSiren, instagramAndroidSiren],
      websites: ['reddit.com', 'twitter.com', 'youtube.com'],
      keywords: ['news', 'politics', 'gaming'],
    })
    const blocklist = buildBlocklist({
      id: 'blocklist-1',
      sirens: {
        android: [instagramAndroidSiren],
        websites: ['twitter.com'],
        keywords: ['gaming'],
      },
    })
    const store = createTestStore(
      { dateProvider },
      stateBuilder()
        .withAvailableSirens(availableSirens)
        .withBlocklists([blocklist])
        .build(),
    )

    const viewModel = selectBlocklistFormViewModel(
      store.getState(),
      dateProvider,
      FormMode.Edit,
      'blocklist-1',
    )

    const androidApps = withoutDividers<AndroidSiren>(
      viewModel.sortedAndroidApps,
    )
    const [firstApp] = androidApps
    const firstAppName = firstApp.siren.appName
    expect(firstAppName).toBe(instagramAndroidSiren.appName)

    const websites = withoutDividers(viewModel.sortedWebsites)
    const [firstWebsite] = websites
    expect(firstWebsite.siren).toBe('twitter.com')

    const keywords = withoutDividers(viewModel.sortedKeywords)
    const [firstKeyword] = keywords
    expect(firstKeyword.siren).toBe('gaming')
  })

  test('Editing mode with empty blocklist name falls back to default placeholder', () => {
    const blocklist = buildBlocklist({ id: 'blocklist-1', name: '' })
    const store = createTestStore(
      { dateProvider },
      stateBuilder().withBlocklists([blocklist]).build(),
    )

    const viewModel = selectBlocklistFormViewModel(
      store.getState(),
      dateProvider,
      FormMode.Edit,
      'blocklist-1',
    )

    expect(viewModel.blocklistNamePlaceholder).toBe('Blocklist name')
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
    expect(viewModel.existingBlocklist).toBeNull()
    expect(viewModel.blocklistNamePlaceholder).toBe('Blocklist name')
  })
})
