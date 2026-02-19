import { expect } from 'vitest'
import { ISODateString } from '@/core/_ports_/date-provider'
import { AppStore } from '@/core/_redux_/createStore'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { Fixture } from '@/core/_tests_/fixture.type'
import { stateBuilderProvider } from '@/core/_tests_/state-builder'
import { AuthUser } from '@/core/auth/auth-user'
import { selectNullableAuthUserId } from '@/core/auth/selectors/selectNullableAuthUserId'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { FakeDataTimerRepository } from '@/infra/timer-repository/fake-data.timer.repository'
import { extendTimer, ExtendTimerPayload } from './extend-timer.usecase'
import { loadTimer } from './load-timer.usecase'
import { notifyLockedSiren } from './notify-locked-siren.usecase'
import { startTimer, StartTimerPayload } from './start-timer.usecase'

const DEFAULT_USER_ID = 'test-user-id'

const DEFAULT_TEST_DATE = new Date('2024-01-01T00:00:00.000Z')

type TimerFixture = Fixture & {
  dateProvider: StubDateProvider
}

export function timerFixture(
  testStateBuilderProvider = stateBuilderProvider(),
): TimerFixture {
  let store: AppStore
  let isUnauthenticated = false
  const timerRepository = new FakeDataTimerRepository()
  const dateProvider = new StubDateProvider()
  dateProvider.now = new Date(DEFAULT_TEST_DATE)
  const defaultAuthUser: AuthUser = {
    id: DEFAULT_USER_ID,
    email: 'test@example.com',
    isEmailVerified: true,
  }

  const buildStore = () =>
    createTestStore(
      { timerRepository, dateProvider },
      testStateBuilderProvider.getState(),
      { isAuthDefaultSkipped: isUnauthenticated },
    )

  return {
    given: {
      existingTimer(endedAt: ISODateString) {
        timerRepository.saveTimer(DEFAULT_USER_ID, endedAt)
        testStateBuilderProvider.setState((builder) =>
          builder.withAuthUser(defaultAuthUser).withStrictModeEndedAt(endedAt),
        )
      },
      noTimer() {
        testStateBuilderProvider.setState((builder) =>
          builder.withAuthUser(defaultAuthUser).withStrictModeEndedAt(null),
        )
      },
      authenticatedUser(authUser: AuthUser = defaultAuthUser) {
        testStateBuilderProvider.setState((builder) =>
          builder.withAuthUser(authUser),
        )
      },
      unauthenticatedUser() {
        isUnauthenticated = true
        testStateBuilderProvider.setState((builder) =>
          builder.withoutAuthUser({}),
        )
      },
    },
    when: {
      loadingTimer: async () => {
        store = buildStore()
        return store.dispatch(loadTimer())
      },
      startingTimer: async (payload: StartTimerPayload) => {
        store = buildStore()
        return store.dispatch(startTimer(payload))
      },
      extendingTimerOf: async (payload: ExtendTimerPayload) => {
        store = buildStore()
        return store.dispatch(extendTimer(payload))
      },
      notifyingLockedSiren: async () => {
        store = buildStore()
        return store.dispatch(notifyLockedSiren())
      },
    },
    then: {
      toastShouldShow(expectedMessage: string) {
        const message = store.getState().toast.message
        expect(message).toBe(expectedMessage)
      },
      timerShouldBeLoadedAs(expectedEndedAt: string | null) {
        expect(store.getState().strictMode.endedAt).toStrictEqual(
          expectedEndedAt,
        )
      },
      timerShouldBeStoredAs(expectedEndedAt: string) {
        expect(store.getState().strictMode.endedAt).toStrictEqual(
          expectedEndedAt,
        )
      },
      async timerShouldBePersisted(expectedEndedAt: string) {
        const userId =
          selectNullableAuthUserId(store.getState()) ?? DEFAULT_USER_ID
        const endedAt = await timerRepository.loadTimer(userId)
        expect(endedAt).toStrictEqual(expectedEndedAt)
      },
      actionShouldBeRejectedWith(
        action: unknown,
        expectedErrorMessage: string,
      ) {
        type RejectedAction = { type: string; error: { message: string } }
        const isRejectedAction = (a: unknown): a is RejectedAction => {
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

        const isRejected = isRejectedAction(action)
        expect(isRejected).toBe(true)
        if (isRejected) expect(action.error.message).toBe(expectedErrorMessage)
      },
    },
    dateProvider,
  }
}
