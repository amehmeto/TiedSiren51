import { expect } from 'vitest'
import { ISODateString } from '@/core/_ports_/port.date-provider'
import { AppStore } from '@/core/_redux_/createStore'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { Fixture } from '@/core/_tests_/fixture.types'
import { stateBuilderProvider } from '@/core/_tests_/state-builder'
import { AuthUser } from '@/core/auth/authUser'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { FakeDataTimerRepository } from '@/infra/timer-repository/fake-data.timer.repository'
import { extendTimer } from './extend-timer.usecase'
import { loadTimer } from './load-timer.usecase'
import { startTimer } from './start-timer.usecase'

const DEFAULT_USER_ID = 'test-user-id'

const DEFAULT_TEST_DATE = new Date('2024-01-01T00:00:00.000Z')

type TimerFixture = Fixture & {
  dateProvider: StubDateProvider
}

export function timerFixture(
  testStateBuilderProvider = stateBuilderProvider(),
): TimerFixture {
  let store: AppStore
  const timerRepository = new FakeDataTimerRepository()
  const dateProvider = new StubDateProvider()
  dateProvider.now = new Date(DEFAULT_TEST_DATE)
  const defaultAuthUser: AuthUser = {
    id: DEFAULT_USER_ID,
    email: 'test@example.com',
  }

  return {
    given: {
      existingTimer(endAt: ISODateString) {
        timerRepository.saveTimer(DEFAULT_USER_ID, endAt)
        testStateBuilderProvider.setState((builder) =>
          builder.withAuthUser(defaultAuthUser).withTimerEndAt(endAt),
        )
      },
      noTimer() {
        testStateBuilderProvider.setState((builder) =>
          builder.withAuthUser(defaultAuthUser).withTimerEndAt(null),
        )
      },
      authenticatedUser(authUser: AuthUser = defaultAuthUser) {
        testStateBuilderProvider.setState((builder) =>
          builder.withAuthUser(authUser),
        )
      },
      unauthenticatedUser() {
        testStateBuilderProvider.setState((builder) =>
          builder.withoutAuthUser({}),
        )
      },
    },
    when: {
      loadingTimer: async () => {
        store = createTestStore(
          { timerRepository, dateProvider },
          testStateBuilderProvider.getState(),
        )
        return store.dispatch(loadTimer())
      },
      startingTimer: async (payload: {
        days: number
        hours: number
        minutes: number
      }) => {
        store = createTestStore(
          { timerRepository, dateProvider },
          testStateBuilderProvider.getState(),
        )
        return store.dispatch(startTimer(payload))
      },
      extendingTimer: async (payload: {
        days: number
        hours: number
        minutes: number
      }) => {
        store = createTestStore(
          { timerRepository, dateProvider },
          testStateBuilderProvider.getState(),
        )
        return store.dispatch(extendTimer(payload))
      },
    },
    then: {
      timerShouldBeLoadedAs(expectedEndAt: string | null) {
        expect(store.getState().timer.endAt).toStrictEqual(expectedEndAt)
      },
      timerShouldBeStoredAs(expectedEndAt: string) {
        expect(store.getState().timer.endAt).toStrictEqual(expectedEndAt)
      },
      async timerShouldBeSavedInRepositoryAs(expectedEndAt: string) {
        const userId = store.getState().auth.authUser?.id ?? DEFAULT_USER_ID
        const endAt = await timerRepository.loadTimer(userId)
        expect(endAt).toStrictEqual(expectedEndAt)
      },
      actionShouldBeRejectedWith(
        action: unknown,
        expectedErrorMessage: string,
      ) {
        const isRejectedAction = (
          a: unknown,
        ): a is { type: string; error: { message: string } } => {
          return (
            typeof a === 'object' &&
            a !== null &&
            'type' in a &&
            typeof a.type === 'string' &&
            a.type.endsWith('/rejected') &&
            'error' in a &&
            typeof a.error === 'object' &&
            a.error !== null &&
            'message' in a.error &&
            typeof a.error.message === 'string'
          )
        }

        expect(isRejectedAction(action)).toBe(true)
        if (isRejectedAction(action))
          expect(action.error.message).toBe(expectedErrorMessage)
      },
    },
    dateProvider,
  }
}
