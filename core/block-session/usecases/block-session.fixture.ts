import { AppStore } from '../../_redux_/createStore'
import {
  createBlockSession,
  CreateBlockSessionPayload,
} from './create-block-session.usecase'
import { expect } from 'vitest'
import { BlockSession, blockSessionAdapter } from '../block.session'
import { createTestStore } from '../../_tests_/createTestStore'
import { FakeDataBlockSessionRepository } from '@/infra/block-session-repository/fake-data.block-session.repository'
import { stateBuilderProvider } from '../../_tests_/state-builder'
import { duplicateBlockSession } from './duplicate-block-session.usecase'
import { selectBlockSessionById } from '../selectors/selectBlockSessionById'
import { selectAllBlockSessionIds } from '../selectors/selectAllBlockSessionIds'
import { renameBlockSession } from './rename-block-session.usecase'
import { deleteBlockSession } from './delete-block-session.usecase'
import { updateBlockSession } from './update-block-session.usecase'
import { FakeNotificationService } from '@/infra/notification-service/fake.notification.service'
import { NotificationTrigger } from '../../ports/notification.service'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { FakeBackgroundTaskService } from '@/infra/background-task-service/fake.background-task.service'

export function blockSessionFixture(
  testStateBuilderProvider = stateBuilderProvider(),
) {
  let store: AppStore
  const blockSessionRepository = new FakeDataBlockSessionRepository()
  const notificationService = new FakeNotificationService()
  const dateProvider = new StubDateProvider()
  const backgroundTaskService = new FakeBackgroundTaskService()

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
      nowIs(now: { hours: number; minutes: number }) {
        const nowDate = new Date()
        nowDate.setUTCHours(now.hours, now.minutes, 0, 0)
        dateProvider.now = nowDate
      },
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
      duplicatingBlockSession: async (toBeDuplicatedPayload: {
        name: string
        id: string
      }) => {
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
      renamingBlockSession: async (toBeRenamedPayload: {
        name: string
        id: string
      }) => {
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
        updateBlockSessionPayload: Partial<BlockSession> &
          Required<Pick<BlockSession, 'id'>>,
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
          expectedBlockSession.id,
          store.getState(),
        )
        expect(retrievedBlockSessions).toStrictEqual(expectedBlockSession)

        const blockSessionIds = selectAllBlockSessionIds(store.getState())
        expect(blockSessionIds).toContain(expectedBlockSession.id)
      },
      blockSessionsFromStoreShouldBe(expectedBlocklists: BlockSession[]) {
        const state = store.getState().blockSession
        const retrievedBlockSessions = blockSessionAdapter
          .getSelectors()
          .selectAll(state)
        expect(retrievedBlockSessions).toStrictEqual(expectedBlocklists)
      },
      blockSessionShouldNotBeInStore(sessionId: string) {
        const retrievedBlockSession = selectBlockSessionById(
          sessionId,
          store.getState(),
        )
        expect(retrievedBlockSession).toBeUndefined()
      },
      notificationsShouldBeScheduled(
        expectedNotification: {
          title: string
          body: string
          trigger: NotificationTrigger
        }[],
      ) {
        expect(notificationService.lastScheduledNotification).toEqual(
          expectedNotification,
        )
      },
      scheduledNotificationsShouldBeCancelled(
        expectedNotificationIds: string[],
      ) {
        expect(notificationService.lastCancelledNotificationIds).toEqual(
          expectedNotificationIds,
        )
      },
      backgroundTasksShouldBeScheduled(expectedTasks: string[]) {
        expect(backgroundTaskService.lastScheduledTasks).toEqual(expectedTasks)
      },
    },
  }
}
