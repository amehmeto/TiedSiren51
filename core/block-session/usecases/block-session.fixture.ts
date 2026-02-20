import { expect } from 'vitest'
import { FakeBackgroundTaskService } from '@/infra/background-task-service/fake.background-task.service'
import { FakeDataBlockSessionRepository } from '@/infra/block-session-repository/fake-data.block-session.repository'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { InMemoryLogger } from '@/infra/logger/in-memory.logger'
import { FakeNotificationService } from '@/infra/notification-service/fake.notification.service'
import { NotificationTrigger } from '../../_ports_/notification.service'
import { UpdatePayload } from '../../_ports_/update.payload'
import { AppStore } from '../../_redux_/createStore'
import { createTestStore } from '../../_tests_/createTestStore'
import { dateFixture } from '../../_tests_/date.fixture'
import { Fixture } from '../../_tests_/fixture.type'
import { stateBuilderProvider } from '../../_tests_/state-builder'
import { BlockSession, blockSessionAdapter } from '../block-session'
import { selectAllBlockSessionIds } from '../selectors/selectAllBlockSessionIds'
import { selectBlockSessionById } from '../selectors/selectBlockSessionById'
import {
  createBlockSession,
  CreateBlockSessionPayload,
} from './create-block-session.usecase'
import { deleteBlockSession } from './delete-block-session.usecase'
import { duplicateBlockSession } from './duplicate-block-session.usecase'
import { renameBlockSession } from './rename-block-session.usecase'
import { updateBlockSession } from './update-block-session.usecase'

type DuplicatePayload = { name: string; id: string }
type RenamePayload = { name: string; id: string }
type ExpectedNotification = {
  title: string
  body: string
  trigger: NotificationTrigger
}

export function blockSessionFixture(
  testStateBuilderProvider = stateBuilderProvider(),
): Fixture {
  let store: AppStore
  const blockSessionRepository = new FakeDataBlockSessionRepository()
  const dateProvider = new StubDateProvider()
  const logger = new InMemoryLogger()
  const notificationService = new FakeNotificationService(logger)
  const backgroundTaskService = new FakeBackgroundTaskService(logger)
  const dateTest = dateFixture(dateProvider)

  return {
    given: {
      existingBlockSession(givenBlockSession: BlockSession) {
        blockSessionRepository.entities.set(
          givenBlockSession.id,
          givenBlockSession,
        )
        testStateBuilderProvider.setState((builder) =>
          builder.withBlockSessions([givenBlockSession]),
        )
      },
      ...dateTest.given,
    },
    when: {
      creatingBlockSession: async (payload: CreateBlockSessionPayload) => {
        store = createTestStore({
          notificationService,
          dateProvider,
          backgroundTaskService,
        })
        await store.dispatch(createBlockSession(payload))
      },
      duplicatingBlockSession: async (
        toBeDuplicatedPayload: DuplicatePayload,
      ) => {
        store = createTestStore(
          {
            blockSessionRepository,
            notificationService,
            dateProvider,
          },
          testStateBuilderProvider.getState(),
        )
        await store.dispatch(duplicateBlockSession(toBeDuplicatedPayload))
      },
      renamingBlockSession: async (toBeRenamedPayload: RenamePayload) => {
        store = createTestStore(
          {
            blockSessionRepository,
          },
          testStateBuilderProvider.getState(),
        )
        await store.dispatch(renameBlockSession(toBeRenamedPayload))
      },
      deletingBlockSession: async (blockSessionId: string) => {
        store = createTestStore(
          {
            blockSessionRepository,
            notificationService,
          },
          testStateBuilderProvider.getState(),
        )
        await store.dispatch(deleteBlockSession(blockSessionId))
      },
      updatingBlockSession: async (
        updateBlockSessionPayload: UpdatePayload<BlockSession>,
      ) => {
        store = createTestStore(
          {
            blockSessionRepository,
            dateProvider,
            notificationService,
          },
          testStateBuilderProvider.getState(),
        )
        await store.dispatch(updateBlockSession(updateBlockSessionPayload))
      },
    },
    then: {
      blockSessionShouldBeStoredAs: (expectedBlockSession: BlockSession) => {
        const retrievedBlockSessions = selectBlockSessionById(
          store.getState(),
          expectedBlockSession.id,
        )
        expect(retrievedBlockSessions).toStrictEqual(expectedBlockSession)

        const blockSessionIds = selectAllBlockSessionIds(store.getState())
        expect(blockSessionIds).toContain(expectedBlockSession.id)
      },
      blockSessionsFromStoreShouldBe(expectedBlocklists: BlockSession[]) {
        const state = store.getState()
        const retrievedBlockSessions = blockSessionAdapter
          .getSelectors()
          .selectAll(state.blockSession)
        expect(retrievedBlockSessions).toStrictEqual(expectedBlocklists)
      },
      blockSessionShouldNotBeInStore(sessionId: string) {
        const retrievedBlockSession = selectBlockSessionById(
          store.getState(),
          sessionId,
        )
        expect(retrievedBlockSession).toBeUndefined()
      },
      notificationsShouldBeScheduled(
        expectedNotification: ExpectedNotification[],
      ) {
        const lastScheduled = notificationService.lastScheduledNotification
        expect(lastScheduled).toEqual(expectedNotification)
      },
      scheduledNotificationsShouldBeCancelled(
        expectedNotificationIds: string[],
      ) {
        const lastCancelled = notificationService.lastCancelledNotificationIds
        expect(lastCancelled).toEqual(expectedNotificationIds)
      },
      backgroundTasksShouldBeScheduled(expectedTasks: string[]) {
        expect(backgroundTaskService.lastScheduledTasks).toEqual(expectedTasks)
      },
    },
  }
}
