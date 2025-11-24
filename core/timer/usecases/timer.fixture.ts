import { expect } from 'vitest'
import { AppStore } from '@/core/_redux_/createStore'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { Fixture } from '@/core/_tests_/fixture.types'
import { stateBuilderProvider } from '@/core/_tests_/state-builder'
import { AuthUser } from '@/core/auth/authUser'
import { FakeDataTimerRepository } from '@/infra/timer-repository/fake-data.timer.repository'
import { selectTimer } from '../selectors/selectTimer'
import { Timer } from '../timer'
import { extendTimer } from './extend-timer.usecase'
import { loadTimer } from './load-timer.usecase'
import { startTimer } from './start-timer.usecase'
import { stopTimer } from './stop-timer.usecase'

const DEFAULT_USER_ID = 'test-user-id'

export function timerFixture(
  testStateBuilderProvider = stateBuilderProvider(),
): Fixture {
  let store: AppStore
  const timerRepository = new FakeDataTimerRepository()
  const defaultAuthUser: AuthUser = {
    id: DEFAULT_USER_ID,
    email: 'test@example.com',
  }

  return {
    given: {
      existingTimer(timer: Timer) {
        timerRepository.saveTimer(DEFAULT_USER_ID, timer)
        testStateBuilderProvider.setState((builder) =>
          builder.withAuthUser(defaultAuthUser).withTimer(timer),
        )
      },
      noTimer() {
        timerRepository.clearTimer(DEFAULT_USER_ID)
        testStateBuilderProvider.setState((builder) =>
          builder.withAuthUser(defaultAuthUser).withTimer(null),
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
          { timerRepository },
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
          { timerRepository },
          testStateBuilderProvider.getState(),
        )
        return store.dispatch(startTimer(payload))
      },
      stoppingTimer: async () => {
        store = createTestStore(
          { timerRepository },
          testStateBuilderProvider.getState(),
        )
        return store.dispatch(stopTimer())
      },
      extendingTimer: async (payload: {
        days: number
        hours: number
        minutes: number
      }) => {
        store = createTestStore(
          { timerRepository },
          testStateBuilderProvider.getState(),
        )
        return store.dispatch(extendTimer(payload))
      },
    },
    then: {
      timerShouldBeLoadedAs(expectedTimer: Timer | null) {
        const timer = selectTimer(store.getState())
        expect(timer).toStrictEqual(expectedTimer)
      },
      timerShouldBeStoredAs(expectedTimer: Timer) {
        const timer = selectTimer(store.getState())
        expect(timer).toStrictEqual(expectedTimer)
        return timer
      },
      timerShouldBeCleared() {
        const timer = selectTimer(store.getState())
        expect(timer).toBeNull()
      },
      async timerShouldBeSavedInRepositoryAs(expectedTimer: Timer) {
        const userId = store.getState().auth.authUser?.id ?? DEFAULT_USER_ID
        const timer = await timerRepository.loadTimer(userId)
        expect(timer).toStrictEqual(expectedTimer)
      },
      async timerShouldNotBeInRepository() {
        const userId = store.getState().auth.authUser?.id ?? DEFAULT_USER_ID
        const timer = await timerRepository.loadTimer(userId)
        expect(timer).toBeNull()
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
  }
}
